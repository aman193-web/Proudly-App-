import { ChevronDown, Plus, SlidersHorizontal, Sparkles } from "lucide-react";
import { ChildAvatar } from "./ui";
import { Sheet } from "./Sheet";
import {
  type Achievement,
  type Activity,
  type Category,
  achievementsForActivity,
  activityById,
  CATEGORIES,
  CATEGORY_COLOR,
  childById,
  CHILDREN,
  durationText,
  fmtMonth,
} from "../data";
import type { Range } from "./Gantt";

export type ChildId = string | "all";

/* ---------- Compact child chip + switcher sheet ---------- */
export function ChildChip({
  childId,
  onOpen,
}: {
  childId: ChildId;
  onOpen: () => void;
}) {
  const child = childId === "all" ? null : childById(childId);
  return (
    <button
      onClick={onOpen}
      className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-surface border border-hairline active:scale-95 transition-transform"
    >
      {child ? (
        <ChildAvatar src={child.photo} name={child.name} size={26} />
      ) : (
        <span className="grid place-items-center w-[26px] h-[26px] rounded-full bg-mint text-teal-dark text-[11px] font-[700]">
          All
        </span>
      )}
      <span className="text-[13.5px] font-[600] text-ink">
        {child ? child.name : "All Kids"}
      </span>
      <ChevronDown size={15} className="text-ink-soft" />
    </button>
  );
}

