import { Lottie } from "lottie-react";
import { motion } from "framer-motion";
import { Screen, PrimaryButton, TextLink } from "../components/ui";
import { Logo } from "../components/Logo";
import awardRibbonAnimation from "../imports/animated-award-ribbon-loop-2025-10-20-03-22-09-utc.json";

export function Welcome({
  onStart,
  onSignIn,
}: {
  onStart: () => void;
  onSignIn: () => void;
}) {
  return (
    <Screen>
      <div className="flex-1 flex flex-col px-4 pt-16 pb-9">
        {/* Lottie hero animation */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="w-64 h-64"
          >
            <Lottie
              src={awardRibbonAnimation}
              loop
              autoplay
              style={{ width: "100%", height: "100%" }}
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
        >
          <Logo className="mb-7" />
          <h1 className="font-display text-[34px] leading-[1.06] font-[700] text-ink tracking-tight">
            Their journey,
            <br />
            <span className="text-teal">tracked.</span>
          </h1>
          <p className="mt-4 text-[15.5px] leading-relaxed text-ink-soft pr-2">
            PROUDLY turns your Calendar and Photos into a lasting record of every
            activity, milestone, and proud moment.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="mt-8 space-y-4"
        >
          <PrimaryButton onClick={onStart}>Get started</PrimaryButton>
          <p className="text-center text-[14.5px] text-ink-soft">
            Already have an account? <TextLink onClick={onSignIn}>Sign in</TextLink>
          </p>
        </motion.div>
      </div>
    </Screen>
  );
}
