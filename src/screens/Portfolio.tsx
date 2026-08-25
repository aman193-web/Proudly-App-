import { useMemo, useState } from "react";
import { ChevronRight, Download, FileText, FolderOpen, Share2 } from "lucide-react";
import { AppHeader, ChildAvatar, PrimaryButton } from "../components/ui";
import { ChildChip, ChildSheet, MilestoneStar, type ChildId } from "../components/proudly";
import { EmptyState, showToast } from "../components/states";
import {
  type Achievement,
  type Activity,
  achievementsFor,
  activitiesFor,
  activityById,
  CATEGORY_COLOR,
  childById,
  dec,
  fmtMonth,
  memoriesFor,
} from "../data";

function spanYears(acts: Activity[]) {
  if (!acts.length) return { start: new Date().getFullYear(), ongoing: true, end: 0 };
  const start = Math.min(...acts.map((a) => a.start.y));
  const ongoing = acts.some((a) => a.end === "present");
  const end = Math.max(...acts.map((a) => (a.end === "present" ? 0 : a.end.y)));
  return { start, ongoing, end };
}

type FeedTab = "all" | "photos" | "achievements" | "activities";

type FeedItem =
  | { kind: "photo"; url: string; activityName: string; date: { y: number; m: number } }
  | { kind: "achievement"; ach: Achievement }
  | { kind: "activity"; act: Activity };

