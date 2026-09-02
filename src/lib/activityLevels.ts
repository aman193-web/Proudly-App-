/* Activity level state
   --------------------
   Activities live in a static module, so a parent's level change needs
   somewhere to go. This is a tiny external store in the same spirit as the
   toast bus in components/states.tsx: module-level state plus a subscription,
   read through useSyncExternalStore.

   Swapping this for a real backend later means changing setLevel/resetLevel
   and the read in levelStateOf. Nothing else in the app touches the map. */

import { useSyncExternalStore } from "react";
import type { Activity, ActivityLevel, LevelSource } from "../data";
import { LEVEL_RANK, ACTIVITY_LEVELS } from "../data";
import { suggestLevelForActivity, type LevelSuggestion } from "./levelSuggestion";

export type LevelState = {
  suggested: ActivityLevel;
  current: ActivityLevel;
  source: LevelSource;
  /** Parent chose something other than the suggestion. */
  overridden: boolean;
};

type Override = { current: ActivityLevel; source: LevelSource };

const overrides = new Map<string, Override>();
const listeners = new Set<() => void>();
let version = 0;

const emit = () => {
  version += 1;
  listeners.forEach((l) => l());
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => void listeners.delete(l);
};

const getSnapshot = () => version;

/** Current level state for an activity, honouring any parent override. */
export function levelStateOf(activity: Activity): LevelState {
  const suggested = activity.suggestedLevel;
  const o = overrides.get(activity.id);
  const current = o?.current ?? activity.currentLevel;
  const source = o?.source ?? activity.levelSource;
  return { suggested, current, source, overridden: current !== suggested };
}

/** Reactive read. Any component rendering a level should use this. */
export function useActivityLevel(activity: Activity): LevelState {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return levelStateOf(activity);
}

/** Parent picks a level. suggestedLevel is never touched. */
export function setParentLevel(activity: Activity, level: ActivityLevel) {
  overrides.set(activity.id, { current: level, source: "parent" });
  emit();
}

/** Hand the level back to PROUDLY's suggestion. */
export function resetToSuggested(activity: Activity) {
  overrides.set(activity.id, { current: activity.suggestedLevel, source: "proudly" });
  emit();
}

/** The rung above the current one, or null at the top. */
export function nextLevel(level: ActivityLevel): ActivityLevel | null {
  return ACTIVITY_LEVELS[LEVEL_RANK[level] + 1] ?? null;
}

/** Why PROUDLY landed where it did — for the "Suggested by PROUDLY" line. */
export function suggestionFor(activity: Activity): LevelSuggestion {
  return suggestLevelForActivity(activity);
}

export { ACTIVITY_LEVELS };
