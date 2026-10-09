import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Calendar, Check, FileText, FolderOpen, Home as HomeIcon, Maximize2, SlidersHorizontal, Trophy, User } from "lucide-react";
import { Icon } from "../components/Icon";
import { dec } from "../data";
import { ChildAvatar } from "../components/ui";
import { AppHeader, BackButton, PrimaryButton } from "../components/ui";
import { AddChild } from "./AddChild";
import { Mark } from "../components/Logo";
import { GanttChart, GanttLegend, type Range } from "../components/Gantt";
import { Sheet } from "../components/Sheet";
import BottomBar from "../imports/BottomBar";
import {
  AchievementPreview,
  AchievementRow,
  ActivityControls,
  ActivityPreview,
  type ActivityView,
  CategorySheet,
  type ChildId,
  ChildChip,
  ChildSheet,
  EmptyGantt,
  FilterButton,
  MilestoneStar,
} from "../components/proudly";
import { CategoryIcon } from "../components/CategoryIcon";
import { NearbySection } from "../components/NearbySection";
import { NoteButton } from "../components/NoteButton";
import { HoursSheet, SupportSheet } from "../components/SupportSheet";
import { fmtHours, hoursFor as hoursTotal, logHours } from "../lib/hours";
import { runSync, useSync } from "../lib/sync";
import { ActivityListView } from "../components/ActivityViews";
import { levelStateOf } from "../lib/activityLevels";
import {
  LevelBadge,
  LevelChooserRow,
  LevelPickerSheet,
  NewActivityLevelField,
  NextLevelCard,
} from "../components/level";
import { suggestLevel } from "../lib/levelSuggestion";
import { CoachFinder } from "./CoachFinder";
import { AskProudlySheet } from "./AskProudly";
import {
  type AskContext,
  buildActivityContext,
  buildGeneralContext,
} from "../lib/askProudly";
import { Notifications, type NotifTarget } from "./Notifications";
import { ManualEntry } from "./ManualEntry";
import { NEW_TO_REVIEW_COUNT, NewToReview } from "./NewToReview";
import { BragSheet } from "./BragSheet";
import {
  AccountSettings,
  ChildManagement,
  ConnectedSources,
  DataPrivacy,
  EditChild,
  NotificationPrefs,
  LevelsHelp,
  ProfileTab,
  SavedCoaches,
  type SettingsTarget,
} from "./Settings";
import { SavedCoachRow } from "../components/SavedCoachList";
import { useSavedCoachesFor } from "../lib/savedCoaches";
import { EmptyState, GanttSkeleton, showToast, ToastHost } from "../components/states";
import {
  type Achievement,
  type Activity,
  type ActivityLevel,
  CHILDREN,
  ageFromDob,
  type Category,
  achievementById,
  achievementsFor,
  achievementsForActivity,
  activitiesFor,
  activityById,
  CATEGORIES,
  CATEGORY_COLOR,
  childById,
  durationText,
  fmtMonth,
  TODAY,
  type YM,
} from "../data";

type Tab = "home" | "activities" | "achievements" | "portfolio" | "profile";

const NAV: { id: Tab; label: string; icon: typeof HomeIcon }[] = [
  { id: "home", label: "Home", icon: HomeIcon },
  { id: "activities", label: "Activities", icon: BarChart3 },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "portfolio", label: "Portfolio", icon: FolderOpen },
  { id: "profile", label: "Profile", icon: User },
];

type Overlay =
  | { kind: "activityDetail"; id: string }
  | { kind: "addActivity"; start?: YM }
  | { kind: "coachFinder"; activityId: string }
  | { kind: "editActivity"; id: string }
  | { kind: "achievementDetail"; id: string }
  | { kind: "addAchievement"; activityId?: string }
  | { kind: "expand" }
  | { kind: "notifications" }
  | { kind: "manualEntry" }
  | { kind: "newToReview" }
  | { kind: "allAchievements" }
  | { kind: "connectedSources" }
  | { kind: "childManagement" }
  | { kind: "savedCoaches" }
  | { kind: "levelsHelp" }
  | { kind: "editChild"; id?: string }
  | { kind: "account" }
  | { kind: "notifPrefs" }
  | { kind: "dataPrivacy" };

/** An overlay on the stack, plus the identity its animation is keyed on. */
type StackEntry = Overlay & { _id: number };

