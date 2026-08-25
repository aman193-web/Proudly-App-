export function Logo({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Mark />
      <span
        className={`font-display font-[700] text-[22px] tracking-[0.14em] ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        PROUDLY
      </span>
    </div>
  );
}

export function Mark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="9" fill="#217c72" />
      <path
        d="M16 8.5l2.1 4.4 4.9.6-3.6 3.3 1 4.8L16 19.3l-4.4 2.3 1-4.8-3.6-3.3 4.9-.6L16 8.5z"
        fill="#fff"
      />
    </svg>
  );
}
