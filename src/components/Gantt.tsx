import { useEffect, useMemo, useRef } from "react";
import { LevelPip } from "./level";
import {
  type Achievement,
  type Activity,
  type Category,
  CATEGORY_COLOR,
  dec,
  TODAY,
} from "../data";

/* Layout constants — tuned so labels stay narrow and the timeline gets the room. */
const LABEL_W = 106;
const ROW_H = 54;
const AXIS_H = 34;
const BAR_H = 22;

export type Range = "1y" | "3y" | "5y" | "all";

const PX_PER_YEAR: Record<Range, number> = {
  "1y": 340,
  "3y": 200,
  "5y": 148,
  all: 118,
};

function GoldMilestone({ size = 18 }: { size?: number }) {
  return (
    <span
      className="grid place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: "#b8893b",
        boxShadow: "0 0 0 3px #fff, 0 2px 5px -1px rgba(184,137,59,0.55)",
      }}
    >
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="#fff">
        <path d="M12 2l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 16.9l-5.8 3.06 1.1-6.47L2.6 8.85l6.5-.95L12 2z" />
      </svg>
    </span>
  );
}

export function GanttChart({
  activities,
  achievements,
  range,
  height,
  onTapActivity,
  onTapAchievement,
  jumpToken,
  jumpTarget,
}: {
  activities: Activity[];
  achievements: Achievement[];
  range: Range;
  height: number;
  onTapActivity: (a: Activity) => void;
  onTapAchievement: (a: Achievement) => void;
  // Change this value to trigger a scroll.
  jumpToken?: number;
  // Decimal-year to center on; defaults to today.
  jumpTarget?: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pxPerYear = PX_PER_YEAR[range];

  const { domainStart, domainEnd } = useMemo(() => {
    if (!activities.length) return { domainStart: 2019, domainEnd: 2026 };
    let min = Infinity;
    let max = -Infinity;
    for (const a of activities) {
      min = Math.min(min, dec(a.start));
      const e = a.end === "present" ? dec(TODAY) : dec(a.end);
      max = Math.max(max, e);
    }
    max = Math.max(max, dec(TODAY));
    return { domainStart: Math.floor(min) - 0.15, domainEnd: Math.ceil(max) + 0.15 };
  }, [activities]);

  const timeW = (domainEnd - domainStart) * pxPerYear;
  const xOf = (d: number) => (d - domainStart) * pxPerYear;
  const contentH = AXIS_H + activities.length * ROW_H;

  const years: number[] = [];
  for (let y = Math.ceil(domainStart); y <= Math.floor(domainEnd); y++) years.push(y);
  const showQuarters = pxPerYear >= 180;

  const todayX = xOf(dec(TODAY));

  // Scroll to keep the focus point (today by default) comfortably in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const focusX = jumpTarget != null ? xOf(jumpTarget) : todayX;
    const target = LABEL_W + focusX - el.clientWidth * 0.5;
    el.scrollTo({ left: Math.max(0, target), behavior: jumpToken ? "smooth" : "auto" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpToken, range]);

  return (
    <div
      ref={scrollRef}
      className="overflow-auto scroll-area overscroll-contain rounded-[22px] bg-surface border border-hairline"
      style={{ height }}
    >
      <div className="relative" style={{ width: LABEL_W + timeW, height: contentH }}>
        {/* Gridlines + today, behind the rows */}
        <div className="absolute top-0 bottom-0" style={{ left: LABEL_W, right: 0 }}>
          {years.map((y) => (
            <div
              key={y}
              className="absolute top-0 bottom-0 w-px bg-hairline/70"
              style={{ left: xOf(y) }}
            />
          ))}
          {showQuarters &&
            years.flatMap((y) =>
              [0.25, 0.5, 0.75].map((q) => (
                <div
                  key={`${y}-${q}`}
                  className="absolute top-0 bottom-0 w-px bg-hairline/35"
                  style={{ left: xOf(y + q) }}
                />
              )),
            )}
          {/* Today */}
          <div
            className="absolute w-px bg-teal/55"
            style={{ left: todayX, top: AXIS_H, bottom: 0 }}
          />
        </div>

        {/* Axis (sticky top) */}
        <div
          className="sticky top-0 z-20 bg-surface/95 border-b border-hairline"
          style={{ height: AXIS_H }}
        >
          {/* corner */}
          <div
            className="sticky left-0 z-30 h-full bg-surface/95 border-r border-hairline"
            style={{ width: LABEL_W }}
          />
          {years.map((y) => (
            <span
              key={y}
              className="absolute top-1/2 -translate-y-1/2 text-[12px] font-[600] text-ink-soft tabular-nums"
              style={{ left: LABEL_W + xOf(y) + 6 }}
            >
              {y}
            </span>
          ))}
          <span
            className="absolute top-1 text-[9px] font-[700] uppercase tracking-wide text-teal"
            style={{ left: LABEL_W + todayX - 14 }}
          >
            Now
          </span>
        </div>

        {/* Rows */}
        {activities.map((a) => {
          const startX = xOf(dec(a.start));
          const endD = a.end === "present" ? dec(TODAY) : dec(a.end);
          const endX = xOf(endD);
          const w = Math.max(endX - startX, 16);
          const ongoing = a.end === "present";
          const acts = achievements.filter((m) => m.activityId === a.id);

          let mask: string | undefined;
          if (a.approxStart && a.approxEnd)
            mask =
              "linear-gradient(90deg, transparent 0, #000 16%, #000 84%, transparent 100%)";
          else if (a.approxStart)
            mask = "linear-gradient(90deg, transparent 0, #000 18%)";
          else if (a.approxEnd)
            mask = "linear-gradient(90deg, #000 82%, transparent 100%)";

          return (
            <div key={a.id} className="relative" style={{ height: ROW_H }}>
              {/* sticky label */}
              <div
                className="sticky left-0 z-10 h-full bg-surface border-r border-hairline flex flex-col justify-center pl-3 pr-2"
                style={{ width: LABEL_W }}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: CATEGORY_COLOR[a.category] }}
                  />
                  <span className="text-[12.5px] font-[600] text-ink leading-tight truncate">
                    {a.name}
                  </span>
                </div>
                <div className="mt-1 pl-[9px]">
                  <LevelPip activity={a} />
                </div>
              </div>

              {/* bar */}
              <button
                onClick={() => onTapActivity(a)}
                className="absolute active:scale-[0.99] transition-transform"
                style={{
                  left: LABEL_W + startX,
                  width: w,
                  top: (ROW_H - BAR_H) / 2,
                  height: BAR_H,
                }}
              >
                <span
                  className="block size-full rounded-full"
                  style={{
                    background: ongoing
                      ? "linear-gradient(90deg,#217c72,#2f9c8f)"
                      : "#c3d0cb",
                    boxShadow: ongoing
                      ? "0 4px 10px -4px rgba(33,124,114,0.55)"
                      : "inset 0 0 0 1px rgba(23,35,33,0.04)",
                    WebkitMaskImage: mask,
                    maskImage: mask,
                  }}
                />
                {ongoing && (
                  <span
                    className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-teal ring-2 ring-surface"
                    style={{ animation: "proudlyPulse 2.4s ease-in-out infinite" }}
                  />
                )}
              </button>

              {/* milestones */}
              {acts.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onTapAchievement(m)}
                  className="absolute z-[6] -translate-x-1/2 -translate-y-1/2 active:scale-90 transition-transform"
                  style={{ left: LABEL_W + xOf(dec(m.date)), top: ROW_H / 2 }}
                >
                  <GoldMilestone />
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Legend ---------- */
export function GanttLegend() {
  return (
    <div className="flex items-center gap-4 text-[11.5px] text-ink-soft">
      <span className="flex items-center gap-1.5">
        <span className="w-4 h-2 rounded-full bg-gradient-to-r from-teal to-[#2f9c8f]" />
        Ongoing
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-4 h-2 rounded-full" style={{ background: "#c3d0cb" }} />
        Completed
      </span>
      <span className="flex items-center gap-1.5">
        <GoldMilestone size={13} />
        Achievement
      </span>
    </div>
  );
}
