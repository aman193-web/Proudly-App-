/* Material Symbols Rounded
   -----------------------
   The redesign's icon set. The font is ligature-based, so the glyph name goes
   in as text content and the browser substitutes the symbol — which means a
   wrong or unavailable name renders as that word, not as a blank box. Keep
   names in the MS vocabulary.

   `size` sets both the box and the font size, so an icon occupies exactly the
   square the layout reserves for it. `fill` switches the outline to a solid —
   the axis the prototype uses to mark a row as having a note, a tab as
   current, and so on. */
export function Icon({
  name,
  size = 24,
  fill,
  weight,
  strokeWidth,
  className = "",
  style,
}: {
  /** A Material Symbols Rounded ligature, e.g. "sync", "event_upcoming". */
  name: string;
  size?: number;
  /** Solid rather than outline. */
  fill?: boolean;
  /** 100–700; the default 400 matches the prototype everywhere it is unset. */
  weight?: number;
  /** Accepted so a lucide stroke width carries over: 2 maps to 500, 3 to 700. */
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      aria-hidden
      className={`ms shrink-0 select-none ${className}`}
      style={{
        fontSize: size,
        width: size,
        height: size,
        ...({
          "--ms-fill": fill ? 1 : 0,
          "--ms-wght":
            weight ?? (strokeWidth ? Math.min(700, Math.round(strokeWidth * 250)) : 400),
        } as React.CSSProperties),
        ...style,
      }}
    >
      {name}
    </span>
  );
}
