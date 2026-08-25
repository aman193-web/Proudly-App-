import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, SlidersHorizontal } from "lucide-react";
import { EmptyState } from "./states";
import { MilestoneStar, rangeYears, withinRange } from "./proudly";
import type { Range } from "./Gantt";
import {
  type Achievement,
  type Activity,
  achievementsForActivity,
  CATEGORY_COLOR,
  dec,
  durationText,
  fmtMonth,
  TODAY,
  type YM,
} from "../data";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Decimal year an activity stops occupying the timeline. */
const endOf = (a: Activity) => (a.end === "present" ? dec(TODAY) : dec(a.end));

/** True when the activity was running during the given month. */
const activeInMonth = (a: Activity, ym: YM) => {
  const point = dec(ym);
  return dec(a.start) <= point && endOf(a) >= point;
};

/* ---------- Stable weekly schedule ----------
   Records are month-precision, so individual session dates do not exist. Rather
   than marking every day of a span, each activity keeps a fixed weekly pattern
   derived from its id: the same weekdays in every month and on every render. */
const hashId = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const scheduleCache = new Map<string, number[]>();

/** Weekdays (0 = Sunday) this activity meets on. */
function scheduleFor(id: string): number[] {
  const cached = scheduleCache.get(id);
  if (cached) return cached;

  const h = hashId(id);
  const first = h % 7;
  // Roughly a third of activities meet twice a week; the rest once.
  const days = h % 3 === 0 ? [first, (first + 2 + (h % 3)) % 7] : [first];
  const unique = Array.from(new Set(days)).sort((a, b) => a - b);
  scheduleCache.set(id, unique);
  return unique;
}

const runsOnWeekday = (a: Activity, weekday: number) =>
  scheduleFor(a.id).includes(weekday);

