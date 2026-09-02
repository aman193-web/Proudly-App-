import { useState, useRef, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Check,
  ChevronDown,
  ImageUp,
  Loader2,
  Sparkles,
  Trash2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Screen, AppHeader, PrimaryButton, TextField, TextLink } from "../components/ui";
import { StepDots } from "../components/StepDots";
import { ageFromDob } from "../data";

const GRADES = ["Pre-K", "Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8"];
const CIRCLE = 240;
const MAX_BYTES = 12 * 1024 * 1024;

export function AddChild({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [grade, setGrade] = useState("");
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imgNatRef = useRef<{ w: number; h: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  /* Paste an image straight onto the step. */
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

  return (
    <Screen>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      <AppHeader title="Add your child" onBack={onBack} />
      <div className="flex-1 px-4 pt-3 flex flex-col overflow-y-auto scroll-area">
        <StepDots total={3} current={0} />

        <h1 className="font-display text-[25px] font-[700] text-ink leading-tight mt-5">
          Who are we celebrating?
        </h1>
        <p className="text-[15px] text-ink-soft mt-1">
          You can add more children anytime later.
        </p>

        {/* Photo control — tap, drop or paste */}
        <div
          className="flex flex-col items-center mt-7"
          onDragEnter={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => {
            // Ignore bubbling from children so the ring doesn't flicker.
            if (e.currentTarget.contains(e.relatedTarget as Node)) return;
            setDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            ingest(e.dataTransfer.files?.[0]);
          }}
        >
          <motion.button
            onClick={openFilePicker}
            disabled={reading}
            aria-label={croppedUrl ? "Change your child's photo" : "Add a photo of your child"}
            animate={{ scale: dragging ? 1.06 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
            className="relative rounded-full active:scale-95 transition-transform outline-none focus-visible:ring-4 focus-visible:ring-teal/25"
          >
            <div
              className={`w-[112px] h-[112px] rounded-full overflow-hidden grid place-items-center transition-colors ${
                croppedUrl
                  ? "bg-mint border-2 border-teal/40"
                  : dragging
                    ? "bg-mint border-2 border-teal"
                    : "bg-mint border-2 border-dashed border-teal/35"
              }`}
            >
              {reading ? (
                <Loader2 size={26} className="text-teal-dark/70 animate-spin" />
              ) : croppedUrl ? (
                <motion.img
                  key={croppedUrl}
                  src={croppedUrl}
                  alt="Your child"
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="size-full object-cover"
                />
              ) : dragging ? (
                <ImageUp size={30} className="text-teal" strokeWidth={1.8} />
              ) : (
                <Camera size={30} className="text-teal-dark/70" strokeWidth={1.8} />
              )}
            </div>

            {!reading && (
              <span className="absolute -bottom-0.5 -right-0.5 grid place-items-center w-9 h-9 rounded-full bg-teal text-white border-[3px] border-canvas">
                {croppedUrl ? <Check size={16} strokeWidth={3} /> : <Camera size={16} />}
              </span>
            )}
          </motion.button>

          {/* Helper line / error / post-upload actions */}
          <div className="mt-4 min-h-[62px] flex flex-col items-center justify-start">
            <AnimatePresence mode="wait">
              {error ? (
                <motion.p
                  key="err"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[12.5px] font-[500] text-[#c0504a] bg-[#fbeceb] border border-[#e2b6b0] rounded-full px-3 py-1.5 text-center max-w-[280px]"
                >
                  {error}
                </motion.p>
              ) : croppedUrl ? (
                <motion.div
                  key="actions"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <button
                    onClick={openFilePicker}
                    className="flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-surface border border-hairline text-[13px] font-[600] text-ink active:scale-95 transition-transform"
                  >
                    <Camera size={14} /> Change
                  </button>
                  <button
                    onClick={() => {
                      setCroppedUrl(null);
                      setError(null);
                    }}
                    className="flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-surface border border-hairline text-[13px] font-[600] text-[#c0504a] active:scale-95 transition-transform"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center"
                >
                  {/* Icon sits inline so it rides the first line instead of
                      floating beside the wrapped block. */}
                  <p className="text-[13.5px] leading-[1.4] text-ink-soft text-center text-balance max-w-[254px]">
                    <Sparkles
                      size={13}
                      className="inline align-middle mr-1 -mt-px text-gold"
                    />
                    A photo helps PROUDLY find your child in your memories.
                  </p>
                  <p
                    className={`text-[11.5px] font-[500] tracking-[0.01em] mt-1.5 transition-colors ${
                      dragging ? "text-teal" : "text-ink-soft/60"
                    }`}
                  >
                    {dragging ? "Drop to upload" : "Tap, drop or paste an image"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-7 space-y-4">
          <TextField label="First name" value={name} onChange={setName} placeholder="e.g. Reet" />

          {/* Date of birth. Age is derived from this — we never ask for it. */}
          <div>
            <TextField label="Date of birth" type="date" value={dob} onChange={setDob} />
            <p className="text-[12px] text-ink-soft mt-1.5 ml-0.5">
              {ageFromDob(dob) !== null
                ? `${ageFromDob(dob)} years old · helps us pitch activity levels`
                : "Helps us pitch activity levels for their age"}
            </p>
          </div>

          {/* Grade selector */}
          <div className="relative">
            <span className="block text-[13px] font-[500] text-ink-soft mb-1.5 ml-0.5">Grade</span>
            <button
              onClick={() => setOpen((o) => !o)}
              className={`h-[52px] w-full rounded-2xl bg-surface px-4 flex items-center justify-between border transition-colors ${
                open ? "border-teal ring-4 ring-teal/10" : "border-hairline"
              }`}
            >
              <span className={`text-[16px] ${grade ? "text-ink" : "text-ink-soft/60"}`}>
                {grade || "Select grade"}
              </span>
              <ChevronDown
                size={18}
                className={`text-ink-soft transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-20 mt-2 inset-x-0 bg-surface rounded-2xl border border-hairline shadow-[0_20px_40px_-16px_rgba(23,35,33,0.28)] p-1.5 max-h-56 overflow-y-auto scroll-area"
              >
                {GRADES.map((g) => (
                  <button
                    key={g}
                    onClick={() => {
                      setGrade(g);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 h-10 rounded-xl text-[15px] flex items-center justify-between active:bg-canvas ${
                      grade === g ? "text-teal font-[600] bg-mint/60" : "text-ink"
                    }`}
                  >
                    {g}
                    {grade === g && <Check size={16} className="text-teal" />}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        <div className="mt-auto pt-8 pb-6 space-y-3">
          <PrimaryButton onClick={() => onContinue(name || "Reet")} disabled={!name}>
            Continue
          </PrimaryButton>
          <div className="text-center">
            <TextLink onClick={() => onContinue(name || "Reet")}>Add another child later</TextLink>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {rawSrc && imgNatRef.current && (
          <CropModal
            key="crop"
            src={rawSrc}
            natW={imgNatRef.current.w}
            natH={imgNatRef.current.h}
            onConfirm={handleConfirmCrop}
            onCancel={() => setRawSrc(null)}
          />
        )}
      </AnimatePresence>
    </Screen>
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
