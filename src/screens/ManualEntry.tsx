import { useState } from "react";
import { Icon } from "../components/Icon";
import { Screen } from "../components/ui";
import { showToast } from "../components/states";
import { CATEGORIES, CHILDREN, type Category, activitiesFor } from "../data";

/* Manual entry — Oct-1 redesign.
   -----------------------------
   The third way in, alongside the two calendar accounts: type it. One screen
   covers both halves of a record — the activity and any accomplishments that
   came with it — because a parent entering a past season usually has both in
   mind at once and would otherwise have to come back.

   Nothing here is required except a name on one or the other: saving with
   only accomplishments files them without an activity, which is what the
   prototype does when the activity name is left blank. */

const CADENCES = ["Weekly", "2× a week", "Monthly"];

/* The quick picks under the name field — the activities parents type most. */
const POPULAR: { label: string; icon: string; category: Category }[] = [
  { label: "Soccer", icon: "sports_soccer", category: "Sports & Athletics" },
  { label: "Piano lessons", icon: "music_note", category: "Music & Performance" },
  { label: "Art classes", icon: "palette", category: "Arts & Crafts" },
  { label: "Ballet", icon: "theater_comedy", category: "Dance & Theater" },
  { label: "Robotics", icon: "precision_manufacturing", category: "STEM & Robotics" },
  { label: "Animal shelter volunteer", icon: "volunteer_activism", category: "Other" },
];

type Win = { id: number; title: string; when: string; activity: string; category: string };

