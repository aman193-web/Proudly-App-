import { ChevronRight, GraduationCap, MessageCircleQuestion, Check, Sparkles } from "lucide-react";
import type { Activity, ActivityLevel } from "../data";
import { ACTIVITY_LEVELS, LEVEL_RANK } from "../data";
import {
  useActivityLevel,
  setParentLevel,
  resetToSuggested,
  nextLevel,
  suggestionFor,
} from "../lib/activityLevels";
import { Sheet } from "./Sheet";

/* Level styling — a progression through the existing palette:
   grey → mint → teal → gold. Matches the "Ongoing" pill treatment already
   used across the app so badges sit naturally beside activity names. */
const LEVEL_STYLE: Record<ActivityLevel, string> = {
  Learning: "bg-canvas text-ink-soft border border-hairline",
  Beginner: "bg-mint text-teal-dark",
  Intermediate: "bg-teal text-white",
  Champion: "bg-gold text-white",
};

/** Bar colour for the compact rank meter. */
const LEVEL_INK: Record<ActivityLevel, string> = {
  Learning: "#66716e",
  Beginner: "#217c72",
  Intermediate: "#217c72",
  Champion: "#b8893b",
};

/** Compact pill. Safe next to an activity name anywhere in the app. */
export function LevelBadge({
  activity,
  size = "sm",
}: {
  activity: Activity;
  size?: "sm" | "md";
}) {
  const { current } = useActivityLevel(activity);
  const dims =
    size === "md" ? "text-[12px] px-2.5 py-1" : "text-[10.5px] px-1.5 py-0.5";
  return (
    <span
      className={`shrink-0 font-[700] rounded-full whitespace-nowrap ${dims} ${LEVEL_STYLE[current]}`}
    >
      {current}
    </span>
  );
}

/** Four-bar rank meter for very tight spots, like the Gantt label column. */
export function LevelPip({ activity, showText = true }: { activity: Activity; showText?: boolean }) {
  const { current } = useActivityLevel(activity);
  const rank = LEVEL_RANK[current];
  const ink = LEVEL_INK[current];
  return (
    <span className="flex items-center gap-1 min-w-0">
      <span className="flex items-end gap-[1.5px] shrink-0" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="w-[2.5px] rounded-[1px]"
            style={{
              height: 4 + i * 2,
              background: i <= rank ? ink : "#dce3e0",
            }}
          />
        ))}
      </span>
      {showText && (
        <span className="text-[9.5px] font-[600] leading-none truncate" style={{ color: ink }}>
          {current}
        </span>
      )}
      <span className="sr-only">{current} level</span>
    </span>
  );
}

/** Bottom sheet for picking a level. Reuses the app's existing Sheet. */
export function LevelPickerSheet({
  activity,
  open,
  onClose,
}: {
  activity: Activity;
  open: boolean;
  onClose: () => void;
}) {
  const { current, suggested, source } = useActivityLevel(activity);

  return (
    <Sheet open={open} onClose={onClose}>
      <h3 className="font-display text-[18px] font-[700] text-ink px-1">Current level</h3>
      <p className="text-[12.5px] text-ink-soft px-1 mt-0.5 mb-3">
        {activity.name} · you can change this any time
      </p>

      <div className="space-y-1.5">
        {ACTIVITY_LEVELS.map((lvl) => {
          const active = lvl === current;
          return (
            <button
              key={lvl}
              onClick={() => {
                setParentLevel(activity, lvl);
                onClose();
              }}
              className={`w-full flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-colors ${
                active ? "bg-mint border-teal" : "bg-surface border-hairline active:bg-canvas"
              }`}
            >
              <span
                className={`text-[10.5px] font-[700] rounded-full px-1.5 py-0.5 shrink-0 ${LEVEL_STYLE[lvl]}`}
              >
                {lvl}
              </span>
              {lvl === suggested && (
                <span className="inline-flex items-center gap-1 text-[11px] font-[600] text-teal">
                  <Sparkles size={11} /> PROUDLY suggests
                </span>
              )}
              <span className="flex-1" />
              {active && <Check size={16} className="text-teal shrink-0" strokeWidth={3} />}
            </button>
          );
        })}
      </div>

      {source === "parent" && current !== suggested && (
        <button
          onClick={() => {
            resetToSuggested(activity);
            onClose();
          }}
          className="w-full mt-3 h-11 rounded-xl bg-surface border border-hairline text-[13.5px] font-[600] text-ink-soft active:scale-[0.99] transition-transform"
        >
          Use PROUDLY's suggestion ({suggested})
        </button>
      )}
    </Sheet>
  );
}

