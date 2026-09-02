/* Coach discovery
   ---------------
   Finds local coaches and businesses for a specific activity. Results are
   meant to come from Google Places; until a key is configured the mock
   provider stands in, so the whole flow is exercisable today.

   Nothing here scrapes Google. The real provider calls the official Places
   API (New) text-search endpoint.

   To go live:
     1. Set VITE_GOOGLE_MAPS_API_KEY (see googleProvider below).
     2. getCoachProvider() picks up the Google provider automatically.
     3. Move the call behind your own endpoint before shipping — a browser
        key is visible to anyone, so it must be referrer-restricted at
        minimum, and proxied server-side ideally. */

import type { Category } from "../data";

/* ---------- Types ---------- */

export type CoachLocation =
  | { kind: "coords"; lat: number; lng: number; label?: string }
  | { kind: "text"; value: string };

export type Coach = {
  id: string;
  /** Coach or business name. */
  name: string;
  /** What they teach — the activity or its category. */
  activity: string;
  category: Category;
  /** Google rating, 0-5. */
  rating: number;
  reviewCount: number;
  /** Miles from the search location, when the provider can work it out. */
  distanceMi?: number;
  /** Human-readable address or area. */
  location: string;
  /** Opens the place on Google Maps. */
  googleUrl: string;
  placeId?: string;
};

export type CoachQuery = {
  activityName: string;
  category: Category;
  location: CoachLocation;
  /** Defaults to 15 miles. */
  radiusMiles?: number;
};

export interface CoachSearchProvider {
  readonly id: string;
  /** True when the provider can actually run — e.g. a key is present. */
  readonly isLive: boolean;
  search(query: CoachQuery, signal?: AbortSignal): Promise<Coach[]>;
}

export class CoachSearchError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "CoachSearchError";
  }
}

/* ---------- Mock provider ---------- */

const FIRST = ["Marden", "Oakfield", "Rosewood", "Bellhaven", "Northgate", "Clearwater", "Ashby", "Linden"];
const KIND: Partial<Record<Category, string[]>> = {
  Music: ["School of Music", "Music Academy", "Conservatory", "Studios"],
  Sports: ["Sports Club", "Athletics Centre", "Academy", "Training Ground"],
  "Dance & Theater": ["Dance Academy", "School of Dance", "Performing Arts", "Studio"],
  Academics: ["Learning Centre", "Tutors", "Academy", "Study Club"],
  Arts: ["Art Studio", "Atelier", "Creative Studio", "Art School"],
  STEM: ["Robotics Lab", "STEM Academy", "Innovation Club", "Tech Studio"],
  Outdoors: ["Outdoor Centre", "Adventure Club", "Trailhead", "Field School"],
  Other: ["Centre", "Club", "Academy", "Studio"],
};
const STREETS = ["Maple Ave", "Chestnut St", "Harbour Rd", "Willow Ln", "Franklin St", "Cedar Way"];

/** Stable pseudo-random from a string, so a given search always looks the same. */
function seeded(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return () => {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    return h / 0x7fffffff;
  };
}

const locationLabel = (l: CoachLocation) =>
  l.kind === "text" ? l.value : (l.label ?? "your location");

export const mockProvider: CoachSearchProvider = {
  id: "mock",
  isLive: false,
  async search(query, signal) {
    // Enough delay to exercise the loading state.
    await new Promise((r) => setTimeout(r, 700));
    if (signal?.aborted) throw new CoachSearchError("aborted");

    const where = locationLabel(query.location);
    const rand = seeded(`${query.activityName}|${where}`);

    // A deliberate empty case so the no-results state is reachable.
    if (/^(nowhere|00000)$/i.test(where.trim())) return [];

    const kinds = KIND[query.category] ?? KIND.Other!;
    const count = 4 + Math.floor(rand() * 3);

    const out: Coach[] = Array.from({ length: count }, (_, i) => {
      const name = `${FIRST[Math.floor(rand() * FIRST.length)]} ${kinds[Math.floor(rand() * kinds.length)]}`;
      const rating = Math.round((4.2 + rand() * 0.8) * 10) / 10;
      const reviewCount = 18 + Math.floor(rand() * 320);
      const distanceMi = Math.round((0.4 + rand() * 9) * 10) / 10;
      const street = `${100 + Math.floor(rand() * 800)} ${STREETS[Math.floor(rand() * STREETS.length)]}`;
      return {
        id: `mock-${i}-${name.replace(/\s+/g, "-").toLowerCase()}`,
        name,
        activity: query.activityName,
        category: query.category,
        rating,
        reviewCount,
        distanceMi,
        location: query.location.kind === "text" ? `${street}, ${where}` : street,
        googleUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${name} ${query.activityName} ${where}`,
        )}`,
      };
    });

    // The client wants strong ratings first.
    return rankCoaches(out);
  },
};

