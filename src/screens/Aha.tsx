import { motion } from "framer-motion";
import { PartyPopper, Trophy } from "lucide-react";
import { Screen, PrimaryButton, StatItem } from "../components/ui";
import { LevelBadge } from "../components/level";
import {
  achievementsFor,
  activitiesFor,
  activityById,
  durationText,
  fmtMonth,
  PHOTO_CANDIDATES,
} from "../data";

const RANGE_START = 2019;
const RANGE_END = 2026;
const SPAN = RANGE_END - RANGE_START;

const REET_ACTIVITIES = activitiesFor("reet");
const REET_ACHIEVEMENTS = achievementsFor("reet")
  .slice()
  .sort((a, b) => b.date.y - a.date.y)
  .slice(0, 3);

export function Aha({
  childName,
  onExplore,
}: {
  childName: string;
  onExplore: () => void;
}) {
  return (
    <Screen>
      <div className="flex-1 overflow-y-auto scroll-area px-4 pt-16 pb-6 flex flex-col">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          className="shrink-0 self-start grid place-items-center w-14 h-14 rounded-2xl bg-gold-soft text-gold mb-5"
        >
          <PartyPopper size={26} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-[28px] font-[700] text-ink leading-[1.1]"
        >
          {childName}'s activity
          <br />
          history is ready.
        </motion.h1>
        <p className="text-[15px] text-ink-soft mt-2">
          Here's what PROUDLY organized from your Calendar and Photos.
        </p>

        {/* Summary stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 flex rounded-3xl bg-surface border border-hairline py-5 divide-x divide-hairline"
        >
          <StatItem value="8" label="Activities" />
          <StatItem value="5" label="Achievements" accent />
          <StatItem value="4" label="Years" />
        </motion.div>

        {/* Photos added from Google Photos review */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mt-6"
        >
          <SectionLabel>Photos added from Google Photos</SectionLabel>
          <div className="flex gap-2 overflow-x-auto scroll-area">
            {PHOTO_CANDIDATES.map((p) => {
              const act = activityById(p.activityId);
              return (
                <div key={p.id} className="shrink-0">
                  <div className="relative w-20 h-24 rounded-2xl overflow-hidden bg-mint">
                    <img src={p.url} alt={act?.name ?? ""} className="size-full object-cover" />
                    {p.achievement && (
                      <div className="absolute top-1.5 left-1.5 grid place-items-center w-5 h-5 rounded-full bg-gold shadow-sm">
                        <Trophy size={10} className="text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-[10.5px] text-ink-soft mt-1 w-20 truncate">{act?.name}</p>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Journey preview */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <SectionLabel>Activity journey</SectionLabel>
          <div className="rounded-3xl bg-surface border border-hairline px-4 pt-1 pb-3 divide-y divide-hairline/70">
            {REET_ACTIVITIES.map((a, i) => {
              const startY = a.start.y;
              const endY = a.end === "present" ? RANGE_END : a.end.y;
              const left = ((startY - RANGE_START) / SPAN) * 100;
              const width = ((endY - startY) / SPAN) * 100;
              const present = a.end === "present";
              return (
                <div key={a.id} className="py-3.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[15px] font-[600] text-ink truncate">{a.name}</span>
                    <LevelBadge activity={a} />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-[11.5px] text-ink-soft">
                    <span className="tabular-nums">
                      {startY} – {present ? "Present" : endY}
                    </span>
                    <span aria-hidden>·</span>
                    <span>{durationText(a.start, a.end)}</span>
                    {present && (
                      <span
                        className="ml-0.5 w-1.5 h-1.5 rounded-full bg-teal shrink-0"
                        aria-label="Ongoing"
                      />
                    )}
                  </div>
                  <div className="relative h-1.5 rounded-full bg-canvas overflow-hidden mt-2.5">
                    <motion.div
                      className="absolute h-full rounded-full"
                      style={{
                        left: `${left}%`,
                        background: present
                          ? "linear-gradient(90deg,#217c72,#2f9c8f)"
                          : "#9dbfb8",
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="flex justify-between pt-3.5 text-[11px] text-ink-soft tabular-nums">
              <span>{RANGE_START}</span>
              <span>Present</span>
            </div>
          </div>
        </motion.section>

        {/* Achievements */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <SectionLabel>Recent milestones</SectionLabel>
          <div className="space-y-2.5">
            {REET_ACHIEVEMENTS.map((ach) => (
              <div
                key={ach.id}
                className="flex items-center gap-3.5 rounded-2xl bg-surface border border-hairline p-3.5"
              >
                <span className="grid place-items-center w-10 h-10 rounded-xl bg-gold-soft text-gold shrink-0">
                  <Trophy size={19} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14.5px] font-[600] text-ink leading-tight truncate">
                    {ach.title}
                  </p>
                  <p className="text-[12.5px] text-ink-soft mt-0.5">
                    {activityById(ach.activityId)?.name} · {fmtMonth(ach.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <div className="pt-7 pb-2">
          <PrimaryButton onClick={onExplore}>Explore {childName}'s activities</PrimaryButton>
        </div>
      </div>
    </Screen>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[12px] font-[600] text-ink-soft uppercase tracking-[0.08em] mb-2.5 ml-0.5">
      {children}
    </p>
  );
}