export function ChildSheet({
  open,
  onClose,
  childId,
  onSelect,
  allowAll = true,
}: {
  open: boolean;
  onClose: () => void;
  childId: ChildId;
  onSelect: (id: ChildId) => void;
  allowAll?: boolean;
}) {
  const options: { id: ChildId; name: string; photo?: string }[] = [
    ...CHILDREN.map((c) => ({ id: c.id as ChildId, name: c.name, photo: c.photo })),
    ...(allowAll ? [{ id: "all" as ChildId, name: "All Kids" }] : []),
  ];
  return (
    <Sheet open={open} onClose={onClose}>
      <h3 className="font-display text-[18px] font-[700] text-ink px-1 mb-2">
        Whose journey?
      </h3>
      <div className="space-y-1.5">
        {options.map((o) => {
          const active = o.id === childId;
          return (
            <button
              key={o.id}
              onClick={() => {
                onSelect(o.id);
                onClose();
              }}
              className={`w-full flex items-center gap-3 p-2.5 rounded-2xl border transition-colors ${
                active ? "bg-mint/50 border-teal/40" : "bg-surface border-hairline"
              }`}
            >
              {o.photo ? (
                <ChildAvatar src={o.photo} name={o.name} size={38} />
              ) : (
                <span className="grid place-items-center w-[38px] h-[38px] rounded-full bg-mint text-teal-dark text-[13px] font-[700]">
                  All
                </span>
              )}
              <span className="text-[15px] font-[600] text-ink">{o.name}</span>
              {active && (
                <span className="ml-auto w-2.5 h-2.5 rounded-full bg-teal" />
              )}
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

/* ---------- Home child selector bar ---------- */
export function ChildSelectorBar({
  childId,
  onSelect,
  onAddChild,
}: {
  childId: ChildId;
  onSelect: (id: ChildId) => void;
  onAddChild?: () => void;
}) {
  return (
    <div className="px-4 flex items-center gap-3 overflow-x-auto scroll-area py-1">
      {/* 'All Kids' option */}
      <button
        onClick={() => onSelect("all")}
        className={`flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full border transition-all duration-200 shrink-0 ${
          childId === "all"
            ? "bg-teal text-white border-teal shadow-md shadow-teal/20 scale-[1.02]"
            : "bg-surface border-hairline text-ink hover:border-teal/40"
        }`}
      >
        <span
          className={`grid place-items-center w-7 h-7 rounded-full font-[700] text-[11px] ${
            childId === "all" ? "bg-white/20 text-white" : "bg-mint text-teal-dark"
          }`}
        >
          ALL
        </span>
        <div className="text-left">
          <div className="text-[13px] font-[700] leading-none">All Kids</div>
          <div
            className={`text-[10px] mt-0.5 ${
              childId === "all" ? "text-white/80" : "text-ink-soft"
            }`}
          >
            Family view
          </div>
        </div>
      </button>

      {CHILDREN.map((c) => {
        const active = c.id === childId;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full border transition-all duration-200 shrink-0 relative ${
              active
                ? "bg-surface border-teal text-ink shadow-md shadow-teal/10 scale-[1.02] ring-2 ring-teal/20"
                : "bg-surface/80 border-hairline text-ink-soft hover:border-teal/30 hover:bg-surface"
            }`}
          >
            <div className="relative">
              <ChildAvatar src={c.photo} name={c.name} size={32} ring={active ? "#217c72" : "transparent"} />
              {active && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-teal rounded-full border-2 border-surface flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                </span>
              )}
            </div>
            <div className="text-left">
              <div
                className={`text-[13.5px] font-[700] leading-none ${
                  active ? "text-teal" : "text-ink"
                }`}
              >
                {c.name}
              </div>
              <div className="text-[10.5px] text-ink-soft mt-0.5 font-[500]">{c.grade}</div>
            </div>
          </button>
        );
      })}

      <button
        onClick={onAddChild}
        className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border border-dashed border-teal/40 text-teal hover:bg-mint/30 transition-colors text-[12.5px] font-[600]"
      >
        <span className="w-5 h-5 rounded-full bg-mint flex items-center justify-center text-teal font-[700] text-[13px]">
          +
        </span>
        Add
      </button>
    </div>
  );
}

/* ---------- Filter button + sheet ---------- */
export function FilterButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative grid place-items-center w-9 h-9 rounded-full border active:scale-95 transition-transform ${
        active ? "bg-teal text-white border-teal" : "bg-surface text-ink border-hairline"
      }`}
    >
      <SlidersHorizontal size={17} />
    </button>
  );
}

export function CategorySheet({
  open,
  onClose,
  value,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  value: Category | "all";
  onSelect: (c: Category | "all") => void;
}) {
  const opts: (Category | "all")[] = ["all", ...CATEGORIES];
  return (
    <Sheet open={open} onClose={onClose}>
      <h3 className="font-display text-[18px] font-[700] text-ink px-1 mb-3">
        Filter by category
      </h3>
      <div className="flex flex-wrap gap-2">
        {opts.map((c) => {
          const active = c === value;
          return (
            <button
              key={c}
              onClick={() => {
                onSelect(c);
                onClose();
              }}
              className={`flex items-center gap-2 pl-3 pr-3.5 py-2 rounded-full border text-[13.5px] font-[600] transition-colors ${
                active
                  ? "bg-teal text-white border-teal"
                  : "bg-surface text-ink border-hairline"
              }`}
            >
              {c !== "all" && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: active ? "#fff" : CATEGORY_COLOR[c] }}
                />
              )}
              {c === "all" ? "All categories" : c}
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

/* ---------- Range selector ---------- */
export function RangeSelector({
  value,
  onChange,
  onJumpToday,
}: {
  value: Range;
  onChange: (r: Range) => void;
  onJumpToday: () => void;
}) {
  const ranges: { id: Range; label: string }[] = [
    { id: "1y", label: "1Y" },
    { id: "3y", label: "3Y" },
    { id: "5y", label: "5Y" },
    { id: "all", label: "All" },
  ];
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 flex items-center bg-canvas rounded-full p-1 border border-hairline">
        {ranges.map((r) => {
          const active = r.id === value;
          return (
            <button
              key={r.id}
              onClick={() => onChange(r.id)}
              className={`flex-1 py-1.5 rounded-full text-[12.5px] font-[600] transition-colors ${
                active ? "bg-surface text-teal shadow-sm" : "text-ink-soft"
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>
      <button
        onClick={onJumpToday}
        className="shrink-0 px-3 h-8 rounded-full bg-mint text-teal-dark text-[12.5px] font-[600] active:scale-95 transition-transform"
      >
        Today
      </button>
    </div>
  );
}

/* ---------- Achievement row ---------- */
export function AchievementRow({
  achievement,
  onClick,
  showChild = false,
}: {
  achievement: Achievement;
  onClick?: () => void;
  showChild?: boolean;
}) {
  const activity = activityById(achievement.activityId);
  const child = childById(achievement.childId);
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3.5 rounded-2xl bg-surface border border-hairline p-3 text-left active:scale-[0.99] transition-transform"
    >
      {achievement.image ? (
        <img
          src={achievement.image}
          alt={achievement.title}
          className="w-12 h-12 rounded-xl object-cover shrink-0 bg-mint"
        />
      ) : (
        <span className="grid place-items-center w-12 h-12 rounded-xl bg-gold-soft text-gold shrink-0">
          <MilestoneStar />
        </span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[14.5px] font-[600] text-ink leading-tight truncate">
          {achievement.title}
        </p>
        <p className="text-[12.5px] text-ink-soft mt-0.5 truncate">
          {activity?.name}
          {showChild && child ? ` · ${child.name}` : ""} · {fmtMonth(achievement.date)}
        </p>
      </div>
    </button>
  );
}

export function MilestoneStar({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 16.9l-5.8 3.06 1.1-6.47L2.6 8.85l6.5-.95L12 2z" />
    </svg>
  );
}

/* ---------- Empty state ---------- */
export function EmptyGantt({
  name,
  onSync,
  onAdd,
}: {
  name: string;
  onSync: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="px-4 mt-8 flex flex-col items-center text-center">
      <span className="grid place-items-center w-14 h-14 rounded-2xl bg-mint text-teal-dark mb-4">
        <Sparkles size={26} />
      </span>
      <h3 className="font-display text-[19px] font-[700] text-ink leading-snug max-w-[260px]">
        {name}'s activity journey starts here
      </h3>
      <p className="text-[13.5px] text-ink-soft mt-2 max-w-[250px]">
        Connect Calendar, add an activity, or sync your sources to start building the timeline.
      </p>
      <div className="flex gap-2.5 mt-5 w-full max-w-[300px]">
        <button
          onClick={onSync}
          className="flex-1 h-11 rounded-xl bg-surface border border-hairline text-ink font-[600] text-[14px] active:scale-95 transition-transform"
        >
          Sync sources
        </button>
        <button
          onClick={onAdd}
          className="flex-1 h-11 rounded-xl bg-teal text-white font-[600] text-[14px] active:scale-95 transition-transform flex items-center justify-center gap-1.5"
        >
          <Plus size={16} /> Add activity
        </button>
      </div>
    </div>
  );
}

/* ---------- Activity preview sheet ---------- */
export function ActivityPreview({
  activity,
  onClose,
  onView,
  onEdit,
}: {
  activity: Activity | null;
  onClose: () => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const acts = activity ? achievementsForActivity(activity.id) : [];
  const memoryCount = activity?.memories.length ?? 0;
  return (
    <Sheet open={!!activity} onClose={onClose}>
      {activity && (
        <div>
          <div className="flex items-center gap-2 px-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: CATEGORY_COLOR[activity.category] }}
            />
            <span className="text-[12.5px] font-[600] text-ink-soft">
              {activity.category}
            </span>
            {activity.end === "present" && (
              <span className="ml-auto text-[11.5px] font-[700] text-teal bg-mint px-2 py-0.5 rounded-full">
                Ongoing
              </span>
            )}
          </div>
          <h3 className="font-display text-[24px] font-[700] text-ink px-1 mt-1.5">
            {activity.name}
          </h3>
          <p className="text-[13.5px] text-ink-soft px-1 mt-0.5">
            {activity.approxStart ? "~" : ""}
            {fmtMonth(activity.start)} –{" "}
            {activity.end === "present" ? "Present" : fmtMonth(activity.end)} ·{" "}
            {durationText(activity.start, activity.end)}
          </p>

          <div className="flex gap-2.5 px-1 mt-4">
            <MiniStat value={String(acts.length)} label="achievements" accent />
            <MiniStat value={String(memoryCount)} label="memories" />
          </div>

          <div className="flex gap-2.5 mt-5">
            <button
              onClick={() => onEdit(activity.id)}
              className="flex-1 h-12 rounded-xl bg-surface border border-hairline text-ink font-[600] text-[15px] active:scale-95 transition-transform"
            >
              Edit
            </button>
            <button
              onClick={() => onView(activity.id)}
              className="flex-[1.4] h-12 rounded-xl bg-teal text-white font-[600] text-[15px] active:scale-95 transition-transform"
            >
              View activity
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function MiniStat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="flex-1 rounded-2xl bg-canvas border border-hairline py-3 text-center">
      <div
        className={`font-display text-[22px] font-[700] leading-none ${
          accent ? "text-gold" : "text-teal"
        }`}
      >
        {value}
      </div>
      <div className="text-[11.5px] text-ink-soft mt-1">{label}</div>
    </div>
  );
}

/* ---------- Achievement preview sheet ---------- */
export function AchievementPreview({
  achievement,
  onClose,
  onView,
}: {
  achievement: Achievement | null;
  onClose: () => void;
  onView: (id: string) => void;
}) {
  const activity = achievement ? activityById(achievement.activityId) : null;
  return (
    <Sheet open={!!achievement} onClose={onClose}>
      {achievement && (
        <div>
          <div className="flex items-center gap-3 px-1">
            <span className="grid place-items-center w-11 h-11 rounded-xl bg-gold-soft text-gold shrink-0">
              <MilestoneStar />
            </span>
            <div className="min-w-0">
              <h3 className="font-display text-[19px] font-[700] text-ink leading-tight">
                {achievement.title}
              </h3>
              <p className="text-[12.5px] text-ink-soft mt-0.5">
                {activity?.name} · {fmtMonth(achievement.date)}
              </p>
            </div>
          </div>
          {achievement.image && (
            <img
              src={achievement.image}
              alt={achievement.title}
              className="w-full h-36 object-cover rounded-2xl mt-4 bg-mint"
            />
          )}
          <button
            onClick={() => onView(achievement.id)}
            className="w-full h-12 rounded-xl bg-teal text-white font-[600] text-[15px] mt-4 active:scale-95 transition-transform"
          >
            View achievement
          </button>
        </div>
      )}
    </Sheet>
  );
}
