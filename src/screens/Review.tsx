import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Pencil, Trophy, X } from "lucide-react";
import { Screen, AppHeader, PrimaryButton } from "../components/ui";
import { StepDots } from "../components/StepDots";

type ReviewItem = {
  question: string;
  guess: string;
  image: string;
  achievement?: boolean;
};

const ITEMS: ReviewItem[] = [
  {
    question: "Is this Soccer?",
    guess: "Saturday mornings · 2021–2024",
    image: "https://images.unsplash.com/photo-1622659097509-4d56de14539e?w=600&h=520&fit=crop&auto=format",
  },
  {
    question: "This may be an achievement",
    guess: "Grade 3 Piano — Distinction",
    image: "https://images.unsplash.com/photo-1590581296894-3c897baa0e54?w=600&h=520&fit=crop&auto=format",
    achievement: true,
  },
  {
    question: "Is this Reet?",
    guess: "Found across 24 photos",
    image: "https://images.unsplash.com/photo-1762444760659-54caed7cbb1a?w=600&h=520&fit=crop&auto=format",
  },
];

export function Review({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);

  const next = () => {
    if (index + 1 >= ITEMS.length) return onDone();
    setDir(1);
    setIndex((i) => i + 1);
  };

  const item = ITEMS[index];

  return (
    <Screen>
      <AppHeader title="Quick check" onBack={onBack} trailing={<SkipButton onClick={onDone} />} />
      <div className="flex-1 px-4 pt-3 flex flex-col">
        <StepDots total={3} current={2} />

        <h1 className="font-display text-[25px] font-[700] text-ink leading-tight mt-5">
          A couple of things to confirm
        </h1>
        <p className="text-[15px] text-ink-soft mt-1 pr-4">
          We handle the obvious — just help us with a few uncertain ones.
        </p>

        <div className="flex-1 relative mt-7" style={{ minHeight: 340 }}>
          <AnimatePresence custom={dir} mode="popLayout">
            <motion.div
              key={index}
              custom={dir}
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, x: dir * -60, rotate: dir * -4 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-0"
            >
              <div className="rounded-3xl overflow-hidden bg-surface border border-hairline shadow-[0_24px_48px_-24px_rgba(23,35,33,0.35)]">
                <div className="relative h-[240px] bg-mint">
                  <img loading="lazy" decoding="async" src={item.image} alt="" className="size-full object-cover" />
                  {item.achievement && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 h-8 pl-2 pr-3 rounded-full bg-gold-soft text-gold text-[12.5px] font-[600]">
                      <Trophy size={14} /> Possible milestone
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-[13px] font-[600] text-ink-soft uppercase tracking-wide">
                    {item.achievement ? "Add to achievements?" : "Our best guess"}
                  </p>
                  <h2 className="font-display text-[22px] font-[700] text-ink mt-1.5 leading-tight">
                    {item.question}
                  </h2>
                  <p className="text-[14.5px] text-ink-soft mt-1">{item.guess}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="pb-6 pt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={next}
              className="h-14 w-14 grid place-items-center rounded-2xl bg-surface border border-hairline text-ink-soft active:scale-95 transition-transform"
            >
              <X size={22} strokeWidth={2.4} />
            </button>
            <button
              onClick={next}
              className="h-14 flex-1 grid place-items-center rounded-2xl bg-surface border border-hairline text-ink font-[600] text-[15px] active:scale-[0.98] transition-transform"
            >
              <span className="flex items-center gap-2">
                <Pencil size={16} /> Not quite
              </span>
            </button>
            <button
              onClick={next}
              className="h-14 flex-1 grid place-items-center rounded-2xl bg-teal text-white font-[600] text-[15px] shadow-[0_10px_24px_-10px_rgba(33,124,114,0.7)] active:scale-[0.98] transition-transform"
            >
              <span className="flex items-center gap-2">
                <Check size={18} strokeWidth={2.6} /> Yes
              </span>
            </button>
          </div>
          <p className="text-center text-[13px] text-ink-soft mt-3">
            {index + 1} of {ITEMS.length}
          </p>
        </div>
      </div>
    </Screen>
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
