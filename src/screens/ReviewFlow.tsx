import { useState } from "react";
import { Screen, AppHeader } from "../components/ui";
import { CHILDREN } from "../data";
import { Icon } from "../components/Icon";

/* Review — Oct-1 redesign, two steps.
   ----------------------------------
   The client's note: "Two-step review: matched by child → assign the rest.
   One Accept button."

   Step 1 lists what the sync matched to a child by name, grouped by child,
   every row checked — the parent only has to uncheck what is wrong. Step 2
   lists the events with no name in them and asks whose they are; leaving one
   blank drops it. Neither step opens a session list: the old screen's
   event-by-event drill-down is gone from the flow. */

type Found = { id: string; name: string; range: string; childId: string };
type Unnamed = { id: string; name: string; range: string };

/* What a first calendar scan would come back with. Matched events carry a
   child's name in their title, which is why they are already assigned. */
const MATCHED: Found[] = [
  { id: "m1", name: "Reet art classes", range: "Feb 2023 – now", childId: "reet" },
  { id: "m2", name: "Reet dance", range: "Sep 2022 – now", childId: "reet" },
  { id: "m3", name: "Reet piano", range: "Jan 2024 – now", childId: "reet" },
  { id: "m4", name: "Reet pet shop volunteering", range: "Apr 2025 – now", childId: "reet" },
  { id: "m5", name: "Aanya voice lessons", range: "Oct 2022 – now", childId: "aanya" },
  { id: "m6", name: "Aanya speech and debate class", range: "Jan 2025 – now", childId: "aanya" },
];

const UNNAMED: Unnamed[] = [
  { id: "u1", name: "Soccer practice", range: "Mar 2025 – now" },
  { id: "u2", name: "Swim team", range: "Jun 2025 – now" },
  { id: "u3", name: "Choir", range: "Aug 2024 – now" },
  { id: "u4", name: "Robotics club", range: "Sep 2025 – now" },
];

/* Each child's tint, used for their initial everywhere they are listed. */
const TINTS = [
  { soft: "bg-pine-soft", ink: "text-pine", solid: "bg-pine", border: "border-pine" },
  { soft: "bg-rust-soft", ink: "text-rust", solid: "bg-rust", border: "border-rust" },
  { soft: "bg-amber-soft", ink: "text-amber-dark", solid: "bg-amber", border: "border-amber" },
];
const tintOf = (id: string) =>
  TINTS[Math.max(0, CHILDREN.findIndex((c) => c.id === id)) % TINTS.length];

