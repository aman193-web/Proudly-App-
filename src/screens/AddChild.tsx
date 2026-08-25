import { useState, useRef, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Check, ChevronDown, Sparkles, ZoomIn, ZoomOut } from "lucide-react";
import { Screen, AppHeader, PrimaryButton, TextField, TextLink } from "../components/ui";
import { StepDots } from "../components/StepDots";

const GRADES = ["Pre-K", "Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8"];
const CIRCLE = 240;

export function AddChild({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const imgNatRef = useRef<{ w: number; h: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const openFilePicker = () => fileRef.current?.click();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        imgNatRef.current = { w: img.naturalWidth, h: img.naturalHeight };
        setRawSrc(src);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

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

        {/* Photo control */}
        <div className="flex flex-col items-center mt-7">
          <button onClick={openFilePicker} className="relative active:scale-95 transition-transform">
            <div className="w-[104px] h-[104px] rounded-full overflow-hidden bg-mint grid place-items-center border border-hairline">
              {croppedUrl ? (
                <img src={croppedUrl} alt="Child" className="size-full object-cover" />
              ) : (
                <Camera size={30} className="text-teal-dark/70" strokeWidth={1.8} />
              )}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 grid place-items-center w-9 h-9 rounded-full bg-teal text-white border-[3px] border-canvas">
              {croppedUrl ? <Check size={16} strokeWidth={3} /> : <Camera size={16} />}
            </span>
          </button>
          <p className="text-[13px] text-ink-soft text-center mt-3.5 max-w-[260px] leading-snug flex items-center gap-1.5 justify-center">
            <Sparkles size={13} className="text-gold shrink-0" />
            A photo helps PROUDLY find your child in your memories.
          </p>
        </div>

        <div className="mt-7 space-y-4">
          <TextField label="First name" value={name} onChange={setName} placeholder="e.g. Reet" />

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
        <img
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
          <img
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
