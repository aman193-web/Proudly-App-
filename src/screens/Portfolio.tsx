import { useMemo, useState } from "react";
import {
  Bookmark,
  ChevronRight,
  Download,
  FileText,
  FolderOpen,
  Heart,
  LayoutGrid,
  MoreHorizontal,
  Rows3,
  Share2,
} from "lucide-react";
import { AppHeader, ChildAvatar, PrimaryButton } from "../components/ui";
import { ChildChip, ChildSheet, MilestoneStar, type ChildId } from "../components/proudly";
import { EmptyState, showToast } from "../components/states";
import { CategoryIcon } from "../components/CategoryIcon";
import {
  type Achievement,
  type Activity,
  achievementsFor,
  activitiesFor,
  activityById,
  type Category,
  CATEGORY_COLOR,
  childById,
  dec,
  durationText,
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

/** Collage grid (the original) or a full-width scrolling feed. */
type PortfolioView = "grid" | "feed";

type FeedItem =
  | {
      kind: "photo";
      url: string;
      activityName: string;
      childId: string;
      category: Category;
      date: { y: number; m: number };
    }
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
  const [view, setView] = useState<PortfolioView>("grid");
  const acts = activitiesFor(childId);
  const child = childId === "all" ? null : childById(childId);
  const name = child ? child.name : "Your family";
  const span = useMemo(() => spanYears(acts), [acts]);

  const allFeedItems = useMemo<FeedItem[]>(() => {
    const photos: FeedItem[] = memoriesFor(childId).map((m) => ({
      kind: "photo",
      url: m.url,
      activityName: m.activityName,
      childId: m.childId,
      category: m.category,
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
      <div className="pt-14 pb-28">
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
    <div className="pt-14 pb-28">
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

      {/* View toggle — collage grid or full-width feed */}
      <div className="px-4 mt-4">
        <div className="flex items-center bg-canvas rounded-full p-1 border border-hairline">
          {(
            [
              { id: "grid", label: "Collage", Icon: LayoutGrid },
              { id: "feed", label: "Feed", Icon: Rows3 },
            ] as { id: PortfolioView; label: string; Icon: typeof LayoutGrid }[]
          ).map(({ id, label, Icon }) => {
            const active = view === id;
            return (
              <button
                key={id}
                onClick={() => setView(id)}
                aria-pressed={active}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-[12.5px] font-[600] transition-colors ${
                  active ? "bg-surface text-teal shadow-sm" : "text-ink-soft"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter tabs — apply to both views */}
      <div className="mt-3 flex gap-2 overflow-x-auto scroll-area px-4">
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

      {/* Collage grid (unchanged) or the feed */}
      {feedItems.length > 0 ? (
        view === "grid" ? (
          <div className="mt-4 grid grid-cols-3 gap-[1.5px] bg-hairline">
            {feedItems.map((item, i) => (
              <FeedCell key={i} item={item} />
            ))}
          </div>
        ) : (
          <div className="mt-4">
            {feedItems.map((item, i) => (
              <FeedPost key={i} item={item} />
            ))}
          </div>
        )
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

/* ============================================================= FEED POST
   Full-width post, Instagram-home-feed shape: identity header, edge-to-edge
   media, action row, caption. Reactions are local to the session — nothing
   here invents follower or like counts. */
function FeedPost({ item }: { item: FeedItem }) {
  const [proud, setProud] = useState(false);
  const [saved, setSaved] = useState(false);

  // Normalise the three item kinds into one post shape.
  let childId: string;
  let sub: string;
  let dot: string;
  /** Null only for an achievement whose activity is missing. */
  let category: Category | null = null;
  let date: { y: number; m: number };
  let image: string | null;
  let caption: React.ReactNode;
  let note: string | null = null;
  let isAchievement = false;

  if (item.kind === "photo") {
    childId = item.childId;
    sub = item.activityName;
    dot = CATEGORY_COLOR[item.category];
    category = item.category;
    date = item.date;
    image = item.url;
    caption = item.activityName;
  } else if (item.kind === "achievement") {
    const act = activityById(item.ach.activityId);
    childId = item.ach.childId;
    sub = act?.name ?? "Achievement";
    dot = act ? CATEGORY_COLOR[act.category] : "#b8893b";
    category = act?.category ?? null;
    date = item.ach.date;
    image = item.ach.image ?? null;
    caption = item.ach.title;
    note = item.ach.description ?? null;
    isAchievement = true;
  } else {
    childId = item.act.childId;
    sub = item.act.category;
    dot = CATEGORY_COLOR[item.act.category];
    category = item.act.category;
    date = item.act.start;
    // Every memory already appears as its own photo post, so an activity post
    // reusing one would show the same picture twice. It gets a milestone panel.
    image = null;
    caption = `Started ${item.act.name} · ${durationText(item.act.start, item.act.end)}`;
    note = item.act.note ?? null;
  }

  const child = childById(childId);
  const childName = child?.name ?? "Family";

  return (
    <article className="border-b border-hairline pb-3 mb-3 last:border-b-0">
      {/* Identity header */}
      <div className="flex items-center gap-2.5 px-4 py-2.5">
        <ChildAvatar src={child?.photo} name={childName} size={34} ring={dot} />
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-[700] text-ink leading-tight truncate">{childName}</p>
          <p className="text-[11.5px] text-ink-soft leading-tight truncate flex items-center gap-1.5">
            {category ? (
              <CategoryIcon category={category} size={13} />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />
            )}
            {sub}
          </p>
        </div>
        {isAchievement && (
          <span className="shrink-0 flex items-center gap-1 text-[10.5px] font-[700] text-gold bg-gold-soft px-2 py-1 rounded-full">
            <MilestoneStar size={10} /> Achievement
          </span>
        )}
        <MoreHorizontal size={18} className="text-ink-soft shrink-0" />
      </div>

      {/* Media — edge to edge */}
      {image ? (
        <img src={image} alt={typeof caption === "string" ? caption : ""} className="w-full aspect-square object-cover bg-mint" />
      ) : isAchievement ? (
        <div className="w-full aspect-square flex flex-col items-center justify-center bg-gradient-to-br from-[#fdf3e3] to-[#f5e0b5] px-10 text-center">
          <span className="text-gold mb-3">
            <MilestoneStar size={44} />
          </span>
          <p className="font-display text-[19px] font-[700] text-[#7a5a20] leading-snug">
            {item.kind === "achievement" ? item.ach.title : ""}
          </p>
        </div>
      ) : (
        <div
          className="w-full aspect-square flex flex-col items-center justify-center px-10 text-center"
          style={{ background: `${dot}1f` }}
        >
          <span className="mb-3">
            {category ? (
              <CategoryIcon category={category} size={30} />
            ) : (
              <span className="block w-4 h-4 rounded-full" style={{ background: dot }} />
            )}
          </span>
          <p className="font-display text-[19px] font-[700] text-ink leading-snug">
            {item.kind === "activity" ? item.act.name : sub}
          </p>
          <p className="text-[12.5px] text-ink-soft mt-1 tabular-nums">
            {item.kind === "activity"
              ? `${item.act.start.y} – ${item.act.end === "present" ? "Present" : item.act.end.y}`
              : ""}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 pt-3">
        <button
          onClick={() => setProud((p) => !p)}
          aria-label={proud ? "Remove proud" : "Mark as proud"}
          aria-pressed={proud}
          className="active:scale-90 transition-transform"
        >
          <Heart size={22} className={proud ? "text-[#c0504a] fill-current" : "text-ink"} />
        </button>
        <button
          onClick={() => showToast("Shared")}
          aria-label="Share"
          className="active:scale-90 transition-transform"
        >
          <Share2 size={20} className="text-ink" />
        </button>
        <button
          onClick={() => setSaved((v) => !v)}
          aria-label={saved ? "Remove from Brag Sheet" : "Save to Brag Sheet"}
          aria-pressed={saved}
          className="ml-auto active:scale-90 transition-transform"
        >
          <Bookmark size={21} className={saved ? "text-teal fill-current" : "text-ink"} />
        </button>
      </div>

      {proud && (
        <p className="px-4 mt-2 text-[12.5px] font-[600] text-ink">You're proud of this</p>
      )}

      {/* Caption */}
      <div className="px-4 mt-2">
        <p className="text-[13.5px] leading-[1.5] text-ink">
          <span className="font-[700]">{childName}</span> {caption}
        </p>
        {note && <p className="text-[12.5px] text-ink-soft leading-[1.5] mt-1">{note}</p>}
        <p className="text-[11px] text-ink-soft/70 mt-1.5 uppercase tracking-[0.04em]">
          {fmtMonth(date)}
        </p>
      </div>
    </article>
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

  // Activity — rendered as its own tile. Its memories are already in the grid
  // as photo cells, so reusing one here would repeat the same image.
  return (
    <div
      className="aspect-square flex flex-col items-center justify-center px-2 text-center"
      style={{ background: `${CATEGORY_COLOR[item.act.category]}20` }}
    >
      <span className="mb-1.5">
        <CategoryIcon category={item.act.category} size={16} />
      </span>
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
