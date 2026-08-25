import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BellOff, Calendar, ChevronRight, Images, RefreshCw } from "lucide-react";
import { AppHeader } from "../components/ui";
import { EmptyState } from "../components/states";
import { MilestoneStar } from "../components/proudly";
import { NOTIFICATIONS, type NotifKind, type Notification } from "../data";

export type NotifTarget = "discovery" | "photos" | "sources";

const TARGET: Record<NotifKind, NotifTarget | null> = {
  activities: "discovery",
  achievement: "discovery",
  photos: "photos",
  reconnect: "sources",
  sync: null,
};

function Glyph({ kind }: { kind: NotifKind }) {
  const base = "grid place-items-center w-10 h-10 rounded-xl shrink-0";
  if (kind === "achievement")
    return (
      <span className={`${base} bg-gold-soft text-gold`}>
        <MilestoneStar size={19} />
      </span>
    );
  if (kind === "photos")
    return (
      <span className={`${base} bg-mint text-teal-dark`}>
        <Images size={19} />
      </span>
    );
  if (kind === "reconnect")
    return (
      <span className={`${base} bg-gold-soft text-[#a3762a]`}>
        <RefreshCw size={18} />
      </span>
    );
  if (kind === "sync")
    return (
      <span className={`${base} bg-canvas text-ink-soft border border-hairline`}>
        <Calendar size={18} />
      </span>
    );
  return (
    <span className={`${base} bg-mint text-teal-dark`}>
      <Calendar size={18} />
    </span>
  );
}

export function Notifications({
  onBack,
  onDeepLink,
}: {
  onBack: () => void;
  onDeepLink: (t: NotifTarget) => void;
}) {
  const [items, setItems] = useState<Notification[]>(NOTIFICATIONS);
  const unread = items.filter((n) => !n.read).length;

  const open = (n: Notification) => {
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    const t = TARGET[n.kind];
    if (t) onDeepLink(t);
  };

  const markAll = () => setItems((prev) => prev.map((x) => ({ ...x, read: true })));

  return (
    <div className="size-full flex flex-col bg-canvas">
      <AppHeader
        title="Notifications"
        onBack={onBack}
        trailing={
          unread > 0 ? (
            <button
              onClick={markAll}
              className="text-[12.5px] font-[600] text-teal active:opacity-60 pr-1 whitespace-nowrap"
            >
              Mark read
            </button>
          ) : (
            <span className="w-10" />
          )
        }
      />
      <div className="flex-1 overflow-y-auto scroll-area pb-8">
        {items.length === 0 ? (
          <EmptyState
            icon={<BellOff size={26} />}
            title="You're all caught up"
            body="We'll let you know when there's a new activity, achievement, or photo to review."
            actionLabel="Back to Home"
            onAction={onBack}
          />
        ) : (
          <div className="px-4 pt-1">
            {unread > 0 && (
              <p className="text-[12px] font-[600] text-ink-soft uppercase tracking-[0.08em] mb-2.5 ml-0.5">
                {unread} new
              </p>
            )}
            <div className="space-y-2.5">
              <AnimatePresence initial={false}>
                {items.map((n) => {
                  const actionable = TARGET[n.kind] !== null;
                  return (
                    <motion.button
                      key={n.id}
                      layout
                      onClick={() => open(n)}
                      disabled={!actionable}
                      className={`w-full flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors ${
                        n.read
                          ? "bg-surface border-hairline"
                          : "bg-surface border-teal/30 shadow-xs"
                      } ${actionable ? "active:scale-[0.99]" : "cursor-default"}`}
                    >
                      <Glyph kind={n.kind} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-[600] text-ink leading-snug flex-1">
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="mt-1 w-2 h-2 rounded-full bg-teal shrink-0" />
                          )}
                        </div>
                        <p className="text-[12.5px] text-ink-soft mt-0.5 leading-snug">
                          {n.body}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[11.5px] text-ink-soft/80">{n.time}</span>
                          {actionable && (
                            <span className="flex items-center gap-0.5 text-[12px] font-[600] text-teal">
                              Review <ChevronRight size={14} />
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