/* ============================================================= PORTFOLIO TAB */
export function Portfolio({
  childId,
  onSelectChild,
  onViewGantt,
  onPreviewBrag,
}: {
  childId: ChildId;
  onSelectChild: (id: ChildId) => void;
  onViewGantt: () => void;
  onPreviewBrag: () => void;
}) {
  const [childSheet, setChildSheet] = useState(false);
  const [feedTab, setFeedTab] = useState<FeedTab>("all");
  const acts = activitiesFor(childId);
  const child = childId === "all" ? null : childById(childId);
  const name = child ? child.name : "Your family";
  const span = useMemo(() => spanYears(acts), [acts]);

  const allFeedItems = useMemo<FeedItem[]>(() => {
    const photos: FeedItem[] = memoriesFor(childId).map((m) => ({
      kind: "photo",
      url: m.url,
      activityName: m.activityName,
      date: m.date,
    }));
    const achievements: FeedItem[] = achievementsFor(childId).map((a) => ({
      kind: "achievement",
      ach: a,
    }));
    const activities: FeedItem[] = activitiesFor(childId).map((a) => ({
      kind: "activity",
      act: a,
    }));
    const all = [...photos, ...achievements, ...activities];
    return all.sort((a, b) => {
      const da =
        a.kind === "photo" ? a.date : a.kind === "achievement" ? a.ach.date : a.act.start;
      const db =
        b.kind === "photo" ? b.date : b.kind === "achievement" ? b.ach.date : b.act.start;
      return dec(db) - dec(da);
    });
  }, [childId]);

  const feedItems = useMemo(() => {
    if (feedTab === "all") return allFeedItems;
    if (feedTab === "photos") return allFeedItems.filter((i) => i.kind === "photo");
    if (feedTab === "achievements") return allFeedItems.filter((i) => i.kind === "achievement");
    return allFeedItems.filter((i) => i.kind === "activity");
  }, [allFeedItems, feedTab]);

  if (!acts.length) {
    return (
      <div className="pt-14 pb-6">
        <div className="px-4 flex items-start justify-between">
          <h1 className="font-display text-[24px] font-[700] text-ink leading-tight">Portfolio</h1>
          <ChildChip childId={childId} onOpen={() => setChildSheet(true)} />
        </div>
        <EmptyState
          icon={<FolderOpen size={26} />}
          title="Nothing to summarize yet"
          body="Once activities and achievements are tracked, PROUDLY builds the portfolio for you automatically."
          actionLabel="View activities"
          onAction={onViewGantt}
        />
        <ChildSheet
          open={childSheet}
          onClose={() => setChildSheet(false)}
          childId={childId}
          onSelect={onSelectChild}
        />
      </div>
    );
  }

  const TABS: { id: FeedTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "photos", label: "Photos" },
    { id: "achievements", label: "Achievements" },
    { id: "activities", label: "Activities" },
  ];

  return (
    <div className="pt-14 pb-6">
      {/* Header */}
      <div className="px-4 flex items-start justify-between">
        <div>
          <h1 className="font-display text-[24px] font-[700] text-ink leading-tight">
            {child ? `${name}'s Portfolio` : "Family Portfolio"}
          </h1>
          <p className="text-[13px] text-ink-soft mt-1 tabular-nums">
            {span.start} – {span.ongoing ? "Present" : span.end}
          </p>
        </div>
        <ChildChip childId={childId} onOpen={() => setChildSheet(true)} />
      </div>

      {/* Filter tabs */}
      <div className="mt-4 flex gap-2 overflow-x-auto scroll-area px-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setFeedTab(t.id)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-[600] border transition-colors ${
              feedTab === t.id
                ? "bg-teal text-white border-teal"
                : "bg-surface text-ink-soft border-hairline"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Instagram-style grid */}
      {feedItems.length > 0 ? (
        <div className="mt-4 grid grid-cols-3 gap-[1.5px] bg-hairline">
          {feedItems.map((item, i) => (
            <FeedCell key={i} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-[13.5px] text-ink-soft text-center mt-12 px-4">Nothing here yet.</p>
      )}

      {/* Brag Sheet CTA */}
      <div className="px-4 mt-8">
        <button
          onClick={onPreviewBrag}
          className="w-full rounded-2xl bg-teal text-white p-4 flex items-center gap-3.5 text-left active:scale-[0.99] transition-transform"
        >
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-white/15 shrink-0">
            <FileText size={20} />
          </span>
          <div className="flex-1">
            <p className="text-[15px] font-[700]">Preview Brag Sheet</p>
            <p className="text-[12.5px] text-mint/90 mt-0.5">
              A one-page summary for schools & applications
            </p>
          </div>
          <ChevronRight size={20} />
        </button>
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

/* ============================================================= FEED CELL */
function FeedCell({ item }: { item: FeedItem }) {
  if (item.kind === "photo") {
    return (
      <div className="aspect-square relative overflow-hidden bg-mint">
        <img src={item.url} alt={item.activityName} className="size-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1.5 pt-5">
          <p className="text-[8.5px] font-[600] text-white truncate">{item.activityName}</p>
        </div>
      </div>
    );
  }

  if (item.kind === "achievement") {
    if (item.ach.image) {
      return (
        <div className="aspect-square relative overflow-hidden bg-gold-soft">
          <img src={item.ach.image} alt={item.ach.title} className="size-full object-cover" />
          <div className="absolute top-1.5 left-1.5 grid place-items-center w-5 h-5 rounded-full bg-gold shadow-sm">
            <span className="text-white" style={{ fontSize: 9, lineHeight: 1 }}>
              ★
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 pb-1.5 pt-5">
            <p className="text-[8.5px] font-[600] text-white truncate">{item.ach.title}</p>
          </div>
        </div>
      );
    }
    return (
      <div className="aspect-square flex flex-col items-center justify-center bg-gradient-to-br from-[#fdf3e3] to-[#f5e0b5] px-2 text-center">
        <span className="text-gold mb-1">
          <MilestoneStar size={20} />
        </span>
        <p className="text-[8.5px] font-[700] text-[#7a5a20] leading-tight line-clamp-3">
          {item.ach.title}
        </p>
      </div>
    );
  }

  // activity
  const firstMemory = item.act.memories[0];
  if (firstMemory) {
    return (
      <div className="aspect-square relative overflow-hidden bg-mint">
        <img src={firstMemory} alt={item.act.name} className="size-full object-cover" />
        <div
          className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full shadow-sm"
          style={{ background: CATEGORY_COLOR[item.act.category] }}
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1.5 pt-5">
          <p className="text-[8.5px] font-[600] text-white truncate">{item.act.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="aspect-square flex flex-col items-center justify-center px-2 text-center"
      style={{ background: `${CATEGORY_COLOR[item.act.category]}20` }}
    >
      <span
        className="w-3 h-3 rounded-full mb-1.5"
        style={{ background: CATEGORY_COLOR[item.act.category] }}
      />
      <p className="text-[9px] font-[700] text-ink leading-tight line-clamp-2">{item.act.name}</p>
      <p className="text-[8px] text-ink-soft mt-0.5 tabular-nums">
        {item.act.start.y}–{item.act.end === "present" ? "Now" : item.act.end.y}
      </p>
    </div>
  );
}

/* ============================================================= BRAG SHEET */
export function BragSheet({
  childId,
  onBack,
}: {
  childId: ChildId;
  onBack: () => void;
}) {
  const child = childId === "all" ? childById("reet")! : childById(childId)!;
  const acts = [...activitiesFor(child.id)].sort((a, b) => dec(a.start) - dec(b.start));
  const achs = [...achievementsFor(child.id)].sort((a, b) => dec(b.date) - dec(a.date));
  const generated = fmtMonth({ y: 2026, m: 8 });

  return (
    <div className="size-full flex flex-col bg-[#e9ebe7]">
      <AppHeader
        title="Brag Sheet"
        onBack={onBack}
        trailing={
          <button
            onClick={() => showToast("Shared")}
            className="grid place-items-center w-10 h-10 rounded-full bg-surface border border-hairline text-ink active:scale-95 transition-transform"
          >
            <Share2 size={17} />
          </button>
        }
      />

      {/* Document preview */}
      <div className="flex-1 overflow-y-auto scroll-area px-4 py-3">
        <div className="mx-auto bg-white rounded-lg shadow-[0_8px_30px_-12px_rgba(23,35,33,0.3)] p-6 max-w-[340px]">
          {/* letterhead */}
          <div className="flex items-center justify-between border-b border-hairline pb-4">
            <div className="flex items-center gap-3">
              <ChildAvatar src={child.photo} name={child.name} size={44} />
              <div>
                <h2 className="font-display text-[19px] font-[700] text-ink leading-tight">
                  {child.name}
                </h2>
                <p className="text-[12px] text-ink-soft">{child.grade}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-[11px] font-[700] tracking-[0.12em] text-teal">
                PROUDLY
              </p>
              <p className="text-[9.5px] text-ink-soft mt-0.5">Extracurricular record</p>
            </div>
          </div>

          {/* Activities */}
          <DocSection title="Activities">
            <div className="space-y-2">
              {acts.map((a) => (
                <div key={a.id} className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-[600] text-ink leading-tight">{a.name}</p>
                    <p className="text-[10.5px] text-ink-soft">{a.category}</p>
                  </div>
                  <p className="text-[11px] text-ink-soft tabular-nums whitespace-nowrap">
                    {a.start.y} – {a.end === "present" ? "Present" : a.end.y}
                  </p>
                </div>
              ))}
            </div>
          </DocSection>

          {/* Achievements */}
          <DocSection title="Achievements">
            <div className="space-y-2">
              {achs.map((a) => (
                <div key={a.id} className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-[600] text-ink leading-tight">{a.title}</p>
                    <p className="text-[10.5px] text-ink-soft">
                      {activityById(a.activityId)?.name}
                    </p>
                  </div>
                  <p className="text-[11px] text-ink-soft tabular-nums whitespace-nowrap">
                    {fmtMonth(a.date)}
                  </p>
                </div>
              ))}
            </div>
          </DocSection>

          <p className="text-[9.5px] text-ink-soft/80 mt-6 pt-3 border-t border-hairline">
            Generated {generated} · {acts.length} activities · {achs.length} achievements
          </p>
        </div>
      </div>

      {/* Export controls — kept separate from the document */}
      <div className="shrink-0 px-4 pt-3 pb-8 border-t border-hairline bg-surface flex gap-2.5">
        <button
          onClick={() => showToast("Shared")}
          className="flex-1 h-[52px] rounded-2xl bg-surface border border-hairline text-ink font-[600] text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Share2 size={18} /> Share
        </button>
        <button
          onClick={() => showToast("Portfolio exported")}
          className="flex-[1.3] h-[52px] rounded-2xl bg-teal text-white font-[600] text-[15px] flex items-center justify-center gap-2 shadow-[0_10px_24px_-10px_rgba(33,124,114,0.7)] active:scale-[0.98] transition-transform"
        >
          <Download size={18} /> Export PDF
        </button>
      </div>
    </div>
  );
}

function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="text-[11px] font-[700] text-teal uppercase tracking-[0.1em] mb-2.5">
        {title}
      </h3>
      {children}
    </div>
  );
}
