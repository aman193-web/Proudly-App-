import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, GraduationCap, Lightbulb, X } from "lucide-react";
import { AiCoachMark } from "../components/AiCoachMark";
import {
  type AskContext,
  type ChatMessage,
  AskProudlyError,
  getAskProudlyProvider,
  newMessage,
  suggestedPrompts,
} from "../lib/askProudly";

/* Ask PROUDLY sheet
   -----------------
   Opens as a bottom sheet and drags up into a full-height one, the way
   Gemini's assistant sheet behaves. Two snap points:

     collapsed  — the sheet covers the lower part of the screen
     expanded   — the sheet fills it

   Drag up to expand, down to collapse, and down again to dismiss. The handle
   is also a button, so expanding never requires a drag. */

/* Snap heights, as a share of the screen. The panel is anchored to the bottom
   and its height animates, so the composer stays visible in both states —
   translating a full-height panel downward would push the input off-screen. */
const COLLAPSED_H = "50%";
/* Stops below the status bar and Dynamic Island — a full-height sheet that
   runs under system chrome hides its own header. */
const EXPANDED_H = "calc(100% - 48px)";
/** Drag distance that counts as a deliberate gesture rather than a wobble. */
const DRAG_THRESHOLD = 44;

export function AskProudlySheet({
  context,
  onClose,
  onFindCoach,
}: {
  /** null closes the sheet. */
  context: AskContext | null;
  onClose: () => void;
  /** Hands the coach request back to the app's existing coach flow. */
  onFindCoach: (activityId: string) => void;
}) {
  return (
    <AnimatePresence>
      {context && (
        <>
          <motion.div
            className="absolute inset-0 z-40 bg-ink/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <Panel context={context} onClose={onClose} onFindCoach={onFindCoach} />
        </>
      )}
    </AnimatePresence>
  );
}

