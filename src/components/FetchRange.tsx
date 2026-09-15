import { useState } from "react";
import { ChevronDown, History } from "lucide-react";
import { Sheet } from "./Sheet";

/* How far back a connected source is scanned.
   ------------------------------------------
   Stored as months so two ranges can be compared without parsing labels;
   null means no limit. */
export type FetchRange = {
  id: string;
  label: string;
  /** null = no cut-off. */
  months: number | null;
};

export const FETCH_RANGES: FetchRange[] = [
  { id: "1m", label: "1 month", months: 1 },
  { id: "2m", label: "2 months", months: 2 },
  { id: "3m", label: "3 months", months: 3 },
  { id: "6m", label: "6 months", months: 6 },
  { id: "9m", label: "9 months", months: 9 },
  { id: "1y", label: "1 year", months: 12 },
  { id: "2y", label: "2 years", months: 24 },
  { id: "5y", label: "5 years", months: 60 },
  { id: "all", label: "All time", months: null },
];

/* A child's record spans years — the app shows activities running six years
   and counts "years tracked" on the home screen — so a short default window
   would hide most of what PROUDLY exists to surface. Two years is long enough
   to feel complete on the first sync without pulling a decade of calendar. */
export const DEFAULT_FETCH_RANGE = "2y";

export const rangeById = (id: string): FetchRange =>
  FETCH_RANGES.find((r) => r.id === id) ?? FETCH_RANGES[FETCH_RANGES.length - 1];

/** Compact row: a label and a pill that opens the full ladder in a sheet. */
export function FetchRangeControl({
  value,
  onChange,
  sourceName,
}: {
  value: string;
  onChange: (id: string) => void;
  /** Named in the sheet so it is obvious which source is being scoped. */
  sourceName: string;
}) {
  const [open, setOpen] = useState(false);
  const current = rangeById(value);

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-soft">
          <History size={13} /> Fetch history
        </span>
        <button
          onClick={() => setOpen(true)}
          aria-label={`Fetch history for ${sourceName}: ${current.label}`}
          className="inline-flex items-center gap-1 h-7 pl-3 pr-2 rounded-full bg-canvas border border-hairline text-[12.5px] font-[600] text-ink active:scale-95 transition-transform"
        >
          {current.label}
          <ChevronDown size={14} className="text-ink-soft" />
        </button>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)}>
        <h3 className="font-display text-[18px] font-[700] text-ink px-1">How far back?</h3>
        <p className="text-[12.5px] text-ink-soft px-1 mt-1 mb-3 leading-snug">
          PROUDLY scans {sourceName} back this far. Anything older is skipped — you can
          widen it later.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {FETCH_RANGES.map((r) => {
            const active = r.id === value;
            return (
              <button
                key={r.id}
                onClick={() => {
                  onChange(r.id);
                  setOpen(false);
                }}
                aria-pressed={active}
                className={`h-[46px] rounded-xl text-[13px] font-[600] border transition-colors ${
                  active
                    ? "bg-teal text-white border-teal"
                    : "bg-surface border-hairline text-ink active:bg-canvas"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </Sheet>
    </>
  );
}
