import { useState } from "react";
import { showToast } from "../components/states";
import type { ChildId } from "../components/proudly";
import {
  type Achievement,
  type Activity,
  CHILDREN,
  achievementsFor,
  achievementsForActivity,
  activitiesFor,
  childById,
  fmtMonth,
} from "../data";
import {
  CAPP_CATEGORY,
  COUNSELOR_QUESTIONS,
  cappDescribe,
  counselorDraft,
  gradeNumber,
  gradeStrip,
  monthsRun,
} from "../lib/bragDrafts";
import { Icon } from "../components/Icon";

/* Brag sheet — Oct-1 redesign.
   ---------------------------
   This screen is a document, not an app screen, and it is styled as one: a
   white page inset from the cream background, a serif for entry titles, and a
   mono for the form's micro-labels — the vocabulary of the application forms
   it is feeding. Two formats, because UC and the Common App ask for different
   things: UC wants awards and activities in separate sections with two long
   fields each, the Common App wants one 150-character line per activity.

   Every description is a draft generated from the record (see lib/bragDrafts).
   The parent edits it in place; "Rewrite" asks for a different phrasing of the
   same facts, and once edited it offers to restore the original instead. */

/** Per-field edit state, keyed by what the field belongs to. */
type FieldState = { text?: string; variant: number };

export function BragSheet({
  childId,
  onSelectChild,
}: {
  childId: ChildId;
  onSelectChild: (id: ChildId) => void;
}) {
  const [fields, setFields] = useState<Record<string, FieldState>>({});

  const child = childId === "all" ? CHILDREN[0] : (childById(childId) ?? CHILDREN[0]);
  const acts = activitiesFor(child.id);
  const wins = achievementsFor(child.id);
  const grade = gradeNumber(child.grade);

  /* Class year: the June they finish 12th grade, counting from this school
     year. Only shown when we know what grade they are in. */
  const classOf = grade != null ? 2026 + (12 - grade) : null;

  /* Longest-running first — the order an admissions reader expects, and the
     order the forms themselves imply by asking for the most significant
     activities first. */
  const ranked = [...acts].sort((p, q) => monthsRun(q) - monthsRun(p)).slice(0, 10);

  const field = (key: string, draft: (variant: number) => string) => {
    const st = fields[key] ?? { variant: 0 };
    const generated = draft(st.variant);
    return {
      key,
      text: st.text ?? generated,
      edited: st.text != null,
      set: (text: string) => setFields((f) => ({ ...f, [key]: { ...st, text } })),
      /* Rewrite on an untouched draft asks for another phrasing; on an edited
         one it puts the generated text back, which is the only way to undo. */
      rewrite: () =>
        setFields((f) => ({
          ...f,
          [key]: st.text != null ? { variant: st.variant } : { variant: st.variant + 1 },
        })),
    };
  };

  return (
    <div className="pb-28">
      <div className="pt-[52px] px-6 pb-1.5 flex flex-col">
        <h2 className="font-[700] text-[30px] leading-[1.1] tracking-[-0.025em] text-ink">
          Brag sheet
        </h2>
        {CHILDREN.length > 1 && (
          <div className="flex flex-wrap gap-1.5 pt-1.5">
            {CHILDREN.map((k) => {
              const on = k.id === child.id;
              return (
                <button
                  key={k.id}
                  onClick={() => onSelectChild(k.id)}
                  aria-pressed={on}
                  className={`flex items-center gap-1.5 h-7 pl-[3px] pr-[11px] rounded-full border transition-colors ${
                    on
                      ? "border-pine bg-pine-soft text-pine"
                      : "border-hairline bg-surface text-[#3d413f]"
                  }`}
                >
                  <span
                    className={`grid place-items-center w-[22px] h-[22px] rounded-full text-[10.5px] font-[700] ${
                      on ? "bg-pine text-white" : "bg-rust-soft text-rust"
                    }`}
                  >
                    {k.name[0]}
                  </span>
                  <span className="text-[12.5px] font-[600]">{k.name}</span>
                </button>
              );
            })}
          </div>
        )}

      </div>

      {/* The page */}
      <div className="mt-2 mx-3 px-4 pt-3.5 pb-4 bg-surface border border-[#e4e5e0] rounded-md shadow-[0_10px_30px_-18px_rgba(20,30,25,0.35)] flex flex-col">
        <div className="pb-1.5 border-b-2 border-ink">
          <span className="font-serif-doc text-[22px] leading-[1.1] font-[700] tracking-[-0.02em] text-ink">
            {child.name}
            {classOf ? ` — Class of ${classOf}` : ""}
          </span>
        </div>
        <div className="mt-[3px] h-px bg-[#e4e5e0]" />
        <div className="pt-1.5 flex items-baseline justify-between gap-2">
          <span className="text-[11.5px] leading-[1.4] text-ink-soft">
            Tap to edit, or Rewrite for a new version.
          </span>
          <span className="shrink-0 font-mono-doc text-[7.5px] font-[700] tracking-[0.1em] text-ink-soft">
            GRADE LEVELS
          </span>
        </div>

        <CommonAppFormat
          acts={ranked}
          grade={grade}
          field={field}
          counselor={(i, v) => counselorDraft(i, acts, wins, v)}
        />
      </div>

      <div className="pt-4 px-6">
        <button
          onClick={() => showToast("Brag sheet shared")}
          className="w-full h-12 rounded-3xl bg-pine text-white text-[15px] font-[600] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Icon name="ios_share" size={20} /> Share PDF
        </button>
      </div>
    </div>
  );
}

/* ---------- Shared document parts ---------- */

