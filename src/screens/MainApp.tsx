import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  Calendar,
  Check,
  ChevronRight,
  FileText,
  FolderOpen,
  Home as HomeIcon,
  Images,
  Maximize2,
  Pencil,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
  Trophy,
  User,
  X,
} from "lucide-react";
import { dec } from "../data";
import { ChildAvatar } from "../components/ui";
import { AppHeader, PrimaryButton } from "../components/ui";
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
  ChildSelectorBar,
  ChildSheet,
  EmptyGantt,
  FilterButton,
  MilestoneStar,
} from "../components/proudly";
import { ActivityCalendarView, ActivityListView } from "../components/ActivityViews";
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
import { FabStack } from "../components/FabStack";
import {
  type AskContext,
  buildActivityContext,
  buildGeneralContext,
} from "../lib/askProudly";
import { Notifications, type NotifTarget } from "./Notifications";
import { PhotoImport } from "./PhotoImport";
import { Portfolio, BragSheet } from "./Portfolio";
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
  PHOTO_CANDIDATES,
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
  | { kind: "photoImport" }
  | { kind: "bragSheet" }
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

export function MainApp({ onSignOut }: { onSignOut: () => void }) {
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
    else if (t === "photos") push({ kind: "photoImport" });
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
          onAddPhotos={() => push({ kind: "photoImport" })}
          onConnectCoach={(activityId) => push({ kind: "coachFinder", activityId })}
          onAskProudly={(activityId: string) => openAsk(activityId)}
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
      {o.kind === "editActivity" && <EditActivity id={o.id} onBack={pop} />}
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
          onClose={pop}
        />
      )}
      {o.kind === "notifications" && (
        <Notifications onBack={pop} onDeepLink={handleDeepLink} />
      )}
      {o.kind === "photoImport" && <PhotoImport onClose={pop} />}
      {o.kind === "bragSheet" && <BragSheet childId={childId} onBack={pop} />}
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
      {o.kind === "editChild" && <EditChild id={o.id} onBack={pop} />}
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
                onOpenAchievement={openAchievement}
                onOpenDiscover={() => setDiscoverOpen(true)}
                onOpenNotifications={() => push({ kind: "notifications" })}
                onAddChild={() => push({ kind: "editChild" })}
                onOpenBrag={() => push({ kind: "bragSheet" })}
              />
            )}
            {tab === "activities" && (
              <Activities
                childId={childId}
                onSelectChild={setChildId}
                range={range}
                setRange={setRange}
                category={category}
                setCategory={setCategory}
                levelFilter={levelFilter}
                setLevelFilter={setLevelFilter}
                jump={jump}
                onJumpToday={jumpToday}
                onTapActivity={setPreviewActivity}
                onTapAchievement={setPreviewAchievement}
                onExpand={() => push({ kind: "expand" })}
                onAddActivity={(start) => push({ kind: "addActivity", start })}
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
              <Portfolio
                childId={childId}
                onSelectChild={setChildId}
                onViewGantt={() => setTab("activities")}
                onPreviewBrag={() => push({ kind: "bragSheet" })}
              />
            )}
            {tab === "profile" && <ProfileTab onOpen={openSetting} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <nav className="shrink-0 bg-surface z-20">
        <BottomBar activeTab={tab} onSelectTab={setTab} />
      </nav>

      {/* Preview sheets */}
      <ActivityPreview
        activity={previewActivity}
        onClose={() => setPreviewActivity(null)}
        onView={openActivity}
        onEdit={(id) => {
          setPreviewActivity(null);
          push({ kind: "editActivity", id });
        }}
      />
      <AchievementPreview
        achievement={previewAchievement}
        onClose={() => setPreviewAchievement(null)}
        onView={openAchievement}
      />

      {/* Ask PROUDLY — bottom sheet, draggable to full height */}
      <AskProudlySheet
        context={askCtx}
        onClose={() => setAskCtx(null)}
        onFindCoach={(activityId) => {
          setAskCtx(null);
          push({ kind: "coachFinder", activityId });
        }}
      />

      {/* Floating actions — Ask PROUDLY everywhere, Add stacked above it on
          the tabs that have an add action. */}
      {stack.length === 0 && (
        <FabStack
          onAskProudly={() => openAsk()}
          onAdd={
            tab === "activities"
              ? () => push({ kind: "addActivity" })
              : tab === "achievements"
                ? () => push({ kind: "addAchievement" })
                : undefined
          }
          addLabel={tab === "activities" ? "Add activity" : "Add achievement"}
        />
      )}

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
      <DiscoveryReview
        open={discoverOpen}
        onClose={() => setDiscoverOpen(false)}
        onOpenPhotos={() => {
          setDiscoverOpen(false);
          push({ kind: "photoImport" });
        }}
      />

      {/* Global success feedback */}
      <ToastHost />
    </div>
  );
}

