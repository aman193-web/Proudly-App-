/* Ask PROUDLY — assistant service
   -------------------------------
   All assistant behaviour lives here. UI components render messages and
   dispatch actions; they never contain answer logic.

   Providers:
     - mockProvider     rule-based prototype replies, used until a backend exists
     - backendProvider  POSTs to your own endpoint (VITE_ASK_PROUDLY_ENDPOINT)

   The browser deliberately does NOT talk to Anthropic directly — that would
   put an API key in client code where anyone can read it. Stand up a small
   server route and point VITE_ASK_PROUDLY_ENDPOINT at it. Reference handler:

     import Anthropic from "@anthropic-ai/sdk";
     const client = new Anthropic();                    // reads ANTHROPIC_API_KEY

     const response = await client.messages.create({
       model: "claude-opus-5",
       max_tokens: 16000,
       thinking: { type: "adaptive" },
       system: SYSTEM_PROMPT,                           // see buildSystemPrompt
       messages: [
         { role: "user", content: contextBlock },       // see buildContextBlock
         ...history,
         { role: "user", content: question },
       ],
     });

   Send back { text, action? } matching AssistantReply below. */

import {
  type Activity,
  type Child,
  achievementsForActivity,
  activitiesFor,
  ageFromDob,
  childById,
  durationText,
  fmtMonth,
} from "../data";
import { levelStateOf, nextLevel } from "./activityLevels";

/* ---------- Messages ---------- */

export type ChatRole = "user" | "assistant";

/** An action the assistant can offer, handed back to the app to run. */
export type AssistantAction = { kind: "findCoach"; activityId: string; label: string };

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  action?: AssistantAction;
};

export type AssistantReply = { text: string; action?: AssistantAction };

let seq = 0;
export const newMessage = (role: ChatRole, text: string, action?: AssistantAction): ChatMessage => ({
  id: `m${++seq}`,
  role,
  text,
  action,
});

/* ---------- Context ---------- */

export type ActivityContext = {
  id: string;
  name: string;
  category: string;
  currentLevel: string;
  suggestedLevel: string;
  levelSource: string;
  nextLevel: string | null;
  started: string;
  duration: string;
  ongoing: boolean;
  sessionsPerWeek?: number;
  achievements: string[];
  history: { date: string; label: string }[];
};

export type AskContext = {
  scope: "activity" | "general";
  child?: { name: string; age: number | null; grade: string };
  activity?: ActivityContext;
  /** Other activities for the same child — the "connected activity" picture. */
  otherActivities?: {
    id: string;
    name: string;
    currentLevel: string;
    duration: string;
    ongoing: boolean;
  }[];
};

function toActivityContext(a: Activity): ActivityContext {
  const lvl = levelStateOf(a);
  return {
    id: a.id,
    name: a.name,
    category: a.category,
    currentLevel: lvl.current,
    suggestedLevel: lvl.suggested,
    levelSource: lvl.source,
    nextLevel: nextLevel(lvl.current),
    started: fmtMonth(a.start),
    duration: durationText(a.start, a.end),
    ongoing: a.end === "present",
    sessionsPerWeek: a.sessionsPerWeek,
    achievements: achievementsForActivity(a.id).map((x) => x.title),
    history: a.history.map((h) => ({ date: fmtMonth(h.date), label: h.label })),
  };
}

/** Context for a question asked from an Activity Detail screen. */
export function buildActivityContext(activity: Activity, child?: Child | null): AskContext {
  const resolved = child ?? childById(activity.childId) ?? null;
  return {
    scope: "activity",
    child: resolved
      ? { name: resolved.name, age: ageFromDob(resolved.dob), grade: resolved.grade }
      : undefined,
    activity: toActivityContext(activity),
    otherActivities: activitiesFor(activity.childId)
      .filter((a) => a.id !== activity.id)
      .map((a) => ({
        id: a.id,
        name: a.name,
        currentLevel: levelStateOf(a).current,
        duration: durationText(a.start, a.end),
        ongoing: a.end === "present",
      })),
  };
}

