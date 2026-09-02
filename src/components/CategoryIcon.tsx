import {
  BookOpen,
  Drama,
  FlaskConical,
  Music,
  Palette,
  Shapes,
  Trees,
  Volleyball,
} from "lucide-react";
import { type Category, CATEGORY_COLOR } from "../data";

/* Category icons
   --------------
   Used where a row has room to say what kind of activity it is — the
   activities list, the portfolio feed and collage, and achievement rows.
   Tighter spots (the Gantt label, preview sheets, calendar cells, filter
   chips) keep the plain colour dot.

   The icon carries the same category colour the dot did, so the colour
   language across the app is unchanged. */
const CATEGORY_ICON: Record<Category, typeof Music> = {
  Sports: Volleyball,
  Music: Music,
  "Dance & Theater": Drama,
  Academics: BookOpen,
  Arts: Palette,
  STEM: FlaskConical,
  Outdoors: Trees,
  Other: Shapes,
};

export function CategoryIcon({
  category,
  size = 18,
  color,
}: {
  category: Category;
  size?: number;
  /** Defaults to the category colour. */
  color?: string;
}) {
  const Icon = CATEGORY_ICON[category];
  return <Icon size={size} color={color ?? CATEGORY_COLOR[category]} strokeWidth={2} aria-hidden />;
}
