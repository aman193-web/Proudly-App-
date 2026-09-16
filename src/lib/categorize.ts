/* Activity categorisation
   -----------------------
   Calendar gives us an event title and nothing else, so the category has to be
   inferred from the words in it. This is the keyword table that inference uses.

   UI-free on purpose: the same mapping serves the onboarding review, manual
   entry, and any later server-side pass, so the taxonomy cannot drift between
   them. Swapping this for a model later means replacing categorizeActivity and
   leaving the table as the fallback. */

import type { Category } from "../data";

/** Keywords per category, lower-case. Order within a list does not matter. */
export const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  "Sports & Athletics": [
    "soccer",
    "football",
    "baseball",
    "basketball",
    "tennis",
    "swim",
    "swimming",
    "gymnastic",
    "gymnastics",
    "volleyball",
    "track",
    "martial arts",
    "karate",
    "taekwondo",
    "golf",
    "hockey",
  ],
  "Music & Performance": [
    "piano",
    "violin",
    "guitar",
    "choir",
    "band",
    "orchestra",
    "music lesson",
    "music",
    "voice lesson",
  ],
  "Dance & Theater": [
    "dance",
    "ballet",
    "theater",
    "theatre",
    "drama",
    "school play",
  ],
  Academics: [
    "math",
    "rsm",
    "kumon",
    "tutoring",
    "tutor",
    "academic",
    "reading",
    "science",
  ],
  "Arts & Crafts": [
    "art class",
    "art",
    "painting",
    "drawing",
    "pottery",
    "ceramics",
  ],
  "STEM & Robotics": [
    "robot",
    "robotics",
    "coding",
    "stem",
    "programming",
    "lego league",
    "lego",
  ],
  // Nothing in the table maps here; both stay available for manual entry.
  Outdoors: [],
  Other: [],
};

/* Longest keyword first, so "music lesson" is tried before "music" and
   "art class" before "art" — otherwise the broader word would always win and
   the specific entries in the table would never be reached. */
const MATCHERS: { keyword: string; category: Category }[] = (
  Object.entries(CATEGORY_KEYWORDS) as [Category, string[]][]
)
  .flatMap(([category, words]) => words.map((keyword) => ({ keyword, category })))
  .sort((a, b) => b.keyword.length - a.keyword.length);

/* Word-boundary match, so "art" does not fire on "Martial arts" or "party",
   while still matching "Art class" and "art-club". Keywords that are already
   multi-word are matched the same way. */
const boundaryRe = (keyword: string) =>
  new RegExp(`(^|[^a-z0-9])${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`, "i");

/**
 * Best-guess category for an activity or calendar event title.
 * Falls back to "Other" when nothing in the table matches — a wrong guess is
 * worse than an honest one the parent can correct.
 */
export function categorizeActivity(title: string): Category {
  const hay = title.toLowerCase();
  for (const m of MATCHERS) {
    if (boundaryRe(m.keyword).test(hay)) return m.category;
  }
  return "Other";
}

/** True when the title matched a keyword rather than falling through. */
export const wasCategorized = (title: string) => categorizeActivity(title) !== "Other";
