import { motion } from "framer-motion";
import { AlertTriangle, Check, Loader2, RefreshCw } from "lucide-react";
import googleCalIcon from "@/imports/image.png";
import googlePhotosIcon from "@/imports/image-1.png";

export type SourceState =
  | "not_connected"
  | "connecting"
  | "connected"
  | "denied"
  | "reconnect";

const META: Record<SourceState, { label: string; tone: string; bg: string }> = {
  not_connected: { label: "Not connected", tone: "#66716e", bg: "#f2f4f1" },
  connecting: { label: "Connecting…", tone: "#217c72", bg: "#f2f4f1" },
  connected: { label: "Connected", tone: "#217c72", bg: "#dcefeb" },
  denied: { label: "Permission denied", tone: "#b4432f", bg: "#faeae6" },
  reconnect: { label: "Reconnect required", tone: "#a3762a", bg: "#f6edda" },
};

export function SourceCard({
  kind,
  title,
  purpose,
  state,
  onAction,
}: {
  kind: "calendar" | "photos";
  title: string;
  purpose: string;
  state: SourceState;
  onAction: () => void;
}) {
  const connected = state === "connected";

  return (
    <div
      className={`rounded-3xl border bg-surface p-4 transition-colors ${
        connected ? "border-teal/40" : "border-hairline"
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div
          className="grid place-items-center w-11 h-11 rounded-2xl shrink-0 bg-white border border-hairline/60 overflow-hidden p-1"
        >
          <img
            src={kind === "calendar" ? googleCalIcon : googlePhotosIcon}
            alt={kind === "calendar" ? "Google Calendar" : "Google Photos"}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-display font-[600] text-[16px] text-ink truncate">{title}</h3>
          <p className="text-[13px] leading-snug text-ink-soft mt-0.5">{purpose}</p>
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-between">
        <StatusPill state={state} />
        <ActionControl state={state} onAction={onAction} />
      </div>
    </div>
  );
}

function StatusPill({ state }: { state: SourceState }) {
  const meta = META[state];
  return (
    <span
      className="inline-flex items-center gap-1.5 h-7 pl-1.5 pr-2.5 rounded-full text-[12.5px] font-[600]"
      style={{ color: meta.tone, background: meta.bg }}
    >
      {state === "connected" && (
        <span className="grid place-items-center w-4 h-4 rounded-full bg-teal text-white">
          <Check size={10} strokeWidth={3.5} />
        </span>
      )}
      {state === "connecting" && <Loader2 size={13} className="animate-spin" />}
      {state === "denied" && <AlertTriangle size={13} />}
      {state === "reconnect" && <RefreshCw size={12} />}
      {meta.label}
    </span>
  );
}

function ActionControl({ state, onAction }: { state: SourceState; onAction: () => void }) {
  if (state === "connecting") {
    return (
      <div className="h-8 w-8 grid place-items-center">
        <motion.span
          className="block w-4 h-4 rounded-full border-2 border-teal/25 border-t-teal"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
        />
      </div>
    );
  }
  if (state === "connected") {
    return (
      <button
        onClick={onAction}
        className="text-[13px] font-[600] text-ink-soft h-8 px-2 active:opacity-60"
      >
        Manage
      </button>
    );
  }
  const label =
    state === "reconnect" ? "Reconnect" : state === "denied" ? "Try again" : "Connect";
  return (
    <button
      onClick={onAction}
      className="h-8 px-4 rounded-full bg-teal text-white text-[13px] font-[600] active:scale-95 transition-transform"
    >
      {label}
    </button>
  );
}
