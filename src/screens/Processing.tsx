import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Check, Image, Loader2, Sparkles, Trophy } from "lucide-react";
import { Screen } from "../components/ui";
import { Mark } from "../components/Logo";

const TASKS = [
  { label: "Checking Calendar", icon: Calendar },
  { label: "Reviewing Photos", icon: Image },
  { label: "Organizing activities", icon: Sparkles },
  { label: "Identifying achievements", icon: Trophy },
];

export function Processing({
  childName,
  onDone,
}: {
  childName: string;
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= TASKS.length) {
      const t = setTimeout(onDone, 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 1150);
    return () => clearTimeout(t);
  }, [step, onDone]);

  const pct = Math.min(100, Math.round((step / TASKS.length) * 100));

  return (
    <Screen>
      <div className="flex-1 flex flex-col px-7 pt-24 pb-12">
        <div className="flex flex-col items-center">
          <div className="relative grid place-items-center">
            <motion.span
              className="absolute w-24 h-24 rounded-full border-2 border-teal/20 border-t-teal"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
            />
            <div className="w-16 h-16 grid place-items-center">
              <Mark size={40} />
            </div>
          </div>

          <h1 className="font-display text-[24px] font-[700] text-ink text-center mt-8 leading-tight">
            Building {childName}'s
            <br />
            activity history
          </h1>
          <p className="text-[14.5px] text-ink-soft mt-2 text-center">
            This only takes a moment.
          </p>

          {/* Progress bar */}
          <div className="w-full mt-6 h-1.5 rounded-full bg-hairline overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-teal"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="mt-9 space-y-2.5">
          {TASKS.map((t, i) => {
            const done = i < step;
            const active = i === step;
            const Icon = t.icon;
            return (
              <motion.div
                key={t.label}
                animate={{ opacity: done || active ? 1 : 0.4 }}
                className={`flex items-center gap-3.5 rounded-2xl px-4 py-3.5 border transition-colors ${
                  active ? "bg-surface border-teal/40" : "bg-surface/60 border-hairline"
                }`}
              >
                <span
                  className="grid place-items-center w-9 h-9 rounded-xl shrink-0"
                  style={{ background: done ? "#dcefeb" : "#f2f4f1", color: done ? "#175f58" : "#66716e" }}
                >
                  {done ? (
                    <Check size={18} strokeWidth={3} />
                  ) : active ? (
                    <Loader2 size={17} className="animate-spin text-teal" />
                  ) : (
                    <Icon size={17} />
                  )}
                </span>
                <span className={`text-[15px] font-[500] ${done || active ? "text-ink" : "text-ink-soft"}`}>
                  {t.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Screen>
  );
}
