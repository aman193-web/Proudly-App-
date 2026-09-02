import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ChevronRight,
  Database,
  GraduationCap,
  Images,
  Info,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { AppHeader, ChildAvatar, PrimaryButton } from "../components/ui";
import { SourceCard } from "../components/SourceCard";
import { EmptyState, showToast } from "../components/states";
import type { ActivityLevel } from "../data";
import {
  type LevelSignals,
  LEVEL_RULES,
  pointsForAchievements,
  pointsForSessions,
  suggestLevel,
  tenureLadder,
} from "../lib/levelSuggestion";
import { SavedCoachRow } from "../components/SavedCoachList";
import { useSavedCoaches, useSavedCount } from "../lib/savedCoaches";
import { ageFromDob, CHILDREN, PARENT, SOURCES, childById } from "../data";

export type SettingsTarget =
  | "sources"
  | "children"
  | "savedCoaches"
  | "levelsHelp"
  | "account"
  | "notifPrefs"
  | "data";

function SavedCoachesRow({ onClick }: { onClick: () => void }) {
  const count = useSavedCount();
  return (
    <Row
      icon={<GraduationCap size={18} />}
      label="Saved coaches"
      value={count ? String(count) : "None yet"}
      onClick={onClick}
    />
  );
}

/** Level pill colours, mirroring components/level.tsx. */
const LEVEL_PILL: Record<ActivityLevel, string> = {
  Learning: "bg-canvas text-ink-soft border border-hairline",
  Beginner: "bg-mint text-teal-dark",
  Intermediate: "bg-teal text-white",
  Champion: "bg-gold text-white",
};

/* ============================================================= LEVELS HELP */

/** Two-column reference row, the app's list idiom rather than a real table. */
function RuleRow({
  left,
  right,
  muted,
}: {
  left: ReactNode;
  right: ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2.5">
      <span className={`text-[13.5px] ${muted ? "text-ink-soft" : "text-ink font-[500]"}`}>
        {left}
      </span>
      <span className="text-[13px] text-ink-soft tabular-nums text-right shrink-0">{right}</span>
    </div>
  );
}

function RuleTable({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <div className="mt-4">
      <p className="text-[12px] font-[600] text-ink-soft uppercase tracking-[0.04em] mb-1.5">
        {title}
      </p>
      <div className="rounded-2xl bg-surface border border-hairline px-3.5 divide-y divide-hairline/70">
        {children}
      </div>
      {note && <p className="text-[11.5px] text-ink-soft/80 mt-1.5 leading-relaxed">{note}</p>}
    </div>
  );
}

const yrs = (n: number) => `${n % 1 === 0 ? n : n.toFixed(1)} yr${n === 1 ? "" : "s"}`;

/** Illustrative records. Scores are computed, never written down. */
const WORKED_EXAMPLES: { label: string; signals: LevelSignals }[] = [
  {
    label: "7 yrs · 2 achievements · 2x a week · active",
    signals: { yearsInvolved: 7, achievementCount: 2, sessionsPerWeek: 2, ongoing: true },
  },
  {
    label: "3 yrs · 1 achievement · 2x a week · active",
    signals: { yearsInvolved: 3, achievementCount: 1, sessionsPerWeek: 2, ongoing: true },
  },
  {
    label: "4 yrs · none · 1x a week · active",
    signals: { yearsInvolved: 4, achievementCount: 0, sessionsPerWeek: 1, ongoing: true },
  },
  {
    label: "2 yrs · none · 1x a week · finished",
    signals: { yearsInvolved: 2, achievementCount: 0, sessionsPerWeek: 1, ongoing: false },
  },
  {
    label: "6 months · none · 1x a week · active",
    signals: { yearsInvolved: 0.5, achievementCount: 0, sessionsPerWeek: 1, ongoing: true },
  },
];

