import { useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronRight,
  HelpCircle,
  Images,
  MapPin,
  Trophy,
} from "lucide-react";
import { Screen, AppHeader, PrimaryButton } from "../components/ui";
import { StepDots } from "../components/StepDots";
import { Sheet } from "../components/Sheet";
import { CategoryIcon } from "../components/CategoryIcon";
import { CATEGORY_COLOR, CATEGORY_SHORT, type Category } from "../data";
import { categorizeActivity } from "../lib/categorize";

/* Final onboarding step
   ---------------------
   Everything the connected sources turned up, in one reviewable list rather
   than the old one-card-at-a-time swipe deck. A parent confirming a sync wants
   to see the whole haul and uncheck the odd wrong guess, not answer a
   questionnaire — so the screen is a dense list with everything pre-selected.

   Sessions live in a sheet rather than inline: a single calendar activity can
   carry dozens of events, and inlining them would bury the activities under
   their own detail.

   Categories are not stored on the fixtures — they are inferred from the event
   title by lib/categorize, which is what a real Calendar sync would have to do
   and keeps this screen honest about where the guess comes from. */

type ReviewSession = {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
};

/* Whether the sync is sure this activity is this child's. "unsure" is not a
   lesser activity — it is one the parent has to rule on, which is why the two
   are split into their own sections. */
type Confidence = "confirmed" | "unsure";

type ReviewActivity = {
  id: string;
  name: string;
  /** Span as read from the calendar, e.g. "Mar 2021 – Jun 2024". */
  timeline: string;
  location?: string;
  confidence: Confidence;
  /** Why we are unsure. Required in spirit for "unsure", shown on the row. */
  doubt?: string;
  sessions: ReviewSession[];
};

type ReviewAchievement = {
  id: string;
  title: string;
  activity: string;
  date: string;
  source: "Calendar" | "Photos";
};

/** Terse constructor — this is fixture data and reads better as rows. */
const s = (
  id: string,
  title: string,
  date: string,
  time: string,
  location?: string,
): ReviewSession => ({ id, title, date, time, location });

