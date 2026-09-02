/* AI coach mark
   -------------
   Filled mortarboard with a spark that turns a quarter revolution and settles
   — the supplied Boxicons education-filled glyph, recoloured for the app.

   Four departures from the source file, each deliberate:

   1. The keyframes live in index.css as `proudlySpark` rather than in a
      <style> block inside the SVG. This mark renders in four places at once;
      an inline block would duplicate both the rule and the `#Vector_3` id it
      selects, and duplicate ids are invalid. A class works for any number of
      instances and lets the animation respect prefers-reduced-motion with the
      rest of the app's ambient motion.

   2. The source's `#F5F5F5` ring is replaced by a stroked border in the
      `haloColor`. The ring is what stops the spark from merging into the cap
      where the two overlap, and the source drew it as a hand-built outline
      path roughly 0.5 units wide — half a pixel once the mark is scaled to
      icon size, which anti-aliases into nothing. Stroking the spark silhouette
      instead makes the width a number we control (BORDER below). It is a
      knockout, not decoration, so the colour has to match whatever sits behind
      the mark; a fixed light grey would read as a grey ring on the teal FAB.

   3. Miter joins, not round. The star's tips are flat-topped rather than
      pointed, so the sharpest corner has an interior angle of 108 degrees and
      a miter ratio of 1.23 — far inside the default limit of 4. The border
      therefore parallels the star's outline exactly instead of blobbing at the
      points, which is what makes it read as a border.

   4. viewBox is `0 -2.2 24.6 24.6`, not the source's `0 0 24 24`. The spark's
      top point sits at y 0 and the border pushes past it, so the original clip
      would shave it. The bounds also allow for the border's miter apex sweeping
      through the quarter turn.

   The cap and spark use currentColor, so they inherit from the parent. */

/** Spark outline, in the rotating group's local coordinates. */
const SPARK =
  "M4.01283 4.01283L5.18377 0.5H6.13246L7.3034 4.01283L10.8162 5.18377V6.13246L7.3034 7.3034L6.13246 10.8162H5.18377L4.01283 7.3034L0.5 6.13246V5.18377L4.01283 4.01283Z";

/** Border width around the spark, in viewBox units. Stroke is centred on the
    path, so the drawn width is doubled to push this far outward. */
const BORDER = 1.5;

export function AiCoachMark({
  size = 24,
  /** Colour of the border around the spark — set to the background behind the
      mark. Transparent means no separation. */
  haloColor = "transparent",
}: {
  size?: number;
  haloColor?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 -2.2 24.6 24.6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Board */}
      <path
        transform="translate(1.01001 5.00552)"
        d="M20.44 4.60447L11.44 0.10447C11.3017 0.0357575 11.1494 0 10.995 0C10.8406 0 10.6883 0.0357575 10.55 0.10447L4.55 3.10447L1.55 4.60447L0.55 5.10447C0.385085 5.18757 0.246403 5.31471 0.149323 5.4718C0.0522437 5.6289 0.000559705 5.8098 0 5.99447V11.9945H2V6.61447L10.55 10.8945C10.69 10.9645 10.84 11.0045 11 11.0045C11.16 11.0045 11.31 10.9645 11.45 10.8945L20.45 6.39447C20.79 6.22447 21 5.87447 21 5.50447C21 5.13447 20.79 4.78447 20.45 4.61447L20.44 4.60447Z"
        fill="currentColor"
      />
      {/* Band under the board */}
      <path
        transform="translate(5 14.85)"
        d="M7 3.15C6.54 3.15 6.07 3.04 5.66 2.83L0 0V1.59C0 3.65 3.12 6.15 7 6.15C10.88 6.15 14 3.66 14 1.59V0L8.34 2.83C7.93 3.04 7.46 3.15 7 3.15Z"
        fill="currentColor"
      />

      {/* Spark. The transform attribute positions it when the animation is
          switched off; the CSS animation overrides it while running. */}
      <g className="proudly-spark" transform="translate(11.5 -0.5)">
        {/* The spark silhouette, fattened outward, painted over the cap — so
            the star keeps its own edge where the two shapes overlap. */}
        <path
          d={SPARK}
          fill={haloColor}
          stroke={haloColor}
          strokeWidth={BORDER * 2}
          strokeLinejoin="miter"
        />
        <path d={SPARK} fill="currentColor" />
      </g>
    </svg>
  );
}
