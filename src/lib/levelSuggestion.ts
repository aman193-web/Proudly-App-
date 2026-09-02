/* Level suggestion
   ----------------
   Works out which of the four levels an activity sits at, from whatever the
   record happens to contain. Deliberately rule-based and coarse for now: the
   weights below are a starting point to be refined once we have real data,
   not a scoring model to trust blindly.

   Two rules hold regardless of how the weights change:
     - Missing signals are skipped, never treated as zero. A suggestion is
       always produced from what is available.
     - The parent's choice always wins, and never overwrites the suggestion. */

import {
  type Activity,
  type ActivityLevel,
  type Child,
  type LevelSource,
  type YM,
  ACTIVITY_LEVELS,
  LEVEL_RANK,
  TODAY,
  achievementsForActivity,
  ageFromDob,
  childById,
} from "../data";

/* ---------- Inputs ---------- */

/** Everything the suggester can use. Every field is optional by design. */
export type LevelSignals = {
  /** Child's age in whole years. */
  ageYears?: number | null;
  /** How long the child has been doing this, in years. */
  yearsInvolved?: number | null;
  /** Typical sessions per week. */
  sessionsPerWeek?: number | null;
  /** Recorded achievements for this activity. */
  achievementCount?: number | null;
  /** Still running. */
  ongoing?: boolean;
};

export type LevelSuggestion = {
  level: ActivityLevel;
  /** 0-100ish. Exposed for debugging and future tuning, not for display. */
  score: number;
  /** How much of the picture we actually had. */
  confidence: "low" | "medium" | "high";
  /** Plain-language notes on what drove the result. */
  reasons: string[];
};

/* ---------- Tunable rules ----------
   Kept as named constants so they can be adjusted without touching logic. */

const WEIGHTS = {
  tenurePerYear: 10,
  tenureMax: 45,
  perAchievement: 15,
  achievementMax: 30,
  /** Applied per session per week beyond the first. */
  perExtraSessionPerWeek: 7.5,
  frequencyMax: 15,
  ongoingBonus: 5,
} as const;

/** Highest band first; the first threshold met wins. */
const THRESHOLDS: { min: number; level: ActivityLevel }[] = [
  { min: 70, level: "Champion" },
  { min: 40, level: "Intermediate" },
  { min: 15, level: "Beginner" },
  { min: 0, level: "Learning" },
];

/** Tenure alone should not make a very young child a Champion. */
const AGE_CAPS: { throughAge: number; cap: ActivityLevel }[] = [
  { throughAge: 4, cap: "Beginner" },
  { throughAge: 6, cap: "Intermediate" },
];

const clamp = (n: number, max: number) => Math.min(n, max);
const isNum = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

/* ---------- Core ---------- */

/** Suggest a level from raw signals. Safe to call with an empty object. */
export function suggestLevel(signals: LevelSignals): LevelSuggestion {
  const reasons: string[] = [];
  let score = 0;
  let known = 0;

  if (isNum(signals.yearsInvolved) && signals.yearsInvolved > 0) {
    known++;
    const pts = clamp(signals.yearsInvolved * WEIGHTS.tenurePerYear, WEIGHTS.tenureMax);
    score += pts;
    reasons.push(
      `${signals.yearsInvolved.toFixed(1)} year${signals.yearsInvolved >= 2 ? "s" : ""} involved`,
    );
  }

  if (isNum(signals.achievementCount) && signals.achievementCount > 0) {
    known++;
    const pts = clamp(
      signals.achievementCount * WEIGHTS.perAchievement,
      WEIGHTS.achievementMax,
    );
    score += pts;
    reasons.push(
      `${signals.achievementCount} achievement${signals.achievementCount > 1 ? "s" : ""} recorded`,
    );
  }

  if (isNum(signals.sessionsPerWeek) && signals.sessionsPerWeek > 1) {
    known++;
    const pts = clamp(
      (signals.sessionsPerWeek - 1) * WEIGHTS.perExtraSessionPerWeek,
      WEIGHTS.frequencyMax,
    );
    score += pts;
    reasons.push(`${signals.sessionsPerWeek}x a week`);
  }

  if (signals.ongoing) {
    score += WEIGHTS.ongoingBonus;
    reasons.push("still going");
  }

  let level = THRESHOLDS.find((t) => score >= t.min)?.level ?? "Learning";

  // Age cap, applied after scoring.
  if (isNum(signals.ageYears)) {
    const cap = AGE_CAPS.find((c) => (signals.ageYears as number) <= c.throughAge);
    if (cap && LEVEL_RANK[level] > LEVEL_RANK[cap.cap]) {
      level = cap.cap;
      reasons.push(`held at ${cap.cap} for age ${signals.ageYears}`);
    }
  }

  const confidence = known >= 3 ? "high" : known === 2 ? "medium" : "low";

  return { level, score: Math.round(score * 10) / 10, confidence, reasons };
}

/* ---------- Deriving signals from the record ---------- */

const yearsBetween = (start: YM, end: YM) =>
  Math.max(0, (end.y - start.y) * 12 + (end.m - start.m)) / 12;

/** Pull whatever signals the stored activity (and child) can provide. */
export function signalsForActivity(activity: Activity, child?: Child | null): LevelSignals {
  const resolved = child ?? childById(activity.childId) ?? null;
  const end = activity.end === "present" ? TODAY : activity.end;

  return {
    ageYears: ageFromDob(resolved?.dob),
    yearsInvolved: yearsBetween(activity.start, end),
    sessionsPerWeek: activity.sessionsPerWeek ?? null,
    achievementCount: achievementsForActivity(activity.id).length,
    ongoing: activity.end === "present",
  };
}

/** Suggest a level for a stored activity. */
export function suggestLevelForActivity(
  activity: Activity,
  child?: Child | null,
): LevelSuggestion {
  return suggestLevel(signalsForActivity(activity, child));
}

/* ---------- Reading and changing an activity's level ---------- */

/** The level to show and use. */
export const effectiveLevel = (activity: Activity): ActivityLevel => activity.currentLevel;

/** True when the parent has moved this off PROUDLY's suggestion. */
export const isParentOverridden = (activity: Activity): boolean =>
  activity.levelSource === "parent" && activity.currentLevel !== activity.suggestedLevel;

type LevelState = Pick<Activity, "suggestedLevel" | "currentLevel" | "levelSource">;

/** Parent picks a level. The suggestion is preserved untouched. */
export function setParentLevel(activity: Activity, level: ActivityLevel): LevelState {
  return {
    suggestedLevel: activity.suggestedLevel,
    currentLevel: level,
    levelSource: "parent",
  };
}

/** Hand control back to PROUDLY. */
export function resetToSuggested(activity: Activity): LevelState {
  return {
    suggestedLevel: activity.suggestedLevel,
    currentLevel: activity.suggestedLevel,
    levelSource: "proudly",
  };
}

/** Recompute the suggestion, leaving a parent's chosen level alone. */
export function refreshSuggestion(activity: Activity, child?: Child | null): LevelState {
  const suggested = suggestLevelForActivity(activity, child).level;
  const source: LevelSource = activity.levelSource;
  return {
    suggestedLevel: suggested,
    currentLevel: source === "parent" ? activity.currentLevel : suggested,
    levelSource: source,
  };
}

export { ACTIVITY_LEVELS };