/* ---------- Google Places provider ----------
   Places API (New) text search. Official endpoint, no scraping. */

const PLACES_ENDPOINT = "https://places.googleapis.com/v1/places:searchText";
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.rating",
  "places.userRatingCount",
  "places.googleMapsUri",
  "places.location",
].join(",");

const MILES_PER_METER = 0.000621371;

function haversineMiles(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function createGooglePlacesProvider(apiKey: string): CoachSearchProvider {
  return {
    id: "google-places",
    isLive: true,
    async search(query, signal) {
      const where = locationLabel(query.location);
      const body: Record<string, unknown> = {
        textQuery: `${query.activityName} lessons for kids near ${where}`,
        maxResultCount: 12,
      };
      if (query.location.kind === "coords") {
        body.locationBias = {
          circle: {
            center: { latitude: query.location.lat, longitude: query.location.lng },
            radius: Math.min((query.radiusMiles ?? 15) / MILES_PER_METER, 50000),
          },
        };
      }

      let res: Response;
      try {
        res = await fetch(PLACES_ENDPOINT, {
          method: "POST",
          signal,
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": FIELD_MASK,
          },
          body: JSON.stringify(body),
        });
      } catch (e) {
        throw new CoachSearchError("Could not reach Google Places.", e);
      }
      if (!res.ok) {
        throw new CoachSearchError(`Google Places returned ${res.status}.`);
      }

      const json = (await res.json()) as {
        places?: {
          id: string;
          displayName?: { text?: string };
          formattedAddress?: string;
          rating?: number;
          userRatingCount?: number;
          googleMapsUri?: string;
          location?: { latitude: number; longitude: number };
        }[];
      };

      const origin =
        query.location.kind === "coords"
          ? { lat: query.location.lat, lng: query.location.lng }
          : null;

      const coaches: Coach[] = (json.places ?? []).map((p) => ({
        id: p.id,
        placeId: p.id,
        name: p.displayName?.text ?? "Unnamed",
        activity: query.activityName,
        category: query.category,
        rating: p.rating ?? 0,
        reviewCount: p.userRatingCount ?? 0,
        distanceMi:
          origin && p.location
            ? Math.round(
                haversineMiles(origin, { lat: p.location.latitude, lng: p.location.longitude }) * 10,
              ) / 10
            : undefined,
        location: p.formattedAddress ?? "",
        googleUrl:
          p.googleMapsUri ??
          `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(p.id)}`,
      }));

      return rankCoaches(coaches);
    },
  };
}

/* ---------- Ranking + selection ---------- */

/** Strong Google ratings first, with review count as the tie-breaker so a
    lone 5.0 review does not outrank a well-reviewed 4.8. */
export function rankCoaches(coaches: Coach[]): Coach[] {
  return [...coaches].sort((a, b) => {
    const score = (c: Coach) => c.rating * Math.log10(Math.max(c.reviewCount, 1) + 1);
    return score(b) - score(a);
  });
}

const apiKey = (import.meta.env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim();

/** The provider the app should use. Google when configured, mock otherwise. */
export function getCoachProvider(): CoachSearchProvider {
  return apiKey ? createGooglePlacesProvider(apiKey) : mockProvider;
}

/* ---------- Browser location ---------- */

export function requestCurrentLocation(): Promise<CoachLocation> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new CoachSearchError("This device can't share a location."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          kind: "coords",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "your location",
        }),
      (err) =>
        reject(
          new CoachSearchError(
            err.code === err.PERMISSION_DENIED
              ? "Location access was declined."
              : "Couldn't get your location.",
            err,
          ),
        ),
      { timeout: 10000, maximumAge: 300000 },
    );
  });
}