export function LevelsHelp({ onBack }: { onBack: () => void }) {
  const { weights, bands, ageCaps } = LEVEL_RULES;
  const ladder = tenureLadder();

  return (
    <div className="size-full flex flex-col bg-canvas">
      <AppHeader title="Learning levels" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scroll-area px-4 pb-10">
        <p className="text-[14.5px] text-ink leading-relaxed mt-1">
          Every activity sits at one of four levels. PROUDLY suggests one from what's recorded,
          and you can change it whenever you disagree.
        </p>

        {/* The ladder */}
        <div className="mt-5 space-y-2">
          {(
            [
              ["Learning", "Just started, or not much recorded yet."],
              ["Beginner", "Settled into it and turning up regularly."],
              ["Intermediate", "Years of steady involvement, often with milestones."],
              ["Champion", "Long commitment plus real achievements to show for it."],
            ] as [ActivityLevel, string][]
          ).map(([lvl, blurb]) => (
            <div
              key={lvl}
              className="flex items-start gap-3 rounded-2xl bg-surface border border-hairline px-3.5 py-3"
            >
              <span
                className={`shrink-0 text-[10.5px] font-[700] rounded-full px-1.5 py-0.5 ${LEVEL_PILL[lvl]}`}
              >
                {lvl}
              </span>
              <p className="text-[13px] text-ink-soft leading-snug">{blurb}</p>
            </div>
          ))}
        </div>

        {/* ---------- How the score works ---------- */}
        <h3 className="font-display text-[17px] font-[700] text-ink mt-8">How it adds up</h3>
        <p className="text-[13px] text-ink-soft leading-relaxed mt-1">
          Levels are based on <strong className="text-ink font-[600]">activity, not age</strong>.
          Each signal earns points up to its own limit, and the total decides the level.
        </p>

        <RuleTable title="Points available">
          <RuleRow left="Time in the activity" right={`${weights.tenurePerYear}/yr · max ${weights.tenureMax}`} />
          <RuleRow left="Achievements" right={`${weights.perAchievement} each · max ${weights.achievementMax}`} />
          <RuleRow
            left="Sessions past the first each week"
            right={`${weights.perExtraSessionPerWeek} each · max ${weights.frequencyMax}`}
          />
          <RuleRow left="Still going" right={`+${weights.ongoingBonus}`} />
        </RuleTable>

        <RuleTable title="Total needed">
          {[...bands].reverse().map((b) => (
            <RuleRow
              key={b.level}
              left={
                <span className={`text-[10.5px] font-[700] rounded-full px-1.5 py-0.5 ${LEVEL_PILL[b.level]}`}>
                  {b.level}
                </span>
              }
              right={`${b.min} points and up`}
            />
          ))}
        </RuleTable>

        {/* ---------- Time ---------- */}
        <h3 className="font-display text-[17px] font-[700] text-ink mt-8">By time alone</h3>
        <RuleTable
          title="Once a week, still going, nothing recorded"
          note="Time is capped, which is why it stops at Intermediate. Champion needs achievements or a heavier week."
        >
          {ladder.map((r) => (
            <RuleRow
              key={r.level}
              left={
                <span className={`text-[10.5px] font-[700] rounded-full px-1.5 py-0.5 ${LEVEL_PILL[r.level]}`}>
                  {r.level}
                </span>
              }
              right={
                !r.reachable
                  ? "not from time alone"
                  : r.to === null
                    ? `${yrs(r.from)}+`
                    : r.from === 0
                      ? `under ${yrs(r.to)}`
                      : `${yrs(r.from)} – ${yrs(r.to)}`
              }
            />
          ))}
        </RuleTable>

        {/* ---------- Achievements ---------- */}
        <h3 className="font-display text-[17px] font-[700] text-ink mt-8">By achievements</h3>
        <RuleTable
          title="What each milestone adds"
          note="Gradings, competitions, awards — anything you record against the activity."
        >
          {[0, 1, 2, 3, 4].map((n) => (
            <RuleRow
              key={n}
              left={`${n} achievement${n === 1 ? "" : "s"}`}
              right={`${pointsForAchievements(n)} points${
                pointsForAchievements(n) === weights.achievementMax && n > 0 ? " (max)" : ""
              }`}
              muted={n === 0}
            />
          ))}
        </RuleTable>

        {/* ---------- Frequency ---------- */}
        <h3 className="font-display text-[17px] font-[700] text-ink mt-8">By how often</h3>
        <RuleTable title="Sessions a week" note="Only counted where we know the schedule.">
          {[1, 2, 3, 4].map((n) => (
            <RuleRow
              key={n}
              left={`${n}x a week`}
              right={`${pointsForSessions(n)} points${
                pointsForSessions(n) === weights.frequencyMax ? " (max)" : ""
              }`}
              muted={n === 1}
            />
          ))}
        </RuleTable>

        {/* ---------- Age ---------- */}
        <h3 className="font-display text-[17px] font-[700] text-ink mt-8">By age</h3>
        <p className="text-[13px] text-ink-soft leading-relaxed mt-1">
          Age never adds points. It only sets a ceiling, so a long run at a very young age
          doesn't read as Champion. Age comes from the child's date of birth, which is why we ask
          for that instead of asking you for an age.
        </p>
        <RuleTable title="Highest level by age">
          {ageCaps.map((c, i) => {
            const from = i === 0 ? 0 : ageCaps[i - 1].throughAge + 1;
            return (
              <RuleRow
                key={c.cap}
                left={from === 0 ? `Under ${c.throughAge + 1}` : `${from} to ${c.throughAge}`}
                right={`up to ${c.cap}`}
              />
            );
          })}
          <RuleRow
            left={`${ageCaps[ageCaps.length - 1].throughAge + 1} and older`}
            right="no ceiling"
          />
        </RuleTable>

        {/* ---------- Worked examples ---------- */}
        <h3 className="font-display text-[17px] font-[700] text-ink mt-8">Worked examples</h3>
        <RuleTable title="How real records land">
          {WORKED_EXAMPLES.map((ex) => {
            // Scored by the engine, not written by hand, so the numbers can't drift.
            const r = suggestLevel({ ...ex.signals, ageYears: 11 });
            return (
              <RuleRow
                key={ex.label}
                left={ex.label}
                right={
                  <>
                    {r.score} →{" "}
                    <span className="text-ink font-[600]">{r.level}</span>
                  </>
                }
              />
            );
          })}
        </RuleTable>

        <div className="mt-6 rounded-2xl bg-mint/50 px-3.5 py-3">
          <p className="text-[13px] text-ink leading-relaxed">
            <strong className="font-[700]">You always have the final say.</strong> Changing a
            level never erases PROUDLY's suggestion — both are kept, so you can go back to it.
            Tap the <Info size={12} className="inline align-[-1px]" /> beside any level to see
            what counted for that activity.
          </p>
        </div>

        <p className="text-[11.5px] text-ink-soft/70 mt-5 leading-relaxed">
          These thresholds are a first pass and will be tuned as we see real activity data.
        </p>
      </div>
    </div>
  );
}