/** Context for a question asked from anywhere else in the app. */
export function buildGeneralContext(childId: string | "all"): AskContext {
  const resolved = childId === "all" ? null : (childById(childId) ?? null);
  return {
    scope: "general",
    child: resolved
      ? { name: resolved.name, age: ageFromDob(resolved.dob), grade: resolved.grade }
      : undefined,
    otherActivities: activitiesFor(childId).map((a) => ({
      id: a.id,
      name: a.name,
      currentLevel: levelStateOf(a).current,
      duration: durationText(a.start, a.end),
      ongoing: a.end === "present",
    })),
  };
}

/* ---------- Prompts offered to the parent ---------- */

/** Three is enough to start a conversation without becoming a menu. */
const PROMPT_LIMIT = 3;

export function suggestedPrompts(ctx: AskContext): string[] {
  const who = ctx.child?.name ?? "my child";
  if (ctx.scope === "activity" && ctx.activity) {
    const a = ctx.activity;
    return [
      a.nextLevel
        ? `How can ${who} get to ${a.nextLevel} in ${a.name}?`
        : `How does ${who} keep growing in ${a.name}?`,
      `What should ${who} focus on next?`,
      `What progress do you see in ${a.name}?`,
      `What achievements should we work toward?`,
      `Should we consider a coach?`,
    ].slice(0, PROMPT_LIMIT);
  }
  return [
    `Which activities has ${who} been doing longest?`,
    `What progress has ${who} made recently?`,
    `Which activity could use more consistent participation?`,
    `What should we focus on next?`,
    `Help me understand ${who}'s activity journey.`,
  ].slice(0, PROMPT_LIMIT);
}

/* ---------- Prompt assembly (shared with the backend) ---------- */

export const SYSTEM_PROMPT = [
  "You are PROUDLY, an assistant that helps a parent understand and support their child's activities.",
  "Be warm, concrete and brief — two or three short paragraphs at most.",
  "Ground every claim in the supplied context. If something is not in the context, say you don't have it rather than inventing it.",
  "Never guarantee outcomes, and never give medical, diagnostic or clinical advice.",
  "When a coach would genuinely help, say so plainly; the app shows the parent how to find one.",
].join(" ");

/** Human-readable context block for the model. */
export function buildContextBlock(ctx: AskContext): string {
  const L: string[] = [];
  if (ctx.child) {
    L.push(
      `Child: ${ctx.child.name}${ctx.child.age !== null ? `, age ${ctx.child.age}` : ""}, ${ctx.child.grade}`,
    );
  }
  const a = ctx.activity;
  if (a) {
    L.push(
      `Activity: ${a.name} (${a.category})`,
      `Current level: ${a.currentLevel} (${a.levelSource === "parent" ? "set by the parent" : "suggested by PROUDLY"})`,
      `PROUDLY suggests: ${a.suggestedLevel}`,
      `Next level: ${a.nextLevel ?? "already at the top level"}`,
      `Started ${a.started}, ${a.duration}${a.ongoing ? ", still going" : ", finished"}`,
    );
    if (a.sessionsPerWeek) L.push(`Frequency: about ${a.sessionsPerWeek} sessions a week`);
    if (a.achievements.length) L.push(`Achievements: ${a.achievements.join("; ")}`);
    if (a.history.length)
      L.push(`Timeline: ${a.history.map((h) => `${h.date} — ${h.label}`).join("; ")}`);
  }
  if (ctx.otherActivities?.length) {
    L.push(
      `Other activities: ${ctx.otherActivities
        .map((o) => `${o.name} (${o.currentLevel}, ${o.duration}${o.ongoing ? ", ongoing" : ""})`)
        .join("; ")}`,
    );
  }
  return L.join("\n");
}

/* ---------- Provider interface ---------- */

