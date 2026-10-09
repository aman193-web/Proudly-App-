/* Row notes
   ---------
   The redesign puts a note button on every activity and accomplishment row,
   so a parent can add context where they see the thing rather than opening
   its edit screen. Notes keyed by row id, seeded from whatever the record
   already carries.

   Same external-store shape as savedCoaches: module state plus a
   subscription, read through useSyncExternalStore. Swap the map for a
   backend and nothing else in the app changes. */

import { useSyncExternalStore } from "react";

const notes = new Map<string, string>();
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

/** Seed from the record once, so an edit does not lose the original text. */
export function seedNote(id: string, text: string | undefined) {
  if (text && !notes.has(id)) notes.set(id, text);
}

export function setNote(id: string, text: string) {
  const t = text.trim();
  if (t) notes.set(id, t);
  else notes.delete(id);
  emit();
}

export function readNote(id: string) {
  return notes.get(id) ?? "";
}

/** Subscribes, so a row re-renders the moment its note changes. */
export function useNote(id: string) {
  useSyncExternalStore(subscribe, getSnapshot);
  return notes.get(id) ?? "";
}