/* ============================================================= SAVED COACHES */
export function SavedCoaches({ onBack }: { onBack: () => void }) {
  const saved = useSavedCoaches();

  return (
    <div className="size-full flex flex-col bg-canvas">
      <AppHeader title="Saved coaches" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scroll-area px-4 pb-8">
        {saved.length === 0 ? (
          <div className="rounded-[22px] bg-surface border border-hairline mt-2">
            <EmptyState
              icon={<GraduationCap size={24} />}
              title="No saved coaches yet"
              body="When you find a coach worth remembering, tap the bookmark to keep it here."
            />
          </div>
        ) : (
          <>
            <p className="text-[13px] text-ink-soft mt-1 mb-3">
              {saved.length} saved from Google. Ratings shown as of when you searched.
            </p>
            <div className="space-y-2.5">
              {saved.map((sv) => (
                <SavedCoachRow key={sv.coach.id} saved={sv} showActivity />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================= PROFILE TAB */
export function ProfileTab({ onOpen }: { onOpen: (t: SettingsTarget) => void }) {
  return (
    <div className="pt-14 pb-28">
      <div className="px-4 flex items-center gap-4">
        <ChildAvatar src={PARENT.photo} name={PARENT.name} size={60} ring="#217c72" />
        <div className="min-w-0">
          <h1 className="font-display text-[22px] font-[700] text-ink leading-tight truncate">
            {PARENT.name}
          </h1>
          <p className="text-[13.5px] text-ink-soft mt-0.5">
            Parent · {CHILDREN.length} children
          </p>
        </div>
      </div>

      <Group title="Family">
        <Row
          icon={<Users size={18} />}
          label="Children"
          value={`${CHILDREN.length}`}
          onClick={() => onOpen("children")}
        />
        <Row
          icon={<Images size={18} />}
          label="Connected sources"
          value="Calendar · Photos"
          onClick={() => onOpen("sources")}
        />
        <SavedCoachesRow onClick={() => onOpen("savedCoaches")} />
      </Group>

      <Group title="Preferences">
        <Row
          icon={<Bell size={18} />}
          label="Notifications"
          onClick={() => onOpen("notifPrefs")}
        />
        <Row
          icon={<ShieldCheck size={18} />}
          label="Account"
          onClick={() => onOpen("account")}
        />
        <Row
          icon={<Database size={18} />}
          label="Data & privacy"
          onClick={() => onOpen("data")}
        />
      </Group>

      <Group title="Help">
        <Row
          icon={<Info size={18} />}
          label="How learning levels work"
          onClick={() => onOpen("levelsHelp")}
        />
      </Group>

      <p className="text-center text-[11.5px] text-ink-soft/70 mt-8">PROUDLY · v1.0</p>
    </div>
  );
}

/* ---------- Reusable settings primitives ---------- */
function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="px-4 mt-7">
      <p className="text-[12px] font-[600] text-ink-soft uppercase tracking-[0.08em] mb-2.5 ml-0.5">
        {title}
      </p>
      <div className="rounded-2xl bg-surface border border-hairline divide-y divide-hairline overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  onClick,
  danger,
}: {
  icon: ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-canvas transition-colors"
    >
      <span
        className={`grid place-items-center w-9 h-9 rounded-xl shrink-0 ${
          danger ? "bg-[#fbeceb] text-[#c0504a]" : "bg-canvas text-ink-soft"
        }`}
      >
        {icon}
      </span>
      <span className={`flex-1 text-[15px] font-[600] ${danger ? "text-[#c0504a]" : "text-ink"}`}>
        {label}
      </span>
      {value && <span className="text-[13px] text-ink-soft">{value}</span>}
      {onClick && <ChevronRight size={17} className="text-ink-soft/70" />}
    </button>
  );
}

function Toggle({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between px-4 py-3.5 text-left active:bg-canvas transition-colors"
    >
      <div className="pr-4">
        <p className="text-[15px] font-[600] text-ink">{label}</p>
        {desc && <p className="text-[12.5px] text-ink-soft mt-0.5">{desc}</p>}
      </div>
      <span
        className={`w-12 h-7 rounded-full p-0.5 shrink-0 transition-colors ${
          value ? "bg-teal" : "bg-hairline"
        }`}
      >
        <motion.span
          layout
          className="block w-6 h-6 rounded-full bg-white shadow"
          style={{ marginLeft: value ? 20 : 0 }}
        />
      </span>
    </button>
  );
}

/* ============================================================= CONNECTED SOURCES */
export function ConnectedSources({ onBack }: { onBack: () => void }) {
  const [calState, setCalState] = useState<"connected" | "reconnect">("connected");
  const [photoState, setPhotoState] = useState<"connected" | "reconnect">("reconnect");
  const [autoSync, setAutoSync] = useState(true);

  return (
    <div className="size-full flex flex-col bg-canvas">
      <AppHeader title="Connected sources" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scroll-area px-4 pb-8">
        <p className="text-[13px] text-ink-soft mt-1 mb-4 leading-relaxed">
          PROUDLY reads Google Calendar and Photos to build the activity journey. They stay
          together and nothing is posted or shared.
        </p>

        <div className="space-y-3">
          <SourceCard
            kind="calendar"
            title="Google Calendar"
            purpose={`${SOURCES.calendar.account} · Last synced ${SOURCES.calendar.lastSync}`}
            state={calState}
            onAction={() => {
              if (calState === "reconnect") {
                setCalState("connected");
                showToast("Google Calendar reconnected");
              }
            }}
          />
          <SourceCard
            kind="photos"
            title="Google Photos"
            purpose={
              photoState === "connected"
                ? `${SOURCES.photos.account} · Select more photos anytime`
                : "Permission expired — reconnect to keep memories in sync."
            }
            state={photoState}
            onAction={() => {
              if (photoState === "reconnect") {
                setPhotoState("connected");
                showToast("Google Photos reconnected");
              }
            }}
          />
        </div>

        {/* Sync */}
        <p className="text-[12px] font-[600] text-ink-soft uppercase tracking-[0.08em] mt-7 mb-2.5 ml-0.5">
          Sync
        </p>
        <div className="rounded-2xl bg-surface border border-hairline divide-y divide-hairline overflow-hidden">
          <Toggle
            label="Background sync"
            desc="Keep the timeline up to date automatically"
            value={autoSync}
            onChange={setAutoSync}
          />
          <button
            onClick={() => showToast("Sync complete")}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-canvas transition-colors"
          >
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-mint text-teal-dark shrink-0">
              <RefreshCw size={17} />
            </span>
            <div className="flex-1">
              <p className="text-[15px] font-[600] text-ink">Sync now</p>
              <p className="text-[12.5px] text-ink-soft">Last synced {SOURCES.calendar.lastSync}</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================= CHILD MANAGEMENT */
export function ChildManagement({
  onBack,
  onEditChild,
  onAddChild,
}: {
  onBack: () => void;
  onEditChild: (id: string) => void;
  onAddChild: () => void;
}) {
  return (
    <div className="size-full flex flex-col bg-canvas">
      <AppHeader
        title="Children"
        onBack={onBack}
        trailing={
          <button
            onClick={onAddChild}
            className="grid place-items-center w-10 h-10 rounded-full bg-surface border border-hairline text-teal active:scale-95 transition-transform"
          >
            <Plus size={19} />
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto scroll-area px-4 pb-8">
        <div className="space-y-2.5 mt-1">
          {CHILDREN.map((c) => (
            <button
              key={c.id}
              onClick={() => onEditChild(c.id)}
              className="w-full flex items-center gap-3.5 rounded-2xl bg-surface border border-hairline p-3.5 text-left active:scale-[0.99] transition-transform"
            >
              <ChildAvatar src={c.photo} name={c.name} size={48} />
              <div className="flex-1">
                <p className="text-[16px] font-[700] text-ink">{c.name}</p>
                <p className="text-[13px] text-ink-soft">{c.grade}</p>
              </div>
              <Pencil size={17} className="text-ink-soft" />
            </button>
          ))}
        </div>

        <button
          onClick={onAddChild}
          className="w-full mt-3 rounded-2xl border border-dashed border-teal/40 text-teal p-4 flex items-center justify-center gap-2 text-[14.5px] font-[600] active:scale-[0.99] transition-transform"
        >
          <Plus size={18} /> Add child
        </button>
      </div>
    </div>
  );
}

/* ============================================================= EDIT / ADD CHILD */
export function EditChild({
  id,
  onBack,
}: {
  id?: string;
  onBack: () => void;
}) {
  const existing = id ? childById(id) : undefined;
  const [name, setName] = useState(existing?.name ?? "");
  const [dob, setDob] = useState(existing?.dob ?? "");
  const [grade, setGrade] = useState(existing?.grade ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = () => {
    showToast(existing ? "Child updated" : "Child added");
    onBack();
  };

  return (
    <div className="size-full flex flex-col bg-canvas">
      <AppHeader title={existing ? "Edit child" : "Add child"} onBack={onBack} />
      <div className="flex-1 overflow-y-auto scroll-area px-4 pb-8">
        {/* Reference photo */}
        <div className="flex flex-col items-center mt-2 mb-5">
          <div className="relative">
            <ChildAvatar src={existing?.photo} name={name || "?"} size={92} ring="#217c72" />
            <span className="absolute bottom-0 right-0 grid place-items-center w-8 h-8 rounded-full bg-teal text-white border-2 border-canvas">
              <Pencil size={14} />
            </span>
          </div>
          <p className="text-[12.5px] text-ink-soft mt-2.5">Reference photo helps match memories</p>
        </div>

        <FieldLabel label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus={!existing}
            placeholder="Child's name"
            className="h-[52px] w-full rounded-2xl bg-surface px-4 text-[16px] text-ink border border-hairline outline-none focus:border-teal focus:ring-4 focus:ring-teal/10 transition placeholder:text-ink-soft/60"
          />
        </FieldLabel>

        <FieldLabel label="Date of birth">
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="h-[52px] w-full rounded-2xl bg-surface px-4 text-[16px] text-ink border border-hairline outline-none focus:border-teal focus:ring-4 focus:ring-teal/10 transition"
          />
          <span className="block text-[12px] text-ink-soft mt-1.5 ml-0.5">
            {ageFromDob(dob) !== null
              ? `${ageFromDob(dob)} years old · used to pitch activity levels`
              : "Used to pitch activity levels for their age"}
          </span>
        </FieldLabel>

        <FieldLabel label="Grade">
          <input
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="e.g. Grade 6"
            className="h-[52px] w-full rounded-2xl bg-surface px-4 text-[16px] text-ink border border-hairline outline-none focus:border-teal focus:ring-4 focus:ring-teal/10 transition placeholder:text-ink-soft/60"
          />
        </FieldLabel>

        {existing && (
          <>
            <button
              onClick={() => setConfirmDelete((v) => !v)}
              className="mt-2 text-[13px] font-[600] text-ink-soft active:opacity-60"
            >
              {confirmDelete ? "Cancel" : "Remove child"}
            </button>
            <AnimatePresence>
              {confirmDelete && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <button
                    onClick={() => {
                      showToast(`${existing.name} removed`);
                      onBack();
                    }}
                    className="w-full mt-3 flex items-center gap-3 rounded-2xl bg-[#fbeceb] border border-[#e2b6b0] p-4 text-left"
                  >
                    <span className="grid place-items-center w-9 h-9 rounded-xl bg-white text-[#c0504a]">
                      <Trash2 size={17} />
                    </span>
                    <div>
                      <p className="text-[14.5px] font-[600] text-[#c0504a]">
                        Delete {existing.name}
                      </p>
                      <p className="text-[12px] text-ink-soft">
                        Removes their activities and memories
                      </p>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
      <div className="shrink-0 px-4 pt-3 pb-8 border-t border-hairline bg-canvas">
        <PrimaryButton onClick={save} disabled={!name || !grade}>
          {existing ? "Save changes" : "Add child"}
        </PrimaryButton>
      </div>
    </div>
  );
}

function FieldLabel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block mb-4">
      <span className="block text-[13px] font-[500] text-ink-soft mb-1.5 ml-0.5">{label}</span>
      {children}
    </label>
  );
}

/* ============================================================= ACCOUNT */
export function AccountSettings({
  onBack,
  onSignOut,
}: {
  onBack: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="size-full flex flex-col bg-canvas">
      <AppHeader title="Account" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scroll-area px-4 pb-8">
        <div className="flex items-center gap-4 mt-2 mb-2">
          <ChildAvatar src={PARENT.photo} name={PARENT.name} size={56} ring="#217c72" />
          <div>
            <p className="font-display text-[18px] font-[700] text-ink">{PARENT.name}</p>
            <p className="text-[13px] text-ink-soft">{PARENT.email}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-surface border border-hairline divide-y divide-hairline overflow-hidden">
          <Row icon={<Pencil size={18} />} label="Edit profile" onClick={() => showToast("Profile saved")} />
          <Row icon={<ShieldCheck size={18} />} label="Change password" onClick={() => {}} />
        </div>

        <button
          onClick={onSignOut}
          className="w-full mt-6 flex items-center justify-center gap-2 rounded-2xl bg-surface border border-hairline p-4 text-[15px] font-[600] text-[#c0504a] active:scale-[0.99] transition-transform"
        >
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </div>
  );
}

/* ============================================================= NOTIFICATION PREFS */
export function NotificationPrefs({ onBack }: { onBack: () => void }) {
  const [prefs, setPrefs] = useState({
    activities: true,
    achievements: true,
    photos: true,
    connection: true,
  });
  const set = (k: keyof typeof prefs) => (v: boolean) => setPrefs((p) => ({ ...p, [k]: v }));

  return (
    <div className="size-full flex flex-col bg-canvas">
      <AppHeader title="Notifications" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scroll-area px-4 pb-8">
        <p className="text-[13px] text-ink-soft mt-1 mb-4 leading-relaxed">
          Choose what's worth a nudge. We only notify when something needs your attention.
        </p>
        <div className="rounded-2xl bg-surface border border-hairline divide-y divide-hairline overflow-hidden">
          <Toggle label="New activities" desc="When we find activities to review" value={prefs.activities} onChange={set("activities")} />
          <Toggle label="Possible achievements" desc="When a moment looks like a milestone" value={prefs.achievements} onChange={set("achievements")} />
          <Toggle label="Photos to review" desc="When photos need a quick check" value={prefs.photos} onChange={set("photos")} />
          <Toggle label="Connection issues" desc="When a source needs reconnecting" value={prefs.connection} onChange={set("connection")} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================= DATA & PRIVACY */
export function DataPrivacy({
  onBack,
  onManageChildren,
}: {
  onBack: () => void;
  onManageChildren: () => void;
}) {
  return (
    <div className="size-full flex flex-col bg-canvas">
      <AppHeader title="Data & privacy" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scroll-area px-4 pb-8">
        <p className="text-[13px] text-ink-soft mt-1 mb-4 leading-relaxed">
          Your family's record stays yours. Manage what PROUDLY keeps.
        </p>
        <div className="rounded-2xl bg-surface border border-hairline divide-y divide-hairline overflow-hidden">
          <Row icon={<Database size={18} />} label="Manage imported items" onClick={() => showToast("Opened imported items")} />
          <Row icon={<Users size={18} />} label="Delete a child" onClick={onManageChildren} />
        </div>

        <div className="mt-6 rounded-2xl bg-surface border border-hairline divide-y divide-hairline overflow-hidden">
          <Row
            icon={<Trash2 size={18} />}
            label="Delete account"
            danger
            onClick={() => showToast("Contact support to delete")}
          />
        </div>
      </div>
    </div>
  );
}
