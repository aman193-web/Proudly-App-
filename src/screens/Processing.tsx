import { useEffect, useState } from "react";
import { Icon } from "../components/Icon";
import { Screen } from "../components/ui";

/* Scanning — Oct-1 redesign.
   -------------------------
   Stripped to four things stacked in the middle of the screen: a calendar
   glyph, what is happening, a bar, and a running count. The old version had
   a task checklist and a ring; the prototype drops both, because the parent
   has nothing to decide here and a list of tasks only makes the wait feel
   longer than it is.

   The title changes once past halfway — reading the calendar first, then
   matching what was read to the children by name. */
export function Processing({
  childName,
  onDone,
}: {
  childName: string;
  onDone: () => void;
}) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setPct((p) => {
        const next = p + 2.5;
        if (next >= 100) {
          clearInterval(iv);
          setTimeout(onDone, 300);
          return 100;
        }
        return next;
      });
    }, 50);
    return () => clearInterval(iv);
  }, [onDone]);

  const title =
    pct < 55 ? "Reading your calendar…" : `Matching events to ${childName}…`;

  return (
    <Screen>
      <div className="flex-1 flex flex-col justify-center gap-[18px] px-8">
        <Icon name="calendar_month" size={40} className="text-pine" />
        <h2 className="font-[700] text-[26px] leading-[1.2] tracking-[-0.02em] text-ink">
          {title}
        </h2>
        <div className="h-1.5 rounded-[3px] bg-[#e8eae6] overflow-hidden">
          <div
            className="h-full rounded-[3px] bg-pine transition-[width] duration-[50ms] ease-linear"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[14px] text-ink-soft">
          {Math.round(pct * 2.14)} events checked
        </span>
      </div>
    </Screen>
  );
}