/* ============================================================= LIST VIEW */
export function ActivityListView({
  activities,
  range,
  onTapActivity,
}: {
  activities: Activity[];
  range: Range;
  onTapActivity: (a: Activity) => void;
}) {
  const rows = useMemo(
    () =>
      activities
        .filter((a) => withinRange(a, range))
        // Most recent first, with anything still running floated to the top.
        .sort((x, y) => {
          const ongoing = Number(y.end === "present") - Number(x.end === "present");
          return ongoing !== 0 ? ongoing : dec(y.start) - dec(x.start);
        }),
    [activities, range],
  );

  if (rows.length === 0) {
    return (
      <div className="rounded-[22px] bg-surface border border-hairline">
        <EmptyState
          icon={<SlidersHorizontal size={24} />}
          title="Nothing in this range"
          body="Widen the range to see more of the journey."
        />
      </div>
    );
  }

  // Group by the year the activity started, mirroring the achievements tab.
  const groups: { year: number; items: Activity[] }[] = [];
  for (const a of rows) {
    let g = groups.find((x) => x.year === a.start.y);
    if (!g) {
      g = { year: a.start.y, items: [] };
      groups.push(g);
    }
    g.items.push(a);
  }

  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.year}>
          <div className="flex items-center gap-3 mb-3">
            <span className="font-display text-[15px] font-[700] text-ink tabular-nums">
              {g.year}
            </span>
            <span className="flex-1 h-px bg-hairline" />
            <span className="text-[12px] text-ink-soft">{g.items.length}</span>
          </div>
          <div className="space-y-2.5">
            {g.items.map((a) => (
              <ActivityListRow key={a.id} activity={a} onClick={() => onTapActivity(a)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityListRow({
  activity,
  onClick,
}: {
  activity: Activity;
  onClick: () => void;
}) {
  const color = CATEGORY_COLOR[activity.category];
  const achCount = achievementsForActivity(activity.id).length;
  const ongoing = activity.end === "present";

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3.5 rounded-2xl bg-surface border border-hairline p-3 text-left active:scale-[0.99] transition-transform"
    >
      <span
        className="grid place-items-center w-12 h-12 rounded-xl shrink-0"
        style={{ background: `${color}1f` }}
      >
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      </span>

      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2">
          <span className="text-[14.5px] font-[600] text-ink truncate">{activity.name}</span>
          {ongoing && (
            <span className="shrink-0 text-[10.5px] font-[700] text-teal bg-mint px-1.5 py-0.5 rounded-full">
              Ongoing
            </span>
          )}
        </span>
        <span className="block text-[12px] text-ink-soft mt-0.5 truncate">
          {activity.category} · {fmtMonth(activity.start)} –{" "}
          {ongoing ? "Present" : fmtMonth(activity.end as YM)}
        </span>
        <span className="flex items-center gap-2 mt-1">
          <span className="text-[11.5px] text-ink-soft">
            {durationText(activity.start, activity.end)}
          </span>
          {achCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-[600] text-gold bg-gold-soft px-1.5 py-0.5 rounded-full">
              <MilestoneStar size={10} />
              {achCount}
            </span>
          )}
        </span>
      </span>

      <ChevronRight size={18} className="text-ink-soft shrink-0" />
    </button>
  );
}

/* ============================================================= CALENDAR VIEW
   A real month calendar. The data model is month-precision (YM), so a day is
   marked when an activity's month span covers that month — every day inside the
   span counts. Achievements and history milestones only carry a month, so they
   are surfaced for the displayed month rather than pinned to an invented day. */

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const monthIndex = (d: YM) => d.y * 12 + (d.m - 1);
const fromIndex = (i: number): YM => ({ y: Math.floor(i / 12), m: (i % 12) + 1 });
const daysInMonth = (d: YM) => new Date(d.y, d.m, 0).getDate();
const firstWeekday = (d: YM) => new Date(d.y, d.m - 1, 1).getDay();

/* The mock "today" is month-precision, so borrow the real day number only when
   the real clock is inside that same month. */
const REAL_NOW = new Date();
const TODAY_DAY =
  REAL_NOW.getFullYear() === TODAY.y && REAL_NOW.getMonth() + 1 === TODAY.m
    ? REAL_NOW.getDate()
    : daysInMonth(TODAY);

export function ActivityCalendarView({
  activities,
  achievements,
  range,
  jumpToken,
  onTapActivity,
  onTapAchievement,
  onAddActivity,
}: {
  activities: Activity[];
  achievements: Achievement[];
  range: Range;
  jumpToken?: number;
  onTapActivity: (a: Activity) => void;
  onTapAchievement: (a: Achievement) => void;
  onAddActivity: (start: YM) => void;
}) {
  // Navigable window: clamped by the range dropdown at the near end and by
  // whatever history exists at the far end.
  const bounds = useMemo(() => {
    if (activities.length === 0) return null;
    const firstAct = Math.min(...activities.map((a) => monthIndex(a.start)));
    const lastAct = Math.max(
      ...activities.map((a) => monthIndex(a.end === "present" ? TODAY : a.end)),
    );
    const years = rangeYears(range);
    const min = years === null ? firstAct : Math.max(firstAct, monthIndex(TODAY) - years * 12);
    const max = Math.max(monthIndex(TODAY), lastAct);
    return { min, max };
  }, [activities, range]);

  const [cursor, setCursor] = useState<number>(monthIndex(TODAY));
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // "Today" in the control row snaps the calendar back to the current month.
  useEffect(() => {
    if (jumpToken === undefined) return;
    setCursor(monthIndex(TODAY));
    setSelectedDay(null);
  }, [jumpToken]);

  // Keep the cursor inside the window when the range narrows.
  const clamped = bounds ? Math.min(Math.max(cursor, bounds.min), bounds.max) : cursor;
  useEffect(() => {
    if (clamped !== cursor) setCursor(clamped);
  }, [clamped, cursor]);

  if (!bounds) {
    return (
      <div className="rounded-[22px] bg-surface border border-hairline">
        <EmptyState
          icon={<CalendarDays size={24} />}
          title="Nothing to show yet"
          body="Once activities are tracked they will appear on the calendar."
        />
      </div>
    );
  }

  const month = fromIndex(clamped);
  const total = daysInMonth(month);
  const offset = firstWeekday(month);
  const isTodayMonth = month.y === TODAY.y && month.m === TODAY.m;
  const isFutureMonth = clamped > monthIndex(TODAY);

  const monthActs = activities.filter((a) => activeInMonth(a, month));
  const monthAchs = achievements.filter((a) => a.date.y === month.y && a.date.m === month.m);

  const dayIsFuture = (day: number) => isFutureMonth || (isTodayMonth && day > TODAY_DAY);

  const selected = selectedDay === null ? null : { ...month, d: selectedDay };
  const selectedWeekday = selectedDay === null ? -1 : (offset + selectedDay - 1) % 7;
  const selectedActs =
    selectedDay === null ? [] : monthActs.filter((a) => runsOnWeekday(a, selectedWeekday));

  return (
    <div className="space-y-3">
      <div className="rounded-[22px] bg-surface border border-hairline p-3.5">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => {
              setCursor(clamped - 1);
              setSelectedDay(null);
            }}
            disabled={clamped <= bounds.min}
            aria-label="Previous month"
            className="grid place-items-center w-9 h-9 rounded-full border border-hairline bg-canvas text-ink active:scale-95 transition-transform disabled:opacity-30"
          >
            <ChevronLeft size={17} />
          </button>
          <div className="text-center">
            <p className="font-display text-[16px] font-[700] text-ink leading-tight">
              {fmtMonth(month)}
            </p>
            <p className="text-[11.5px] text-ink-soft">
              {monthActs.length} active
              {monthAchs.length > 0 ? ` · ${monthAchs.length} achievement` : ""}
              {monthAchs.length > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => {
              setCursor(clamped + 1);
              setSelectedDay(null);
            }}
            disabled={clamped >= bounds.max}
            aria-label="Next month"
            className="grid place-items-center w-9 h-9 rounded-full border border-hairline bg-canvas text-ink active:scale-95 transition-transform disabled:opacity-30"
          >
            <ChevronRight size={17} />
          </button>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((w, i) => (
            <span
              key={i}
              className="text-center text-[10.5px] font-[600] text-ink-soft/70 py-1"
            >
              {w}
            </span>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: offset }).map((_, i) => (
            <span key={`pad-${i}`} />
          ))}
          {Array.from({ length: total }, (_, i) => i + 1).map((day) => {
            const future = dayIsFuture(day);
            const isToday = isTodayMonth && day === TODAY_DAY;
            const isSelected = selectedDay === day;
            const weekday = (offset + day - 1) % 7;
            const dayActs = monthActs.filter((a) => runsOnWeekday(a, weekday));
            const dots = Array.from(new Set(dayActs.map((a) => a.category))).slice(0, 3);
            const hasActs = dayActs.length > 0 && !future;
            // A free day in the past or present is an invitation to add something.
            const isFreeDay = !hasActs && !future;

            return (
              <button
                key={day}
                disabled={future}
                onClick={() =>
                  hasActs ? setSelectedDay(isSelected ? null : day) : onAddActivity(month)
                }
                aria-label={
                  hasActs
                    ? `${day} ${fmtMonth(month)}`
                    : `Add activity on ${day} ${fmtMonth(month)}`
                }
                className={`h-[42px] rounded-xl flex flex-col items-center justify-center gap-1 border transition-colors ${
                  isSelected
                    ? "bg-teal border-teal"
                    : isToday
                      ? "bg-mint border-teal/40"
                      : hasActs
                        ? "bg-canvas border-hairline active:bg-mint"
                        : isFreeDay
                          ? "bg-transparent border-dashed border-hairline/70 active:bg-mint"
                          : "bg-transparent border-transparent"
                }`}
              >
                <span
                  className={`text-[12.5px] leading-none tabular-nums ${
                    isSelected
                      ? "text-white font-[700]"
                      : isToday
                        ? "text-teal-dark font-[700]"
                        : future
                          ? "text-ink-soft/35"
                          : hasActs
                            ? "text-ink font-[500]"
                            : "text-ink-soft/45"
                  }`}
                >
                  {day}
                </span>
                <span className="flex items-center justify-center gap-[2px] h-1.5">
                  {hasActs
                    ? dots.map((c) => (
                        <span
                          key={c}
                          className="w-[4px] h-[4px] rounded-full"
                          style={{ background: isSelected ? "#ffffff" : CATEGORY_COLOR[c] }}
                        />
                      ))
                    : isFreeDay && <Plus size={9} className="text-ink-soft/40" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Achievements carry a month, not a day — shown for the whole month. */}
      {monthAchs.length > 0 && (
        <div className="rounded-[22px] bg-surface border border-hairline p-3.5">
          <p className="text-[12px] font-[600] text-ink-soft mb-2.5 px-0.5">
            Achievements in {fmtMonth(month)}
          </p>
          <div className="space-y-2">
            {monthAchs.map((a) => (
              <button
                key={a.id}
                onClick={() => onTapAchievement(a)}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-hairline bg-gold-soft/50 text-left active:scale-[0.99] transition-transform"
              >
                <span className="grid place-items-center w-8 h-8 rounded-lg bg-gold-soft text-gold shrink-0">
                  <MilestoneStar size={15} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13.5px] font-[600] text-ink truncate">
                    {a.title}
                  </span>
                  <span className="block text-[11.5px] text-gold font-[600]">Achievement</span>
                </span>
                <ChevronRight size={16} className="text-ink-soft shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tapped date → the activities running that day */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-[22px] bg-surface border border-hairline p-3.5"
        >
          <p className="font-display text-[15px] font-[700] text-ink mb-3 px-0.5">
            {MONTH_LABELS[selected.m - 1]} {selected.d}, {selected.y}
          </p>

          <div className="space-y-2">
            {selectedActs.map((a) => {
              const started = a.start.y === month.y && a.start.m === month.m;
              const ended =
                a.end !== "present" && a.end.y === month.y && a.end.m === month.m;
              return (
                <button
                  key={a.id}
                  onClick={() => onTapActivity(a)}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-hairline bg-canvas text-left active:scale-[0.99] transition-transform"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 ml-1"
                    style={{ background: CATEGORY_COLOR[a.category] }}
                  />
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[13.5px] font-[600] text-ink truncate">{a.name}</span>
                      {started && (
                        <span className="shrink-0 text-[10px] font-[700] text-teal bg-mint px-1.5 py-0.5 rounded-full">
                          Started
                        </span>
                      )}
                      {ended && (
                        <span className="shrink-0 text-[10px] font-[700] text-ink-soft bg-canvas border border-hairline px-1.5 py-0.5 rounded-full">
                          Ended
                        </span>
                      )}
                    </span>
                    <span className="block text-[11.5px] text-ink-soft">{a.category}</span>
                  </span>
                  <ChevronRight size={16} className="text-ink-soft shrink-0" />
                </button>
              );
            })}

            {selectedActs.length === 0 && (
              <p className="text-[13px] text-ink-soft text-center py-3">
                Nothing tracked on this date.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
