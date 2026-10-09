import { useState } from "react";
import { Icon } from "./Icon";
import { Sheet } from "./Sheet";
import { type Activity, childById } from "../data";
import {
  type Coach,
  getCoachProvider,
  rankCoaches,
} from "../lib/coachSearch";

/* Find support — Oct-1 redesign.
   -----------------------------
   The gradient button opens a sheet, not a screen: three picks for this
   activity and a field to ask a follow-up. The full coach search is still
   there and is what the first pick opens — the sheet is the quick answer,
   the search is the long one.

   Suggestions are generated from the activity's category rather than
   fetched, so the sheet always has something to show offline. */

type PickKind = "Coach" | "Competition" | "Camp" | "Gear";

/** One turn in the sheet's thread. A reply may carry coach results. */
type Turn = { me: boolean; text: string; coaches?: Coach[] };

const KIND_ICON: Record<PickKind, string> = {
  Coach: "school",
  Competition: "emoji_events",
  Camp: "wb_sunny",
  Gear: "shopping_bag",
};

/* The prototype's own suggestion table, keyed by what the activity is. Three
   per activity, each naming something specific and dated — a generic "find a
   coach" is what the fallback is for. */
const SUGGESTIONS: [RegExp, [PickKind, string, string][]][] = [
  [/art|paint|draw|pottery/i, [
    ["Coach", "Portfolio mentoring with a working illustrator", "1:1 · online · from $45"],
    ["Competition", "Regional Young Artists Showcase", "Entries due Dec 12"],
    ["Camp", "Summer studio intensive", "Jun 22 – Jul 17 · 4 weeks"],
  ]],
  [/dance|ballet/i, [
    ["Coach", "Private ballet technique sessions", "2 studios within 5 mi"],
    ["Competition", "Spring youth dance championship", "Registration opens Jan 8"],
    ["Camp", "Summer dance intensive", "July · audition by video"],
  ]],
  [/piano|keyboard|violin|guitar|cello|band/i, [
    ["Coach", "Piano teacher for intermediate students", "3 teachers within 4 mi"],
    ["Competition", "Young pianists festival", "Winter round · Feb 21"],
    ["Gear", "Upgrade to a weighted 88-key keyboard", "From $499"],
  ]],
  [/choir|chorus|voice|sing/i, [
    ["Coach", "Vocal coach, musical theatre focus", "1:1 · from $50"],
    ["Competition", "All-county honor choir auditions", "Auditions Nov 15"],
    ["Camp", "Summer musical theatre camp", "2 weeks · July"],
  ]],
  [/debate|speech|quiz/i, [
    ["Coach", "Debate coach for novice competitors", "Online · weekly"],
    ["Competition", "Fall invitational tournament", "Nov 7–8 · 12 mi away"],
    ["Camp", "Summer debate institute", "3 weeks · residential"],
  ]],
  [/soccer|football|basketball|tennis|swim|track/i, [
    ["Coach", "Small-group skills training", "Saturdays · 3 mi away"],
    ["Competition", "Club team tryouts", "Winter tryouts Dec 6"],
    ["Camp", "Summer soccer camp", "Day camp · June"],
  ]],
  [/volunteer|shelter|pet shop/i, [
    ["Camp", "Junior volunteer program at the animal shelter", "Ages 12+ · weekends"],
    ["Competition", "Community service award nomination", "Nominations due Jan 31"],
    ["Coach", "Pre-vet mentorship sessions", "Online · monthly"],
  ]],
  [/robot|science|code|chess/i, [
    ["Coach", "Mentor sessions with a team alum", "Online · weekly"],
    ["Competition", "Regional qualifier", "Team entries open"],
    ["Camp", "Build week", "Five days · bring a laptop"],
  ]],
];

const FALLBACK: [PickKind, string, string][] = [
  ["Coach", "Find a local coach or mentor", "Matched to their level"],
  ["Competition", "Upcoming local competitions", "Next 3 months"],
  ["Camp", "Summer programs", "Registration opening soon"],
];

