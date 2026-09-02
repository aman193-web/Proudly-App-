import { Plus } from "lucide-react";
import { AiCoachMark } from "./AiCoachMark";

/* Floating actions
   ----------------
   One container owns FAB positioning for the whole app, so the arrangement
   can't drift between screens.

       Add (+)            optional, only where the screen has an add action
          ↑  14px
     Ask PROUDLY          always present, in the original Add FAB position
          ↑
     Bottom navigation

   The container is anchored at the old Add position (bottom-24 right-5) and
   stacks upward, so the AI action lands where Add used to sit and Add moves
   up by one button plus the gap.

   Both are icon-only circles. The AI button carries the brand gradient and
   the coach mark, which distinguishes it from the flat teal Add button. */

export function FabStack({
  onAskProudly,
  onAdd,
  addLabel = "Add",
}: {
  onAskProudly: () => void;
  /** Omit on screens with no add action — only the AI button renders. */
  onAdd?: () => void;
  addLabel?: string;
}) {
  return (
    <div className="absolute bottom-24 right-5 z-20 flex flex-col items-end gap-3.5">
      {onAdd && (
        <button
          onClick={onAdd}
          aria-label={addLabel}
          className="w-14 h-14 rounded-full grid place-items-center bg-teal text-white shadow-[0_12px_28px_-8px_rgba(33,124,114,0.7)] active:scale-95 transition-transform"
        >
          <Plus size={26} />
        </button>
      )}

      {/* Two quiet layers only: a soft glow and a quick sweep around the rim.
          The earlier version stacked five and ran slowly, which read as fussy.
          Both stop under prefers-reduced-motion. */}
      <div className="proudly-ambient relative w-14 h-14">
        <span
          aria-hidden
          className="absolute -inset-1.5 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(33,124,114,0.5) 0%, transparent 70%)",
            animation: "proudlyGlow 2.4s ease-in-out infinite",
          }}
        />
        <span
          aria-hidden
          className="absolute -inset-[1.5px] rounded-full pointer-events-none"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.75) 26deg, rgba(184,137,59,0.85) 52deg, transparent 88deg, transparent 360deg)",
            animation: "proudlySpin 2.2s linear infinite",
          }}
        />
        <button
          onClick={onAskProudly}
          aria-label="Ask PROUDLY"
          className="absolute inset-0 rounded-full grid place-items-center text-white
            shadow-[0_14px_30px_-8px_rgba(23,60,56,0.55)]
            active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg,#2a9184 0%,#217c72 45%,#175f58 100%)" }}
        >
          <AiCoachMark size={30} haloColor="#23857b" />
        </button>
      </div>
    </div>
  );
}
