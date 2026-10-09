/* Logged volunteering hours
   ------------------------
   Hours accrue after the record is seeded, so they live in a store rather
   than on the Activity. Read `hoursFor` wherever a row prints a total: it
   folds the seeded figure and anything logged since into one number.

   Same external-store shape as savedCoaches and notes. */

import { useSyncExternalStore } from "react";
import { activityById } from "../data";

const logged = new Map<string, number>();
const listeners = new Set<() => void>();
let version = 0;

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => void listeners.delete(l);
};

const getSnapshot = () => version;

export function logHours(activityId: string, hours: number) {
  logged.set(activityId, (logged.get(activityId) ?? 0) + hours);
  version += 1;
  listeners.forEach((l) => l());
}

export const hoursFor = (activityId: string) =>
  (activityById(activityId)?.hours ?? 0) + (logged.get(activityId) ?? 0);

/** Subscribes, so a row re-renders the moment hours are added. */
export function useHours(activityId: string) {
  useSyncExternalStore(subscribe, getSnapshot);
  return hoursFor(activityId);
}

/** "24 hrs" / "1 hr" / "2.5 hrs" — the prototype's own formatting. */
export const fmtHours = (h: number) =>
  `${Number.isInteger(h) ? h : h.toFixed(1)} hr${h === 1 ? "" : "s"}`;