export type AskInput = {
  question: string;
  context: AskContext;
  history: ChatMessage[];
};

export interface AskProudlyProvider {
  readonly id: string;
  readonly isLive: boolean;
  send(input: AskInput, signal?: AbortSignal): Promise<AssistantReply>;
}

export class AskProudlyError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AskProudlyError";
  }
}

/* ---------- Mock provider ----------
   Intent matching over the real context, so prototype answers stay truthful
   about this child's actual record. Replaced wholesale by the backend. */

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));

function coachAction(ctx: AskContext, question: string): AssistantAction | undefined {
  const target =
    ctx.activity ??
    (ctx.otherActivities ?? []).find((o) => question.includes(o.name.toLowerCase()));
  if (!target) return undefined;
  return { kind: "findCoach", activityId: target.id, label: `Find ${target.name} coaches nearby` };
}

export const mockProvider: AskProudlyProvider = {
  id: "mock",
  isLive: false,
  async send({ question, context }, signal) {
    await new Promise((r) => setTimeout(r, 800));
    if (signal?.aborted) throw new AskProudlyError("aborted");

    const q = question.toLowerCase();
    const who = context.child?.name ?? "your child";
    const a = context.activity;

    // Coach intent — surfaces the existing coach flow rather than duplicating it.
    if (has(q, "coach", "teacher", "tutor", "lessons near", "instructor")) {
      const action = coachAction(context, q);
      const what = a?.name ?? "this activity";
      return {
        text: a
          ? `At ${a.currentLevel} after ${a.duration} of ${what}, a coach is a reasonable next step${
              a.nextLevel ? ` — most of the gap to ${a.nextLevel} is technique that's hard to self-correct` : ""
            }. Look for someone who has taken students through this stage before, and ask how they measure progress.`
          : `A coach helps most when a child has plateaued or is preparing for something specific. Tell me which activity you have in mind and I'll point you at nearby options.`,
        action,
      };
    }

    if (a && has(q, "next level", "get to", "reach", "level up", "advance")) {
      const gap = a.nextLevel
        ? `Moving to ${a.nextLevel} usually comes down to consistency and a harder challenge to aim at.`
        : `${who} is already at the top level here, so the goal shifts to depth rather than rank.`;
      return {
        text: `${gap} ${who} has been at ${a.name} for ${a.duration}${
          a.sessionsPerWeek ? ` at about ${a.sessionsPerWeek} sessions a week` : ""
        }. ${
          a.achievements.length
            ? `The ${a.achievements.length === 1 ? "milestone" : "milestones"} already recorded (${a.achievements.join(", ")}) show the work is landing.`
            : `Recording a milestone or two would give you something concrete to measure against.`
        } A specific goal in the next few months tends to move the needle more than extra practice hours.`,
      };
    }

    if (a && has(q, "focus", "work on", "practice", "improve")) {
      return {
        text: `For ${who} at ${a.currentLevel} in ${a.name}, the useful focus is usually the thing that is boring to practise${
          a.sessionsPerWeek && a.sessionsPerWeek < 2 ? " — and a second session a week, if that is realistic" : ""
        }. Pick one measurable thing to hold for six weeks rather than three vague ones. ${
          a.history.length
            ? `Their last recorded step was "${a.history[a.history.length - 1].label}" — building directly on that is easier than starting something new.`
            : ""
        }`,
      };
    }

    if (has(q, "progress", "how are they doing", "doing well", "improved")) {
      if (a) {
        return {
          text: `${who} has kept ${a.name} going for ${a.duration}, which is the part most children do not manage. PROUDLY reads that record as ${a.suggestedLevel}${
            a.levelSource === "parent" ? `, though you have it set to ${a.currentLevel}` : ""
          }. ${
            a.achievements.length
              ? `Recorded so far: ${a.achievements.join(", ")}.`
              : `Nothing is recorded as an achievement yet — worth adding any that happened.`
          }`,
        };
      }
      const ongoing = (context.otherActivities ?? []).filter((o) => o.ongoing);
      return {
        text: `${who} has ${ongoing.length} ${ongoing.length === 1 ? "activity" : "activities"} running right now: ${ongoing
          .map((o) => `${o.name} (${o.currentLevel})`)
          .join(", ")}. The longest-running is ${
          [...(context.otherActivities ?? [])].sort((x, y) => y.duration.localeCompare(x.duration))[0]?.name ?? "—"
        }. Steady time in one activity tends to matter more than breadth.`,
      };
    }

    if (a && has(q, "achievement", "award", "milestone", "compete", "exam")) {
      return {
        text: `Aim at something with a date on it — a grading, a recital, a local competition. ${
          a.achievements.length
            ? `${who} already has ${a.achievements.join(" and ")}, so the next rung up in the same series is the natural target.`
            : `A first recorded milestone is worth more than a big one later; it gives ${who} something to point at.`
        } Add it in PROUDLY when it happens and the level suggestion picks it up.`,
      };
    }

    if (has(q, "longest", "how long")) {
      const all = context.otherActivities ?? [];
      const withCurrent = a ? [{ name: a.name, duration: a.duration }, ...all] : all;
      return {
        text: withCurrent.length
          ? `Longest running for ${who}: ${withCurrent
              .slice(0, 3)
              .map((o) => `${o.name} (${o.duration})`)
              .join(", ")}. Long tenure is the strongest signal in the record — it is what pushes a level suggestion up.`
          : `There is nothing recorded yet for ${who}.`,
      };
    }

    if (has(q, "consistent", "consistency", "drop", "quiet", "slipping")) {
      const quiet = (context.otherActivities ?? []).filter((o) => !o.ongoing);
      return {
        text: quiet.length
          ? `${quiet.map((o) => o.name).join(" and ")} ${quiet.length === 1 ? "has" : "have"} stopped appearing in the record. If either is still happening, adding sessions keeps the picture accurate. Of the active ones, the lowest-frequency activity is usually where consistency pays back fastest.`
          : `Everything on ${who}'s list is currently active, which is a good place to be. The question is depth rather than consistency.`,
      };
    }

    // Fallback — still grounded in the record.
    return {
      text: a
        ? `Here is what the record shows for ${a.name}: ${a.duration} in, currently ${a.currentLevel}${
            a.nextLevel ? `, with ${a.nextLevel} as the next step` : ""
          }. Ask me about what to focus on, what progress looks like, or whether a coach would help.`
        : `I can look at ${who}'s activities, how long each has been running, and where the momentum is. Try one of the suggestions, or ask about a specific activity.`,
    };
  },
};

/* ---------- Backend provider ---------- */

const endpoint = (import.meta.env?.VITE_ASK_PROUDLY_ENDPOINT as string | undefined)?.trim();

export function createBackendProvider(url: string): AskProudlyProvider {
  return {
    id: "backend",
    isLive: true,
    async send(input, signal) {
      let res: Response;
      try {
        res = await fetch(url, {
          method: "POST",
          signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: input.question,
            context: input.context,
            contextBlock: buildContextBlock(input.context),
            system: SYSTEM_PROMPT,
            history: input.history.map((m) => ({ role: m.role, content: m.text })),
          }),
        });
      } catch (e) {
        throw new AskProudlyError("Couldn't reach PROUDLY. Check your connection.", e);
      }
      if (!res.ok) throw new AskProudlyError(`Assistant returned ${res.status}.`);
      const json = (await res.json()) as Partial<AssistantReply>;
      if (!json.text) throw new AskProudlyError("Empty reply from the assistant.");
      return { text: json.text, action: json.action };
    },
  };
}

export function getAskProudlyProvider(): AskProudlyProvider {
  return endpoint ? createBackendProvider(endpoint) : mockProvider;
}