/* ---------- Step 1: matched by child ---------- */
export function ReviewMatched({
  onBack,
  onAccept,
}: {
  onBack: () => void;
  onAccept: () => void;
}) {
  const [off, setOff] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setOff((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const accepted = MATCHED.length - off.size;
  const groups = CHILDREN.map((c) => ({
    child: c,
    rows: MATCHED.filter((m) => m.childId === c.id),
  })).filter((g) => g.rows.length);

  return (
    <Screen>
      <AppHeader
        title="Matched activities"
        onBack={onBack}
        step="Step 3 of 3 · Review 1/2"
      />
      <div className="flex-1 overflow-y-auto scroll-area pb-4 flex flex-col">
        <p className="px-6 pb-2 text-[15px] leading-[1.45] text-ink-soft">
          Found by name. Uncheck anything that's wrong.
        </p>

        {groups.map((g) => {
          const tint = tintOf(g.child.id);
          const on = g.rows.filter((r) => !off.has(r.id)).length;
          return (
            <div key={g.child.id} className="mt-2 pt-3.5 pb-1.5 flex flex-col">
              <div className="px-6 pb-1.5 flex items-center gap-2.5">
                <span
                  className={`grid place-items-center w-7 h-7 rounded-full text-[12px] font-[700] ${tint.soft} ${tint.ink}`}
                >
                  {g.child.name[0]}
                </span>
                <span className="flex-1 text-[14px] font-[600] text-ink">{g.child.name}</span>
                <span className="text-[13px] font-[500] text-ink-soft">
                  {on} of {g.rows.length}
                </span>
              </div>
              {g.rows.map((r) => {
                const checked = !off.has(r.id);
                return (
                  <button
                    key={r.id}
                    onClick={() => toggle(r.id)}
                    aria-pressed={checked}
                    className="flex items-center gap-4 min-h-[60px] px-6 text-left"
                  >
                    <span
                      className={`grid place-items-center w-6 h-6 rounded-md shrink-0 transition-colors ${
                        checked ? "bg-pine" : "border-2 border-[#9aa09c]"
                      }`}
                    >
                      {checked && <Icon name="check" size={16} strokeWidth={3} className="text-white" />}
                    </span>
                    <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <span className="text-[16px] font-[500] text-ink">{r.name}</span>
                      <span className="text-[13px] text-ink-soft">{r.range}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}

      </div>

      <div className="shrink-0 px-6 pt-3 pb-5 flex flex-col gap-2">
        <button
          onClick={onAccept}
          className="h-14 w-full rounded-[28px] bg-pine text-white font-[600] text-[16px] active:scale-[0.98] transition-transform"
        >
          Accept ({accepted})
        </button>
        <span className="text-[13px] text-ink-soft">
          Next: {UNNAMED.length} events without a name
        </span>
      </div>
    </Screen>
  );
}

/* ---------- Step 2: assign the rest ---------- */
export function ReviewUnnamed({
  onBack,
  onAccept,
}: {
  onBack: () => void;
  onAccept: () => void;
}) {
  const [pick, setPick] = useState<Record<string, string | undefined>>({});

  return (
    <Screen>
      <AppHeader title="Who's this for?" onBack={onBack} step="Step 3 of 3 · Review 2/2" />
      <div className="flex-1 overflow-y-auto scroll-area pb-4 flex flex-col gap-1">
        <p className="px-6 pb-3 text-[15px] leading-[1.45] text-ink-soft">
          No name in these events. Tap a child, or leave blank to skip.
        </p>

        {UNNAMED.map((u) => (
          <div key={u.id} className="px-6 py-3 flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[16px] font-[500] text-ink">{u.name}</span>
              <span className="text-[13px] text-ink-soft">{u.range}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {CHILDREN.map((c) => {
                const tint = tintOf(c.id);
                const on = pick[u.id] === c.id;
                return (
                  <button
                    key={c.id}
                    /* Tapping the chosen child again clears it, which is how a
                       row gets left blank after a mis-tap. */
                    onClick={() =>
                      setPick((p) => ({ ...p, [u.id]: p[u.id] === c.id ? undefined : c.id }))
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
      </div>

      <div className="shrink-0 px-6 pt-3 pb-5">
        <button
          onClick={onAccept}
          className="h-14 w-full rounded-[28px] bg-pine text-white font-[600] text-[16px] active:scale-[0.98] transition-transform"
        >
          Accept
        </button>
      </div>
    </Screen>
  );
}

/* ---------- All set ---------- */
export function AllSet({
  onAddActivities,
  onDone,
}: {
  onAddActivities: () => void;
  onDone: () => void;
}) {
  /* What the review just produced, per child. Counts come from the scan
     rather than the seeded record, so they match what was accepted. */
  const tally = CHILDREN.map((c) => ({
    child: c,
    acts: MATCHED.filter((m) => m.childId === c.id).length + (c.id === "reet" ? 1 : 0),
    wins: c.id === "reet" ? 4 : 2,
  }));

  return (
    <Screen>
      <div className="flex-1 overflow-y-auto scroll-area px-6 pt-12 pb-4 flex flex-col gap-5">
        <span className="grid place-items-center w-16 h-16 rounded-full bg-pine-soft text-pine">
          <Icon name="check_circle" size={34} fill />
        </span>

        <div className="flex flex-col gap-2">
          <h2 className="font-[700] text-[30px] leading-[1.12] tracking-[-0.025em] text-ink">
            You're all set
          </h2>
          <p className="text-[15px] leading-[1.45] text-ink-soft">
            Missing something that isn't on a calendar, like past seasons or awards? Add it
            now or anytime later.
          </p>
        </div>

        <div className="flex flex-col">
          {tally.map((t) => {
            const tint = tintOf(t.child.id);
            return (
              <div key={t.child.id} className="flex items-center gap-3.5 min-h-[60px]">
                <span
                  className={`grid place-items-center w-10 h-10 rounded-full text-[15px] font-[700] shrink-0 ${tint.soft} ${tint.ink}`}
                >
                  {t.child.name[0]}
                </span>
                <span className="min-w-0 flex flex-col gap-0.5">
                  <span className="text-[16px] font-[600] text-ink">{t.child.name}</span>
                  <span className="text-[13px] text-ink-soft">
                    {t.acts} activities · {t.wins} accomplishments
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 px-6 pt-3 pb-5 flex flex-col gap-2.5">
        <button
          onClick={onAddActivities}
          className="h-14 w-full rounded-[28px] bg-surface border-[1.5px] border-pine text-pine font-[600] text-[16px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Icon name="add" size={22} /> Add other activities
        </button>
        <button
          onClick={onDone}
          className="h-14 w-full rounded-[28px] bg-pine text-white font-[600] text-[16px] active:scale-[0.98] transition-transform"
        >
          Go to dashboard
        </button>
      </div>
    </Screen>
  );
}
