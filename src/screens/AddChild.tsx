import { useState, useRef, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Plus,
  Check,
  ChevronDown,
  ImageUp,
  Loader2,
  Sparkles,
  Trash2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Screen, AppHeader, PrimaryButton } from "../components/ui";

const GRADES = ["Pre-K", "K", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
const CIRCLE = 240;
const MAX_BYTES = 12 * 1024 * 1024;

/* Your kids — step 1 of onboarding.
   ---------------------------------
   Rebuilt from the Oct-1 prototype, whose note reads "Add several kids in one
   pass: name, grade, optional birth date + photo". The old screen collected
   one child and moved on; a parent with two or three had no way through
   without repeating the whole flow later.

   Saved kids are plain rows, not cards — the prototype drops boxes around list
   rows throughout. The photo control and its cropper are the existing ones,
   kept as-is: the prototype only sketches a placeholder there, and losing a
   working cropper to match a sketch would be a step backwards. */

type Kid = {
  id: number;
  first: string;
  last: string;
  grade: string;
  dob: string;
  photo: string | null;
};

const EMPTY = { first: "", last: "", grade: "", dob: "", photo: null as string | null };

/* Cycles the three brand colours so siblings are told apart at a glance. */
const TINTS = [
  { soft: "bg-pine-soft", text: "text-pine" },
  { soft: "bg-amber-soft", text: "text-amber-dark" },
  { soft: "bg-rust-soft", text: "text-rust" },
];

export function AddChild({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: (name: string) => void;
}) {
  const [kids, setKids] = useState<Kid[]>([]);
  const [draft, setDraft] = useState(EMPTY);
  const [formOpen, setFormOpen] = useState(true);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imgNatRef = useRef<{ w: number; h: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const seq = useRef(0);

  const openFilePicker = () => fileRef.current?.click();

  /* Single path for every way a photo can arrive: picker, drop or paste. */
  const ingest = useCallback((file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image. Try a JPG or PNG.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That image is over 12 MB. Try a smaller one.");
      return;
    }
    setError(null);
    setReading(true);

    const reader = new FileReader();
    reader.onerror = () => {
      setReading(false);
      setError("We couldn't read that file. Try another one.");
    };
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onerror = () => {
        setReading(false);
        setError("That image looks damaged. Try another one.");
      };
      img.onload = () => {
        imgNatRef.current = { w: img.naturalWidth, h: img.naturalHeight };
        setReading(false);
        setRawSrc(src);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    ingest(e.target.files?.[0]);
    e.target.value = "";
  };

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files ?? [])[0];
      if (file) {
        e.preventDefault();
        ingest(file);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [ingest]);

  const handleConfirmCrop = useCallback(
    (scale: number, offset: { x: number; y: number }) => {
      if (!rawSrc || !imgNatRef.current) return;
      const { w: nw, h: nh } = imgNatRef.current;
      const img = new Image();
      img.onload = () => {
        const OUT = 440;
        const canvas = document.createElement("canvas");
        canvas.width = OUT;
        canvas.height = OUT;
        const ctx = canvas.getContext("2d")!;

        ctx.beginPath();
        ctx.arc(OUT / 2, OUT / 2, OUT / 2, 0, Math.PI * 2);
        ctx.clip();

        const coverS = Math.max(CIRCLE / nw, CIRCLE / nh);
        const renderW = nw * coverS * scale;
        const renderH = nh * coverS * scale;
        const imgLeft = CIRCLE / 2 + offset.x - renderW / 2;
        const imgTop = CIRCLE / 2 + offset.y - renderH / 2;
        const s = OUT / CIRCLE;

        ctx.drawImage(img, imgLeft * s, imgTop * s, renderW * s, renderH * s);
        setCroppedUrl(canvas.toDataURL("image/jpeg", 0.92));
        setRawSrc(null);
      };
      img.src = rawSrc;
    },
    [rawSrc],
  );

  const canSave = draft.first.trim().length > 0;

  const saveChild = () => {
    if (!canSave) return;
    setKids((prev) => [
      ...prev,
      { ...draft, first: draft.first.trim(), last: draft.last.trim(), photo: croppedUrl, id: ++seq.current },
    ]);
    setDraft(EMPTY);
    setCroppedUrl(null);
    setFormOpen(false);
  };

  const removeKid = (id: number) => {
    setKids((prev) => {
      const next = prev.filter((k) => k.id !== id);
      if (next.length === 0) setFormOpen(true);
      return next;
    });
  };

  const metaFor = (k: Kid) =>
    [k.grade, k.dob ? new Date(k.dob).getFullYear() : null].filter(Boolean).join(" \u00b7 ") || "No grade yet";

  return (
    <Screen>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      <AppHeader title="Your kids" onBack={onBack} step="Step 1 of 3" />

      <div className="flex-1 overflow-y-auto scroll-area px-4 pb-4 flex flex-col gap-5">
        {/* Saved kids — rows, no boxes */}
        {kids.length > 0 && (
          <div className="flex flex-col">
            {kids.map((k, i) => {
              const tint = TINTS[i % TINTS.length];
              return (
                <div key={k.id} className="flex items-center gap-3.5 min-h-[60px]">
                  {k.photo ? (
                    <img
                      src={k.photo}
                      alt=""
                      decoding="async"
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <span
                      className={`grid place-items-center w-10 h-10 rounded-full shrink-0 font-[700] text-[15px] ${tint.soft} ${tint.text}`}
                    >
                      {k.first.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-[600] text-ink truncate">
                      {[k.first, k.last].filter(Boolean).join(" ")}
                    </p>
                    <p className="text-[13px] text-ink-soft truncate">{metaFor(k)}</p>
                  </div>
                  <button
                    onClick={() => removeKid(k.id)}
                    aria-label={`Remove ${k.first}`}
                    className="grid place-items-center w-11 h-11 rounded-full text-ink-soft active:bg-hairline/50 transition-colors shrink-0"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Inline form for the child being added */}
        {formOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-3.5"
          >
            <div className="flex items-center gap-3.5">
              <button
                onClick={openFilePicker}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  ingest(e.dataTransfer.files?.[0]);
                }}
                aria-label={croppedUrl ? "Change photo" : "Add a photo"}
                className={`grid place-items-center w-16 h-16 rounded-full border-[1.5px] border-dashed overflow-hidden shrink-0 transition-colors ${
                  dragging ? "border-pine bg-pine-soft" : "border-pine/40 bg-surface"
                }`}
              >
                {reading ? (
                  <Loader2 size={22} className="animate-spin text-pine" />
                ) : croppedUrl ? (
                  <img src={croppedUrl} alt="" className="size-full object-cover" />
                ) : dragging ? (
                  <ImageUp size={24} className="text-pine" />
                ) : (
                  <Camera size={24} className="text-pine" />
                )}
              </button>
              <div>
                <p className="text-[15px] font-[500] text-ink">
                  {croppedUrl ? "Photo added" : "Add a photo"}
                </p>
                <p className="text-[13px] text-ink-soft">Optional</p>
              </div>
            </div>

            {error && <p className="text-[12.5px] text-rust">{error}</p>}

            <div className="grid grid-cols-2 gap-2.5">
              <Field label="First name">
                <input
                  value={draft.first}
                  onChange={(e) => setDraft({ ...draft, first: e.target.value })}
                  placeholder="Reet"
                  className="h-[52px] w-full rounded-xl bg-surface border border-hairline px-3.5 text-[16px] text-ink outline-none focus:border-pine transition-colors"
                />
              </Field>
              <Field label="Last name">
                <input
                  value={draft.last}
                  onChange={(e) => setDraft({ ...draft, last: e.target.value })}
                  placeholder="Singh"
                  className="h-[52px] w-full rounded-xl bg-surface border border-hairline px-3.5 text-[16px] text-ink outline-none focus:border-pine transition-colors"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Field label="Grade">
                <div className="relative">
                  <select
                    value={draft.grade}
                    onChange={(e) => setDraft({ ...draft, grade: e.target.value })}
                    className="h-[52px] w-full appearance-none rounded-xl bg-surface border border-hairline pl-3.5 pr-9 text-[16px] text-ink outline-none focus:border-pine transition-colors"
                  >
                    <option value="">Select</option>
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
                  />
                </div>
              </Field>
              <Field label="Birth date · optional">
                <input
                  type="date"
                  value={draft.dob}
                  onChange={(e) => setDraft({ ...draft, dob: e.target.value })}
                  className="h-[52px] w-full rounded-xl bg-surface border border-hairline px-3 text-[15px] text-ink outline-none focus:border-pine transition-colors"
                />
              </Field>
            </div>

            <button
              onClick={saveChild}
              disabled={!canSave}
              className="self-start h-11 px-6 rounded-full bg-pine-soft text-pine-dark font-[600] text-[14px] disabled:opacity-40 active:scale-[0.98] transition-all"
            >
              Save child
            </button>
          </motion.div>
        ) : (
          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-3.5 min-h-[56px] text-pine font-[600] text-[16px] text-left"
          >
            <span className="grid place-items-center w-10 h-10 rounded-full border-[1.5px] border-dashed border-pine/40 shrink-0">
              <Plus size={22} />
            </span>
            Add another child
          </button>
        )}
      </div>

      <div className="shrink-0 px-4 pt-3 pb-5">
        <PrimaryButton
          onClick={() => onContinue(kids[0]?.first ?? draft.first.trim())}
          disabled={kids.length === 0}
        >
          Continue
        </PrimaryButton>
      </div>

      <AnimatePresence>
        {rawSrc && (
          <CropModal
            src={rawSrc}
            natW={imgNatRef.current?.w ?? 1}
            natH={imgNatRef.current?.h ?? 1}
            onCancel={() => setRawSrc(null)}
            onConfirm={handleConfirmCrop}
          />
        )}
      </AnimatePresence>
    </Screen>
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

function CropModal({
  src,
  natW,
  natH,
  onConfirm,
  onCancel,
}: {
  src: string;
  natW: number;
  natH: number;
  onConfirm: (scale: number, offset: { x: number; y: number }) => void;
  onCancel: () => void;
}) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const cropRef = useRef<HTMLDivElement>(null);

  const coverScale = Math.max(CIRCLE / natW, CIRCLE / natH);
  const renderW = natW * coverScale * scale;
  const renderH = natH * coverScale * scale;
  const imgLeft = CIRCLE / 2 + offset.x - renderW / 2;
  const imgTop = CIRCLE / 2 + offset.y - renderH / 2;

  useEffect(() => {
    const el = cropRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScale((s) => Math.max(0.8, Math.min(4, s - e.deltaY * 0.003)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setOffset({
      x: dragRef.current.ox + (e.clientX - dragRef.current.sx),
      y: dragRef.current.oy + (e.clientY - dragRef.current.sy),
    });
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-50 bg-black flex flex-col select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4 shrink-0">
        <button
          onClick={onCancel}
          className="text-white/60 text-[15px] font-[500] active:text-white/40 transition-colors"
        >
          Cancel
        </button>
        <span className="text-white text-[15px] font-[600]">Move and Scale</span>
        <button
          onClick={() => onConfirm(scale, offset)}
          className="text-[#2fd6c6] text-[15px] font-[700] active:opacity-60 transition-opacity"
        >
          Use Photo
        </button>
      </div>

      {/* Crop area */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Dimmed full image behind */}
        <img decoding="async"
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{ opacity: 0.18 }}
        />

        {/* Circular crop window */}
        <div
          ref={cropRef}
          className="relative rounded-full overflow-hidden ring-2 ring-white/40 cursor-grab active:cursor-grabbing"
          style={{ width: CIRCLE, height: CIRCLE, touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <img decoding="async"
            src={src}
            alt=""
            draggable={false}
            style={{
              position: "absolute",
              width: renderW,
              height: renderH,
              left: imgLeft,
              top: imgTop,
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {/* Zoom controls */}
      <div className="shrink-0 flex items-center justify-center gap-4 px-8 pb-14 pt-5">
        <button
          onClick={() => setScale((s) => Math.max(0.8, s - 0.1))}
          className="grid place-items-center w-10 h-10 rounded-full bg-white/15 text-white active:bg-white/30 transition-colors"
        >
          <ZoomOut size={18} />
        </button>
        <input
          type="range"
          min={0.8}
          max={3}
          step={0.02}
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
          className="flex-1"
          style={{ accentColor: "#217c72" }}
        />
        <button
          onClick={() => setScale((s) => Math.min(3, s + 0.1))}
          className="grid place-items-center w-10 h-10 rounded-full bg-white/15 text-white active:bg-white/30 transition-colors"
        >
          <ZoomIn size={18} />
        </button>
      </div>
    </motion.div>
  );
}