export function ManualEntry({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [childId, setChildId] = useState(CHILDREN[0]?.id ?? "");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("");
  const [started, setStarted] = useState("");
  const [cadence, setCadence] = useState(CADENCES[0]);
  const [wins, setWins] = useState<Win[]>([
    { id: 1, title: "", when: "", activity: "", category: "" },
  ]);

  const child = CHILDREN.find((c) => c.id === childId);
  const existing = activitiesFor(childId);
  const filled = wins.filter((w) => w.title.trim());
  const canSave = name.trim().length > 0 || filled.length > 0;

  const setWin = (id: number, patch: Partial<Win>) =>
    setWins((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));

  const save = () => {
    if (!canSave) return;
    showToast(
      name.trim()
        ? filled.length
          ? `Saved with ${filled.length} accomplishment${filled.length > 1 ? "s" : ""}`
          : "Activity saved"
        : `${filled.length} accomplishment${filled.length > 1 ? "s" : ""} saved`,
    );
    onSaved();
  };

  return (
    <Screen>
      <div className="shrink-0 pt-10">
        <div className="h-14 px-2 flex items-center">
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid place-items-center w-12 h-12 rounded-full text-ink active:bg-hairline/50 transition-colors"
          >
            <Icon name="close" size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-area px-6 pt-1 pb-4 flex flex-col gap-[18px]">
        <div className="flex flex-col gap-1">
          <h2 className="font-[700] text-[28px] leading-[1.15] tracking-[-0.02em] text-ink">
            Add to {child?.name ?? "their"}'s journey
          </h2>
          <span className="text-[14px] text-ink-soft">
            Activities, accomplishments, or both
          </span>
        </div>

        {CHILDREN.length > 1 && (
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-[500] text-ink-soft">For</span>
            <div className="flex flex-wrap gap-2">
              {CHILDREN.map((c, i) => {
                const on = c.id === childId;
                const tint = i === 0 ? "pine" : "rust";
                return (
                  <button
                    key={c.id}
                    onClick={() => setChildId(c.id)}
                    aria-pressed={on}
                    className={`flex items-center gap-2 h-9 pl-1.5 pr-3.5 rounded-[18px] border transition-colors ${
                      on
                        ? tint === "pine"
                          ? "bg-pine-soft border-pine text-pine"
                          : "bg-rust-soft border-rust text-rust"
                        : "bg-surface border-hairline text-[#3d413f]"
                    }`}
                  >
                    <span
                      className={`grid place-items-center w-6 h-6 rounded-full text-[11px] font-[700] ${
                        on
                          ? tint === "pine"
                            ? "bg-pine text-white"
                            : "bg-rust text-white"
                          : tint === "pine"
                            ? "bg-pine-soft text-pine"
                            : "bg-rust-soft text-rust"
                      }`}
                    >
                      {c.name[0]}
                    </span>
                    <span className="text-[14px] font-[600]">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <SectionHead
          icon={<Icon name="category" size={20} />}
          title="Activity"
          tint="bg-pine-soft text-pine"
        />

        <Field label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Piano lessons"
            className="h-[54px] w-full rounded-xl bg-surface border border-hairline px-3.5 text-[16px] text-ink outline-none focus:border-pine transition-colors"
          />
        </Field>

        <div className="-mt-1.5 flex flex-col gap-2">
          <span className="text-[12px] font-[500] text-ink-soft">Popular</span>
          <div className="flex flex-wrap gap-2">
            {POPULAR.map((p) => {
              return (
                <button
                  key={p.label}
                  onClick={() => {
                    setName(p.label);
                    setCategory(p.category);
                  }}
                  className="flex items-center gap-1.5 h-[34px] pl-2 pr-3 rounded-[17px] bg-surface border border-hairline active:scale-95 transition-transform"
                >
                  <Icon name={p.icon} size={16} weight={500} className="text-pine" />
                  <span className="text-[13px] font-[500] text-[#3d413f]">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Category">
            <Select
              value={category}
              onChange={setCategory}
              placeholder="Select"
              options={CATEGORIES}
            />
          </Field>
          <Field label="Started">
            <input
              type="month"
              value={started}
              onChange={(e) => setStarted(e.target.value)}
              className="h-[54px] w-full rounded-xl bg-surface border border-hairline px-2.5 text-[15px] text-ink outline-none focus:border-pine transition-colors"
            />
          </Field>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-[500] text-ink-soft">How often</span>
          <div className="flex h-11 rounded-[22px] border border-hairline overflow-hidden">
            {CADENCES.map((c) => (
              <button
                key={c}
                onClick={() => setCadence(c)}
                aria-pressed={c === cadence}
                className={`flex-1 text-[14px] font-[600] transition-colors ${
                  c === cadence ? "bg-pine-soft text-pine-dark" : "bg-surface text-[#3d413f]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="my-1.5 h-px bg-[#e7e4dc]" />

        <div className="flex flex-col gap-3.5">
          <SectionHead
            icon={<Icon name="trophy" size={20} />}
            title="Accomplishments"
            tint="bg-amber-soft text-amber"
          />

          {wins.map((w) => (
            <div key={w.id} className="flex flex-col gap-3.5">
              <Field label="What happened?">
                <input
                  value={w.title}
                  onChange={(e) => setWin(w.id, { title: e.target.value })}
                  placeholder="e.g. Passed Grade 3 piano exam"
                  className="h-[54px] w-full rounded-xl bg-surface border border-hairline px-3.5 text-[16px] text-ink outline-none focus:border-pine transition-colors"
                />
              </Field>
              <Field label="When">
                <input
                  type="month"
                  value={w.when}
                  onChange={(e) => setWin(w.id, { when: e.target.value })}
                  className="h-[54px] w-full rounded-xl bg-surface border border-hairline px-3 text-[15px] text-ink outline-none focus:border-pine transition-colors"
                />
              </Field>
              <div className="grid grid-cols-2 gap-2.5">
                <Field label="Activity · optional">
                  <Select
                    value={w.activity}
                    onChange={(v) => setWin(w.id, { activity: v })}
                    placeholder={name.trim() ? name.trim() : "Select"}
                    options={existing.map((a) => a.name)}
                  />
                </Field>
                <Field label="Category · optional">
                  <Select
                    value={w.category}
                    onChange={(v) => setWin(w.id, { category: v })}
                    placeholder="Select"
                    options={CATEGORIES}
                  />
                </Field>
              </div>
            </div>
          ))}

          <button
            onClick={() =>
              setWins((prev) => [
                ...prev,
                { id: Date.now(), title: "", when: "", activity: "", category: "" },
              ])
            }
            className="self-start flex items-center gap-1.5 h-11 pl-3.5 pr-[18px] rounded-[22px] bg-surface border-[1.5px] border-amber text-amber-dark font-[600] text-[14px] active:scale-[0.98] transition-transform"
          >
            <Icon name="add" size={20} /> Add another accomplishment
          </button>
        </div>
      </div>

      <div className="shrink-0 px-6 pt-3 pb-5">
        <button
          onClick={save}
          disabled={!canSave}
          className="h-14 w-full rounded-[28px] bg-pine text-white font-[600] text-[16px] disabled:bg-[#a7c1b9] active:scale-[0.98] transition-all"
        >
          Save
        </button>
      </div>
    </Screen>
  );
}

function SectionHead({
  icon,
  title,
  tint,
}: {
  icon: React.ReactNode;
  title: string;
  tint: string;
}) {
  return (
    <div className="pt-1 flex items-center gap-2.5">
      <span className={`grid place-items-center w-9 h-9 rounded-full ${tint}`}>{icon}</span>
      <span className="font-[700] text-[19px] tracking-[-0.01em] text-ink">{title}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 min-w-0">
      <span className="text-[13px] font-[500] text-ink-soft">{label}</span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: readonly string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[52px] w-full appearance-none rounded-xl bg-surface border border-hairline pl-2.5 pr-9 text-[16px] text-ink outline-none focus:border-pine transition-colors"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <Icon name="keyboard_arrow_down"
        size={18}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
      />
    </div>
  );
}
