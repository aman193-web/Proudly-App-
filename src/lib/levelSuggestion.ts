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

/** One signal's contribution to the score. */
export type LevelContribution = {
  key: "tenure" | "achievements" | "frequency" | "ongoing";
  label: string;
  /** What the record says, in words. */
  detail: string;
  points: number;
  max: number;
};

export type LevelSuggestion = {
  level: ActivityLevel;
  /** 0-100ish. Exposed for debugging and future tuning, not for display. */
  score: number;
  /** How much of the picture we actually had. */
  confidence: "low" | "medium" | "high";
  /** Plain-language notes on what drove the result. */
  reasons: string[];
  /** Per-signal breakdown, for the "why this level?" explainer. */
  contributions: LevelContribution[];
  /** Set when age held the level below what the score alone would give. */
  cappedByAge: ActivityLevel | null;
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
  // 35 puts Intermediate at a round 3 years on time alone (30 + the ongoing 5).
  { min: 35, level: "Intermediate" },
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
  const contributions: LevelContribution[] = [];
  let score = 0;
  let known = 0;

  if (isNum(signals.yearsInvolved) && signals.yearsInvolved > 0) {
    known++;
    const pts = clamp(signals.yearsInvolved * WEIGHTS.tenurePerYear, WEIGHTS.tenureMax);
    score += pts;
    const detail = `${signals.yearsInvolved.toFixed(1)} year${signals.yearsInvolved >= 2 ? "s" : ""} involved`;
    reasons.push(detail);
    contributions.push({
      key: "tenure",
      label: "Time in the activity",
      detail,
      points: Math.round(pts * 10) / 10,
      max: WEIGHTS.tenureMax,
    });
  }

  if (isNum(signals.achievementCount) && signals.achievementCount > 0) {
    known++;
    const pts = clamp(
      signals.achievementCount * WEIGHTS.perAchievement,
      WEIGHTS.achievementMax,
    );
    score += pts;
    const detail = `${signals.achievementCount} achievement${signals.achievementCount > 1 ? "s" : ""} recorded`;
    reasons.push(detail);
    contributions.push({
      key: "achievements",
      label: "Achievements",
      detail,
      points: Math.round(pts * 10) / 10,
      max: WEIGHTS.achievementMax,
    });
  }

  if (isNum(signals.sessionsPerWeek) && signals.sessionsPerWeek > 1) {
    known++;
    const pts = clamp(
      (signals.sessionsPerWeek - 1) * WEIGHTS.perExtraSessionPerWeek,
      WEIGHTS.frequencyMax,
    );
    score += pts;
    const detail = `${signals.sessionsPerWeek}x a week`;
    reasons.push(detail);
    contributions.push({
      key: "frequency",
      label: "How often",
      detail,
      points: Math.round(pts * 10) / 10,
      max: WEIGHTS.frequencyMax,
    });
  }

  if (signals.ongoing) {
    score += WEIGHTS.ongoingBonus;
    reasons.push("still going");
    contributions.push({
      key: "ongoing",
      label: "Still going",
      detail: "Currently active",
      points: WEIGHTS.ongoingBonus,
      max: WEIGHTS.ongoingBonus,
    });
  }

  const byScore = THRESHOLDS.find((t) => score >= t.min)?.level ?? "Learning";
  let level = byScore;
  let cappedByAge: ActivityLevel | null = null;

  // Age cap, applied after scoring.
  if (isNum(signals.ageYears)) {
    const cap = AGE_CAPS.find((c) => (signals.ageYears as number) <= c.throughAge);
    if (cap && LEVEL_RANK[level] > LEVEL_RANK[cap.cap]) {
      level = cap.cap;
      cappedByAge = cap.cap;
      reasons.push(`held at ${cap.cap} for age ${signals.ageYears}`);
    }
  }

  const confidence = known >= 3 ? "high" : known === 2 ? "medium" : "low";

  return {
    level,
    score: Math.round(score * 10) / 10,
    confidence,
    reasons,
    contributions,
    cappedByAge,
  };
}

/* ---------- Explaining a level ---------- */

/** The score bands, for display. */
export const LEVEL_BANDS = THRESHOLDS.map((t) => ({ level: t.level, min: t.min })).reverse();

/** The rules themselves, so help copy can quote real numbers rather than
    hardcoding them and drifting when the weights are tuned. */