/* ---------- Next level card ----------
   Ties the current level, PROUDLY's reasoning and the two ways forward into
   one block on Activity Detail. Deliberately a single card, not a dashboard. */
export function NextLevelCard({
  activity,
  onChangeLevel,
  onAskProudly,
  onConnectCoach,
}: {
  activity: Activity;
  onChangeLevel: () => void;
  onAskProudly: () => void;
  onConnectCoach: () => void;
}) {
  const { current, suggested, source, overridden } = useActivityLevel(activity);
  const up = nextLevel(current);
  const reasons = suggestionFor(activity).reasons.slice(0, 3).join(", ");

  return (
    <div className="rounded-[22px] bg-surface border border-hairline overflow-hidden">
      {/* Current level — tap to change */}
      <button
        onClick={onChangeLevel}
        className="w-full text-left px-4 pt-4 pb-3.5 active:bg-canvas transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="flex-1 min-w-0">
            <span className="block text-[12px] font-[600] text-ink-soft uppercase tracking-[0.04em]">
              Current level
            </span>
            <span className="block font-display text-[24px] font-[700] text-ink leading-tight mt-0.5">
              {current}
            </span>
          </span>
          <span className="flex items-center gap-1 shrink-0 text-[12.5px] font-[600] text-teal">
            Change <ChevronRight size={15} />
          </span>
        </div>

        {/* Where the level came from */}
        {source === "proudly" ? (
          <span className="flex items-center gap-1.5 mt-2 text-[12.5px] font-[600] text-teal">
            <Sparkles size={12} className="shrink-0" /> Suggested by PROUDLY
          </span>
        ) : (
          <span className="flex items-center gap-1.5 mt-2 text-[12.5px] font-[600] text-ink-soft">
            You set this level
          </span>
        )}

        {reasons && (
          <span className="block text-[12px] text-ink-soft mt-1 leading-relaxed">
            Based on {reasons}.
          </span>
        )}

        {/* Parent disagreed with PROUDLY — show the suggestion separately. */}
        {overridden && (
          <span className="inline-flex items-center gap-1.5 mt-2.5 text-[11.5px] font-[600] text-teal bg-mint rounded-full px-2 py-1">
            <Sparkles size={11} /> PROUDLY suggests {suggested}
          </span>
        )}
      </button>

      {/* Next level */}
      <div className="border-t border-hairline px-4 py-3.5 bg-canvas/60">
        <div className="flex items-center gap-3">
          <span className="flex-1 min-w-0">
            <span className="block text-[12px] font-[600] text-ink-soft uppercase tracking-[0.04em]">
              Next level
            </span>
            <span className="block font-display text-[18px] font-[700] text-ink leading-tight mt-0.5">
              {up ?? "Top level reached"}
            </span>
          </span>
          {up && (
            <span
              className={`shrink-0 text-[10.5px] font-[700] rounded-full px-1.5 py-0.5 ${LEVEL_STYLE[up]}`}
            >
              {up}
            </span>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={onAskProudly}
            className="flex-1 h-11 rounded-xl bg-surface border border-hairline flex items-center justify-center gap-1.5 text-[13.5px] font-[600] text-ink active:scale-[0.99] transition-transform"
          >
            <MessageCircleQuestion size={15} /> Ask PROUDLY
          </button>
          <button
            onClick={onConnectCoach}
            className="flex-1 h-11 rounded-xl bg-teal text-white flex items-center justify-center gap-1.5 text-[13.5px] font-[600] active:scale-[0.99] transition-transform"
          >
            <GraduationCap size={15} /> Find a coach
          </button>
        </div>
      </div>
    </div>
  );
}
