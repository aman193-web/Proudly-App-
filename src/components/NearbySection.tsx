import { useState } from "react";
import { Icon } from "./Icon";
import { showToast } from "./states";
import type { Activity } from "../data";

/* Nearby — sponsored listings on Home.
   -----------------------------------
   The redesign's one piece of monetisation: local businesses matched to what
   the child already does, under the child's own name. It is labelled
   SPONSORED, it sits below the parent's own record rather than above it, and
   it closes for good on one tap — all three are the prototype's choices, and
   worth keeping as they are.

   Listings are keyed off the child's longest-running activity, which is why
   the heading names the child: these are picked for them, not generic. */

type Listing = {
  name: string;
  rating: string;
  count: number;
  type: string;
  where: string;
  open: boolean;
  hours: string;
  quote?: string;
  extra?: string;
};

const MUSIC: Listing[] = [
  {
    name: "Alamo Music School",
    rating: "5.0",
    count: 2,
    type: "Music school",
    where: "1.5 mi · Alamo, CA · (925) 984-2914",
    open: true,
    hours: "Closes 9 PM",
    extra: "Online classes",
  },
  {
    name: "New World Music Academy",
    rating: "5.0",
    count: 23,
    type: "Music school",
    where: "1.7 mi · Alamo, CA · (925) 462-5400",
    open: false,
    hours: "Opens 2 PM",
    quote: "My son learns piano with Ms. Kiki, and she is truly amazing.",
  },
  {
    name: "Music In Motion School",
    rating: "5.0",
    count: 2,
    type: "Music school",
    where: "1.4 mi · 433 Front St · (925) 326-6467",
    open: true,
    hours: "Closes 7 PM",
    quote: "She knows how to teach.",
  },
];

const SPORTS: Listing[] = [
  {
    name: "Diablo Valley Soccer Club",
    rating: "4.8",
    count: 61,
    type: "Sports club",
    where: "2.0 mi · Danville, CA · (925) 743-1180",
    open: true,
    hours: "Closes 8 PM",
    extra: "Spring season open",
  },
  {
    name: "Alamo Swim Center",
    rating: "4.6",
    count: 34,
    type: "Swim school",
    where: "1.1 mi · Alamo, CA · (925) 820-4455",
    open: false,
    hours: "Opens 7 AM",
    quote: "The coaches are patient with beginners.",
  },
  {
    name: "Round Hill Tennis Academy",
    rating: "4.9",
    count: 18,
    type: "Tennis club",
    where: "2.4 mi · Alamo, CA · (925) 736-9010",
    open: true,
    hours: "Closes 9 PM",
  },
];

const ARTS: Listing[] = [
  {
    name: "Blackhawk Art Studio",
    rating: "4.9",
    count: 12,
    type: "Art school",
    where: "1.9 mi · Danville, CA · (925) 736-7700",
    open: true,
    hours: "Closes 6 PM",
    extra: "Portfolio classes",
  },
  {
    name: "Clayworks Pottery",
    rating: "4.7",
    count: 29,
    type: "Pottery studio",
    where: "2.2 mi · Walnut Creek, CA · (925) 932-1150",
    open: true,
    hours: "Closes 7 PM",
    quote: "My daughter looks forward to it every week.",
  },
];

export function NearbySection({
  childName,
  topActivity,
}: {
  childName: string;
  /** What the listings are matched against. */
  topActivity: Activity | undefined;
}) {
  const [hidden, setHidden] = useState(false);
  if (hidden || !topActivity) return null;

  const cat = topActivity.category;
  const listings =
    cat === "Sports & Athletics" || cat === "Outdoors"
      ? SPORTS
      : cat === "Arts & Crafts" || cat === "Dance & Theater"
        ? ARTS
        : MUSIC;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 pt-4 px-4">
        <span className="text-[13px] font-[600] tracking-[0.04em] text-ink-soft uppercase whitespace-nowrap">
          Nearby for {childName}
        </span>
        <span className="px-[5px] py-px rounded border border-hairline text-[10px] font-[600] tracking-[0.06em] text-[#8a908c]">
          SPONSORED
        </span>
        <div className="flex-1" />
        <button
          onClick={() => {
            setHidden(true);
            showToast("Nearby hidden");
          }}
          aria-label="Hide nearby"
          className="grid place-items-center w-9 h-9 shrink-0 rounded-full text-[#8a908c] active:bg-black/5 transition-colors"
        >
          <Icon name="close" size={20} />
        </button>
      </div>

      <div className="py-1 flex flex-col">
        {listings.map((l) => (
          <div key={l.name} className="px-4 py-3 flex flex-col gap-[3px]">
            <span className="text-[16px] leading-[1.25] font-[600] text-ink">{l.name}</span>
            <div className="flex flex-wrap items-center gap-1 text-[13px] text-ink-soft">
              <span>{l.rating}</span>
              <span className="tracking-[-1px] text-[#e3a21a]">★★★★★</span>
              <span>
                ({l.count}) · {l.type}
              </span>
            </div>
            <span className="text-[13px] text-ink-soft">{l.where}</span>
            <div className="flex gap-1 text-[13px] text-ink-soft">
              <span className={`font-[600] ${l.open ? "text-pine" : "text-[#b3412e]"}`}>
                {l.open ? "Open" : "Closed"}
              </span>
              <span>· {l.hours}</span>
            </div>
            {l.quote && (
              <div className="flex items-start gap-1.5 pt-0.5 text-[13px] leading-[1.4] text-ink-soft">
                <Icon name="account_circle" size={18} fill className="text-[#8a908c]" />
                <span className="italic">“{l.quote}”</span>
              </div>
            )}
            {l.extra && <span className="text-[13px] text-ink-soft">{l.extra}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