const FOUND_ACTIVITIES: ReviewActivity[] = [
  {
    id: "soccer",
    confidence: "confirmed",
    name: "Soccer practice",
    timeline: "Mar 2021 – Jun 2024",
    location: "Riverside Park",
    sessions: [
      s("so1", "Soccer practice", "Sat 6 Mar 2021", "9:00 – 10:30 AM", "Riverside Park"),
      s("so2", "Soccer practice", "Sat 13 Mar 2021", "9:00 – 10:30 AM", "Riverside Park"),
      s("so3", "Match vs. Eastside", "Sun 18 Apr 2021", "2:00 – 3:30 PM", "Eastside Fields"),
      s("so4", "Soccer practice", "Sat 11 Sep 2021", "9:00 – 10:30 AM", "Riverside Park"),
      s("so5", "Regional tournament", "Sat 4 Mar 2023", "8:00 AM – 4:00 PM", "City Sports Complex"),
      s("so6", "Final season match", "Sun 9 Jun 2024", "10:00 – 11:30 AM", "Riverside Park"),
    ],
  },
  {
    id: "piano",
    confidence: "confirmed",
    name: "Piano lesson",
    timeline: "Sep 2019 – Present",
    location: "Bellevue Music School",
    sessions: [
      s("pi1", "Piano lesson", "Tue 10 Sep 2019", "4:30 – 5:15 PM", "Bellevue Music School"),
      s("pi2", "Piano lesson", "Tue 17 Sep 2019", "4:30 – 5:15 PM", "Bellevue Music School"),
      s("pi3", "Winter recital", "Sat 14 Dec 2019", "6:00 – 8:00 PM", "Bellevue Hall"),
      s("pi4", "Piano lesson", "Tue 7 Jan 2020", "4:30 – 5:15 PM", "Bellevue Music School"),
      s("pi5", "Grade 3 exam", "Thu 16 May 2024", "11:00 – 11:40 AM", "Northgate Exam Centre"),
      s("pi6", "Piano lesson", "Tue 3 Sep 2024", "4:30 – 5:15 PM", "Bellevue Music School"),
      s("pi7", "Spring showcase", "Sat 12 Apr 2025", "5:00 – 7:00 PM", "Bellevue Hall"),
      s("pi8", "Piano lesson", "Tue 2 Sep 2025", "4:30 – 5:15 PM", "Bellevue Music School"),
    ],
  },
  {
    id: "swim",
    confidence: "unsure",
    doubt: "Could be Aanya's — no photo match",
    name: "Swim club",
    timeline: "Jan 2020 – Aug 2022",
    location: "Aquatic Center",
    sessions: [
      s("sw1", "Swim club", "Mon 13 Jan 2020", "5:00 – 6:00 PM", "Aquatic Center"),
      s("sw2", "Swim club", "Mon 20 Jan 2020", "5:00 – 6:00 PM", "Aquatic Center"),
      s("sw3", "Time trials", "Sat 8 Aug 2020", "9:00 – 11:00 AM", "Aquatic Center"),
      s("sw4", "Swim club", "Mon 11 Jan 2021", "5:00 – 6:00 PM", "Aquatic Center"),
      s("sw5", "Summer gala", "Sat 6 Aug 2022", "9:00 AM – 1:00 PM", "Lakeside Pool"),
    ],
  },
  {
    id: "robotics",
    confidence: "confirmed",
    name: "Robotics club",
    timeline: "Sep 2024 – Present",
    location: "Lincoln Middle School",
    sessions: [
      s("ro1", "Robotics club", "Wed 11 Sep 2024", "3:30 – 5:00 PM", "Lincoln Middle School"),
      s("ro2", "Robotics club", "Wed 18 Sep 2024", "3:30 – 5:00 PM", "Lincoln Middle School"),
      s("ro3", "Build weekend", "Sat 2 Nov 2024", "10:00 AM – 4:00 PM", "Lincoln Middle School"),
      s("ro4", "State finals", "Fri 14 Nov 2025", "8:00 AM – 6:00 PM", "State Convention Center"),
    ],
  },
  {
    id: "choir",
    confidence: "confirmed",
    name: "Choir rehearsal",
    timeline: "Sep 2022 – Present",
    location: "Community Hall",
    sessions: [
      s("ch1", "Choir rehearsal", "Thu 8 Sep 2022", "4:00 – 5:00 PM", "Community Hall"),
      s("ch2", "Holiday concert", "Fri 16 Dec 2022", "7:00 – 8:30 PM", "Community Hall"),
      s("ch3", "Choir rehearsal", "Thu 5 Sep 2024", "4:00 – 5:00 PM", "Community Hall"),
    ],
  },
  {
    id: "artclass",
    name: "Art class",
    timeline: "Feb 2025 – Mar 2025",
    location: "Lincoln Middle School",
    confidence: "unsure",
    doubt: "Only 2 events — may be a one-off",
    sessions: [
      s("ar1", "Art class", "Thu 6 Feb 2025", "3:30 – 4:30 PM", "Lincoln Middle School"),
      s("ar2", "Art class", "Thu 13 Mar 2025", "3:30 – 4:30 PM", "Lincoln Middle School"),
    ],
  },
  {
    id: "kumon",
    name: "Kumon math",
    timeline: "Sep 2023 – Present",
    location: "Kumon Northgate",
    confidence: "unsure",
    doubt: "No name in the event title",
    sessions: [
      s("ku1", "Kumon math", "Wed 6 Sep 2023", "5:00 – 6:00 PM", "Kumon Northgate"),
      s("ku2", "Kumon math", "Wed 13 Sep 2023", "5:00 – 6:00 PM", "Kumon Northgate"),
      s("ku3", "Kumon math", "Wed 4 Sep 2024", "5:00 – 6:00 PM", "Kumon Northgate"),
    ],
  },
];

