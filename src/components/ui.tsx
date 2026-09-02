import { motion } from "framer-motion";
import { ArrowLeft, Check, Eye, EyeOff } from "lucide-react";
import { useState, type ReactNode } from "react";
import { PhoneFrame } from "./PhoneFrame";

/* ---------- Phone shell ----------
   The app is a phone design, so it renders inside a hardware frame with the
   iOS status bar, Dynamic Island and home indicator. The frame scales to fit
   whatever window it is viewed in. */
export function PhoneShell({ children }: { children: ReactNode }) {
  return <PhoneFrame>{children}</PhoneFrame>;
}

/* ---------- Screen scaffold ---------- */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="size-full flex flex-col bg-canvas"
    >
      {children}
    </motion.div>
  );
}

export function AppHeader({
  title,
  onBack,
  trailing,
}: {
  title?: string;
  onBack?: () => void;
  trailing?: ReactNode;
}) {
  return (
    <div className="shrink-0 pt-12 px-4 pb-2 flex items-center gap-3">
      {onBack ? <BackButton onClick={onBack} /> : <span className="w-10" />}
      <h2 className="flex-1 text-center font-display text-[17px] font-[600] text-ink">
        {title}
      </h2>
      {trailing ?? <span className="w-10" />}
    </div>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="grid place-items-center w-10 h-10 rounded-full bg-surface border border-hairline text-ink active:scale-95 transition-transform"
    >
      <ArrowLeft size={19} strokeWidth={2.2} />
    </button>
  );
}

/* ---------- Buttons ---------- */
export function PrimaryButton({
  children,
  onClick,
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-[54px] w-full rounded-2xl bg-teal text-white font-sans font-[600] text-[16px] tracking-tight
        shadow-[0_10px_24px_-10px_rgba(33,124,114,0.7)]
        active:scale-[0.985] transition-all duration-150
        disabled:opacity-40 disabled:shadow-none ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-[54px] w-full rounded-2xl bg-surface border border-hairline text-ink font-sans font-[600] text-[16px] tracking-tight active:scale-[0.985] transition-all duration-150 ${className}`}
    >
      {children}
    </button>
  );
}

export function TextLink({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-teal font-[600] active:opacity-60 transition-opacity"
    >
      {children}
    </button>
  );
}

/* ---------- Inputs ---------- */
export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <label className="block">
      <span className="block text-[13px] font-[500] text-ink-soft mb-1.5 ml-0.5">
        {label}
      </span>
      <input
        type={type}
        value={value}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        className={`h-[52px] w-full rounded-2xl bg-surface px-4 text-[16px] text-ink placeholder:text-ink-soft/60
          border transition-colors outline-none ${
            focused ? "border-teal ring-4 ring-teal/10" : "border-hairline"
          }`}
      />
    </label>
  );
}

export function PasswordField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <label className="block">
      <span className="block text-[13px] font-[500] text-ink-soft mb-1.5 ml-0.5">
        {label}
      </span>
      <div
        className={`h-[52px] w-full rounded-2xl bg-surface flex items-center pr-2 pl-4 border transition-colors ${
          focused ? "border-teal ring-4 ring-teal/10" : "border-hairline"
        }`}
      >
        <input
          type={show ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-[16px] text-ink placeholder:text-ink-soft/60 outline-none"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="grid place-items-center w-9 h-9 rounded-xl text-ink-soft active:bg-canvas"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  );
}

/* ---------- Google button ---------- */
export function GoogleButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-[54px] w-full rounded-2xl bg-surface border border-hairline flex items-center justify-center gap-3 font-sans font-[600] text-[15px] text-ink active:scale-[0.985] transition-transform"
    >
      <GoogleGlyph />
      Continue with Google
    </button>
  );
}

export function AppleButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-[54px] w-full rounded-2xl bg-surface border border-hairline flex items-center justify-center gap-3 font-sans font-[600] text-[15px] text-ink active:scale-[0.985] transition-transform"
    >
      <AppleGlyph />
      Continue with Apple
    </button>
  );
}

export function AppleGlyph({ size = 19 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#172321" aria-hidden>
      <path d="M16.36 12.79c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.83-.81-3.01-.79-1.55.02-2.98.9-3.777 2.29-1.61 2.79-.41 6.92 1.15 9.18.76 1.11 1.67 2.35 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.78.74 3 .72 1.24-.02 2.02-1.12 2.78-2.24.88-1.28 1.24-2.52 1.26-2.59-.03-.01-2.41-.93-2.43-3.7zM14.09 5.66c.63-.77 1.06-1.83.94-2.9-.91.04-2.02.61-2.67 1.37-.58.68-1.09 1.77-.95 2.81 1.02.08 2.05-.52 2.68-1.28z" />
    </svg>
  );
}

export function GoogleGlyph({ size = 19 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

/* ---------- Child avatar ---------- */
export function ChildAvatar({
  src,
  name,
  size = 44,
  ring,
}: {
  src?: string;
  name: string;
  size?: number;
  ring?: string;
}) {
  return (
    <div
      className="rounded-full overflow-hidden bg-mint grid place-items-center shrink-0"
      style={{
        width: size,
        height: size,
        boxShadow: ring ? `0 0 0 2.5px ${ring}, 0 0 0 5px #fff` : undefined,
      }}
    >
      {src ? (
        <img decoding="async" src={src} alt={name} className="size-full object-cover" />
      ) : (
        <span className="font-display font-[600] text-teal-dark" style={{ fontSize: size * 0.4 }}>
          {name.charAt(0)}
        </span>
      )}
    </div>
  );
}

/* ---------- Small stat item ---------- */
export function StatItem({
  value,
  label,
  accent = false,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="flex-1 text-center">
      <div
        className={`font-display text-[26px] font-[700] leading-none ${
          accent ? "text-gold" : "text-teal"
        }`}
      >
        {value}
      </div>
      <div className="text-[12px] text-ink-soft mt-1.5 font-[500]">{label}</div>
    </div>
  );
}

/* ---------- Checkmark badge ---------- */
export function CheckBadge({ size = 20, tone = "teal" }: { size?: number; tone?: "teal" | "gold" }) {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 22 }}
      className="grid place-items-center rounded-full text-white"
      style={{
        width: size,
        height: size,
        background: tone === "teal" ? "#217c72" : "#b8893b",
      }}
    >
      <Check size={size * 0.62} strokeWidth={3} />
    </motion.span>
  );
}
