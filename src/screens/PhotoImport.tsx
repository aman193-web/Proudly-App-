import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, Sparkles } from "lucide-react";
import { AppHeader, ChildAvatar, PrimaryButton } from "../components/ui";
import { Sheet } from "../components/Sheet";
import { ChildSheet, MilestoneStar } from "../components/proudly";
import { showToast } from "../components/states";
import {
  activitiesFor,
  activityById,
  CATEGORY_COLOR,
  childById,
  fmtMonth,
  PHOTO_CANDIDATES,
  type PhotoCandidate,
} from "../data";

type Step = "select" | "processing" | "review";

type Draft = PhotoCandidate & { include: boolean; isAchievement: boolean; note: string };

export function PhotoImport({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>("select");
  const [drafts, setDrafts] = useState<Draft[]>(
    PHOTO_CANDIDATES.map((c) => ({
      ...c,
      include: true,
      isAchievement: !!c.achievement,
      note: "",
    })),
  );

  const selected = drafts.filter((d) => d.include);

  const finish = () => {
    showToast(`${selected.length} photos assigned`);
    onClose();
  };

  return (
    <div className="size-full flex flex-col bg-canvas">
      <AppHeader
        title="Add from Google Photos"
        onBack={step === "select" ? onClose : () => setStep("select")}
      />
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {step === "select" && (
            <Select
              key="select"
              drafts={drafts}
              onToggle={(id) =>
                setDrafts((p) => p.map((d) => (d.id === id ? { ...d, include: !d.include } : d)))
              }
              onContinue={() => setStep("processing")}
              count={selected.length}
            />
          )}
          {step === "processing" && (
            <Processing key="processing" onDone={() => setStep("review")} />
          )}
          {step === "review" && (
            <Review
              key="review"
              drafts={selected}
              setDrafts={setDrafts}
              onDone={finish}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- Select ---------- */
function Select({
  drafts,
  onToggle,
  onContinue,
  count,
}: {
  drafts: Draft[];
  onToggle: (id: string) => void;
  onContinue: () => void;
  count: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="size-full flex flex-col"
    >
      <div className="px-4 pt-1">
        <h1 className="font-display text-[22px] font-[700] text-ink leading-tight">
          Choose photos to add
        </h1>
        <p className="text-[13px] text-ink-soft mt-1">
          We picked recent shots that look like activity moments. Tap to include or leave out.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto scroll-area px-4 mt-4">
        <div className="grid grid-cols-3 gap-2">
          {drafts.map((d) => (
            <button
              key={d.id}
              onClick={() => onToggle(d.id)}
              className="relative aspect-square rounded-2xl overflow-hidden bg-mint active:scale-[0.98] transition-transform"
            >
              <img src={d.url} alt="" className="size-full object-cover" />
              <span
                className={`absolute inset-0 transition-colors ${
                  d.include ? "bg-teal/10" : "bg-ink/30"
                }`}
              />
              <span
                className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full grid place-items-center border-2 border-white transition-colors ${
                  d.include ? "bg-teal text-white" : "bg-white/30"
                }`}
              >
                {d.include && <Check size={14} strokeWidth={3} />}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="shrink-0 px-4 pt-3 pb-8 border-t border-hairline bg-canvas">
        <PrimaryButton onClick={onContinue} disabled={count === 0}>
          Continue with {count} photo{count === 1 ? "" : "s"}
        </PrimaryButton>
      </div>
    </motion.div>
  );
}

/* ---------- Processing ---------- */
function Processing({ onDone }: { onDone: () => void }) {
  const stages = [
    "Processing photos",
    "Matching to your children",
    "Finding likely activities",
    "Checking for achievements",
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i >= stages.length) {
      const t = setTimeout(onDone, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setI((v) => v + 1), 750);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="size-full flex flex-col items-center justify-center px-10"
    >
      <motion.span
        className="grid place-items-center w-16 h-16 rounded-3xl bg-mint text-teal-dark mb-7"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
      >
        <Sparkles size={28} />
      </motion.span>
      <div className="w-full max-w-[260px] space-y-3">
        {stages.map((s, idx) => {
          const done = idx < i;
          const active = idx === i;
          return (
            <div key={s} className="flex items-center gap-3">
              <span
                className={`grid place-items-center w-5 h-5 rounded-full shrink-0 transition-colors ${
                  done ? "bg-teal text-white" : active ? "bg-mint" : "bg-hairline/60"
                }`}
              >
                {done ? (
                  <Check size={12} strokeWidth={3} />
                ) : active ? (
                  <motion.span
                    className="w-2 h-2 rounded-full bg-teal"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                ) : null}
              </span>
              <span
                className={`text-[14px] transition-colors ${
                  done || active ? "text-ink font-[600]" : "text-ink-soft"
                }`}
              >
                {s}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ---------- Review ---------- */
function Review({
  drafts,
  setDrafts,
  onDone,
}: {
  drafts: Draft[];
  setDrafts: React.Dispatch<React.SetStateAction<Draft[]>>;
  onDone: () => void;
}) {
  const [childSheetFor, setChildSheetFor] = useState<string | null>(null);
  const [actSheetFor, setActSheetFor] = useState<string | null>(null);

  const patch = (id: string, p: Partial<Draft>) =>
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, ...p } : d)));

  const uncertain = drafts.filter((d) => !d.confident).length;
  const actForSheet = actSheetFor ? drafts.find((d) => d.id === actSheetFor) : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className="size-full flex flex-col"
    >
      <div className="px-4 pt-1">
        <h1 className="font-display text-[22px] font-[700] text-ink leading-tight">
          Confirm the matches
        </h1>
        <p className="text-[13px] text-ink-soft mt-1">
          {uncertain > 0
            ? `${uncertain} need a quick check — the rest look right.`
            : "Everything looks matched. Adjust anything that's off."}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto scroll-area px-4 mt-4 space-y-2.5 pb-4">
        {drafts.map((d) => {
          const child = childById(d.childId);
          const activity = activityById(d.activityId);
          return (
            <div
              key={d.id}
              className={`rounded-2xl border bg-surface p-3 ${
                d.confident ? "border-hairline" : "border-gold/40"
              }`}
            >
              <div className="flex gap-3">
                <img
                  src={d.url}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover bg-mint shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {d.confident ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-[700] text-teal bg-mint px-2 py-0.5 rounded-full">
                        <Check size={11} strokeWidth={3} /> Matched
                      </span>
                    ) : (
                      <span className="text-[11px] font-[700] text-[#a3762a] bg-gold-soft px-2 py-0.5 rounded-full">
                        Needs your review
                      </span>
                    )}
                    <span className="text-[11.5px] text-ink-soft ml-auto">
                      {fmtMonth(d.date)}
                    </span>
                  </div>

                  <div className="flex gap-1.5 mt-2">
                    <button
                      onClick={() => setChildSheetFor(d.id)}
                      className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-canvas border border-hairline text-[12.5px] font-[600] text-ink"
                    >
                      <ChildAvatar src={child?.photo} name={child?.name ?? ""} size={20} />
                      {child?.name}
                    </button>
                    <button
                      onClick={() => setActSheetFor(d.id)}
                      className="flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-full bg-canvas border border-hairline text-[12.5px] font-[600] text-ink"
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: CATEGORY_COLOR[activity!.category] }}
                      />
                      {activity?.name}
                      <ChevronRight size={13} className="text-ink-soft" />
                    </button>
                  </div>
                </div>
              </div>

              {d.achievement && (
                <button
                  onClick={() => patch(d.id, { isAchievement: !d.isAchievement })}
                  className="w-full mt-2.5 flex items-center gap-2.5 rounded-xl bg-gold-soft/60 border border-gold/20 p-2.5 text-left"
                >
                  <span className="grid place-items-center w-8 h-8 rounded-lg bg-gold-soft text-gold shrink-0">
                    <MilestoneStar size={16} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-[600] text-ink truncate">
                      {d.achievement}
                    </p>
                    <p className="text-[11px] text-ink-soft">Mark as an achievement</p>
                  </div>
                  <span
                    className={`w-10 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
                      d.isAchievement ? "bg-gold" : "bg-hairline"
                    }`}
                  >
                    <motion.span
                      layout
                      className="block w-5 h-5 rounded-full bg-white shadow"
                      style={{ marginLeft: d.isAchievement ? 16 : 0 }}
                    />
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="shrink-0 px-4 pt-3 pb-8 border-t border-hairline bg-canvas">
        <PrimaryButton onClick={onDone}>
          Add {drafts.length} photo{drafts.length === 1 ? "" : "s"} to timeline
        </PrimaryButton>
      </div>

      {/* Child picker */}
      <ChildSheet
        open={!!childSheetFor}
        onClose={() => setChildSheetFor(null)}
        childId={childSheetFor ? drafts.find((d) => d.id === childSheetFor)!.childId : "reet"}
        onSelect={(id) => {
          if (childSheetFor) {
            const first = activitiesFor(id as string)[0];
            patch(childSheetFor, {
              childId: id as string,
              ...(first ? { activityId: first.id } : {}),
            });
          }
        }}
        allowAll={false}
      />

      {/* Activity picker */}
      <Sheet open={!!actSheetFor} onClose={() => setActSheetFor(null)}>
        <h3 className="font-display text-[18px] font-[700] text-ink px-1 mb-2">Which activity?</h3>
        <div className="space-y-1.5 max-h-[320px] overflow-y-auto scroll-area">
          {actForSheet &&
            activitiesFor(actForSheet.childId).map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  patch(actForSheet.id, { activityId: a.id });
                  setActSheetFor(null);
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
    </motion.div>
  );
}
