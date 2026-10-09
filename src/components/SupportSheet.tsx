import { useState } from "react";
import { Icon } from "./Icon";
import { Sheet } from "./Sheet";
import { type Activity, type Category, childById } from "../data";

/* Find support — Oct-1 redesign.
   -----------------------------
   The gradient button opens a sheet, not a screen: three picks for this
   activity and a field to ask a follow-up. The full coach search is still
   there and is what the first pick opens — the sheet is the quick answer,
   the search is the long one.

   Suggestions are generated from the activity's category rather than
   fetched, so the sheet always has something to show offline. */

type PickKind = "Coach" | "Competition" | "Camp" | "Gear";

const KIND_ICON: Record<PickKind, string> = {
  Coach: "school",
  Competition: "emoji_events",
  Camp: "wb_sunny",
  Gear: "shopping_bag",
};

/* Two or three things worth doing next, per category. */
const SUGGESTIONS: Partial<Record<Category, [PickKind, string, string][]>> = {
  "Music & Performance": [
    ["Coach", "Private teacher, 1.4 mi", "Graded exam prep · from $45/hr"],
    ["Competition", "Spring recital auditions", "Entries close in 3 weeks"],
    ["Camp", "Summer music intensive", "Two weeks in July · day camp"],
  ],
  "Sports & Athletics": [
    ["Coach", "Skills coach, 2.1 mi", "Small-group sessions · from $30"],
    ["Competition", "Regional league trials", "Open for this age group"],
    ["Camp", "Half-term skills camp", "Three days · all abilities"],
  ],
  "Dance & Theater": [
    ["Coach", "Technique class, 1.8 mi", "Weekly · all levels"],
    ["Competition", "Youth showcase", "Applications open now"],
    ["Camp", "Summer stage school", "One week · ages 8–14"],
  ],
  "Arts & Crafts": [
    ["Coach", "Studio class, 0.9 mi", "Portfolio building · weekly"],
    ["Competition", "District art show", "Submissions open in May"],
    ["Gear", "Student materials set", "Recommended for this level"],
  ],
  "STEM & Robotics": [
    ["Competition", "Regional robotics meet", "Team entries open"],
    ["Camp", "Build week", "Five days · bring a laptop"],
    ["Coach", "Mentor sessions", "Online · weekly"],
  ],
  Academics: [
    ["Coach", "Subject tutor, 1.2 mi", "Weekly · exam focused"],
    ["Competition", "Regional tournament", "Registration open"],
  ],
  Volunteering: [
    ["Coach", "Volunteer coordinator", "More weekend shifts available"],
    ["Competition", "Community service award", "Nominations open in spring"],
  ],
};

const FALLBACK: [PickKind, string, string][] = [
  ["Coach", "Local instructors", "Search what's near you"],
  ["Camp", "Holiday programmes", "Short courses in the area"],
];