export function MainApp({
  onSignOut,
  firstRun = false,
}: {
  onSignOut: () => void;
  /** Set when the parent skipped the calendar scan during onboarding. */
  firstRun?: boolean;
}) {
  const [tab, setTab] = useState<Tab>("home");
  const [childId, setChildId] = useState<ChildId>("reet");
  const [stack, setStack] = useState<StackEntry[]>([]);
  /* Stable per-entry key. Keying by position or kind meant a pop changed the
     key of the entry below it, which remounted that whole screen. */
  const overlaySeq = useRef(0);
  const [discoverOpen, setDiscoverOpen] = useState(false);

  // Gantt shared state (used by Activities tab + expanded view)
  const [range, setRange] = useState<Range>("all");
  const [category, setCategory] = useState<Category | "all">("all");
  const [levelFilter, setLevelFilter] = useState<ActivityLevel | "all">("all");
  const [jump, setJump] = useState<{ token: number; target?: number }>({ token: 0 });

  // Preview sheets
  const [askCtx, setAskCtx] = useState<AskContext | null>(null);
  const [previewActivity, setPreviewActivity] = useState<Activity | null>(null);
  /* "Find support" and "Log hours" are sheets over the current tab, not
     routes — the prototype keeps the list behind them visible. */
  const [supportFor, setSupportFor] = useState<Activity | null>(null);
  const [hoursFor, setHoursFor] = useState<Activity | null>(null);
  const [previewAchievement, setPreviewAchievement] = useState<Achievement | null>(null);

  const push = (o: Overlay) =>
    setStack((s) => [...s, { ...o, _id: ++overlaySeq.current } as StackEntry]);
  const pop = () => setStack((s) => s.slice(0, -1));
  const closeAll = () => setStack([]);

  const openActivity = (id: string) => {
    setPreviewActivity(null);
    push({ kind: "activityDetail", id });
  };
  const openAchievement = (id: string) => {
    setPreviewAchievement(null);
    push({ kind: "achievementDetail", id });
  };
  const viewOnTimeline = (ach: Achievement) => {
    closeAll();
    setChildId(ach.childId);
    setCategory("all");
    setTab("activities");
    setJump((j) => ({ token: j.token + 1, target: dec(ach.date) }));
  };
  const jumpToday = () => setJump((j) => ({ token: j.token + 1, target: undefined }));

  const handleDeepLink = (t: NotifTarget) => {
    setStack((s) => s.slice(0, -1)); // leave the notifications screen
    if (t === "discovery") setDiscoverOpen(true);
    else if (t === "sources") push({ kind: "connectedSources" });
  };

  const openSetting = (s: SettingsTarget) => {
    if (s === "sources") push({ kind: "connectedSources" });
    else if (s === "children") push({ kind: "childManagement" });
    else if (s === "savedCoaches") push({ kind: "savedCoaches" });
    else if (s === "levelsHelp") push({ kind: "levelsHelp" });
    else if (s === "account") push({ kind: "account" });
    else if (s === "notifPrefs") push({ kind: "notifPrefs" });
    else if (s === "data") push({ kind: "dataPrivacy" });
    else if (s === "achievements") push({ kind: "allAchievements" });
  };

  /* Activity context when opened from an activity, the child's wider picture
     otherwise. Built here so the chat screen stays presentational. */
  const openAsk = (activityId?: string) => {
    const activity = activityId ? activityById(activityId) : undefined;
    setAskCtx(activity ? buildActivityContext(activity) : buildGeneralContext(childId));
  };

  const renderOverlay = (o: StackEntry) => (
    <>
      {o.kind === "activityDetail" && (
        <ActivityDetail
          id={o.id}
          onBack={pop}
          onEdit={(id) => push({ kind: "editActivity", id })}
          onOpenAchievement={openAchievement}
          onAddAchievement={(activityId) => push({ kind: "addAchievement", activityId })}
          onFindSupport={setSupportFor}
          onLogHours={setHoursFor}
        />
      )}
      {o.kind === "coachFinder" && (
        <CoachFinder activity={activityById(o.activityId)!} onBack={pop} />
      )}
      {o.kind === "addActivity" && (
        <AddActivity
          childId={childId === "all" ? "reet" : childId}
          start={o.start}
          onBack={pop}
        />
      )}
      {o.kind === "editActivity" && (
        <ManualEntry editId={o.id} onClose={pop} onSaved={pop} />
      )}
      {o.kind === "achievementDetail" && (
        <AchievementDetail
          id={o.id}
          onBack={pop}
          onViewTimeline={viewOnTimeline}
        />
      )}
      {o.kind === "addAchievement" && (
        <AddAchievement
          activityId={o.activityId}
          childId={childId === "all" ? "reet" : childId}
          onBack={pop}
        />
      )}
      {o.kind === "expand" && (
        <ExpandedGantt
          childId={childId}
          onSelectChild={setChildId}
          range={range}
          setRange={setRange}
          category={category}
          setCategory={setCategory}
          jump={jump}
          onJumpToday={jumpToday}
          onTapActivity={setPreviewActivity}
          onTapAchievement={setPreviewAchievement}
          onFindCoach={(activityId) => push({ kind: "coachFinder", activityId })}
          onClose={pop}
        />
      )}
      {o.kind === "notifications" && (
        <Notifications onBack={pop} onDeepLink={handleDeepLink} />
      )}
      {o.kind === "manualEntry" && <ManualEntry onClose={pop} onSaved={pop} />}
      {o.kind === "newToReview" && <NewToReview onBack={pop} />}
      {o.kind === "allAchievements" && (
        <AllAchievements
          childId={childId}
          onSelectChild={setChildId}
          onOpen={openAchievement}
          onBack={pop}
        />
      )}
      {o.kind === "connectedSources" && <ConnectedSources onBack={pop} />}
      {o.kind === "savedCoaches" && <SavedCoaches onBack={pop} />}
      {o.kind === "levelsHelp" && <LevelsHelp onBack={pop} />}
      {o.kind === "childManagement" && (
        <ChildManagement
          onBack={pop}
          onEditChild={(id) => push({ kind: "editChild", id })}
          onAddChild={() => push({ kind: "editChild" })}
        />
      )}
      {o.kind === "editChild" &&
        (o.id ? (
          <EditChild id={o.id} onBack={pop} />
        ) : (
          /* Adding from Profile runs the onboarding flow, not a second form. */
          <AddChild
            onBack={pop}
            onContinue={() => {
              pop();
              showToast("Child added");
            }}
            title="Add a child"
            step=""
            ctaLabel="Done"
          />
        ))}
      {o.kind === "account" && (
        <AccountSettings
          onBack={pop}
          onSignOut={() => {
            closeAll();
            onSignOut();
          }}
        />
      )}
      {o.kind === "notifPrefs" && <NotificationPrefs onBack={pop} />}
      {o.kind === "dataPrivacy" && (
        <DataPrivacy
          onBack={pop}
          onManageChildren={() => push({ kind: "childManagement" })}
        />
      )}
    </>
  );

  return (
    <div className="size-full flex flex-col bg-canvas relative overflow-hidden">
      <div className="flex-1 overflow-y-auto scroll-area">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            /* Short, asymmetric: mode="wait" plays this out in full before the
               incoming tab starts, so a symmetric 0.22s each way meant 0.44s
               and a blank beat between tabs. */
            exit={{ opacity: 0, y: -6, transition: { duration: 0.09, ease: "easeIn" } }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            {tab === "home" && (
              <Home
                childId={childId}
                onSelectChild={setChildId}
                onGoTab={setTab}
                firstRun={firstRun}
                onTapActivity={setPreviewActivity}
                onOpenAchievement={openAchievement}
                onOpenNotifications={() => push({ kind: "newToReview" })}
                onAddActivity={() => push({ kind: "manualEntry" })}
                onAddAchievement={() => push({ kind: "addAchievement" })}
                onFindSupport={setSupportFor}
                onLogHours={setHoursFor}
              />
            )}
            {tab === "activities" && (
              <Activities
                childId={childId}
                onSelectChild={setChildId}
                onTapActivity={setPreviewActivity}
                onFindSupport={setSupportFor}
                onLogHours={setHoursFor}
              />
            )}
            {tab === "achievements" && (
              <Achievements
                childId={childId}
                onSelectChild={setChildId}
                onOpen={openAchievement}
              />
            )}
            {tab === "portfolio" && (
              <BragSheet childId={childId} onSelectChild={setChildId} />
            )}
            {tab === "profile" && <ProfileTab onOpen={openSetting} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating glass nav — overlays the scrolling tab body. */}
      <BottomBar activeTab={tab} onSelectTab={setTab} />

      {/* Preview sheets */}
      <ActivityPreview
        activity={previewActivity}
        onClose={() => setPreviewActivity(null)}
        onLogHours={(a) => {
          setPreviewActivity(null);
          setHoursFor(a);
        }}
        onView={openActivity}
        onEdit={(id) => {
          setPreviewActivity(null);
          push({ kind: "editActivity", id });
        }}
      />
      <SupportSheet activity={supportFor} onClose={() => setSupportFor(null)} />
      <HoursSheet
        activity={hoursFor}
        onClose={() => setHoursFor(null)}
        onSave={(activityId, h) => {
          logHours(activityId, h);
          setHoursFor(null);
          showToast(`${fmtHours(h)} logged`);
        }}
      />

      <AchievementPreview
        achievement={previewAchievement}
        onClose={() => setPreviewAchievement(null)}
        onView={openAchievement}
      />

      {/* Ask BragOn — bottom sheet, draggable to full height */}
      <AskProudlySheet
        context={askCtx}
        onClose={() => setAskCtx(null)}
        onFindCoach={(activityId) => {
          setAskCtx(null);
          push({ kind: "coachFinder", activityId });
        }}
      />

      {/* Overlay screens */}
      {/* Overlay screens. The whole stack stays mounted, with only the top one
          interactive — so going back reveals the screen underneath instead of
          rebuilding it and sliding it in from the right as if it were new. */}
      <AnimatePresence>
        {stack.map((o, i) => {
          const isTop = i === stack.length - 1;
          return (
            <motion.div
              key={o._id}
              className={`absolute inset-0 z-30 bg-canvas ${isTop ? "" : "pointer-events-none"}`}
              aria-hidden={!isTop}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 40 }}
            >
              {renderOverlay(o)}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Discovery review (lifted so notifications can deep-link to it) */}
      <DiscoveryReview open={discoverOpen} onClose={() => setDiscoverOpen(false)} />

      {/* Global success feedback */}
      <ToastHost />
    </div>
  );
}

/* ============================================================= HOME *//* Home — Oct-1 redesign.
   ----------------------
   Rebuilt from the prototype: a glassy sticky action bar, then "<Kid>'s
   journey" with the sync state under it, a pending-review row, two hero
   numbers, and flat lists of activities and accomplishments. The old card
   stacks are gone — the prototype drops boxes around list rows throughout.

   Note for the client: child switching here is horizontal chips, which is
   what the prototype shows. That reverses the compact dropdown asked for
   earlier; the dropdown still exists and is used on the other tabs. */
function Home({
  childId,
  onSelectChild,
  onGoTab,
  firstRun,
  onTapActivity,
  onOpenAchievement,
  onOpenNotifications,
  onAddActivity,
  onAddAchievement,
  onFindSupport,
  onLogHours,
}: {
  childId: ChildId;
  onSelectChild: (id: ChildId) => void;
  onGoTab: (t: Tab) => void;
  firstRun: boolean;
  onTapActivity: (a: Activity) => void;
  onOpenAchievement: (id: string) => void;
  onOpenNotifications: () => void;
  onAddActivity: () => void;
  onAddAchievement: () => void;
  onFindSupport: (a: Activity) => void;
  onLogHours: (a: Activity) => void;
}) {
  const acts = activitiesFor(childId);
  const achs = achievementsFor(childId);
  const child = childById(childId);
  const first = child?.name ?? "Your child";
  const { syncing, label: syncLabel } = useSync();

  return (
    <div className="flex-1 overflow-y-auto scroll-area flex flex-col pb-28">
      {/* Glassy action bar — sits over the content as it scrolls */}
      <div
        className="sticky top-0 z-20 flex items-center gap-2 px-4 pt-[46px] pb-1.5"
        style={{
          background: "color-mix(in srgb, var(--color-cream) 55%, transparent)",
          backdropFilter: "blur(20px) saturate(1.5)",
          WebkitBackdropFilter: "blur(20px) saturate(1.5)",
        }}
      >
        <div className="flex-1" />
        {[
          {
            icon: (
              <Icon name="sync" size={24} className={syncing ? "animate-spin" : undefined} />
            ),
            label: "Sync calendars",
            onClick: runSync,
          },
          {
            icon: <Icon name="notifications" size={24} />,
            label: `Activities to review (${NEW_TO_REVIEW_COUNT})`,
            onClick: onOpenNotifications,
            badge: NEW_TO_REVIEW_COUNT,
          },
          { icon: <Icon name="add" size={24} />, label: "Add activity", onClick: onAddActivity },
        ].map((b) => (
          <button
            key={b.label}
            onClick={b.onClick}
            aria-label={b.label}
            className="relative grid place-items-center w-12 h-12 rounded-full border border-white/90 bg-white/60 text-ink shadow-[0_6px_16px_-10px_rgba(20,50,44,0.3)] active:scale-95 transition-transform shrink-0"
          >
            {b.icon}
            {!!b.badge && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-[5px] rounded-full bg-amber border-2 border-cream text-white text-[11px] font-[700] leading-[14px] text-center">
                {b.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Title + sync state + kid chips */}
      <div className="px-4 pt-2.5 flex flex-col gap-1">
        <h2 className="font-[700] text-[32px] leading-[1.1] tracking-[-0.03em] text-ink">
          {first}'s journey
        </h2>
        <span className="text-[14px] text-ink-soft">{syncLabel}</span>
        {CHILDREN.length > 1 && <KidChips childId={childId} onSelect={onSelectChild} />}
      </div>

      {firstRun ? (
        /* Nothing was scanned, so there is no queue to review — the one
           thing worth doing is adding the first activity by hand. */
        <button
          onClick={onAddActivity}
          className="mt-4 flex items-center gap-3.5 min-h-16 px-4 text-left border-y transition-colors"
          style={{ background: "#f0f4f2", borderColor: "rgba(36,100,79,0.15)" }}
        >
          <Icon name="add_circle" size={24} fill className="text-pine" />
          <span className="flex-1 min-w-0">
            <span className="block text-[15px] font-[600] text-ink">
              Add your first activity
            </span>
            <span className="block text-[13px] text-ink-soft">
              Nothing synced — start {first}'s journey by hand
            </span>
          </span>
          <span className="text-[14px] font-[700] text-pine whitespace-nowrap">Add</span>
        </button>
      ) : (
      <button
        onClick={onOpenNotifications}
        className="mt-4 flex items-center gap-3.5 min-h-16 px-4 text-left border-y transition-colors"
        style={{
          background: "#fbf5ea",
          borderColor: "rgba(217,140,18,0.15)",
        }}
      >
        <Icon name="event_upcoming" size={24} fill className="text-amber" />
        <span className="flex-1 min-w-0">
          <span className="block text-[15px] font-[600] text-ink">
            {NEW_TO_REVIEW_COUNT} new{" "}
            {NEW_TO_REVIEW_COUNT === 1 ? "activity" : "activities"} to review
          </span>
          <span className="block text-[13px] text-ink-soft">Found in your calendars</span>
        </span>
        <span className="text-[14px] font-[700] text-amber whitespace-nowrap">Review</span>
      </button>
      )}

      {/* Hero numbers */}
      <div className="mt-[18px] px-4 flex gap-10">
        <div className="flex flex-col gap-0.5">
          <span className="font-[700] text-[34px] leading-none tracking-[-0.02em] text-pine">
            {acts.length}
          </span>
          <span className="text-[13px] font-[500] text-ink-soft">Activities</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-[700] text-[34px] leading-none tracking-[-0.02em] text-amber">
            {achs.length}
          </span>
          <span className="text-[13px] font-[500] text-ink-soft">Accomplishments</span>
        </div>
      </div>

      <SectionLabel label="Activities" onAdd={onAddActivity} addLabel="Add activity" />
      <div className="py-1">
        {acts.map((a) => (
          <div key={a.id} className="flex items-center gap-3 px-4">
            <button
              onClick={() => onTapActivity(a)}
              className="flex-1 flex items-center gap-3 min-h-[66px] min-w-0 text-left"
            >
              <span className="grid place-items-center w-[42px] h-[42px] rounded-full bg-pine-soft shrink-0">
                <CategoryIcon category={a.category} size={22} color="#24644f" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-[600] text-ink truncate">{a.name}</span>
              </span>
            </button>
            <div className="shrink-0 flex items-center">
              <button
                onClick={() => onLogHours(a)}
                aria-label={`Log hours for ${a.name}`}
                className="grid place-items-center w-9 h-9 rounded-full text-pine active:bg-pine-soft transition-colors"
              >
                <Icon name="more_time" size={21} />
              </button>
              <NoteButton id={a.id} title={a.name} seed={a.note} />
            </div>
            {/* The prototype's shimmering "Find support" — the app's coach finder */}
            <button
              onClick={() => onFindSupport(a)}
              className="brag-shine shrink-0 h-[38px] pl-[11px] pr-3.5 rounded-full text-white font-[600] text-[13px] flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-transform"
              style={{ boxShadow: "0 8px 18px -8px rgba(181,83,47,0.7)" }}
            >
              <Icon name="auto_awesome" size={18} fill /> Find support
            </button>
          </div>
        ))}
      </div>

      <SectionLabel label="Accomplishments" onAdd={onAddAchievement} addLabel="Add accomplishment" />
      <div className="flex flex-col">
        {achs.map((w) => (
          <div key={w.id} className="flex items-center gap-3.5 min-h-[62px] px-4">
            <button
              onClick={() => onOpenAchievement(w.id)}
              className="flex-1 min-w-0 flex items-center gap-3.5 text-left"
            >
              <Trophy size={24} className="text-amber w-[42px] shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-[600] text-ink truncate">{w.title}</span>
                <span className="block text-[12px] text-ink-soft truncate">
                  {[activityById(w.activityId)?.name, fmtMonth(w.date)].filter(Boolean).join(" · ")}
                </span>
              </span>
            </button>
            <NoteButton id={w.id} title={w.title} seed={w.description} />
          </div>
        ))}
      </div>

      <NearbySection childName={first} topActivity={acts[0]} />
    </div>
  );
}

/** Uppercase section label with a quiet add control, per the prototype. */
function SectionLabel({
  label,
  onAdd,
  addLabel,
}: {
  label: string;
  onAdd: () => void;
  addLabel: string;
}) {
  return (
    <div className="flex items-center justify-between pt-4 px-4">
      <span className="text-[13px] font-[600] tracking-[0.04em] text-ink-soft uppercase whitespace-nowrap">
        {label}
      </span>
      <button
        onClick={onAdd}
        aria-label={addLabel}
        className="grid place-items-center w-9 h-9 -mr-2 rounded-full text-pine active:bg-pine-soft transition-colors"
      >
        <Icon name="add" size={20} />
      </button>
    </div>
  );
}

function Summary({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="flex-1 py-3.5 text-center">
      <div
        className={`font-display text-[24px] font-[700] leading-none ${
          accent ? "text-gold" : "text-teal"
        }`}
      >
        {value}
      </div>
      <div className="text-[11.5px] text-ink-soft mt-1.5 font-[500]">{label}</div>
    </div>
  );
}

function JourneyPreviewRow({
  activity,
  all,
  onOpen,
  onFindCoach,
}: {
  activity: Activity;
  all: Activity[];
  onOpen: () => void;
  onFindCoach: () => void;
}) {
  const min = Math.min(...all.map((a) => a.start.y));
  const max = Math.max(new Date().getFullYear(), ...all.map((a) => (a.end === "present" ? 0 : a.end.y)));
  const span = Math.max(max - min, 1);
  const startY = activity.start.y;
  const endY = activity.end === "present" ? max : activity.end.y;
  const left = ((startY - min) / span) * 100;
  const width = Math.max(((endY - startY) / span) * 100, 6);
  const ongoing = activity.end === "present";
  return (
    // Relative so the coach button can pin to the row's top-right; the rest of
    // the row stays one tap target into the activities tab.
    <div className="relative py-3.5">
      <button onClick={onOpen} className="w-full text-left">
        <span className="flex items-center gap-2 min-w-0 pr-[104px]">
          <span className="text-[15px] font-[600] text-ink truncate">{activity.name}</span>
          <LevelBadge activity={activity} />
        </span>

        <span className="flex items-center gap-1.5 mt-1 text-[11.5px] text-ink-soft">
          <span className="tabular-nums">
            {startY} – {ongoing ? "Present" : endY}
          </span>
          <span aria-hidden>·</span>
          <span>{durationText(activity.start, activity.end)}</span>
          {ongoing && (
            <span
              className="ml-0.5 w-1.5 h-1.5 rounded-full bg-teal shrink-0"
              aria-label="Ongoing"
            />
          )}
        </span>
      </button>

      <button
        onClick={onFindCoach}
        aria-label={`Find a ${activity.name} coach`}
        className="absolute top-3 right-0 h-[26px] px-2.5 rounded-full bg-teal text-white text-[11px] font-[700] inline-flex items-center gap-1 active:scale-95 transition-transform"
      >
        <Icon name="school" size={12} />
        Find a coach
      </button>

      <div className="relative h-1.5 rounded-full bg-canvas mt-2.5">
        <div
          className="absolute h-full rounded-full"
          style={{
            left: `${left}%`,
            width: `${width}%`,
            background: ongoing ? "linear-gradient(90deg,#217c72,#2f9c8f)" : "#cfd9d4",
          }}
        />
      </div>
    </div>
  );
}

function SectionHead({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="px-4 mt-6 mb-2.5 flex items-center justify-between">
      <h3 className="font-display text-[17px] font-[700] text-ink">{title}</h3>
      {actionLabel && onAction && (
        <button onClick={onAction} className="text-[13px] font-[600] text-teal active:opacity-60">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* ============================================================= ACTIVITIES */
/* Activity journey — Oct-1 redesign.
   -----------------------------------
   The prototype replaces the Gantt-first screen with a flat ranked list:
   longest-running activity first, each row carrying its level, its span, its
   accomplishment count and a bar showing how long it has run relative to the
   longest. No cards, no boxes — the divider is the only structure.

   The prototype carries no filter and no chart on this screen, so neither is
   here. Both still exist — the Gantt as the full-screen "expand" route — but
   they have no entry point on this tab any more. */
function Activities({
  childId,
  onSelectChild,
  onTapActivity,
  onFindSupport,
  onLogHours,
}: {
  childId: ChildId;
  onSelectChild: (id: ChildId) => void;
  onTapActivity: (a: Activity) => void;
  onFindSupport: (a: Activity) => void;
  onLogHours: (a: Activity) => void;
}) {
  const acts = activitiesFor(childId);
  const allActs = acts;
  const achs = achievementsFor(childId);
  const name = childId === "all" ? "Everyone" : childById(childId)!.name;

  /* Months run, floored at one so a brand-new activity still draws a sliver
     of bar. The longest sets the scale for every other row. */
  const months = (a: Activity) => {
    const e = a.end === "present" ? TODAY : a.end;
    return Math.max(1, (e.y - a.start.y) * 12 + (e.m - a.start.m) + 1);
  };
  const longest = Math.max(1, ...acts.map(months));
  const ranked = [...acts].sort((p, q) => months(q) - months(p));

  return (
    <div className="pb-28">
      {/* Title block */}
      <div className="pt-[56px] px-6 pb-2 flex flex-col gap-1">
        <h2 className="font-[700] text-[30px] leading-[1.1] tracking-[-0.025em] text-ink">
          Activity journey
        </h2>
        <span className="text-[14px] text-ink-soft">
          {name} · {allActs.length} activities · {achs.length} accomplishments
        </span>
        {CHILDREN.length > 1 && <KidChips childId={childId} onSelect={onSelectChild} />}
      </div>

      {ranked.length === 0 ? (
        <div className="px-6 pt-2">
          <EmptyGantt name={name} onSync={() => {}} onAdd={() => {}} />
        </div>
      ) : (
        <div className="pt-1 flex flex-col">
          {ranked.map((a) => {
            const wins = achievementsForActivity(a.id).length;
            const live = a.end === "present";
            const pct = Math.round((months(a) / longest) * 100);
            return (
              <div
                key={a.id}
                className="flex flex-col gap-2.5 px-6 py-[18px] border-b border-[#e7e4dc]"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onTapActivity(a)}
                    className="flex-1 min-w-0 flex flex-wrap items-center gap-2 text-left"
                  >
                    <span className="text-[17px] leading-[1.3] font-[600] text-ink">
                      {a.name}
                    </span>
                    <span className="h-6 px-2.5 rounded-xl bg-pine-soft text-pine-dark text-[12px] font-[600] leading-6 whitespace-nowrap">
                      {levelStateOf(a).current}
                    </span>
                  </button>
                  <div className="shrink-0 flex items-center">
                    <button
                      onClick={() => onLogHours(a)}
                      aria-label={`Log hours for ${a.name}`}
                      className="grid place-items-center w-9 h-9 rounded-full text-pine active:bg-pine-soft transition-colors"
                    >
                      <Icon name="more_time" size={21} />
                    </button>
                    <NoteButton id={a.id} title={a.name} seed={a.note} />
                  </div>
                  <button
                    onClick={() => onFindSupport(a)}
                    className="brag-shine shrink-0 h-8 pl-[9px] pr-3 rounded-full text-white font-[600] text-[12px] flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-transform"
                    style={{ boxShadow: "0 6px 14px -8px rgba(181,83,47,0.7)" }}
                  >
                    <Icon name="auto_awesome" size={16} fill /> Find support
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[13px] text-ink-soft">
                  <span>
                    {a.start.y} – {a.end === "present" ? "Present" : a.end.y} ·{" "}
                    {durationText(a.start, a.end)}
                  </span>
                  {hoursTotal(a.id) > 0 && (
                    <span className="font-[600] text-pine-dark">
                      · {fmtHours(hoursTotal(a.id))}
                    </span>
                  )}
                  {live && <span className="w-1.5 h-1.5 rounded-full bg-pine" />}
                  {wins > 0 && (
                    <span className="flex items-center gap-1 font-[600] text-amber-dark">
                      <Trophy size={16} className="text-amber" />
                      {wins}
                    </span>
                  )}
                </div>

                {a.note && (
                  <span className="block italic text-[12px] leading-[1.35] text-[#6a6f6c] truncate">
                    {a.note}
                  </span>
                )}

                <div className="h-1.5 rounded-full bg-pine-soft overflow-hidden">
                  <div
                    className="h-full rounded-full bg-pine transition-[width] duration-[600ms] ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* Each child gets a tint, used for their initial wherever they are listed. */
const KID_TINT = [
  { soft: "bg-pine-soft", ink: "text-pine" },
  { soft: "bg-rust-soft", ink: "text-rust" },
  { soft: "bg-amber-soft", ink: "text-amber-dark" },
];
export const kidTint = (id: string) =>
  KID_TINT[Math.max(0, CHILDREN.findIndex((c) => c.id === id)) % KID_TINT.length];

/** The prototype's horizontal child switcher — shared by Home and Timeline. */
function KidChips({
  childId,
  onSelect,
}: {
  childId: ChildId;
  onSelect: (id: ChildId) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 pt-2">
      {CHILDREN.map((k) => {
        const on = k.id === childId;
        const tint = kidTint(k.id);
        return (
          <button
            key={k.id}
            onClick={() => onSelect(k.id)}
            aria-pressed={on}
            className={`flex items-center gap-1.5 h-7 pl-[3px] pr-[11px] rounded-full border transition-colors ${
              on ? "border-pine bg-pine-soft text-pine" : "border-hairline bg-surface text-[#3d413f]"
            }`}
          >
            <span
              className={`grid place-items-center w-[22px] h-[22px] rounded-full text-[10.5px] font-[700] ${
                on ? "bg-pine text-white" : `${tint.soft} ${tint.ink}`
              }`}
            >
              {k.name[0]}
            </span>
            <span className="text-[12.5px] font-[600]">{k.name}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Gantt error state (keeps the Activities structure in place) ---------- */
function GanttError({ name, onRetry }: { name: string; onRetry: () => void }) {
  return (
    <div className="rounded-[22px] bg-surface border border-hairline px-8 py-11 flex flex-col items-center text-center">
      <span className="grid place-items-center w-14 h-14 rounded-2xl bg-[#faeae6] text-[#b4432f] mb-4">
        <Icon name="sync" size={24} />
      </span>
      <h3 className="font-display text-[17px] font-[700] text-ink leading-snug max-w-[250px]">
        We couldn't load {name}'s activity history
      </h3>
      <p className="text-[13px] text-ink-soft mt-2 max-w-[240px] leading-relaxed">
        This is usually temporary. Try again in a moment.
      </p>
      <div className="flex flex-col items-center gap-2.5 mt-5 w-full max-w-[240px]">
        <button
          onClick={onRetry}
          className="w-full h-11 rounded-xl bg-teal text-white font-[600] text-[14px] active:scale-95 transition-transform"
        >
          Try again
        </button>
        <span className="text-[12.5px] font-[600] text-ink-soft">Check connected sources</span>
      </div>
    </div>
  );
}

/* ---------- Expanded (distraction-free) Gantt ---------- */
function ExpandedGantt({
  childId,
  onSelectChild,
  range,
  setRange,
  category,
  setCategory,
  jump,
  onJumpToday,
  onTapActivity,
  onTapAchievement,
  onFindCoach,
  onClose,
}: {
  childId: ChildId;
  onSelectChild: (id: ChildId) => void;
  range: Range;
  setRange: (r: Range) => void;
  category: Category | "all";
  setCategory: (c: Category | "all") => void;
  jump: { token: number; target?: number };
  onJumpToday: () => void;
  onTapActivity: (a: Activity) => void;
  onTapAchievement: (a: Achievement) => void;
  onFindCoach: (activityId: string) => void;
  onClose: () => void;
}) {
  const [childSheet, setChildSheet] = useState(false);
  const [catSheet, setCatSheet] = useState(false);
  const allActs = activitiesFor(childId);
  const acts = category === "all" ? allActs : allActs.filter((a) => a.category === category);
  const achs = achievementsFor(childId);

  return (
    <div className="size-full flex flex-col bg-canvas">
      <div className="shrink-0 pt-12 px-4 pb-2 flex items-center gap-2">
        <button
          onClick={onClose}
          className="grid place-items-center w-10 h-10 rounded-full bg-surface border border-hairline text-ink active:scale-95 transition-transform"
        >
          <Icon name="close" size={19} strokeWidth={2.2} />
        </button>
        <ChildChip childId={childId} onOpen={() => setChildSheet(true)} />
        <div className="ml-auto">
          <FilterButton active={category !== "all"} onClick={() => setCatSheet(true)} />
        </div>
      </div>
      <div className="px-4 pb-2">
        <ActivityControls range={range} onRangeChange={setRange} onJumpToday={onJumpToday} />
      </div>
      <div className="flex-1 px-3 pb-3">
        <GanttChart
          activities={acts}
          achievements={achs}
          range={range}
          height={620}
          jumpToken={jump.token}
          jumpTarget={jump.target}
          onTapActivity={onTapActivity}
          onTapAchievement={onTapAchievement}
          onFindCoach={(a) => onFindCoach(a.id)}
        />
      </div>
      <div className="px-4 pb-6">
        <GanttLegend />
      </div>
      <ChildSheet
        open={childSheet}
        onClose={() => setChildSheet(false)}
        childId={childId}
        onSelect={onSelectChild}
      />
      <CategorySheet
        open={catSheet}
        onClose={() => setCatSheet(false)}
        value={category}
        onSelect={setCategory}
      />
    </div>
  );
}

/* ============================================================= ACTIVITY DETAIL */
function ActivityDetail({
  id,
  onBack,
  onEdit,
  onOpenAchievement,
  onAddAchievement,
  onFindSupport,
  onLogHours,
}: {
  id: string;
  onBack: () => void;
  onEdit: (id: string) => void;
  onOpenAchievement: (id: string) => void;
  onAddAchievement: (activityId: string) => void;
  onFindSupport: (a: Activity) => void;
  onLogHours: (a: Activity) => void;
}) {
  const activity = activityById(id)!;
  const acts = achievementsForActivity(id);
  const ongoing = activity.end === "present";
  const [levelSheet, setLevelSheet] = useState(false);
  const savedCoaches = useSavedCoachesFor(id);
  const history = [...activity.history].sort((a, b) => dec(a.date) - dec(b.date));

  return (
    <div className="size-full flex flex-col bg-canvas">
      <AppHeader
        onBack={onBack}
        trailing={
          <button
            onClick={() => onEdit(id)}
            className="grid place-items-center w-10 h-10 rounded-full bg-surface border border-hairline text-ink active:scale-95 transition-transform"
          >
            <Icon name="edit" size={17} />
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto scroll-area pb-8">
        <div className="px-6">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: CATEGORY_COLOR[activity.category] }}
            />
            <span className="text-[13px] font-[600] text-ink-soft">{activity.category}</span>
            <LevelBadge activity={activity} />
            {ongoing && (
              <span className="text-[11.5px] font-[700] text-pine bg-pine-soft px-2 py-0.5 rounded-full">
                Ongoing
              </span>
            )}
          </div>
          <h1 className="font-[700] text-[30px] leading-[1.1] tracking-[-0.025em] text-ink mt-1.5">
            {activity.name}
          </h1>

          {/* The span, the tally and the hours on one line. The counts used to
              be two big cards, which made a number the loudest thing on a
              screen that is about the activity. */}
          <p className="flex flex-wrap items-center gap-x-2 text-[14px] text-ink-soft mt-1.5">
            <span>
              {activity.approxStart ? "~" : ""}
              {fmtMonth(activity.start)} –{" "}
              {activity.end === "present" ? "Present" : fmtMonth(activity.end)} ·{" "}
              {durationText(activity.start, activity.end)}
            </span>
            {acts.length > 0 && (
              <span className="inline-flex items-center gap-1 font-[600] text-amber-dark">
                <Icon name="trophy" size={16} fill className="text-amber" />
                {acts.length}
              </span>
            )}
            {hoursTotal(id) > 0 && (
              <span className="font-[600] text-pine-dark">· {fmtHours(hoursTotal(id))}</span>
            )}
          </p>

          <div className="flex gap-2 mt-4">
            <NoteButton id={activity.id} title={activity.name} seed={activity.note} label />
            <button
              onClick={() => onLogHours(activity)}
              className="flex items-center gap-1.5 h-10 pl-3 pr-4 rounded-full bg-surface border border-hairline text-[13.5px] font-[600] text-ink active:scale-95 transition-transform"
            >
              <Icon name="more_time" size={18} className="text-pine" /> Log hours
            </button>
          </div>
        </div>

        {/* Level + what's next */}
        <div className="px-4 mt-4">
          <NextLevelCard
            activity={activity}
            onChangeLevel={() => setLevelSheet(true)}
            onFindSupport={() => onFindSupport(activity)}
          />
        </div>

        {/* Coaches the parent kept for this activity */}
        {savedCoaches.length > 0 && (
          <div className="px-4 mt-7">
            <h3 className="font-display text-[17px] font-[700] text-ink mb-3">Saved coaches</h3>
            <div className="space-y-2.5">
              {savedCoaches.map((sv) => (
                <SavedCoachRow key={sv.coach.id} saved={sv} />
              ))}
            </div>
          </div>
        )}

        {/* History */}
        <h3 className="px-4 mt-7 mb-3 font-display text-[17px] font-[700] text-ink">Journey</h3>
        <div className="px-4">
          <div className="relative pl-6">
            <div className="absolute left-[7px] top-1 bottom-1 w-px bg-hairline" />
            <div className="space-y-4">
              {history.map((h, i) => (
                <div key={i} className="relative">
                  <span
                    className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-canvas ${
                      i === history.length - 1 && ongoing ? "bg-teal" : "bg-hairline"
                    }`}
                  />
                  <p className="text-[11.5px] font-[600] text-ink-soft uppercase tracking-wide">
                    {fmtMonth(h.date)}
                  </p>
                  <p className="text-[14.5px] text-ink font-[500] mt-0.5">{h.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="px-4 mt-7 flex items-center justify-between">
          <h3 className="font-display text-[17px] font-[700] text-ink">Achievements</h3>
          <button
            onClick={() => onAddAchievement(id)}
            className="flex items-center gap-1 text-[13px] font-[600] text-teal active:opacity-60"
          >
            <Icon name="add" size={15} /> Add
          </button>
        </div>
        <div className="px-4 mt-3 space-y-2.5">
          {acts.length ? (
            acts.map((a) => (
              <AchievementRow key={a.id} achievement={a} onClick={() => onOpenAchievement(a.id)} />
            ))
          ) : (
            <p className="text-[13.5px] text-ink-soft">No achievements yet.</p>
          )}
        </div>

        {/* Notes */}
        {activity.note && (
          <div className="px-4 mt-7">
            <h3 className="font-display text-[17px] font-[700] text-ink mb-2">Parent notes</h3>
            <div className="rounded-2xl bg-gold-soft/60 border border-gold/20 p-4">
              <p className="text-[14px] text-ink leading-relaxed">{activity.note}</p>
            </div>
          </div>
        )}
      </div>

      <LevelPickerSheet
        activity={activity}
        open={levelSheet}
        onClose={() => setLevelSheet(false)}
      />
    </div>
  );
}

/* ============================================================= EDIT ACTIVITY */
/* ============================================================= ADD ACTIVITY */
function AddActivity({
  childId,
  start,
  onBack,
}: {
  childId: string;
  start?: YM;
  onBack: () => void;
}) {
  const startMonth = start ?? TODAY;
  const [name, setName] = useState("");
  const [selectedChild, setSelectedChild] = useState(childId);
  const [category, setCategory] = useState<Category | null>(null);
  const [ongoing, setOngoing] = useState(true);
  const [note, setNote] = useState("");
  const [childSheet, setChildSheet] = useState(false);
  const [catSheet, setCatSheet] = useState(false);
  /** null until the parent picks, so the suggestion keeps tracking the form. */
  const [pickedLevel, setPickedLevel] = useState<ActivityLevel | null>(null);

  /* What the engine would suggest for this activity the moment it is created:
     no tenure and no achievements yet, so only the child's age ceiling and the
     ongoing flag move it. Recomputed rather than hardcoded, so it cannot drift
     from the rules documented in Settings > Help. */
  const suggestedLevel = useMemo(
    () =>
      suggestLevel({
        ageYears: ageFromDob(childById(selectedChild)?.dob),
        yearsInvolved: 0,
        achievementCount: 0,
        ongoing,
      }).level,
    [selectedChild, ongoing],
  );
  const level = pickedLevel ?? suggestedLevel;

  const save = () => {
    showToast("Activity added");
    onBack();
  };

  return (
    <div className="size-full flex flex-col bg-canvas">
      <AppHeader title="Add activity" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scroll-area px-6 pb-8">
        <div className="flex justify-center mt-2 mb-6">
          <span className="grid place-items-center w-16 h-16 rounded-3xl bg-mint text-teal-dark">
            <BarChart3 size={30} />
          </span>
        </div>

        <Field label="Activity name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            placeholder="e.g. Swimming"
            className="h-[52px] w-full rounded-2xl bg-surface px-4 text-[16px] text-ink border border-hairline outline-none focus:border-teal focus:ring-4 focus:ring-teal/10 transition placeholder:text-ink-soft/60"
          />
        </Field>

        <Field label="Child">
          <PickerRow
            value={childById(selectedChild)?.name ?? ""}
            avatar={childById(selectedChild)?.photo}
            onClick={() => setChildSheet(true)}
          />
        </Field>

        <Field label="Category">
          <PickerRow
            value={category ?? "Choose category"}
            dot={category ? CATEGORY_COLOR[category] : undefined}
            onClick={() => setCatSheet(true)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start date">
            <div className="h-[52px] rounded-2xl bg-surface px-4 border border-hairline flex items-center gap-2 text-[15px] text-ink">
              <Calendar size={16} className="text-ink-soft" />
              {fmtMonth(startMonth)}
            </div>
          </Field>
          <Field label="End date">
            <div
              className={`h-[52px] rounded-2xl px-4 border flex items-center gap-2 text-[15px] ${
                ongoing
                  ? "bg-canvas border-hairline text-ink-soft/60"
                  : "bg-surface border-hairline text-ink"
              }`}
            >
              <Calendar size={16} className="text-ink-soft" />
              {ongoing ? "—" : fmtMonth(startMonth)}
            </div>
          </Field>
        </div>

        {/* Ongoing toggle */}
        <button
          onClick={() => setOngoing((o) => !o)}
          className="w-full mt-1 flex items-center justify-between rounded-2xl bg-surface border border-hairline p-4"
        >
          <div className="text-left">
            <p className="text-[15px] font-[600] text-ink">Ongoing</p>
            <p className="text-[12.5px] text-ink-soft">Still an active activity</p>
          </div>
          <span
            className={`w-12 h-7 rounded-full p-0.5 transition-colors ${
              ongoing ? "bg-teal" : "bg-hairline"
            }`}
          >
            <motion.span
              layout
              className="block w-6 h-6 rounded-full bg-white shadow"
              style={{ marginLeft: ongoing ? 20 : 0 }}
            />
          </span>
        </button>

        <div className="mt-4">
          <NewActivityLevelField
            value={level}
            suggested={suggestedLevel}
            onChange={setPickedLevel}
            onReset={() => setPickedLevel(null)}
          />
        </div>

        <Field label="Notes (optional)" className="mt-4">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Add a memory or context…"
            className="w-full rounded-2xl bg-surface px-4 py-3 text-[15px] text-ink border border-hairline outline-none focus:border-teal focus:ring-4 focus:ring-teal/10 transition resize-none placeholder:text-ink-soft/60"
          />
        </Field>

      </div>

      <div className="shrink-0 px-6 pt-3 pb-8 border-t border-hairline bg-canvas">
        <PrimaryButton onClick={save} disabled={!name || !category}>
          Add activity
        </PrimaryButton>
      </div>

      <ChildSheet
        open={childSheet}
        onClose={() => setChildSheet(false)}
        childId={selectedChild}
        onSelect={(id) => setSelectedChild(id as string)}
      />
      <CategorySheet
        open={catSheet}
        onClose={() => setCatSheet(false)}
        value={category ?? "all"}
        onSelect={(c) => c !== "all" && setCategory(c)}
      />
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block mb-4 ${className}`}>
      <span className="block text-[13px] font-[500] text-ink-soft mb-1.5 ml-0.5">{label}</span>
      {children}
    </label>
  );
}

function PickerRow({
  value,
  onClick,
  dot,
  avatar,
}: {
  value: string;
  onClick: () => void;
  dot?: string;
  avatar?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[52px] w-full rounded-2xl bg-surface px-4 border border-hairline flex items-center gap-2.5 text-[16px] text-ink active:scale-[0.99] transition-transform"
    >
      {avatar && <ChildAvatar src={avatar} name={value} size={26} />}
      {dot && <span className="w-2.5 h-2.5 rounded-full" style={{ background: dot }} />}
      <span className="flex-1 text-left">{value}</span>
      <Icon name="chevron_right" size={18} className="text-ink-soft" />
    </button>
  );
}

/* Overlay wrappers
   ----------------
   The redesign's nav carries four tabs, so the accomplishments list and the
   photo portfolio are pushed as screens from Profile instead. Both are the
   existing tab screens, unchanged, under a back row. */
function PushedScreen({
  onBack,
  children,
}: {
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <div className="absolute inset-0 z-30 bg-canvas flex flex-col">
      <div className="shrink-0 h-14 mt-10 px-2 flex items-center">
        <BackButton onClick={onBack} />
      </div>
      <div className="flex-1 overflow-y-auto scroll-area -mt-14">{children}</div>
    </div>
  );
}

function AllAchievements({
  childId,
  onSelectChild,
  onOpen,
  onBack,
}: {
  childId: ChildId;
  onSelectChild: (id: ChildId) => void;
  onOpen: (id: string) => void;
  onBack: () => void;
}) {
  return (
    <PushedScreen onBack={onBack}>
      <Achievements childId={childId} onSelectChild={onSelectChild} onOpen={onOpen} />
    </PushedScreen>
  );
}


/* ============================================================= ACHIEVEMENTS */
function Achievements({
  childId,
  onSelectChild,
  onOpen,
}: {
  childId: ChildId;
  onSelectChild: (id: ChildId) => void;
  onOpen: (id: string) => void;
}) {
  const [childSheet, setChildSheet] = useState(false);
  const [filter, setFilter] = useState<string>("all"); // all | year:2024 | cat:Sports | act:piano
  const achs = achievementsFor(childId);

  // Build filter options: years present
  const years = Array.from(new Set(achs.map((a) => a.date.y))).sort((a, b) => b - a);

  const filtered = achs.filter((a) => {
    if (filter === "all") return true;
    if (filter.startsWith("year:")) return String(a.date.y) === filter.slice(5);
    if (filter.startsWith("cat:")) return activityById(a.activityId)?.category === filter.slice(4);
    return true;
  });

  const sorted = [...filtered].sort((a, b) => dec(b.date) - dec(a.date));

  // group by year
  const groups: { year: number; items: Achievement[] }[] = [];
  for (const a of sorted) {
    let g = groups.find((x) => x.year === a.date.y);
    if (!g) {
      g = { year: a.date.y, items: [] };
      groups.push(g);
    }
    g.items.push(a);
  }

  const cats = Array.from(
    new Set(achs.map((a) => activityById(a.activityId)?.category).filter(Boolean)),
  ) as Category[];

  const chips: { id: string; label: string }[] = [
    { id: "all", label: "All" },
    ...years.map((y) => ({ id: `year:${y}`, label: String(y) })),
    ...cats.map((c) => ({ id: `cat:${c}`, label: c })),
  ];

  return (
    <div className="pt-14 pb-28">
      <div className="px-4 flex items-start justify-between">
        <div>
          <h1 className="font-display text-[24px] font-[700] text-ink leading-tight">
            Achievements
          </h1>
          <p className="text-[13px] text-ink-soft mt-1">
            {achs.length} proud moments, in one place
          </p>
        </div>
        <ChildChip childId={childId} onOpen={() => setChildSheet(true)} />
      </div>

      {/* Filter chips */}
      <div className="mt-4 flex gap-2 overflow-x-auto scroll-area px-4">
        {chips.map((c) => {
          const active = c.id === filter;
          return (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-[600] border transition-colors ${
                active
                  ? "bg-teal text-white border-teal"
                  : "bg-surface text-ink-soft border-hairline"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Grouped list */}
      <div className="px-4 mt-5 space-y-6">
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
                <AchievementRow
                  key={a.id}
                  achievement={a}
                  showChild={childId === "all"}
                  onClick={() => onOpen(a.id)}
                />
              ))}
            </div>
          </div>
        ))}
        {groups.length === 0 && (
          <p className="text-[13.5px] text-ink-soft text-center mt-10">
            No achievements match this filter.
          </p>
        )}
      </div>

      <ChildSheet
        open={childSheet}
        onClose={() => setChildSheet(false)}
        childId={childId}
        onSelect={onSelectChild}
      />
    </div>
  );
}

/* ============================================================= ACHIEVEMENT DETAIL */
function AchievementDetail({
  id,
  onBack,
  onViewTimeline,
}: {
  id: string;
  onBack: () => void;
  onViewTimeline: (a: Achievement) => void;
}) {
  const ach = achievementById(id)!;
  const activity = activityById(ach.activityId);
  const child = childById(ach.childId);

  return (
    <div className="size-full flex flex-col bg-canvas">
      <AppHeader title="Achievement" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scroll-area pb-8">
          <div className="px-4">
            <div className="w-full h-40 rounded-3xl bg-gold-soft grid place-items-center">
              <span className="text-gold">
                <MilestoneStar size={48} />
              </span>
            </div>
          </div>

        <div className="px-4 mt-5">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-[700] text-gold bg-gold-soft px-2.5 py-1 rounded-full">
            <MilestoneStar size={13} /> Achievement
          </span>
          <h1 className="font-display text-[26px] font-[700] text-ink mt-3 leading-tight">
            {ach.title}
          </h1>
          <p className="text-[14px] text-ink-soft mt-1.5">{fmtMonth(ach.date)}</p>

          <div className="flex gap-2.5 mt-4">
            <div className="flex-1 rounded-2xl bg-surface border border-hairline p-3.5 flex items-center gap-2.5">
              <ChildAvatar src={child?.photo} name={child?.name ?? ""} size={34} />
              <div>
                <p className="text-[11px] text-ink-soft">Child</p>
                <p className="text-[14px] font-[600] text-ink">{child?.name}</p>
              </div>
            </div>
            <div className="flex-1 rounded-2xl bg-surface border border-hairline p-3.5 flex items-center gap-2.5">
              <span
                className="grid place-items-center w-8 h-8 rounded-lg"
                style={{ background: `${CATEGORY_COLOR[activity!.category]}22` }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: CATEGORY_COLOR[activity!.category] }}
                />
              </span>
              <div>
                <p className="text-[11px] text-ink-soft">Activity</p>
                <p className="text-[14px] font-[600] text-ink">{activity?.name}</p>
              </div>
            </div>
          </div>

          {ach.description && (
            <>
              <h3 className="font-display text-[16px] font-[700] text-ink mt-7 mb-2">About</h3>
              <p className="text-[14.5px] text-ink leading-relaxed">{ach.description}</p>
            </>
          )}

          <button
            onClick={() => onViewTimeline(ach)}
            className="w-full mt-7 rounded-2xl bg-surface border border-hairline p-4 flex items-center gap-3 active:scale-[0.99] transition-transform"
          >
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-mint text-teal-dark">
              <BarChart3 size={19} />
            </span>
            <div className="flex-1 text-left">
              <p className="text-[14.5px] font-[600] text-ink">View on activity timeline</p>
              <p className="text-[12.5px] text-ink-soft">
                See where this sits in {activity?.name}
              </p>
            </div>
            <Icon name="chevron_right" size={18} className="text-ink-soft" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================= ADD ACHIEVEMENT */
function AddAchievement({
  activityId,
  childId,
  onBack,
}: {
  activityId?: string;
  childId: string;
  onBack: () => void;
}) {
  const [title, setTitle] = useState("");
  const [selectedChild, setSelectedChild] = useState(childId);
  const [selectedActivity, setSelectedActivity] = useState(activityId ?? "");
  const [desc, setDesc] = useState("");
  const [actSheet, setActSheet] = useState(false);
  const [childSheet, setChildSheet] = useState(false);
  const childActs = activitiesFor(selectedChild);
  const activity = selectedActivity ? activityById(selectedActivity) : null;

  return (
    <div className="size-full flex flex-col bg-canvas">
      <AppHeader title="Add achievement" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scroll-area px-6 pb-8">
        <div className="flex justify-center mt-2 mb-6">
          <span className="grid place-items-center w-16 h-16 rounded-3xl bg-gold-soft text-gold">
            <MilestoneStar size={30} />
          </span>
        </div>

        <Field label="Achievement title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            placeholder="e.g. Regional Championship"
            className="h-[52px] w-full rounded-2xl bg-surface px-4 text-[16px] text-ink border border-hairline outline-none focus:border-teal focus:ring-4 focus:ring-teal/10 transition placeholder:text-ink-soft/60"
          />
        </Field>

        <Field label="Child">
          <PickerRow
            value={childById(selectedChild)?.name ?? ""}
            avatar={childById(selectedChild)?.photo}
            onClick={() => setChildSheet(true)}
          />
        </Field>

        <Field label="Related activity">
          <PickerRow
            value={activity?.name ?? "Choose activity"}
            dot={activity ? CATEGORY_COLOR[activity.category] : undefined}
            onClick={() => setActSheet(true)}
          />
        </Field>

        <Field label="Date">
          <div className="h-[52px] rounded-2xl bg-surface px-4 border border-hairline flex items-center gap-2 text-[15px] text-ink">
            <Calendar size={16} className="text-ink-soft" />
            {fmtMonth({ y: 2026, m: 8 })}
          </div>
        </Field>

        <Field label="Description (optional)">
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
            placeholder="Add any details worth remembering…"
            className="w-full rounded-2xl bg-surface px-4 py-3 text-[15px] text-ink border border-hairline outline-none focus:border-teal focus:ring-4 focus:ring-teal/10 transition resize-none placeholder:text-ink-soft/60"
          />
        </Field>

      </div>
      <div className="shrink-0 px-6 pt-3 pb-8 border-t border-hairline bg-canvas">
        <PrimaryButton onClick={onBack} disabled={!title || !selectedActivity}>
          Add achievement
        </PrimaryButton>
      </div>

      {/* Activity picker */}
      <Sheet open={actSheet} onClose={() => setActSheet(false)}>
        <h3 className="font-display text-[18px] font-[700] text-ink px-1 mb-2">Related activity</h3>
        <div className="space-y-1.5 max-h-[320px] overflow-y-auto scroll-area">
          {childActs.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                setSelectedActivity(a.id);
                setActSheet(false);
              }}
              className="w-full flex items-center gap-2.5 p-3 rounded-2xl border border-hairline bg-surface"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: CATEGORY_COLOR[a.category] }}
              />
              <span className="text-[15px] font-[600] text-ink">{a.name}</span>
              <span className="ml-auto text-[12px] text-ink-soft">{a.category}</span>
            </button>
          ))}
        </div>
      </Sheet>

      <ChildSheet
        open={childSheet}
        onClose={() => setChildSheet(false)}
        childId={selectedChild}
        onSelect={(id) => {
          setSelectedChild(id as string);
          setSelectedActivity("");
        }}
      />
    </div>
  );
}

/* ============================================================= DISCOVERY REVIEW */
/* One auto-detected find awaiting review. `child` is null when the sync could
   not tell whose event it is — those cards offer Assign rather than Add,
   because there is no child to add them to yet. */
type DiscoveryItem = {
  id: string;
  kind: "activity" | "achievement" | "duplicate";
  title: string;
  category: string;
  child: string | null;
  source: string;
  date: string;
  detail: string;
  editing: boolean;
};


/* The sync queue's seed. Hoisted so Home can show a true count on its
   review row instead of a number baked into the copy. */
const DISCOVERY_SEED: DiscoveryItem[] = [
  {
    id: "soccer",
    kind: "activity" as const,
    title: "Soccer",
    category: "Sports & Athletics",
    child: "Reet",
    source: "Google Calendar",
    date: "Sep 2025 – Present",
    detail: "Detected 14 recurring practice events & matches",
    editing: false,
  },
  {
    id: "ach-robotics",
    kind: "achievement" as const,
    title: "Regional Tournament — Runner Up",
    category: "Sports & Athletics",
    child: "Reet",
    source: "Google Calendar",
    date: "Mar 2026",
    detail: "Detected from a calendar event titled \"Regional tournament final\"",
    editing: false,
  },
  {
    id: "piano-dupe",
    kind: "duplicate" as const,
    title: "Piano Practice (Duplicate)",
    category: "Music & Performance",
    child: "Reet",
    source: "Google Calendar",
    date: "Ongoing",
    detail: "Matches existing 'Piano' activity in profile",
    editing: false,
  },
  {
    id: "a-gym-new",
    kind: "activity" as const,
    title: "Gymnastics Meet",
    category: "Sports & Athletics",
    child: "Aanya",
    source: "Google Calendar",
    date: "Nov 2025",
    detail: "Detected weekend competition event",
    editing: false,
  },
  /* Unattributed finds: the event was read, but nothing in it says whose it
     is, so there is no child to add it to yet. These carry Assign instead of
     Add — see the action row below. */
  {
    id: "other-saturday",
    kind: "activity" as const,
    title: "Saturday Morning Club",
    category: "Other",
    child: null,
    source: "Google Calendar",
    date: "Jan 2026 – Present",
    detail: "12 recurring events · no child named in the invite",
    editing: false,
  },
  {
    id: "other-centre",
    kind: "activity" as const,
    title: "Community Centre Session",
    category: "Other",
    child: null,
    source: "Google Calendar",
    date: "Sep 2025 – Present",
    detail: "Recurring Thursday event on a shared calendar",
    editing: false,
  },
  {
    id: "other-workshop",
    kind: "activity" as const,
    title: "Weekend Workshop",
    category: "Other",
    child: null,
    source: "Google Calendar",
    date: "Feb 2026",
    detail: "One-off event · could belong to either child",
    editing: false,
  },
];

function DiscoveryReview({
  open,
  onClose,
  onEditActivity,
}: {
  open: boolean;
  onClose: () => void;
  onEditActivity?: (id: string) => void;
}) {
  const [items, setItems] = useState<DiscoveryItem[]>(DISCOVERY_SEED);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<Category>("Sports & Athletics");
  /** Which unattributed card is waiting on a child, if any. */
  const [assignFor, setAssignFor] = useState<string | null>(null);

  /* Assigning answers "whose is this?", not "add it" — the card keeps its
     Ignore/Add row afterwards so the parent still confirms. Category stays
     Other until they edit it. */
  const assignTo = (id: ChildId) => {
    const name = childById(id)?.name;
    if (!name) return;
    setItems((prev) => prev.map((it) => (it.id === assignFor ? { ...it, child: name } : it)));
    setAssignFor(null);
    showToast(`Assigned to ${name}`);
  };

  const startEdit = (it: DiscoveryItem) => {
    setEditingId(it.id);
    setEditTitle(it.title);
    setEditCategory(it.category as Category);
  };

  const saveEdit = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, title: editTitle, category: editCategory } : item,
      ),
    );
    setEditingId(null);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const acceptItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <>
    <Sheet open={open} onClose={onClose}>
      <div className="flex items-center justify-between px-1 mb-1">
        <h3 className="font-display text-[20px] font-[700] text-ink">
          {items.length > 0 ? `${items.length} new moments found` : "All caught up!"}
        </h3>
        <span className="text-[12px] font-[600] text-teal bg-mint px-2.5 py-0.5 rounded-full">
          AI Auto-Sync
        </span>
      </div>
      <p className="text-[13px] text-ink-soft px-1 mb-4">
        Review activities and milestones auto-detected from your linked sources.
      </p>

      {items.length === 0 ? (
        <div className="py-8 text-center bg-canvas rounded-2xl border border-hairline my-2">
          <div className="w-12 h-12 rounded-full bg-mint text-teal grid place-items-center mx-auto mb-2 font-bold">
            ✓
          </div>
          <p className="text-[15px] font-[700] text-ink">All moments reviewed!</p>
          <p className="text-[12.5px] text-ink-soft mt-1">Your timeline is up to date.</p>
          <button
            onClick={onClose}
            className="mt-4 px-5 py-2 rounded-full bg-teal text-white font-[600] text-[13px]"
          >
            Done
          </button>
        </div>
      ) : (
        <div className="space-y-3 max-h-[420px] overflow-y-auto scroll-area pr-0.5">
          {items.map((it) => {
            const isEditing = editingId === it.id;
            return (
              <div
                key={it.id}
                className="rounded-2xl bg-surface border border-hairline p-3.5 shadow-xs transition-all"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-[600] text-ink-soft uppercase tracking-wider block mb-1">
                        Title
                      </label>
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full h-10 rounded-xl bg-canvas border border-hairline px-3 text-[14px] text-ink font-[600] outline-none focus:border-teal"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-[600] text-ink-soft uppercase tracking-wider block mb-1">
                        Category
                      </label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as Category)}
                        className="w-full h-10 rounded-xl bg-canvas border border-hairline px-3 text-[13.5px] text-ink font-[500] outline-none focus:border-teal"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-xl border border-hairline text-ink-soft text-[12.5px] font-[600]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(it.id)}
                        className="px-4 py-1.5 rounded-xl bg-teal text-white text-[12.5px] font-[600]"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start gap-3">
                      <span
                        className={`grid place-items-center w-10 h-10 rounded-xl shrink-0 ${
                          it.kind === "achievement"
                            ? "bg-gold-soft text-gold"
                            : it.child === null || it.kind === "duplicate"
                              ? "bg-canvas text-ink-soft border border-hairline"
                              : "bg-mint text-teal-dark"
                        }`}
                      >
                        {it.kind === "achievement" ? (
                          <MilestoneStar size={20} />
                        ) : it.child === null ? (
                          <User size={20} />
                        ) : it.kind === "duplicate" ? (
                          <BarChart3 size={20} />
                        ) : (
                          <Calendar size={20} />
                        )}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{
                              background: CATEGORY_COLOR[it.category as Category] || "#217c72",
                            }}
                          />
                          <span className="text-[11px] font-[600] text-ink-soft uppercase">
                            {it.child ?? "Unassigned"} · {it.category}
                          </span>
                        </div>
                        <h4 className="text-[15px] font-[700] text-ink leading-snug mt-0.5 truncate">
                          {it.title}
                        </h4>
                        <p className="text-[12px] text-ink-soft mt-0.5">{it.detail}</p>
                        <p className="text-[11px] text-teal font-[600] mt-1">
                          Source: {it.source} ({it.date})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-hairline/60">
                      <button
                        onClick={() => startEdit(it)}
                        className="flex items-center gap-1 text-[12.5px] font-[600] text-ink-soft hover:text-teal transition-colors"
                      >
                        <Icon name="edit" size={14} /> Edit activity
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeItem(it.id)}
                          className="px-3 py-1.5 rounded-full border border-hairline text-ink-soft text-[12.5px] font-[600] hover:bg-canvas active:scale-95 transition"
                        >
                          Ignore
                        </button>
                        {it.child === null ? (
                          <button
                            onClick={() => setAssignFor(it.id)}
                            className="pl-3.5 pr-2.5 py-1.5 rounded-full bg-teal text-white text-[12.5px] font-[600] flex items-center gap-0.5 active:scale-95 transition shadow-xs"
                          >
                            Assign <Icon name="chevron_right" size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => acceptItem(it.id)}
                            className="px-3.5 py-1.5 rounded-full bg-teal text-white text-[12.5px] font-[600] flex items-center gap-1 active:scale-95 transition shadow-xs"
                          >
                            <Check size={14} /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Sheet>

    {/* Sibling of the review sheet, not nested inside it — a Sheet is
        absolutely positioned, so nesting would anchor this one to the review
        panel instead of the screen. Rendering it after also puts it on top. */}
    <ChildSheet
      open={assignFor !== null}
      onClose={() => setAssignFor(null)}
      childId=""
      onSelect={assignTo}
      title="Assign to which child?"
    />
    </>
  );
}

