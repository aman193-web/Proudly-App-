import { motion } from "framer-motion";
import { ArrowLeft, Check, Eye, EyeOff } from "lucide-react";
import { useState, type ReactNode } from "react";

/* ---------- Phone shell ---------- */
export function PhoneShell({ children }: { children: ReactNode }) {
  return <div className="size-full bg-canvas">{children}</div>;
}

function SignalDots() {
  return (
    <svg width="52" height="13" viewBox="0 0 52 13" fill="none">
      <rect x="0" y="4" width="3" height="7" rx="1" fill="#172321" />
      <rect x="5" y="2.5" width="3" height="8.5" rx="1" fill="#172321" />
      <rect x="10" y="1" width="3" height="10" rx="1" fill="#172321" />
      <rect x="15" y="0" width="3" height="11" rx="1" fill="#172321" opacity="0.35" />
      <rect x="24" y="0" width="17" height="11" rx="3" stroke="#172321" strokeOpacity="0.5" />
      <rect x="25.5" y="1.5" width="12" height="8" rx="1.5" fill="#172321" />
      <rect x="42" y="3.5" width="1.6" height="4" rx="0.8" fill="#172321" opacity="0.5" />
    </svg>
  );
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
        <img src={src} alt={name} className="size-full object-cover" />
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
