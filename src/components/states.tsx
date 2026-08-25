import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { Check } from "lucide-react";

/* ============================================================= EMPTY STATE
   One consistent empty state with exactly one clear next step. */
export function EmptyState({
  icon,
  title,
  body,
  actionLabel,
  onAction,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="px-8 py-12 flex flex-col items-center text-center">
      <span className="grid place-items-center w-14 h-14 rounded-2xl bg-mint text-teal-dark mb-4">
        {icon}
      </span>
      <h3 className="font-display text-[18px] font-[700] text-ink leading-snug max-w-[260px]">
        {title}
      </h3>
      <p className="text-[13.5px] text-ink-soft mt-2 max-w-[250px] leading-relaxed">{body}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 h-11 px-6 rounded-xl bg-teal text-white font-[600] text-[14px] active:scale-95 transition-transform"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* ============================================================= SKELETONS */
export function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-hairline/60 ${className}`}>
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)",
        }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
      />
    </div>
  );
}

/* Gantt loading — keeps the label column + axis + row structure visible. */
export function GanttSkeleton({ height = 430 }: { height?: number }) {
  const rows = [0.62, 0.9, 0.42, 0.75, 0.55];
  return (
    <div
      className="rounded-[22px] bg-surface border border-hairline overflow-hidden"
      style={{ height }}
    >
      {/* axis */}
      <div className="flex items-center gap-6 h-[34px] border-b border-hairline pl-[88px] pr-4">
        {[0, 1, 2, 3].map((i) => (
          <Shimmer key={i} className="h-2.5 w-8 rounded-full" />
        ))}
      </div>
      {rows.map((w, i) => (
        <div key={i} className="flex items-center" style={{ height: 54 }}>
          <div className="w-[88px] pl-3 pr-2 border-r border-hairline h-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-hairline shrink-0" />
            <Shimmer className="h-2.5 flex-1 rounded-full" />
          </div>
          <div className="flex-1 px-4">
            <Shimmer
              className="h-[22px] rounded-full"
              // stagger the bar starts so it reads as a timeline, not a table
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-surface border border-hairline p-3 flex items-center gap-3.5">
      <Shimmer className="w-12 h-12 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-3 w-2/3 rounded-full" />
        <Shimmer className="h-2.5 w-1/2 rounded-full" />
      </div>
    </div>
  );
}

/* ============================================================= SUCCESS TOAST
   A tiny module-level bus so any screen can fire subtle success feedback. */
type ToastListener = (msg: string) => void;
let toastListener: ToastListener | null = null;
export function showToast(msg: string) {
  toastListener?.(msg);
}

export function ToastHost() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    toastListener = (m: string) => {
      setMsg(m);
      clearTimeout(timer);
      timer = setTimeout(() => setMsg(null), 2200);
    };
    return () => {
      toastListener = null;
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {msg && (
        <motion.div
          className="absolute left-1/2 bottom-24 z-[60] -translate-x-1/2"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 460, damping: 32 }}
        >
          <div className="flex items-center gap-2.5 rounded-full bg-ink text-white pl-2 pr-4 py-2 shadow-[0_12px_30px_-8px_rgba(23,35,33,0.5)]">
            <span className="grid place-items-center w-6 h-6 rounded-full bg-teal">
              <Check size={14} strokeWidth={3} />
            </span>
            <span className="text-[13.5px] font-[600] whitespace-nowrap">{msg}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
