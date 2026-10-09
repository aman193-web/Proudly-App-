import { useEffect, useState } from "react";
import { Sheet } from "./Sheet";
import { readNote, seedNote, setNote, useNote } from "../lib/notes";
import { Icon } from "./Icon";

/* Note button + sheet.
   --------------------
   The redesign hangs one of these off every activity and accomplishment row.
   Filled and pine when there is a note, hollow and grey when there is not, so
   a parent can see at a glance which rows they have annotated.

   The sheet is deliberately plain — one field, one Save. Anything larger
   belongs on the edit screen, which is still there for the rest of a record. */
export function NoteButton({
  id,
  title,
  seed,
}: {
  id: string;
  title: string;
  /** Whatever the record already carries, adopted the first time only. */
  seed?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  seedNote(id, seed);
  const note = useNote(id);

  // The field starts from the stored note each time the sheet opens, so a
  // discarded edit does not linger into the next one.
  useEffect(() => {
    if (open) setDraft(readNote(id));
  }, [open, id]);

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label={note ? `Edit note on ${title}` : `Add a note to ${title}`}
        className={`grid place-items-center w-9 h-9 shrink-0 rounded-full transition-colors active:bg-black/5 ${
          note ? "text-pine" : "text-[#a3a8a4]"
        }`}
      >
        <Icon name="sticky_note_2" size={20} strokeWidth={note ? 2.4 : 1.9} />
      </button>

      <Sheet open={open} onClose={() => setOpen(false)}>
        <h3 className="px-1 text-[18px] font-[700] text-ink">Note</h3>
        <p className="px-1 mt-1 text-[13px] text-ink-soft">{title}</p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          autoFocus
          placeholder="What should you remember about this?"
          className="mt-3 w-full rounded-2xl border border-hairline bg-canvas px-3.5 py-3 text-[15px] leading-[1.45] text-ink outline-none resize-none focus:border-pine focus:bg-surface transition-colors"
        />
        <div className="mt-3 flex gap-2.5">
          {note && (
            <button
              onClick={() => {
                setNote(id, "");
                setOpen(false);
              }}
              className="h-12 px-5 rounded-full border border-hairline bg-surface text-[15px] font-[600] text-rust active:scale-[0.98] transition-transform"
            >
              Delete
            </button>
          )}
          <button
            onClick={() => {
              setNote(id, draft);
              setOpen(false);
            }}
            className="flex-1 h-12 rounded-full bg-pine text-white text-[15px] font-[600] active:scale-[0.98] transition-transform"
          >
            Save
          </button>
        </div>
      </Sheet>
    </>
  );
}