const CONFIRMED = FOUND_ACTIVITIES.filter((a) => a.confidence === "confirmed");
const UNSURE = FOUND_ACTIVITIES.filter((a) => a.confidence === "unsure");

const FOUND_ACHIEVEMENTS: ReviewAchievement[] = [
  {
    id: "ach-piano",
    title: "Grade 3 Piano — Distinction",
    activity: "Piano lesson",
    date: "May 2024",
    source: "Calendar",
  },
  {
    id: "ach-soccer",
    title: "Regional Tournament — Runner Up",
    activity: "Soccer practice",
    date: "Mar 2023",
    source: "Calendar",
  },
  {
    id: "ach-robotics",
    title: "State Finals — Design Award",
    activity: "Robotics club",
    date: "Nov 2025",
    source: "Photos",
  },
];

type Tri = "on" | "off" | "mixed";

export function Review({
  childName,
  onBack,
  onDone,
}: {
  childName: string;
  onBack: () => void;
  onDone: () => void;
}) {
  const who = childName.trim() || "your child";
  /* An activity's selection is derived from its sessions rather than tracked
     separately, so the two can never disagree: selected means "at least one
     session kept". */
  const [sessionSel, setSessionSel] = useState<Record<string, Set<string>>>(() =>
    Object.fromEntries(
      FOUND_ACTIVITIES.map((a) => [a.id, new Set(a.sessions.map((x) => x.id))]),
    ),
  );
  const [achSel, setAchSel] = useState<Set<string>>(
    () => new Set(FOUND_ACHIEVEMENTS.map((a) => a.id)),
  );
  const [sheetFor, setSheetFor] = useState<string | null>(null);

  const activityState = (a: ReviewActivity): Tri => {
    const n = sessionSel[a.id].size;
    return n === 0 ? "off" : n === a.sessions.length ? "on" : "mixed";
  };

  const toggleActivity = (a: ReviewActivity) =>
    setSessionSel((prev) => ({
      ...prev,
      // Standard tri-state: a partial selection fills rather than clears.
      [a.id]:
        prev[a.id].size === a.sessions.length
          ? new Set<string>()
          : new Set(a.sessions.map((x) => x.id)),
    }));

  const toggleSession = (activityId: string, sessionId: string) =>
    setSessionSel((prev) => {
      const next = new Set(prev[activityId]);
      next.has(sessionId) ? next.delete(sessionId) : next.add(sessionId);
      return { ...prev, [activityId]: next };
    });

  const setAllSessions = (a: ReviewActivity, on: boolean) =>
    setSessionSel((prev) => ({
      ...prev,
      [a.id]: on ? new Set(a.sessions.map((x) => x.id)) : new Set<string>(),
    }));

  const toggleAchievement = (id: string) =>
    setAchSel((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const counts = useMemo(() => {
    const activities = FOUND_ACTIVITIES.filter((a) => sessionSel[a.id].size > 0).length;
    const sessions = FOUND_ACTIVITIES.reduce((n, a) => n + sessionSel[a.id].size, 0);
    const totalSessions = FOUND_ACTIVITIES.reduce((n, a) => n + a.sessions.length, 0);
    return {
      activities,
      sessions,
      achievements: achSel.size,
      all:
        activities === FOUND_ACTIVITIES.length &&
        sessions === totalSessions &&
        achSel.size === FOUND_ACHIEVEMENTS.length,
      none: activities === 0 && achSel.size === 0,
    };
  }, [sessionSel, achSel]);

  const selectAll = (on: boolean) => {
    setSessionSel(
      Object.fromEntries(
        FOUND_ACTIVITIES.map((a) => [
          a.id,
          on ? new Set(a.sessions.map((x) => x.id)) : new Set<string>(),
        ]),
      ),
    );
    setAchSel(on ? new Set(FOUND_ACHIEVEMENTS.map((a) => a.id)) : new Set());
  };

  /* Section-level toggle, so clearing the whole uncertain batch is one tap. */
  const sectionState = (list: ReviewActivity[]): Tri => {
    const kept = list.reduce((n, a) => n + sessionSel[a.id].size, 0);
    const total = list.reduce((n, a) => n + a.sessions.length, 0);
    return kept === 0 ? "off" : kept === total ? "on" : "mixed";
  };

  const setSection = (list: ReviewActivity[], on: boolean) =>
    setSessionSel((prev) => ({
      ...prev,
      ...Object.fromEntries(
        list.map((a) => [a.id, on ? new Set(a.sessions.map((x) => x.id)) : new Set<string>()]),
      ),
    }));

  const sheetActivity = FOUND_ACTIVITIES.find((a) => a.id === sheetFor) ?? null;

  return (
    <Screen>
      <AppHeader title="Review" onBack={onBack} trailing={<SkipButton onClick={onDone} />} />

      {/* Fixed intro — kept short so the list gets the height */}
      <div className="shrink-0 px-4 pt-3">
        <StepDots total={3} current={2} />
        <h1 className="font-display text-[22px] font-[700] text-ink leading-tight mt-5">
          Here's what we found
        </h1>
        <p className="text-[13.5px] text-ink-soft mt-1 leading-snug">
          Everything is selected. The ones we're unsure about are listed
          separately — check those before accepting.
        </p>

        {/* Select-all + running tally, one row */}
        <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-surface border border-hairline px-3.5 py-2.5">
          <button
            onClick={() => selectAll(!counts.all)}
            className="flex items-center gap-2 active:opacity-60"
          >
            <CheckBox state={counts.all ? "on" : counts.none ? "off" : "mixed"} />
            <span className="text-[13.5px] font-[600] text-ink">Select all</span>
          </button>
          <span className="text-[12px] text-ink-soft tabular-nums">
            {counts.activities} activities · {counts.achievements} achievements
          </span>
        </div>
      </div>

      {/* The list is the only thing that scrolls */}
      <div className="flex-1 overflow-y-auto scroll-area px-4 pt-4 pb-5">
        <SectionHead
          label="Confirmed activities"
          count={CONFIRMED.length}
          icon={<BadgeCheck size={12} className="text-teal" />}
          state={sectionState(CONFIRMED)}
          onToggle={(on) => setSection(CONFIRMED, on)}
        />
        <div className="rounded-2xl bg-surface border border-hairline divide-y divide-hairline overflow-hidden">
          {CONFIRMED.map((a) => (
            <ActivityRow
              key={a.id}
              activity={a}
              state={activityState(a)}
              kept={sessionSel[a.id].size}
              onToggle={() => toggleActivity(a)}
              onOpenSessions={() => setSheetFor(a.id)}
            />
          ))}
        </div>

        <SectionHead
          label="Other activities"
          count={UNSURE.length}
          icon={<HelpCircle size={12} className="text-gold" />}
          state={sectionState(UNSURE)}
          onToggle={(on) => setSection(UNSURE, on)}
          className="mt-5"
        />
        <p className="text-[11.5px] text-ink-soft leading-snug mb-2 ml-0.5">
          We couldn't confirm these are {who}'s.
        </p>
        <div className="rounded-2xl bg-surface border border-hairline divide-y divide-hairline overflow-hidden">
          {UNSURE.map((a) => (
            <ActivityRow
              key={a.id}
              activity={a}
              state={activityState(a)}
              kept={sessionSel[a.id].size}
              onToggle={() => toggleActivity(a)}
              onOpenSessions={() => setSheetFor(a.id)}
            />
          ))}
        </div>

        <SectionHead
          label="Achievements"
          count={FOUND_ACHIEVEMENTS.length}
          icon={<Trophy size={12} />}
          className="mt-5"
        />
        <div className="rounded-2xl bg-surface border border-hairline divide-y divide-hairline overflow-hidden">
          {FOUND_ACHIEVEMENTS.map((a) => (
            <button
              key={a.id}
              onClick={() => toggleAchievement(a.id)}
              aria-pressed={achSel.has(a.id)}
              className="w-full flex items-center gap-3 px-3.5 py-3 text-left active:opacity-60"
            >
              <CheckBox state={achSel.has(a.id) ? "on" : "off"} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 min-w-0">
                  <Trophy size={13} className="text-gold shrink-0" />
                  <span className="text-[14px] font-[600] text-ink truncate">{a.title}</span>
                </span>
                <span className="block text-[11.5px] text-ink-soft truncate mt-1">
                  {a.activity} · {a.date}
                </span>
              </span>
              <span
                className="shrink-0 inline-flex items-center gap-1 h-6 px-2 rounded-full bg-canvas text-[10.5px] font-[600] text-ink-soft"
                title={`Found in Google ${a.source}`}
              >
                {a.source === "Photos" ? <Images size={10} /> : <CalendarDays size={10} />}
                {a.source}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Primary action */}
      <div className="shrink-0 px-4 pt-2.5 pb-7 border-t border-hairline bg-canvas">
        <PrimaryButton onClick={onDone} disabled={counts.none}>
          Accept activities &amp; achievements
        </PrimaryButton>
        <p className="text-center text-[11px] text-ink-soft mt-1.5 tabular-nums">
          {counts.activities} activities · {counts.sessions} sessions ·{" "}
          {counts.achievements} achievements
        </p>
      </div>

      {/* Sessions for one activity */}
      <Sheet open={sheetActivity !== null} onClose={() => setSheetFor(null)}>
        {sheetActivity && (
          <SessionList
            activity={sheetActivity}
            selected={sessionSel[sheetActivity.id]}
            onToggle={(sid) => toggleSession(sheetActivity.id, sid)}
            onSetAll={(on) => setAllSessions(sheetActivity, on)}
          />
        )}
      </Sheet>
    </Screen>
  );
}

function SessionList({
  activity,
  selected,
  onToggle,
  onSetAll,
}: {
  activity: ReviewActivity;
  selected: Set<string>;
  onToggle: (sessionId: string) => void;
  onSetAll: (on: boolean) => void;
}) {
  const all = selected.size === activity.sessions.length;
  return (
    <>
      <div className="px-1 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-[17px] font-[700] text-ink truncate">
            {activity.name}
          </h3>
          <p className="text-[12px] text-ink-soft mt-0.5 tabular-nums">
            {selected.size} of {activity.sessions.length} sessions selected
          </p>
        </div>
        <button
          onClick={() => onSetAll(!all)}
          className="shrink-0 text-[12.5px] font-[600] text-teal active:opacity-60 pt-0.5"
        >
          {all ? "Clear all" : "Select all"}
        </button>
      </div>

      {/* Capped in px, not vh — vh is the browser viewport, not the phone screen */}
      <div className="mt-3 max-h-[340px] overflow-y-auto scroll-area rounded-2xl bg-canvas border border-hairline divide-y divide-hairline">
        {activity.sessions.map((sn) => (
          <button
            key={sn.id}
            onClick={() => onToggle(sn.id)}
            aria-pressed={selected.has(sn.id)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left active:opacity-60"
          >
            <CheckBox state={selected.has(sn.id) ? "on" : "off"} />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-[600] text-ink truncate">{sn.title}</span>
              <span className="block text-[11px] text-ink-soft truncate mt-0.5">
                {sn.date} · {sn.time}
              </span>
              {sn.location && (
                <span className="flex items-center gap-1 text-[11px] text-ink-soft truncate mt-0.5">
                  <MapPin size={10} className="shrink-0" />
                  <span className="truncate">{sn.location}</span>
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

/** One activity. Rendered in both sections, so it lives on its own. */
function ActivityRow({
  activity: a,
  state,
  kept,
  onToggle,
  onOpenSessions,
}: {
  activity: ReviewActivity;
  state: Tri;
  kept: number;
  onToggle: () => void;
  onOpenSessions: () => void;
}) {
  return (
    <div className="flex items-center gap-2 pl-3.5 pr-2 py-3">
      {/* Row toggle and the sessions link are siblings — nesting them would
          make one button swallow the other's clicks. */}
      <button
        onClick={onToggle}
        aria-pressed={state !== "off"}
        className="flex items-center gap-3 flex-1 min-w-0 text-left active:opacity-60"
      >
        <CheckBox state={state} />
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-[600] text-ink truncate">{a.name}</span>
          <span className="flex items-center gap-1.5 min-w-0 mt-1">
            <CategoryPill category={categorizeActivity(a.name)} />
            <span className="text-[11.5px] text-ink-soft truncate">{a.timeline}</span>
          </span>
          {/* An unsure row shows why instead of the location — the reason is
              what the parent needs to rule on, and every session in the sheet
              still carries its own location. Keeps both sections one height. */}
          {a.doubt ? (
            <span className="flex items-center gap-1 text-[11.5px] text-gold truncate mt-1">
              <HelpCircle size={10} className="shrink-0" />
              <span className="truncate">{a.doubt}</span>
            </span>
          ) : (
            a.location && (
              <span className="flex items-center gap-1 text-[11.5px] text-ink-soft truncate mt-1">
                <MapPin size={10} className="shrink-0" />
                <span className="truncate">{a.location}</span>
              </span>
            )
          )}
        </span>
      </button>
      <button
        onClick={onOpenSessions}
        className="shrink-0 inline-flex items-center gap-0.5 h-8 pl-2.5 pr-1.5 rounded-lg text-[12px] font-[600] text-teal active:bg-canvas transition-colors"
      >
        {kept === a.sessions.length ? a.sessions.length : `${kept}/${a.sessions.length}`} sessions
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

function SectionHead({
  label,
  count,
  icon,
  state,
  onToggle,
  className = "",
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  /** Supplying both adds a select-all/clear control for the section. */
  state?: Tri;
  onToggle?: (on: boolean) => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between gap-2 mb-2 ml-0.5 ${className}`}>
      <span className="flex items-center gap-1.5 text-[11px] font-[700] text-ink-soft uppercase tracking-[0.08em]">
        {icon}
        {label}
        <span className="text-ink-soft/70 tabular-nums">({count})</span>
      </span>
      {state && onToggle && (
        <button
          onClick={() => onToggle(state !== "on")}
          className="text-[11.5px] font-[600] text-teal active:opacity-60"
        >
          {state === "on" ? "Clear" : "Select all"}
        </button>
      )}
    </div>
  );
}

/** Colour-coded category chip. Short label so it fits beside the timeline. */
function CategoryPill({ category }: { category: Category }) {
  const color = CATEGORY_COLOR[category];
  return (
    <span
      className="shrink-0 inline-flex items-center gap-1 h-[19px] pl-1.5 pr-2 rounded-full text-[10.5px] font-[700]"
      // Tint from the category colour, so the chip matches the dots and icons
      // already used for this category everywhere else.
      style={{ background: `${color}1f`, color }}
      title={category}
    >
      <CategoryIcon category={category} size={11} color={color} />
      {CATEGORY_SHORT[category]}
    </span>
  );
}

function CheckBox({ state }: { state: Tri }) {
  return (
    <span
      aria-hidden
      className={`grid place-items-center w-[19px] h-[19px] rounded-[6px] border-2 shrink-0 transition-colors ${
        state === "off" ? "border-hairline bg-surface" : "border-teal bg-teal"
      }`}
    >
      {state === "on" && <Check size={12} strokeWidth={3.5} className="text-white" />}
      {state === "mixed" && <span className="w-[9px] h-[2px] rounded-full bg-white" />}
    </span>
  );
}

function SkipButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-10 text-[14px] font-[600] text-ink-soft active:opacity-60"
    >
      Skip
    </button>
  );
}
