/* Brand mark
   ----------
   Three ascending bars in a rounded square — the Oct-1 redesign's geometric
   mark, replacing the star ("Geometric mark, no smiley" in the client's own
   notes). Geometry is the prototype's 80px original scaled to this 32 viewBox
   (x0.4): 10px bars become 4, the 6px gaps 2.4, the 20px baseline inset 8.

   `color` defaults to the original teal so the mark stays consistent on
   screens that have not been ported to the new palette yet; Welcome passes
   pine. That lets the brand update app-wide with the rename without dragging
   the new colours onto screens still designed around the old ones. */
export function Mark({
  size = 30,
  color = "#217c72",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="10.4" fill={color} />
      {/* bottom-aligned on y=24, centred as a group across the 32 width */}
      <rect x="7.6" y="18.4" width="4" height="5.6" rx="2" fill="#fff" opacity="0.5" />
      <rect x="14" y="13.6" width="4" height="10.4" rx="2" fill="#fff" opacity="0.75" />
      <rect x="20.4" y="8" width="4" height="16" rx="2" fill="#fff" />
    </svg>
  );
}

export function Logo({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Mark />
      <span
        className={`font-display font-[700] text-[22px] tracking-[0.14em] ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        BragOn
      </span>
    </div>
  );
}