/** The four-grade strip the forms print beside every entry. */
function Grades({ cells }: { cells: { g: number; on: boolean; future: boolean }[] }) {
  return (
    <div className="flex gap-[3px] shrink-0">
      {cells.map((c) => (
        <span
          key={c.g}
          className="grid place-items-center min-w-[17px] h-[15px] px-0.5 rounded-[3px] border font-mono-doc text-[8.5px]"
          style={{
            borderColor: c.on ? "#1b1d1c" : "transparent",
            color: c.on ? "#1b1d1c" : c.future ? "#c9ccc7" : "#9aa09c",
            fontWeight: c.on ? 700 : 400,
          }}
        >
          {c.g}
        </span>
      ))}
    </div>
  );
}

type Field = {
  key: string;
  text: string;
  edited: boolean;
  set: (t: string) => void;
  rewrite: () => void;
};

/** A labelled, character-capped draft the parent can edit in place. */
function DraftField({
  label,
  limit,
  field,
}: {
  label: string;
  limit: number;
  field: Field;
}) {
  const over = field.text.length > limit - 10;
  return (
    <>
      <span className="mt-2.5 font-mono-doc text-[8px] font-[700] tracking-[0.08em] text-ink-soft uppercase">
        {label} · {limit} chars
      </span>
      <textarea
        value={field.text}
        onChange={(e) => field.set(e.target.value.slice(0, limit))}
        rows={Math.max(1, Math.ceil(field.text.length / 44))}
        className="mt-1 -mx-1.5 px-1.5 py-1 rounded-md bg-transparent border border-transparent text-[13px] leading-[1.5] text-ink resize-none outline-none overflow-hidden hover:border-hairline focus:border-pine focus:bg-[#fbfbf9] transition-colors"
      />
      <div className="mt-1.5 flex items-center gap-2">
        <span
          className="font-mono-doc text-[9.5px]"
          style={{ color: over ? "#87570b" : "#5f6461" }}
        >
          {field.text.length} / {limit}
        </span>
        <div className="flex-1" />
        <button
          onClick={field.rewrite}
          className="h-6 pl-[9px] pr-[9px] rounded-xl bg-surface border border-hairline flex items-center gap-1 active:scale-95 transition-transform"
        >
          <Icon name="sync" size={14} className="text-pine" />
          <span className="text-[11px] font-[600] text-pine">
            {field.edited ? "Restore original" : "Rewrite"}
          </span>
        </button>
      </div>
    </>
  );
}

/* ---------- Common App ---------- */
function CommonAppFormat({
  acts,
  grade,
  field,
  counselor,
}: {
  acts: Activity[];
  grade: number | null;
  field: (key: string, draft: (v: number) => string) => Field;
  counselor: (index: number, variant: number) => string;
}) {
  return (
    <>
      {acts.map((a) => {
        const awards = achievementsForActivity(a.id);
        return (
          <div
            key={a.id}
            className="pt-3 pb-3.5 flex flex-col gap-1 border-b border-[#e4e5e0]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono-doc text-[8.5px] font-[700] tracking-[0.09em] text-pine">
                {CAPP_CATEGORY[a.category]}
              </span>
              <Grades
                cells={gradeStrip(grade, a.start, a.end === "present" ? undefined : a.end)}
              />
            </div>
            <span className="font-serif-doc text-[15px] leading-[1.25] font-[700] tracking-[-0.01em] text-ink">
              {a.name}
            </span>
            <span className="text-[11.5px] text-ink-soft">
              {fmtMonth(a.start)} – {a.end === "present" ? "present" : fmtMonth(a.end)}
            </span>
            {awards.length > 0 && (
              <span className="text-[11.5px] leading-[1.35] font-[600] text-[#b27310]">
                {awards.map((w) => `${w.title} — ${fmtMonth(w.date)}`).join("  ◆ ")}
              </span>
            )}
            <DraftField
              label="Describe the activity"
              limit={150}
              field={field(`capp:${a.id}`, (v) => cappDescribe(a, awards, v))}
            />
          </div>
        );
      })}

      <div className="pt-5">
        <span className="font-mono-doc text-[8.5px] font-[700] tracking-[0.1em] text-ink">
          COUNSELOR QUESTIONNAIRE — EXCERPT
        </span>
      </div>
      {COUNSELOR_QUESTIONS.map(([q, placeholder], i) => {
        const f = field(`q:${i}`, (v) => counselor(i, v));
        return (
          <div key={q} className="pt-3 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="flex-1 font-serif-doc text-[14px] leading-[1.3] font-[700] text-ink">
                {q}
              </span>
              <button
                onClick={f.rewrite}
                className="shrink-0 h-6 px-[9px] rounded-xl bg-surface border border-hairline flex items-center gap-1 active:scale-95 transition-transform"
              >
                <Icon name="sync" size={14} className="text-pine" />
                <span className="text-[11px] font-[600] text-pine">
                  {f.edited ? "Restore original" : "Rewrite"}
                </span>
              </button>
            </div>
            <textarea
              value={f.text}
              onChange={(e) => f.set(e.target.value)}
              rows={i === 2 ? 1 : Math.max(1, Math.ceil((f.text.length || 40) / 44))}
              placeholder={placeholder}
              className={`-mx-1.5 px-1.5 py-1 rounded-md bg-transparent border border-transparent resize-none outline-none overflow-hidden hover:border-hairline focus:border-pine focus:bg-[#fbfbf9] transition-colors ${
                i === 2
                  ? "font-serif-doc text-[15px] font-[700] text-pine"
                  : "text-[13px] leading-[1.45] text-ink"
              }`}
            />
          </div>
        );
      })}
    </>
  );
}