export const LEVEL_RULES = {
  weights: WEIGHTS,
  bands: LEVEL_BANDS,
  ageCaps: AGE_CAPS,
} as const;

/** Score a single signal in isolation — used for the reference tables. */
export const pointsForAchievements = (n: number) =>
  clamp(n * WEIGHTS.perAchievement, WEIGHTS.achievementMax);

export const pointsForSessions = (perWeek: number) =>
  perWeek <= 1 ? 0 : clamp((perWeek - 1) * WEIGHTS.perExtraSessionPerWeek, WEIGHTS.frequencyMax);

export const pointsForYears = (years: number) =>
  clamp(years * WEIGHTS.tenurePerYear, WEIGHTS.tenureMax);

/** Highest level a child of this age can hold, whatever the score. */
export function ageCeiling(age: number): ActivityLevel | null {
  return AGE_CAPS.find((c) => age <= c.throughAge)?.cap ?? null;
}

export type TenureRung = {
  level: ActivityLevel;
  /** Years needed to enter this band. */
  from: number;
  /** Years at which the next band starts, or null at the top. */
  to: number | null;
  /** False when time alone can never carry an activity this far. */
  reachable: boolean;
};

/** Year ranges per level assuming the common case: once a week, still going,
    nothing recorded as an achievement. Shows why time alone stops short. */
export function tenureLadder(): TenureRung[] {
  const base = WEIGHTS.ongoingBonus;
  const ceiling = WEIGHTS.tenureMax + base;
  const asc = [...THRESHOLDS].reverse();
  const yearsFor = (min: number) => Math.max(0, (min - base) / WEIGHTS.tenurePerYear);

  return asc.map((band, i) => {
    const next = asc[i + 1];
    return {
      level: band.level,
      from: yearsFor(band.min),
      to: next && ceiling >= next.min ? yearsFor(next.min) : null,
      reachable: ceiling >= band.min,
    };
  });
}

export type LevelExplainer = LevelSuggestion & {
  /** The rung above the suggested level. */
  next: ActivityLevel | null;
  /** Score still needed to reach it. */
  pointsToNext: number | null;
  /** Concrete ways to close that gap, given the current record. */
  waysToNext: string[];
};

/** Everything the UI needs to answer "why is my child at this level?". */
export function explainLevel(activity: Activity, child?: Child | null): LevelExplainer {
  const s = suggestLevelForActivity(activity, child);
  const rank = LEVEL_RANK[s.level];
  const next = ACTIVITY_LEVELS[rank + 1] ?? null;
  const band = next ? THRESHOLDS.find((t) => t.level === next) : undefined;
  const pointsToNext = band ? Math.max(0, Math.round((band.min - s.score) * 10) / 10) : null;

  const ways: string[] = [];
  if (pointsToNext !== null && pointsToNext > 0) {
    const spentTenure = s.contributions.find((c) => c.key === "tenure");
    const spentAch = s.contributions.find((c) => c.key === "achievements");
    const spentFreq = s.contributions.find((c) => c.key === "frequency");

    // Only offer a route that still has headroom under its cap.
    const tenureLeft = WEIGHTS.tenureMax - (spentTenure?.points ?? 0);
    if (tenureLeft > 0) {
      const years = Math.min(pointsToNext, tenureLeft) / WEIGHTS.tenurePerYear;
      if (years > 0) ways.push(`about ${years.toFixed(1)} more year${years >= 2 ? "s" : ""} of it`);
    }
    const achLeft = WEIGHTS.achievementMax - (spentAch?.points ?? 0);
    if (achLeft > 0) {
      const n = Math.ceil(Math.min(pointsToNext, achLeft) / WEIGHTS.perAchievement);
      if (n > 0) ways.push(`${n} more achievement${n > 1 ? "s" : ""}`);
    }
    const freqLeft = WEIGHTS.frequencyMax - (spentFreq?.points ?? 0);
    if (freqLeft > 0) {
      const n = Math.ceil(Math.min(pointsToNext, freqLeft) / WEIGHTS.perExtraSessionPerWeek);
      if (n > 0) ways.push(`${n} more session${n > 1 ? "s" : ""} a week`);
    }
  }

  return { ...s, next, pointsToNext, waysToNext: ways };
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
