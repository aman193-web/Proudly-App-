import { motion } from "framer-motion";
import { Screen } from "../components/ui";
import { Mark } from "../components/Logo";

/* Welcome — first screen ported to the Oct-1 redesign.
   -----------------------------------------------------
   Built from the client prototype, which strips this screen back to the mark,
   the name, one line, and two buttons. Two removals are deliberate on their
   side, not oversights:

   - the Lottie award ribbon is gone; the mark and wordmark carry the top of
     the screen on their own
   - the "turns your Calendar and Photos into…" paragraph is gone, per their
     note "tagline under 7 words, no source names"

   Colours and type come from the redesign tokens (pine/cream/Figtree) rather
   than the app's teal set — this screen is ported, the rest are not yet. The
   entrance timings are the app's existing ones, so it still moves like itself. */
export function Welcome({
  onStart,
  onSignIn,
}: {
  onStart: () => void;
  onSignIn: () => void;
}) {
  return (
    <Screen>
      <div className="flex-1 flex flex-col bg-cream font-figtree px-7 pb-6">
        {/* Mark + wordmark, centred in the space above the copy */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <Mark size={80} color="#24644F" />
          </motion.div>
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="font-[700] text-[28px] tracking-[-0.03em] text-ink"
          >
            BragOn
          </motion.span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22 }}
        >
          <h2
            className="font-[700] text-[32px] leading-[1.12] tracking-[-0.025em] text-ink mb-7"
            style={{ textWrap: "balance" }}
          >
            Their journey, kept automatically.
          </h2>

          <button
            onClick={onStart}
            className="h-14 w-full rounded-[28px] bg-pine text-white font-[600] text-[16px]
              shadow-[0_10px_24px_-10px_rgba(36,100,79,0.7)]
              active:scale-[0.98] transition-transform duration-150"
          >
            Get started
          </button>
          <button
            onClick={onSignIn}
            className="h-12 w-full mt-1.5 text-pine font-[600] text-[15px] active:opacity-60 transition-opacity"
          >
            I already have an account
          </button>
        </motion.div>
      </div>
    </Screen>
  );
}