export function SupportSheet({
  activity,
  onClose,
}: {
  activity: Activity | null;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [chat, setChat] = useState<Turn[]>([]);
  const [searching, setSearching] = useState(false);

  const picks = activity
    ? (SUGGESTIONS.find(([re]) => re.test(activity.name))?.[1] ?? FALLBACK)
    : FALLBACK;
  const child = activity ? childById(activity.childId) : undefined;
  const who = child?.name ?? "them";

  /* Each pick is a prompt. Tapping one asks it, which turns the sheet into a
     conversation — the cards scroll away above the thread rather than sitting
     there as navigation. */
  const ask = (question: string, answer: string, coaches?: Coach[]) =>
    setChat((c) => [
      ...c,
      { me: true, text: question },
      { me: false, text: answer, coaches },
    ]);

  /* A coach prompt answers with real listings rather than a sentence — the
     parent's next move is picking one, so the reply is the list. */
  const findCoaches = async (question: string) => {
    if (!activity) return;
    setChat((c) => [...c, { me: true, text: question }]);
    setSearching(true);
    try {
      const found = await getCoachProvider().search({
        activityName: activity.name,
        category: activity.category,
        location: { kind: "text", value: "near you" },
      });
      const top = rankCoaches(found).slice(0, 3);
      setChat((c) => [
        ...c,
        {
          me: false,
          text: top.length
            ? `Here are the best-rated near you for ${who}'s ${activity.name.toLowerCase()}. Tap one to open it on Google.`
            : `I couldn't find anyone nearby for ${activity.name.toLowerCase()} just now.`,
          coaches: top,
        },
      ]);
    } catch {
      setChat((c) => [
        ...c,
        { me: false, text: "I couldn't reach the search just now — try again in a moment." },
      ]);
    } finally {
      setSearching(false);
    }
  };

  const askPick = ([kind, title, meta]: [PickKind, string, string]) => {
    if (kind === "Coach") {
      void findCoaches(`Find coaches: ${title}`);
      return;
    }
    ask(
      `Tell me about: ${title}`,
      `${title} — ${meta}. It is a ${kind.toLowerCase()} option I found for ${who}'s ${
        activity?.name.toLowerCase() ?? "activity"
      }. Want me to pull together dates, cost and how to sign up?`,
    );
  };

  const send = () => {
    const q = draft.trim();
    if (!q) return;
    setDraft("");
    if (/coach|teacher|tutor|lesson|class|near/i.test(q)) {
      void findCoaches(q);
      return;
    }
    ask(
      q,
      `Looking into that for ${who} — I'll check what's available near you for ${
        activity?.name.toLowerCase() ?? "this"
      } and come back with options.`,
    );
  };

  const started = chat.length > 0;

  return (
    <Sheet open={!!activity} onClose={onClose}>
      {activity && (
        <div className="flex flex-col">
          <div className="px-2 pt-2 pb-1 flex flex-col gap-1">
            <span className="flex items-center gap-2 text-[13px] font-[600] text-pine">
              <Icon name="auto_awesome" size={18} fill /> Top picks near you
            </span>
            <h3 className="font-[700] text-[22px] leading-[1.2] tracking-[-0.02em] text-ink">
              {activity.name}
              {child ? ` for ${child.name}` : ""}
            </h3>
          </div>

          {/* The prompts. They stay available after the first question so a
              parent can ask about another pick without starting over. */}
          <div className="mt-2 flex flex-col gap-2">
            {picks.map((p) => (
              <button
                key={p[1]}
                onClick={() => askPick(p)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-[18px] bg-white/70 border border-white text-left active:scale-[0.99] transition-transform"
              >
                <Icon name={KIND_ICON[p[0]]} size={24} className="text-pine" />
                <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span className="text-[11px] font-[600] tracking-[0.06em] text-ink-soft uppercase">
                    {p[0]}
                  </span>
                  <span className="text-[15px] font-[500] text-ink">{p[1]}</span>
                  <span className="text-[13px] text-ink-soft">{p[2]}</span>
                </span>
                <Icon name="chevron_right" size={20} className="text-[#9aa09c]" />
              </button>
            ))}
          </div>

          {started && (
            <div className="mt-3 flex flex-col gap-2">
              {chat.map((m, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <span
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-[18px] text-[14px] leading-[1.4] ${
                      m.me
                        ? "self-end bg-pine text-white"
                        : "self-start bg-white/70 border border-white text-ink"
                    }`}
                  >
                    {m.text}
                  </span>
                  {/* Same shape as Home's nearby listings — a parent reads
                      one local business the same way wherever it appears. */}
                  {m.coaches?.map((c) => (
                    <a
                      key={c.id}
                      href={c.googleUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex items-start gap-3 px-3.5 py-3 rounded-[18px] bg-white/70 border border-white active:scale-[0.99] transition-transform"
                    >
                      <span className="flex-1 min-w-0 flex flex-col gap-[3px]">
                        <span className="text-[16px] leading-[1.25] font-[600] text-ink">
                          {c.name}
                        </span>
                        <span className="flex flex-wrap items-center gap-1 text-[13px] text-ink-soft">
                          <span>{c.rating.toFixed(1)}</span>
                          <span className="tracking-[-1px] text-[#e3a21a]">★★★★★</span>
                          <span>
                            ({c.reviewCount}) · {c.activity}
                          </span>
                        </span>
                        <span className="text-[13px] text-ink-soft">
                          {[c.distanceMi != null ? `${c.distanceMi.toFixed(1)} mi` : null, c.location]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                        <span className="flex gap-1 text-[13px] text-ink-soft">
                          <span className="font-[600] text-pine">On Google</span>
                          <span>· opens in a new tab</span>
                        </span>
                      </span>
                      <Icon name="open_in_new" size={18} className="mt-0.5 text-[#9aa09c]" />
                    </a>
                  ))}
                </div>
              ))}
              {searching && (
                <span className="self-start px-3.5 py-2.5 rounded-[18px] bg-white/70 border border-white text-[14px] text-ink-soft">
                  Searching near you…
                </span>
              )}
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={started ? "Ask a follow-up…" : "Ask about any of these…"}
              className="flex-1 min-w-0 h-12 rounded-3xl px-5 bg-white/70 border border-white text-[15px] text-ink outline-none focus:border-pine transition-colors"
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
                placeholder="e.g. 2"
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
