import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

/* Screen geometry, in points. The screen box is the app's viewport;
   everything else is hardware drawn around it.

   380x816 is the client prototype's own viewport. Every spacing, type size
   and gutter in the Oct-1 redesign was set against it, so matching it is what
   makes those numbers land where they do in the prototype. */
const SCREEN_W = 380;
const SCREEN_H = 816;
const BEZEL = 11;
const DEVICE_W = SCREEN_W + BEZEL * 2;
const DEVICE_H = SCREEN_H + BEZEL * 2;
const SCREEN_R = 55;
const DEVICE_R = SCREEN_R + BEZEL;

/** Largest whole-device scale that still fits the window. */
function useFitScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const compute = () => {
      // Give the device breathing room on desktop, none on a phone-sized window.
      const pad = window.innerWidth < 520 ? 0 : 40;
      const next = Math.min(
        1,
        (window.innerWidth - pad) / DEVICE_W,
        (window.innerHeight - pad) / DEVICE_H,
      );
      setScale(Math.max(0.25, next));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return scale;
}

const formatClock = (d: Date) =>
  `${((d.getHours() + 11) % 12) + 1}:${String(d.getMinutes()).padStart(2, "0")}`;

function useClock() {
  const [time, setTime] = useState(() => formatClock(new Date()));
  useEffect(() => {
    const id = setInterval(() => setTime(formatClock(new Date())), 15000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function SignalBars() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={i * 4.6}
          y={9 - i * 3}
          width="3"
          height={3 + i * 3}
          rx="1"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

function Battery() {
  return (
    <svg width="27" height="13" viewBox="0 0 27 13" fill="none" aria-hidden>
      <rect
        x="0.5"
        y="0.5"
        width="23"
        height="12"
        rx="3.6"
        stroke="currentColor"
        strokeOpacity="0.4"
      />
      <rect x="2" y="2" width="20" height="9" rx="2.2" fill="currentColor" />
      <path
        d="M25 4.5v4c1 -0.35 1.4 -0.9 1.4 -2s-0.4 -1.65 -1.4 -2z"
        fill="currentColor"
        fillOpacity="0.4"
      />
    </svg>
  );
}

/* iOS status bar. Sits above app content, the way system chrome does.

   STATUS_H is the prototype's own 40px band: screens clear it with their own
   top padding, so changing it here moves every screen's first row together. */
export const STATUS_H = 40;

function StatusBar({ time }: { time: string }) {
  return (
    <div
      className="absolute inset-x-0 top-0 z-[100] flex items-center justify-between pl-[30px] pr-[26px] text-ink pointer-events-none select-none"
      style={{ height: STATUS_H }}
    >
      <span className="text-[14px] font-[600] tracking-[-0.01em] leading-none tabular-nums">
        {time}
      </span>
      <span className="flex items-center gap-[5px]">
        <SignalBars />
        <Icon name="wifi" size={15} strokeWidth={2.4} />
        <Battery />
      </span>
    </div>
  );
}

function NotchDot() {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 z-[110] rounded-full bg-black pointer-events-none"
      style={{ top: 9, width: 22, height: 22 }}
    >
    </div>
  );
}

/* The 22px band the prototype reserves at the foot of every screen. */
export const INDICATOR_H = 22;

function HomeIndicator() {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 z-[100] rounded-full bg-ink pointer-events-none"
      style={{ bottom: 9, width: 110, height: 4 }}
    />
  );
}

/** A side button on the titanium rail. */
function SideButton({
  side,
  top,
  height,
}: {
  side: "left" | "right";
  top: number;
  height: number;
}) {
  return (
    <span
      className="absolute"
      style={{
        [side]: -3,
        top,
        width: 3.5,
        height,
        borderRadius: 2,
        background: "linear-gradient(180deg,#6f6f76,#3f4046 35%,#2c2d31 70%,#55565c)",
      }}
    />
  );
}

export function PhoneFrame({ children }: { children: ReactNode }) {
  const scale = useFitScale();
  const time = useClock();

  return (
    <div
      className="size-full grid place-items-center overflow-hidden"
      style={{
        background:
          "radial-gradient(1200px 700px at 50% 0%, #f4f6f3 0%, #e6e9e4 55%, #dde1db 100%)",
      }}
    >
      {/* Reserve the scaled footprint so the device stays centred. */}
      <div style={{ width: DEVICE_W * scale, height: DEVICE_H * scale }}>
        <div
          className="relative"
          style={{
            width: DEVICE_W,
            height: DEVICE_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {/* Buttons sit under the body so only their edge shows. */}
          <SideButton side="left" top={152} height={32} />
          <SideButton side="left" top={214} height={64} />
          <SideButton side="left" top={292} height={64} />
          <SideButton side="right" top={236} height={102} />

          {/* Titanium rail */}
          <div
            className="absolute inset-0"
            style={{
              borderRadius: DEVICE_R,
              background: "linear-gradient(150deg,#8d8f95 0%,#43454b 22%,#2a2b30 55%,#6b6d74 100%)",
              boxShadow:
                "0 42px 80px -28px rgba(23,35,33,0.55), 0 12px 28px -12px rgba(23,35,33,0.35)",
            }}
          />
          {/* Inner black bezel */}
          <div
            className="absolute"
            style={{
              inset: 2.5,
              borderRadius: DEVICE_R - 2.5,
              background: "#08090b",
            }}
          />

          {/* Screen — the app's viewport and the positioning context for its overlays */}
          <div
            className="absolute overflow-hidden bg-canvas"
            style={{
              left: BEZEL,
              top: BEZEL,
              width: SCREEN_W,
              height: SCREEN_H,
              borderRadius: SCREEN_R,
            }}
          >
            <div className="relative size-full">
              {children}
              <StatusBar time={time} />
              <NotchDot />
              <HomeIndicator />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
