import { Icon } from "./Icon";
import { type Category, CATEGORY_COLOR } from "../data";

/* Category icons
   --------------
   Used where a row has room to say what kind of activity it is — the
   activities list, the portfolio feed and collage, and achievement rows.
   Tighter spots (the Gantt label, preview sheets, calendar cells, filter
   chips) keep the plain colour dot.

   Names are the prototype's own Material Symbols, matched category for
   category; Outdoors has no counterpart there, so it takes `park`. */
const CATEGORY_ICON: Record<Category, string> = {
  "Sports & Athletics": "sports_soccer",
  "Music & Performance": "music_note",
  "Dance & Theater": "theater_comedy",
  Academics: "menu_book",
  "Arts & Crafts": "palette",
  "STEM & Robotics": "precision_manufacturing",
  Outdoors: "park",
  Volunteering: "volunteer_activism",
  Other: "star",
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
  return (
    <Icon
      name={CATEGORY_ICON[category]}
      size={size}
      style={{ color: color ?? CATEGORY_COLOR[category] }}
    />
  );
}
