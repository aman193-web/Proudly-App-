/* Calendar sync state
   ------------------
   Home's first button runs a sync and its label reports when the last one
   finished. Both live here so the label is the same wherever it is shown and
   a sync started from one screen is visible on another.

   Same external-store shape as notes and hours. */

import { useSyncExternalStore } from "react";

let syncing = false;
/** Minutes since the last sync. Starts at two hours, as the seeded record. */
let lastSyncAt = Date.now() - 2 * 60 * 60 * 1000;

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

/** Runs a sync. Resolves when it finishes, so a caller can chain a toast. */
export function runSync() {
  if (syncing) return;
  syncing = true;
  emit();
  setTimeout(() => {
    syncing = false;
    lastSyncAt = Date.now();
    emit();
  }, 1400);
}

function label() {
  if (syncing) return "Syncing…";
  const mins = Math.floor((Date.now() - lastSyncAt) / 60000);
  if (mins < 1) return "Synced just now";
  if (mins < 60) return `Synced ${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Synced ${hrs}h ago`;
  return `Synced ${Math.floor(hrs / 24)}d ago`;
}

/** Subscribes, so the label and the spinner update together. */
export function useSync() {
  useSyncExternalStore(subscribe, getSnapshot);
  return { syncing, label: label() };
}