export function SupportSheet({
  activity,
  onClose,
  onSeeAll,
}: {
  activity: Activity | null;
  onClose: () => void;
  /** Opens the full coach search for this activity. */
  onSeeAll: (activityId: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const [chat, setChat] = useState<{ me: boolean; text: string }[]>([]);

  const picks = activity
    ? (SUGGESTIONS[activity.category] ?? FALLBACK)
    : FALLBACK;
  const child = activity ? childById(activity.childId) : undefined;

  const send = () => {
    const q = draft.trim();
    if (!q) return;
    setDraft("");
    setChat((c) => [
      ...c,
      { me: true, text: q },
      {
        me: false,
        text: `I'll look into that for ${child?.name ?? "them"} — searching ${
          activity?.name ?? "this activity"
        } near you.`,
      },
    ]);
  };

  return (
    <Sheet open={!!activity} onClose={onClose}>
      {activity && (
        <div className="flex flex-col">
          <div className="px-5 pt-2 pb-1 flex flex-col gap-1">
            <span className="flex items-center gap-2 text-[13px] font-[600] text-pine">
              <Icon name="auto_awesome" size={18} fill /> Top picks near you
            </span>
            <h3 className="font-[700] text-[22px] leading-[1.2] tracking-[-0.02em] text-ink">
              {activity.name}
            </h3>
            <span className="text-[13px] text-ink-soft">
              Coaches, competitions and camps picked for {child?.name ?? "them"}
            </span>
          </div>

          <div className="mt-1 -mx-4 flex flex-col">
            {picks.map(([kind, title, meta]) => (
              <button
                key={title}
                onClick={() => onSeeAll(activity.id)}
                className="flex items-center gap-3.5 min-h-[68px] px-6 text-left active:bg-black/5 transition-colors"
              >
                <Icon name={KIND_ICON[kind]} size={24} className="text-pine" />
                <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span className="text-[11px] font-[600] tracking-[0.06em] text-ink-soft uppercase">
                    {kind}
                  </span>
                  <span className="text-[15px] font-[500] text-ink">{title}</span>
                  <span className="text-[13px] text-ink-soft">{meta}</span>
                </span>
                <Icon name="chevron_right" size={20} className="text-[#9aa09c]" />
              </button>
            ))}
          </div>

          {chat.length > 0 && (
            <div className="px-2 pt-2 flex flex-col gap-2">
              {chat.map((m, i) => (
                <span
                  key={i}
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-[18px] text-[14px] leading-[1.4] ${
                    m.me
                      ? "self-end bg-pine text-white"
                      : "self-start bg-surface text-ink"
                  }`}
                >
                  {m.text}
                </span>
              ))}
            </div>
          )}

          <div className="mt-2.5 -mx-4 px-4 pt-2.5 flex gap-2 border-t border-[#eeefec]">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask a follow-up…"
              className="flex-1 min-w-0 h-12 rounded-3xl px-6 bg-[#f1f2ef] text-[15px] text-ink outline-none"
            />
            <button
              onClick={send}
              aria-label="Send"
              className="grid place-items-center w-12 h-12 shrink-0 rounded-3xl bg-pine text-white active:scale-95 transition-transform"
            >
              <Icon name="arrow_upward" size={22} />
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
}

/* ---------- Log hours ---------- */
export function HoursSheet({
  activity,
  onClose,
  onSave,
}: {
  activity: Activity | null;
  onClose: () => void;
  onSave: (activityId: string, hours: number) => void;
}) {
  const [n, setN] = useState("");
  const [date, setDate] = useState("");

  const value = Number(n);
  const valid = value > 0;

  return (
    <Sheet open={!!activity} onClose={onClose}>
      {activity && (
        <div className="px-5 pt-2 pb-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="font-[700] text-[22px] leading-[1.2] tracking-[-0.02em] text-ink">
              Log hours
            </h3>
            <span className="text-[14px] text-ink-soft">
              {activity.name} · {Math.round(activity.hours ?? 0)} hrs so far
            </span>
          </div>

          <div className="flex gap-2">
            {[1, 2, 3, 4].map((h) => (
              <button
                key={h}
                onClick={() => setN(String(h))}
                aria-pressed={n === String(h)}
                className={`flex-1 h-11 rounded-[22px] border text-[15px] font-[600] transition-colors ${
                  n === String(h)
                    ? "bg-pine border-pine text-white"
                    : "bg-surface border-hairline text-ink"
                }`}
              >
                {h} hr{h > 1 ? "s" : ""}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <label className="flex flex-col gap-1.5 min-w-0 text-[13px] font-[500] text-ink-soft">
              Hours
              <input
                type="number"
                min={0}
                step={0.5}
                value={n}
                onChange={(e) => setN(e.target.value)}
                className="h-[52px] rounded-xl bg-surface border border-hairline px-3.5 text-[16px] text-ink outline-none focus:border-pine transition-colors"
              />
            </label>
            <label className="flex flex-col gap-1.5 min-w-0 text-[13px] font-[500] text-ink-soft">
              Date
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-[52px] rounded-xl bg-surface border border-hairline px-2.5 text-[15px] text-ink outline-none focus:border-pine transition-colors"
              />
            </label>
          </div>

          <button
            onClick={() => {
              if (!valid) return;
              onSave(activity.id, value);
              setN("");
              setDate("");
            }}
            disabled={!valid}
            className="h-[52px] rounded-[26px] bg-pine text-white font-[600] text-[16px] disabled:bg-[#a7c1b9] active:scale-[0.98] transition-all"
          >
            Add hours
          </button>
        </div>
      )}
    </Sheet>
  );
}