/* ============================================================= HOME */
function Home({
  childId,
  onSelectChild,
  onGoTab,
  onOpenAchievement,
  onOpenDiscover,
  onOpenNotifications,
  onAddChild,
  onOpenBrag,
}: {
  childId: ChildId;
  onSelectChild: (id: ChildId) => void;
  onGoTab: (t: Tab) => void;
  onOpenAchievement: (id: string) => void;
  onOpenDiscover: () => void;
  onOpenNotifications: () => void;
  onAddChild: () => void;
  onOpenBrag: () => void;
}) {
  const acts = activitiesFor(childId);
  const achs = achievementsFor(childId);
  const years = useMemo(() => {
    if (!acts.length) return 0;
    const min = Math.min(...acts.map((a) => a.start.y));
    return new Date().getFullYear() - min + 1;
  }, [acts]);

  // Journey preview: four rows, still-running first then longest-running.
  // Six was too many to scan, and start-year order buried the active ones.
  const preview = [...acts]
    .sort((x, y) => {
      const ongoing = Number(y.end === "present") - Number(x.end === "present");
      return ongoing !== 0 ? ongoing : x.start.y - y.start.y;
    })
    .slice(0, 4);
  const recent = [...achs]
    .sort((a, b) => dec(b.date) - dec(a.date))
    .slice(0, 2);

  return (
    <div className="pt-14 pb-28">
      {/* Header */}
      <div className="px-4 pt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mark size={26} />
          <span className="font-display font-[700] text-[15px] tracking-[0.12em] text-ink">
            PROUDLY
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenBrag}
            className="grid place-items-center w-10 h-10 rounded-full bg-surface border border-hairline shadow-xs active:scale-95 transition-transform"
            aria-label="Brag Sheet"
          >
            <FileText size={17} className="text-ink" />
          </button>
          <button
            onClick={onOpenNotifications}
            className="relative grid place-items-center w-10 h-10 rounded-full bg-surface border border-hairline shadow-xs active:scale-95 transition-transform"
          >
            <Bell size={18} className="text-ink" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-gold border-2 border-surface" />
          </button>
        </div>
      </div>

      {/* Child selector */}
      <div className="mt-4">
        <ChildSelectorBar childId={childId} onSelect={onSelectChild} onAddChild={onAddChild} />
      </div>

      {/* Compact summary */}
      <div className="px-4 mt-4">
        <div className="flex rounded-2xl bg-surface border border-hairline divide-x divide-hairline">
          <Summary value={String(acts.length)} label="Activities" />
          <Summary value={String(achs.length)} label="Achievements" accent />
          <Summary value={String(years)} label="Years tracked" />
        </div>
      </div>

      {/* New discoveries */}
      <div className="px-4 mt-4">
        <button
          onClick={onOpenDiscover}
          className="w-full rounded-2xl bg-teal text-white p-4 flex items-center gap-3.5 text-left active:scale-[0.99] transition-transform relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-8 w-28 h-28 rounded-full bg-white/10" />
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-white/15 shrink-0">
            <Images size={20} />
          </span>
          <div className="flex-1 relative">
            <p className="text-[15px] font-[700]">4 new moments found</p>
            <p className="text-[12.5px] text-mint/90 mt-0.5">
              3 activities · 1 possible achievement
            </p>
          </div>
          <span className="text-[13px] font-[700] bg-white/20 rounded-full px-3 py-1.5 relative">
            Review
          </span>
        </button>
      </div>

      {/* Activity journey preview */}
      <SectionHead
        title="Activity journey"
        actionLabel="View full journey"
        onAction={() => onGoTab("activities")}
      />
      <div className="px-4">
        <button
          onClick={() => onGoTab("activities")}
          className="w-full rounded-[22px] bg-surface border border-hairline px-4 pt-1 pb-3 active:scale-[0.99] transition-transform"
        >
          <div className="divide-y divide-hairline/70">
            {preview.map((a) => (
              <JourneyPreviewRow key={a.id} activity={a} all={acts} />
            ))}
          </div>
          <div className="flex items-center justify-center gap-1.5 pt-3.5 text-[13px] font-[600] text-teal">
            {acts.length > preview.length
              ? `View all ${acts.length} activities`
              : "View full activity journey"}{" "}
            <ChevronRight size={16} />
          </div>
        </button>
      </div>

      {/* Recent achievements */}
      <SectionHead
        title="Recent achievements"
        actionLabel="View all"
        onAction={() => onGoTab("achievements")}
      />
      <div className="px-4 space-y-2.5">
        {recent.map((a) => (
          <AchievementRow
            key={a.id}
            achievement={a}
            showChild={childId === "all"}
            onClick={() => onOpenAchievement(a.id)}
          />
        ))}
        {recent.length === 0 && (
          <p className="text-[13px] text-ink-soft text-center py-4">
            Achievements will appear here as they're added.
          </p>
        )}
      </div>
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

function JourneyPreviewRow({ activity, all }: { activity: Activity; all: Activity[] }) {
  const min = Math.min(...all.map((a) => a.start.y));
  const max = Math.max(new Date().getFullYear(), ...all.map((a) => (a.end === "present" ? 0 : a.end.y)));
  const span = Math.max(max - min, 1);
  const startY = activity.start.y;
  const endY = activity.end === "present" ? max : activity.end.y;
  const left = ((startY - min) / span) * 100;
  const width = Math.max(((endY - startY) / span) * 100, 6);
  const ongoing = activity.end === "present";
  return (
    <div className="py-3.5 text-left">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[15px] font-[600] text-ink truncate">{activity.name}</span>
        <LevelBadge activity={activity} />
      </div>

      <div className="flex items-center gap-1.5 mt-1 text-[11.5px] text-ink-soft">
        <span className="tabular-nums">
          {startY} – {ongoing ? "Present" : endY}
        </span>
        <span aria-hidden>·</span>
        <span>{durationText(activity.start, activity.end)}</span>
        {ongoing && (
          <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-teal shrink-0" aria-label="Ongoing" />
        )}
      </div>

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
function Activities({
  childId,
  onSelectChild,
  range,
  setRange,
  category,
  setCategory,
  levelFilter,
  setLevelFilter,
  jump,
  onJumpToday,
  onTapActivity,
  onTapAchievement,
  onExpand,
  onAddActivity,
}: {
  childId: ChildId;
  onSelectChild: (id: ChildId) => void;
  range: Range;
  setRange: (r: Range) => void;
  category: Category | "all";
  setCategory: (c: Category | "all") => void;
  levelFilter: ActivityLevel | "all";
  setLevelFilter: (l: ActivityLevel | "all") => void;
  jump: { token: number; target?: number };
  onJumpToday: () => void;
  onTapActivity: (a: Activity) => void;
  onTapAchievement: (a: Achievement) => void;
  onExpand: () => void;
  onAddActivity: (start?: YM) => void;
}) {
  const [childSheet, setChildSheet] = useState(false);
  const [catSheet, setCatSheet] = useState(false);
  const [view, setView] = useState<ActivityView>("gantt");

  // Deliberate loading treatment when switching whose journey we're viewing.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    setLoading(true);
    setError(false);
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, [childId]);

  const allActs = activitiesFor(childId);
  const acts = allActs.filter(
    (a) =>
      (category === "all" || a.category === category) &&
      (levelFilter === "all" || levelStateOf(a).current === levelFilter),
  );
  const filtered = category !== "all" || levelFilter !== "all";
  const achs = achievementsFor(childId);
  const name = childId === "all" ? "Everyone" : childById(childId)!.name;
  const yearsSpan = acts.length
    ? new Date().getFullYear() - Math.min(...acts.map((a) => a.start.y)) + 1
    : 0;

  return (
    <div className="pt-14 pb-28">
      {/* Header */}
      <div className="px-4 flex items-start justify-between">
        <div>
          <h1 className="font-display text-[24px] font-[700] text-ink leading-tight">
            {childId === "all" ? "Activities" : `${name}'s activities`}
          </h1>
          <p className="text-[13px] text-ink-soft mt-1">
            {allActs.length} activities · {yearsSpan} years
          </p>
        </div>
        <div className="flex items-center gap-2 pt-0.5">
          <FilterButton active={filtered} onClick={() => setCatSheet(true)} />
          <ChildChip childId={childId} onOpen={() => setChildSheet(true)} />
        </div>
      </div>

      {/* Active filter chips */}
      {filtered && (
        <div className="px-4 mt-3 flex flex-wrap gap-2">
          {category !== "all" && (
            <button
              onClick={() => setCategory("all")}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-full bg-mint text-teal-dark text-[12.5px] font-[600]"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: CATEGORY_COLOR[category as Category] }}
              />
              {category}
              <X size={13} className="ml-0.5" />
            </button>
          )}
          {levelFilter !== "all" && (
            <button
              onClick={() => setLevelFilter("all")}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-full bg-mint text-teal-dark text-[12.5px] font-[600]"
            >
              {levelFilter}
              <X size={13} className="ml-0.5" />
            </button>
          )}
        </div>
      )}

      {/* View toggle + range dropdown + Today */}
      <div className="px-4 mt-3.5">
        <ActivityControls
          view={view}
          onViewChange={setView}
          range={range}
          onRangeChange={setRange}
          onJumpToday={onJumpToday}
        />
      </div>

      {/* Chart / list / calendar */}
      <div className="px-4 mt-3.5">
        {loading ? (
          <GanttSkeleton height={430} />
        ) : error ? (
          <GanttError
            name={name}
            onRetry={() => {
              setLoading(true);
              setError(false);
              setTimeout(() => setLoading(false), 650);
            }}
          />
        ) : allActs.length === 0 ? (
          // No activity history at all for this child
          <EmptyGantt name={name} onSync={() => setError(true)} onAdd={onAddActivity} />
        ) : acts.length === 0 ? (
          // History exists, but the current filter has no results
          <div className="rounded-[22px] bg-surface border border-hairline">
            <EmptyState
              icon={<SlidersHorizontal size={24} />}
              title="No activities match these filters"
              body={`${name} has other activities tracked. Clear the filters to see the full journey.`}
              actionLabel="Clear filters"
              onAction={() => {
                setCategory("all");
                setLevelFilter("all");
              }}
            />
          </div>
        ) : view === "list" ? (
          <ActivityListView activities={acts} range={range} onTapActivity={onTapActivity} />
        ) : view === "calendar" ? (
          <ActivityCalendarView
            activities={acts}
            achievements={achs}
            range={range}
            jumpToken={jump.token}
            onTapActivity={onTapActivity}
            onTapAchievement={onTapAchievement}
            onAddActivity={onAddActivity}
          />
        ) : (
          <>
            <GanttChart
              activities={acts}
              achievements={achs}
              range={range}
              height={430}
              jumpToken={jump.token}
              jumpTarget={jump.target}
              onTapActivity={onTapActivity}
              onTapAchievement={onTapAchievement}
            />
            <div className="mt-3 flex items-center justify-between">
              <GanttLegend />
              <button
                onClick={onExpand}
                className="flex items-center gap-1.5 text-[12.5px] font-[600] text-teal active:opacity-60"
              >
                <Maximize2 size={15} /> Expand
              </button>
            </div>
          </>
        )}
      </div>

      {!loading && !error && acts.length > 0 && (
        <p className="px-4 mt-5 text-[12px] text-ink-soft leading-relaxed">
          {view === "gantt" ? (
            <>
              The name under each activity is its level. Tap any bar for details, or a{" "}
              <span className="text-gold font-[600]">gold marker</span> to revisit an achievement.
            </>
          ) : view === "list" ? (
            <>Tap any activity to see its details, photos and achievements.</>
          ) : (
            <>
              Each activity keeps to its regular weekday. Tap any date to see what
              was on, or an{" "}
              <span className="text-gold font-[600]">achievement</span> to revisit it.
            </>
          )}
        </p>
      )}

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
        level={levelFilter}
        onSelectLevel={setLevelFilter}
        resultCount={acts.length}
      />
    </div>
  );
}

/* ---------- Gantt error state (keeps the Activities structure in place) ---------- */
function GanttError({ name, onRetry }: { name: string; onRetry: () => void }) {
  return (
    <div className="rounded-[22px] bg-surface border border-hairline px-8 py-11 flex flex-col items-center text-center">
      <span className="grid place-items-center w-14 h-14 rounded-2xl bg-[#faeae6] text-[#b4432f] mb-4">
        <RefreshCw size={24} />
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
          <X size={19} strokeWidth={2.2} />
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
  onAddPhotos,
  onConnectCoach,
  onAskProudly,
}: {
  id: string;
  onBack: () => void;
  onEdit: (id: string) => void;
  onOpenAchievement: (id: string) => void;
  onAddAchievement: (activityId: string) => void;
  onAddPhotos: () => void;
  onConnectCoach: (activityId: string) => void;
  onAskProudly: (activityId: string) => void;
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
            <Pencil size={17} />
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto scroll-area pb-8">
        <div className="px-4">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: CATEGORY_COLOR[activity.category] }}
            />
            <span className="text-[13px] font-[600] text-ink-soft">{activity.category}</span>
            <LevelBadge activity={activity} />
            {ongoing && (
              <span className="text-[11.5px] font-[700] text-teal bg-mint px-2 py-0.5 rounded-full">
                Ongoing
              </span>
            )}
          </div>
          <h1 className="font-display text-[30px] font-[700] text-ink mt-1.5">{activity.name}</h1>
          <p className="text-[14px] text-ink-soft mt-1">
            {activity.approxStart ? "~" : ""}
            {fmtMonth(activity.start)} –{" "}
            {activity.end === "present" ? "Present" : fmtMonth(activity.end)}
          </p>
          <p className="text-[13px] text-teal font-[600] mt-0.5">
            {durationText(activity.start, activity.end)}
          </p>
        </div>

        {/* stats */}
        <div className="px-4 mt-4">
          <div className="flex rounded-2xl bg-surface border border-hairline divide-x divide-hairline">
            <Summary value={durationText(activity.start, activity.end).split(" ")[0]} label="years" />
            <Summary value={String(acts.length)} label="achievements" accent />
            <Summary value={String(activity.memories.length)} label="memories" />
          </div>
        </div>

        {/* Level + what's next */}
        <div className="px-4 mt-4">
          <NextLevelCard
            activity={activity}
            onChangeLevel={() => setLevelSheet(true)}
            onAskProudly={() => onAskProudly(id)}
            onConnectCoach={() => onConnectCoach(id)}
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
            <Plus size={15} /> Add
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

        {/* Photos & Memories — tied to this activity's history */}
        <div className="px-4 mt-7 flex items-center justify-between">
          <h3 className="font-display text-[17px] font-[700] text-ink">
            {activity.name} memories
          </h3>
          <button
            onClick={onAddPhotos}
            className="flex items-center gap-1 text-[13px] font-[600] text-teal active:opacity-60"
          >
            <Plus size={15} /> Add photos
          </button>
        </div>
        {activity.memories.length > 0 ? (
          <div className="flex gap-2.5 overflow-x-auto scroll-area px-4 mt-3">
            {activity.memories.map((m, i) => {
              // Spread memory dates across the activity span for a believable chronology.
              const endY = activity.end === "present" ? 2026 : activity.end.y;
              const y = Math.min(activity.start.y + i, endY);
              return (
                <div key={i} className="shrink-0">
                  <img loading="lazy" decoding="async"
                    src={m}
                    alt={`${activity.name} memory`}
                    className="w-28 h-32 rounded-2xl object-cover bg-mint"
                  />
                  <p className="text-[11px] text-ink-soft mt-1 tabular-nums">{y}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-4 mt-3">
            <button
              onClick={onAddPhotos}
              className="w-full rounded-2xl border border-dashed border-hairline bg-surface p-5 flex flex-col items-center gap-1.5 text-ink-soft active:scale-[0.99] transition-transform"
            >
              <Images size={22} />
              <span className="text-[13.5px] font-[600]">Add photos from Google Photos</span>
              <span className="text-[11.5px]">Bring this activity's moments to life</span>
            </button>
          </div>
        )}

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
      <div className="flex-1 overflow-y-auto scroll-area px-4 pb-8">
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

        <button className="w-full rounded-2xl border border-dashed border-hairline bg-surface p-5 flex flex-col items-center gap-1.5 text-ink-soft active:scale-[0.99] transition-transform">
          <Images size={22} />
          <span className="text-[13.5px] font-[600]">Add photos</span>
          <span className="text-[11.5px]">Optional</span>
        </button>
      </div>

      <div className="shrink-0 px-4 pt-3 pb-8 border-t border-hairline bg-canvas">
        <PrimaryButton onClick={save} disabled={!name || !category}>
          Add activity
        </PrimaryButton>
      </div>

      <ChildSheet
        open={childSheet}
        onClose={() => setChildSheet(false)}
        childId={selectedChild}
        onSelect={(id) => setSelectedChild(id as string)}
        allowAll={false}
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

function EditActivity({ id, onBack }: { id: string; onBack: () => void }) {
  const activity = activityById(id)!;
  const [name, setName] = useState(activity.name);
  const [category, setCategory] = useState<Category>(activity.category);
  const [childId, setChildId] = useState(activity.childId);
  const [ongoing, setOngoing] = useState(activity.end === "present");
  const [note, setNote] = useState(activity.note ?? "");
  const [showDanger, setShowDanger] = useState(false);
  const [childSheet, setChildSheet] = useState(false);
  const [catSheet, setCatSheet] = useState(false);

  return (
    <div className="size-full flex flex-col bg-canvas">
      <AppHeader title="Edit activity" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scroll-area px-4 pb-8">
        <Field label="Activity name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-[52px] w-full rounded-2xl bg-surface px-4 text-[16px] text-ink border border-hairline outline-none focus:border-teal focus:ring-4 focus:ring-teal/10 transition"
          />
        </Field>

        <Field label="Child">
          <PickerRow
            value={childById(childId)?.name ?? ""}
            onClick={() => setChildSheet(true)}
            avatar={childById(childId)?.photo}
          />
        </Field>

        <Field label="Category">
          <PickerRow
            value={category}
            dot={CATEGORY_COLOR[category]}
            onClick={() => setCatSheet(true)}
          />
        </Field>

        <div className="mb-4">
          <LevelChooserRow activity={activity} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start date">
            <div className="h-[52px] rounded-2xl bg-surface px-4 border border-hairline flex items-center gap-2 text-[15px] text-ink">
              <Calendar size={16} className="text-ink-soft" />
              {fmtMonth(activity.start)}
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
              {ongoing ? "—" : activity.end === "present" ? "—" : fmtMonth(activity.end)}
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

        <Field label="Notes" className="mt-4">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Add a memory or context…"
            className="w-full rounded-2xl bg-surface px-4 py-3 text-[15px] text-ink border border-hairline outline-none focus:border-teal focus:ring-4 focus:ring-teal/10 transition resize-none placeholder:text-ink-soft/60"
          />
        </Field>

        {/* Progressive disclosure: uncommon actions */}
        <button
          onClick={() => setShowDanger((s) => !s)}
          className="mt-2 text-[13px] font-[600] text-ink-soft active:opacity-60"
        >
          {showDanger ? "Hide" : "More"} options
        </button>
        <AnimatePresence>
          {showDanger && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2.5">
                <button className="w-full flex items-center gap-3 rounded-2xl bg-surface border border-hairline p-4 text-left">
                  <span className="grid place-items-center w-9 h-9 rounded-xl bg-canvas text-ink-soft">
                    <BarChart3 size={17} />
                  </span>
                  <div>
                    <p className="text-[14.5px] font-[600] text-ink">Merge duplicate</p>
                    <p className="text-[12px] text-ink-soft">Combine with another activity</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 rounded-2xl bg-surface border border-[#e2b6b0] p-4 text-left">
                  <span className="grid place-items-center w-9 h-9 rounded-xl bg-[#fbeceb] text-[#c0504a]">
                    <Trash2 size={17} />
                  </span>
                  <div>
                    <p className="text-[14.5px] font-[600] text-[#c0504a]">Delete activity</p>
                    <p className="text-[12px] text-ink-soft">Remove this from the timeline</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="shrink-0 px-4 pt-3 pb-8 border-t border-hairline bg-canvas">
        <PrimaryButton onClick={onBack}>Save changes</PrimaryButton>
      </div>

      <ChildSheet
        open={childSheet}
        onClose={() => setChildSheet(false)}
        childId={childId}
        onSelect={(id) => setChildId(id as string)}
        allowAll={false}
      />
      <CategorySheet
        open={catSheet}
        onClose={() => setCatSheet(false)}
        value={category}
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
      <ChevronRight size={18} className="text-ink-soft" />
    </button>
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
        {ach.image ? (
          <div className="px-4">
            <img decoding="async"
              src={ach.image}
              alt={ach.title}
              className="w-full h-52 object-cover rounded-3xl bg-mint"
            />
          </div>
        ) : (
          <div className="px-4">
            <div className="w-full h-40 rounded-3xl bg-gold-soft grid place-items-center">
              <span className="text-gold">
                <MilestoneStar size={48} />
              </span>
            </div>
          </div>
        )}

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
            <ChevronRight size={18} className="text-ink-soft" />
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
      <div className="flex-1 overflow-y-auto scroll-area px-4 pb-8">
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

        <button className="w-full rounded-2xl border border-dashed border-hairline bg-surface p-5 flex flex-col items-center gap-1.5 text-ink-soft active:scale-[0.99] transition-transform">
          <Images size={22} />
          <span className="text-[13.5px] font-[600]">Add photo or certificate</span>
          <span className="text-[11.5px]">Optional</span>
        </button>
      </div>
      <div className="shrink-0 px-4 pt-3 pb-8 border-t border-hairline bg-canvas">
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
        allowAll={false}
      />
    </div>
  );
}

/* ============================================================= DISCOVERY REVIEW */
function DiscoveryReview({
  open,
  onClose,
  onEditActivity,
  onOpenPhotos,
}: {
  open: boolean;
  onClose: () => void;
  onEditActivity?: (id: string) => void;
  onOpenPhotos?: () => void;
}) {
  const [items, setItems] = useState([
    {
      id: "soccer",
      kind: "activity" as const,
      title: "Soccer",
      category: "Sports",
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
      category: "Sports",
      child: "Reet",
      source: "Google Photos",
      date: "Mar 2026",
      detail: "Detected trophy award photo from Photos album",
      editing: false,
    },
    {
      id: "piano-dupe",
      kind: "duplicate" as const,
      title: "Piano Practice (Duplicate)",
      category: "Music",
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
      category: "Sports",
      child: "Aanya",
      source: "Google Calendar",
      date: "Nov 2025",
      detail: "Detected weekend competition event",
      editing: false,
    },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<Category>("Sports");

  const startEdit = (it: typeof items[0]) => {
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

      {/* Review Photos card */}
      {onOpenPhotos && (
        <div className="rounded-2xl bg-surface border border-hairline p-3.5 mb-3">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-mint text-teal-dark shrink-0">
                <Images size={17} />
              </span>
              <div>
                <p className="text-[14px] font-[700] text-ink">Review Photos</p>
                <p className="text-[11.5px] text-ink-soft">
                  {PHOTO_CANDIDATES.length} photos matched from Google Photos
                </p>
              </div>
            </div>
            <button
              onClick={onOpenPhotos}
              className="px-3 py-1.5 rounded-full bg-teal text-white text-[12.5px] font-[600] active:scale-95 transition-transform shrink-0"
            >
              Review
            </button>
          </div>
          <div className="flex gap-1.5 overflow-x-auto scroll-area">
            {PHOTO_CANDIDATES.map((p) => (
              <img loading="lazy" decoding="async"
                key={p.id}
                src={p.url}
                alt=""
                className="w-14 h-14 rounded-xl object-cover bg-mint shrink-0"
              />
            ))}
          </div>
        </div>
      )}

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
                            : it.kind === "duplicate"
                              ? "bg-canvas text-ink-soft border border-hairline"
                              : "bg-mint text-teal-dark"
                        }`}
                      >
                        {it.kind === "achievement" ? (
                          <MilestoneStar size={20} />
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
                            {it.child} · {it.category}
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
                        <Pencil size={14} /> Edit activity
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeItem(it.id)}
                          className="px-3 py-1.5 rounded-full border border-hairline text-ink-soft text-[12.5px] font-[600] hover:bg-canvas active:scale-95 transition"
                        >
                          Ignore
                        </button>
                        <button
                          onClick={() => acceptItem(it.id)}
                          className="px-3.5 py-1.5 rounded-full bg-teal text-white text-[12.5px] font-[600] flex items-center gap-1 active:scale-95 transition shadow-xs"
                        >
                          <Check size={14} /> Add
                        </button>
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
  );
}