function Panel({
  context,
  onClose,
  onFindCoach,
}: {
  context: AskContext;
  onClose: () => void;
  onFindCoach: (activityId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const prompts = suggestedPrompts(context);
  const activity = context.activity;

  useEffect(() => () => abortRef.current?.abort(), []);

  // Keep the newest message in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy) return;

    // Asking is the point at which the small sheet stops being enough.
    setExpanded(true);

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const history = messages;
    setMessages((m) => [...m, newMessage("user", q)]);
    setDraft("");
    setError(null);
    setBusy(true);

    try {
      const reply = await getAskProudlyProvider().send(
        { question: q, context, history },
        ctrl.signal,
      );
      if (ctrl.signal.aborted) return;
      setMessages((m) => [...m, newMessage("assistant", reply.text, reply.action)]);
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setError(e instanceof AskProudlyError ? e.message : "Something went wrong. Try again.");
    } finally {
      if (!ctrl.signal.aborted) setBusy(false);
    }
  };

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[28px] bg-canvas shadow-[0_-16px_40px_-12px_rgba(23,35,33,0.28)]"
      initial={{ y: "100%" }}
      animate={{ y: 0, height: expanded ? EXPANDED_H : COLLAPSED_H }}
      exit={{ y: "100%", transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
      transition={{
        y: { type: "spring", stiffness: 340, damping: 32, mass: 0.9 },
        height: { type: "spring", stiffness: 300, damping: 30 },
      }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.14, bottom: 0.22 }}
      onDragEnd={(_, info) => {
        // Drag up expands; drag down collapses, then dismisses.
        if (info.offset.y < -DRAG_THRESHOLD) setExpanded(true);
        else if (info.offset.y > DRAG_THRESHOLD) {
          if (expanded) setExpanded(false);
          else onClose();
        }
      }}
    >
      {/* Drag handle — also toggles, so expanding never requires a drag */}
      <button
        onClick={() => setExpanded((e) => !e)}
        aria-label={expanded ? "Collapse Ask PROUDLY" : "Expand Ask PROUDLY"}
        aria-expanded={expanded}
        className="shrink-0 pt-2.5 pb-1.5 grid place-items-center cursor-grab active:cursor-grabbing"
      >
        <span className="h-1.5 w-11 rounded-full bg-hairline" />
      </button>

      {/* Header */}
      <div className="shrink-0 px-4 pb-3">
        <div className="flex items-start gap-3">
          <span
            className="grid place-items-center w-10 h-10 rounded-2xl text-white shrink-0"
            style={{ background: "linear-gradient(135deg,#2a9184 0%,#217c72 55%,#175f58 100%)" }}
          >
            <AiCoachMark size={25} haloColor="#23857b" />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-[19px] font-[700] text-ink leading-tight">
              Ask PROUDLY
            </h2>
            <p className="text-[12.5px] text-ink-soft leading-snug mt-0.5">
              Ask about your child's activities, progress, and next steps.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Ask PROUDLY"
            className="grid place-items-center w-9 h-9 rounded-full bg-surface border border-hairline text-ink shrink-0 active:scale-95 transition-transform"
          >
            <X size={17} />
          </button>
        </div>

        {/* Activity context, when opened from an activity */}
        {activity && (
          <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-xl bg-surface border border-hairline px-3 py-2">
            <span className="text-[13px] font-[700] text-ink">{activity.name}</span>
            <span className="text-[11.5px] text-ink-soft">
              Current: <span className="font-[600] text-ink">{activity.currentLevel}</span>
            </span>
            {activity.nextLevel && (
              <span className="text-[11.5px] text-ink-soft">
                Next: <span className="font-[600] text-teal">{activity.nextLevel}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Conversation */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto scroll-area px-4">
        {messages.length === 0 && (
          <div className="pb-2">
            <div className="space-y-2">
              {prompts.map((p, i) => (
                <motion.button
                  key={p}
                  onClick={() => ask(p)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.07, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full flex items-center gap-3 text-left rounded-2xl bg-mint/45 px-3 py-2.5 active:bg-mint transition-colors"
                >
                  <span className="grid place-items-center w-9 h-9 rounded-xl bg-surface text-teal shrink-0">
                    <Lightbulb size={17} />
                  </span>
                  <span className="text-[13.5px] text-ink leading-snug">{p}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 pb-2">
          {messages.map((m) =>
            m.role === "user" ? (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="flex justify-end"
              >
                <p className="max-w-[82%] rounded-2xl rounded-br-md bg-teal text-white px-3.5 py-2.5 text-[14px] leading-relaxed">
                  {m.text}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="flex gap-2.5"
              >
                <span className="grid place-items-center w-7 h-7 rounded-lg bg-mint text-teal-dark shrink-0 mt-0.5">
                  <AiCoachMark size={17} haloColor="#dcefeb" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="rounded-2xl rounded-tl-md bg-surface border border-hairline px-3.5 py-2.5 text-[14px] text-ink leading-relaxed whitespace-pre-line">
                    {m.text}
                  </p>
                  {/* Reuses the existing coach flow — no coach UI in here. */}
                  {m.action?.kind === "findCoach" && (
                    <button
                      onClick={() => onFindCoach(m.action!.activityId)}
                      className="mt-2 h-10 rounded-xl bg-teal text-white px-3.5 inline-flex items-center gap-1.5 text-[13px] font-[600] active:scale-[0.99] transition-transform"
                    >
                      <GraduationCap size={15} /> {m.action.label}
                    </button>
                  )}
                </div>
              </motion.div>
            ),
          )}

          {busy && (
            <div className="flex gap-2.5">
              <span className="grid place-items-center w-7 h-7 rounded-lg bg-mint text-teal-dark shrink-0 mt-0.5">
                <AiCoachMark size={17} haloColor="#dcefeb" />
              </span>
              <div className="rounded-2xl rounded-tl-md bg-surface border border-hairline px-4 py-3.5 flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-ink-soft/50 animate-pulse"
                    style={{ animationDelay: `${i * 160}ms` }}
                  />
                ))}
                <span className="sr-only">PROUDLY is responding</span>
              </div>
            </div>
          )}

          {error && (
            <p className="text-[12.5px] font-[500] text-[#c0504a] bg-[#fbeceb] border border-[#e2b6b0] rounded-xl px-3 py-2">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Composer — pinned, clear of the home indicator */}
      <div className="shrink-0 border-t border-hairline bg-canvas px-4 pt-3 pb-7">
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={() => setExpanded(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask(draft);
              }
            }}
            rows={1}
            placeholder="Ask about progress, next steps…"
            className="flex-1 min-w-0 max-h-24 resize-none rounded-2xl bg-surface border border-hairline px-4 py-3 text-[15px] text-ink outline-none focus:border-teal focus:ring-4 focus:ring-teal/10 transition placeholder:text-ink-soft/60"
          />
          <button
            onClick={() => ask(draft)}
            disabled={!draft.trim() || busy}
            aria-label="Send"
            className="w-12 h-12 shrink-0 grid place-items-center rounded-2xl bg-teal text-white active:scale-95 transition-transform disabled:opacity-40"
          >
            <ArrowUp size={20} strokeWidth={2.5} />
          </button>
        </div>
        <p className="text-[11px] text-ink-soft/70 text-center mt-2.5">
          PROUDLY can make mistakes. Check anything important.
        </p>
      </div>
    </motion.div>
  );
}
