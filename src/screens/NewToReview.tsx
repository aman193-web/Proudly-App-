import { useState } from "react";
import { showToast } from "../components/states";
import { CHILDREN } from "../data";
import { Icon } from "../components/Icon";

/* New to review — Oct-1 redesign.
   ------------------------------
   What the sync found since last time and could not file on its own. Each row
   asks one question — whose is this? — and nothing else: no category, no
   dates, no confidence score. Dismiss drops it, a child chip files it, and
   one Accept at the foot commits everything that has an answer.

   Rows left unanswered stay in the queue, which is why Accept only takes the
   assigned ones and the screen does not close until the queue is empty. */

type Event = { id: string; title: string; meta: string };

const FOUND: Event[] = [
  { id: "e1", title: "Saturday morning club", meta: "Recurring · Sat 9:00 AM · 14 events" },
  { id: "e2", title: "Lessons at the centre", meta: "Recurring · Wed 4:30 PM · 9 events" },
  { id: "e3", title: "Weekend workshop", meta: "One-off · Feb 2026" },
  { id: "e4", title: "Spring showcase", meta: "One-off · Apr 2026" },
];

const TINTS = [
  { soft: "bg-pine-soft", ink: "text-pine", solid: "bg-pine", border: "border-pine" },
  { soft: "bg-rust-soft", ink: "text-rust", solid: "bg-rust", border: "border-rust" },
  { soft: "bg-amber-soft", ink: "text-amber-dark", solid: "bg-amber", border: "border-amber" },
];
const tintOf = (id: string) =>
  TINTS[Math.max(0, CHILDREN.findIndex((c) => c.id === id)) % TINTS.length];

/** What Home's review row and bell badge count. */
export const NEW_TO_REVIEW_COUNT = FOUND.length;

export function NewToReview({ onBack }: { onBack: () => void }) {
  const [queue, setQueue] = useState<Event[]>(FOUND);
  const [pick, setPick] = useState<Record<string, string | undefined>>({});
  const [syncing, setSyncing] = useState(false);

  const assigned = queue.filter((e) => pick[e.id]);

  const sync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 1200);
  };

  const accept = () => {
    if (!assigned.length) return;
    const keep = queue.filter((e) => !pick[e.id]);
    setQueue(keep);
    showToast(`${assigned.length} added`);
    if (!keep.length) onBack();
  };

  return (
    <div className="absolute inset-0 z-30 bg-canvas flex flex-col">
      <div className="shrink-0 pt-10">
        <div className="h-14 px-2 flex items-center">
          <button
            onClick={onBack}
            aria-label="Back"
            className="grid place-items-center w-12 h-12 rounded-full text-ink active:bg-hairline/50 transition-colors"
          >
            <Icon name="arrow_back" size={24} />
          </button>
          <div className="flex-1" />
          <button
            onClick={sync}
            className="h-10 mr-2 pl-2.5 pr-3.5 rounded-full flex items-center gap-1.5 text-pine font-[600] text-[14px] active:bg-pine-soft transition-colors"
          >
            <Icon name="sync" size={20} className={syncing ? "animate-spin" : undefined} />
            {syncing ? "Syncing" : "Sync"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-area pt-1 pb-4 flex flex-col">
        <div className="px-6 pb-3 flex flex-col gap-1.5">
          <h2 className="font-[700] text-[28px] leading-[1.15] tracking-[-0.02em] text-ink">
            New activities
          </h2>
          <p className="text-[15px] leading-[1.45] text-ink-soft">
            {queue.length
              ? `${queue.length} event${queue.length > 1 ? "s" : ""} we couldn't match to a child.`
              : "Nothing waiting."}
          </p>
        </div>

        {queue.map((e) => (
          <div key={e.id} className="px-6 py-3 flex flex-col gap-3">
            <div className="flex items-start gap-2.5">
              <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="text-[16px] font-[500] text-ink">{e.title}</span>
                <span className="text-[13px] text-ink-soft">{e.meta}</span>
              </span>
              <button
                onClick={() => setQueue((q) => q.filter((x) => x.id !== e.id))}
                aria-label={`Not an activity: ${e.title}`}
                className="grid place-items-center w-10 h-10 shrink-0 rounded-full text-[#8a908c] active:bg-black/5 transition-colors"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {CHILDREN.map((c) => {
                const tint = tintOf(c.id);
                const on = pick[e.id] === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() =>
                      setPick((p) => ({ ...p, [e.id]: p[e.id] === c.id ? undefined : c.id }))
                    }
                    aria-pressed={on}
                    className={`flex items-center gap-2 h-9 pl-1.5 pr-3.5 rounded-[18px] border transition-colors ${
                      on
                        ? `${tint.soft} ${tint.border} ${tint.ink}`
                        : "bg-surface border-hairline text-[#3d413f]"
                    }`}
                  >
                    <span
                      className={`grid place-items-center w-6 h-6 rounded-full text-[11px] font-[700] ${
                        on ? `${tint.solid} text-white` : `${tint.soft} ${tint.ink}`
                      }`}
                    >
                      {c.name[0]}
                    </span>
                    <span className="text-[14px] font-[600]">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {!queue.length && (
          <div className="px-6 py-10 flex flex-col items-center gap-2.5 text-ink-soft">
            <Icon name="check_circle" size={40} className="text-pine" />
            <span className="text-[14px]">All caught up. Tap sync to check again.</span>
          </div>
        )}
      </div>

      {queue.length > 0 && (
        <div className="shrink-0 px-6 pt-3 pb-5">
          <button
            onClick={accept}
            disabled={!assigned.length}
            className="h-14 w-full rounded-[28px] bg-pine text-white font-[600] text-[16px] disabled:bg-[#a7c1b9] active:scale-[0.98] transition-all"
          >
            Accept{assigned.length ? ` (${assigned.length})` : ""}
          </button>
        </div>
      )}
    </div>
  );
}
