import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Bookmark,
  ExternalLink,
  Loader2,
  LocateFixed,
  MapPin,
  Search,
  SearchX,
  Star,
} from "lucide-react";
import { AppHeader, PrimaryButton } from "../components/ui";
import { EmptyState } from "../components/states";
import type { Activity } from "../data";
import { CATEGORY_COLOR } from "../data";
import {
  type Coach,
  type CoachLocation,
  CoachSearchError,
  getCoachProvider,
  requestCurrentLocation,
} from "../lib/coachSearch";
import { toggleSaved, useIsSaved, useSavedCoachesFor } from "../lib/savedCoaches";
import { showToast } from "../components/states";

type Phase =
  | { kind: "location" }
  | { kind: "loading" }
  | { kind: "results"; coaches: Coach[] }
  | { kind: "empty" }
  | { kind: "error"; message: string };

const labelFor = (l: CoachLocation) => (l.kind === "text" ? l.value : (l.label ?? "your location"));

export function CoachFinder({ activity, onBack }: { activity: Activity; onBack: () => void }) {
  const [phase, setPhase] = useState<Phase>({ kind: "location" });
  const [location, setLocation] = useState<CoachLocation | null>(null);
  const [manual, setManual] = useState("");
  const [locating, setLocating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const savedForActivity = useSavedCoachesFor(activity.id);

  // Drop any in-flight search when the screen closes.
  useEffect(() => () => abortRef.current?.abort(), []);

  const run = useCallback(
    async (loc: CoachLocation) => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      setLocation(loc);
      setPhase({ kind: "loading" });
      try {
        const coaches = await getCoachProvider().search(
          { activityName: activity.name, category: activity.category, location: loc },
          ctrl.signal,
        );
        if (ctrl.signal.aborted) return;
        setPhase(coaches.length ? { kind: "results", coaches } : { kind: "empty" });
      } catch (e) {
        if (ctrl.signal.aborted) return;
        setPhase({
          kind: "error",
          message:
            e instanceof CoachSearchError ? e.message : "Something went wrong. Try again.",
        });
      }
    },
    [activity],
  );

  const useMyLocation = async () => {
    setLocating(true);
    try {
      run(await requestCurrentLocation());
    } catch (e) {
      setPhase({
        kind: "error",
        message: e instanceof CoachSearchError ? e.message : "Couldn't get your location.",
      });
    } finally {
      setLocating(false);
    }
  };

  const searchManual = () => {
    const v = manual.trim();
    if (v) run({ kind: "text", value: v });
  };

  return (
    <div className="size-full flex flex-col bg-canvas">
      <AppHeader title="Find a coach" onBack={onBack} />

      <div className="flex-1 overflow-y-auto scroll-area px-4 pb-8">
        {/* Context */}
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: CATEGORY_COLOR[activity.category] }}
          />
          <span className="text-[13px] font-[600] text-ink-soft">{activity.category}</span>
        </div>
        <h1 className="font-display text-[22px] font-[700] text-ink leading-snug mt-1">
          Top-rated {activity.name} coaches nearby
        </h1>
        <p className="text-[13px] text-ink-soft mt-1">
          Ranked by Google rating and review count.
        </p>

        {/* Already saved for this activity */}
        {savedForActivity.length > 0 && (
          <div className="mt-4">
            <p className="text-[12px] font-[600] text-ink-soft uppercase tracking-[0.04em] mb-2">
              Saved for {activity.name}
            </p>
            <div className="space-y-2.5">
              {savedForActivity.map((s) => (
                <CoachCard key={s.coach.id} coach={s.coach} activityId={activity.id} />
              ))}
            </div>
          </div>
        )}

        {/* Where we're searching, once we know */}
        {location && phase.kind !== "location" && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-surface border border-hairline px-3.5 h-11">
            <MapPin size={15} className="text-teal shrink-0" />
            <span className="flex-1 text-[13.5px] text-ink truncate">{labelFor(location)}</span>
            <button
              onClick={() => setPhase({ kind: "location" })}
              className="text-[12.5px] font-[600] text-teal shrink-0 active:opacity-60"
            >
              Change
            </button>
          </div>
        )}

        {/* ---------- Location step ---------- */}
        {phase.kind === "location" && (
          <div className="mt-5">
            <button
              onClick={useMyLocation}
              disabled={locating}
              className="w-full h-[54px] rounded-2xl bg-teal text-white font-[600] text-[15px] flex items-center justify-center gap-2.5 active:scale-[0.985] transition-transform disabled:opacity-60"
            >
              {locating ? <Loader2 size={18} className="animate-spin" /> : <LocateFixed size={18} />}
              {locating ? "Getting your location…" : "Use my current location"}
            </button>

            <div className="flex items-center gap-3 py-4">
              <span className="flex-1 h-px bg-hairline" />
              <span className="text-[12.5px] text-ink-soft font-[500]">or</span>
              <span className="flex-1 h-px bg-hairline" />
            </div>

            <label className="block">
              <span className="block text-[13px] font-[500] text-ink-soft mb-1.5 ml-0.5">
                City or ZIP code
              </span>
              <div className="flex gap-2">
                <input
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchManual()}
                  placeholder="e.g. Boston, MA or 02138"
                  className="h-[52px] flex-1 min-w-0 rounded-2xl bg-surface px-4 text-[16px] text-ink border border-hairline outline-none focus:border-teal focus:ring-4 focus:ring-teal/10 transition placeholder:text-ink-soft/60"
                />
                <button
                  onClick={searchManual}
                  disabled={!manual.trim()}
                  aria-label="Search this location"
                  className="w-[52px] h-[52px] shrink-0 grid place-items-center rounded-2xl bg-teal text-white active:scale-95 transition-transform disabled:opacity-40"
                >
                  <Search size={19} />
                </button>
              </div>
            </label>

            <p className="text-[12px] text-ink-soft/80 mt-3 leading-relaxed">
              PROUDLY only uses your location to find nearby coaches. It is not stored.
            </p>
          </div>
        )}

        {/* ---------- Loading ---------- */}
        {phase.kind === "loading" && (
          <div className="mt-4 space-y-2.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-surface border border-hairline p-3.5 animate-pulse"
              >
                <div className="h-3.5 w-1/2 rounded-full bg-hairline" />
                <div className="h-3 w-1/3 rounded-full bg-hairline mt-2.5" />
                <div className="h-3 w-2/3 rounded-full bg-hairline mt-2" />
              </div>
            ))}
            <p className="text-[12.5px] text-ink-soft text-center pt-1">
              Searching {activity.name} coaches…
            </p>
          </div>
        )}

        {/* ---------- Results ---------- */}
        {phase.kind === "results" && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 space-y-2.5"
          >
            {phase.coaches.map((c) => (
              <CoachCard key={c.id} coach={c} activityId={activity.id} />
            ))}
            <p className="text-[11.5px] text-ink-soft/80 text-center pt-2 leading-relaxed">
              Ratings and reviews from Google. PROUDLY doesn't endorse or vet coaches.
            </p>
          </motion.div>
        )}

        {/* ---------- No results ---------- */}
        {phase.kind === "empty" && (
          <div className="mt-4 rounded-[22px] bg-surface border border-hairline">
            <EmptyState
              icon={<SearchX size={24} />}
              title={`No ${activity.name} coaches found`}
              body="Try a nearby city or a wider search area."
              actionLabel="Change location"
              onAction={() => setPhase({ kind: "location" })}
            />
          </div>
        )}

        {/* ---------- Error ---------- */}
        {phase.kind === "error" && (
          <div className="mt-5 rounded-[22px] bg-surface border border-hairline px-7 py-9 flex flex-col items-center text-center">
            <span className="grid place-items-center w-14 h-14 rounded-2xl bg-[#faeae6] text-[#b4432f] mb-4">
              <MapPin size={24} />
            </span>
            <h3 className="font-display text-[17px] font-[700] text-ink leading-snug max-w-[250px]">
              {phase.message}
            </h3>
            <p className="text-[13px] text-ink-soft mt-2 max-w-[240px] leading-relaxed">
              You can enter a city or ZIP code instead.
            </p>
            <div className="w-full max-w-[240px] mt-5">
              <PrimaryButton onClick={() => setPhase({ kind: "location" })}>
                Enter a location
              </PrimaryButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CoachCard({ coach, activityId }: { coach: Coach; activityId: string }) {
  const saved = useIsSaved(coach.id);
  return (
    <div className="rounded-2xl bg-surface border border-hairline p-3.5">
      <div className="flex items-start gap-3">
        <span className="flex-1 min-w-0">
          <p className="text-[15px] font-[700] text-ink leading-snug">{coach.name}</p>
          <p className="text-[12px] text-ink-soft mt-0.5">
            {coach.activity}
            {coach.distanceMi !== undefined && ` · ${coach.distanceMi} mi`}
          </p>
        </span>
        <span className="flex items-center gap-1 shrink-0 bg-gold-soft text-gold rounded-full px-2 py-1">
          <Star size={12} className="fill-current" />
          <span className="text-[12px] font-[700] tabular-nums">{coach.rating.toFixed(1)}</span>
        </span>
        <button
          onClick={() => {
            toggleSaved(coach, activityId);
            showToast(saved ? "Removed from saved" : "Coach saved");
          }}
          aria-label={saved ? `Remove ${coach.name} from saved` : `Save ${coach.name}`}
          aria-pressed={saved}
          className="shrink-0 grid place-items-center w-8 h-8 rounded-full active:scale-90 transition-transform"
        >
          <Bookmark
            size={18}
            className={saved ? "text-teal fill-current" : "text-ink-soft"}
          />
        </button>
      </div>

      <p className="text-[12px] text-ink-soft mt-1.5 tabular-nums">
        {coach.reviewCount.toLocaleString()} review{coach.reviewCount === 1 ? "" : "s"}
      </p>

      {coach.location && (
        <p className="flex items-start gap-1.5 text-[12.5px] text-ink-soft mt-2 leading-snug">
          <MapPin size={13} className="shrink-0 mt-[2px]" />
          <span className="min-w-0">{coach.location}</span>
        </p>
      )}

      <a
        href={coach.googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 h-10 w-full rounded-xl bg-canvas border border-hairline flex items-center justify-center gap-1.5 text-[13.5px] font-[600] text-ink active:scale-[0.99] transition-transform"
      >
        View on Google <ExternalLink size={14} />
      </a>
    </div>
  );
}
