/* Saved coaches
   -------------
   Coach discovery is a search — results change with location and Google's
   ranking, so a coach a parent liked is easy to lose. Saving keeps the ones
   worth remembering, per activity.

   Same external-store shape as activityLevels: module state plus a
   subscription, read through useSyncExternalStore. Swap the map for a
   backend and nothing else in the app changes. */

import { useSyncExternalStore } from "react";
import type { Coach } from "./coachSearch";

export type SavedCoach = {
  coach: Coach;
  /** The activity the parent was looking at when they saved it. */
  activityId: string;
  /** Insertion order, so the list stays stable and newest-first. */
  order: number;
};

const saved = new Map<string, SavedCoach>();
const listeners = new Set<() => void>();
let version = 0;
let counter = 0;

const emit = () => {
  version += 1;
  listeners.forEach((l) => l());
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => void listeners.delete(l);
};

const getSnapshot = () => version;

const newestFirst = (a: SavedCoach, b: SavedCoach) => b.order - a.order;

export function isSaved(coachId: string): boolean {
  return saved.has(coachId);
}

export function toggleSaved(coach: Coach, activityId: string) {
  if (saved.has(coach.id)) saved.delete(coach.id);
  else saved.set(coach.id, { coach, activityId, order: ++counter });
  emit();
}

export function removeSaved(coachId: string) {
  saved.delete(coachId);
  emit();
}

/** All saved coaches, newest first. */
export function listSaved(): SavedCoach[] {
  return [...saved.values()].sort(newestFirst);
}

/** Saved coaches for one activity, newest first. */
export function listSavedFor(activityId: string): SavedCoach[] {
  return listSaved().filter((s) => s.activityId === activityId);
}

/* ---------- Reactive reads ---------- */

export function useSavedCoaches(): SavedCoach[] {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return listSaved();
}

export function useSavedCoachesFor(activityId: string): SavedCoach[] {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return listSavedFor(activityId);
}

export function useIsSaved(coachId: string): boolean {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return isSaved(coachId);
}

export function useSavedCount(): number {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return saved.size;
}
