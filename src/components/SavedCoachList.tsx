import { Bookmark, ExternalLink, MapPin, Star } from "lucide-react";
import { activityById, CATEGORY_COLOR } from "../data";
import { type SavedCoach, removeSaved } from "../lib/savedCoaches";
import { showToast } from "./states";

/* One saved coach. Used on Activity Detail and on the Saved coaches screen,
   so the two never drift apart. */
export function SavedCoachRow({
  saved,
  showActivity = false,
}: {
  saved: SavedCoach;
  /** Label which activity it was saved under — useful in the combined list. */
  showActivity?: boolean;
}) {
  const { coach } = saved;
  const activity = activityById(saved.activityId);

  return (
    <div className="rounded-2xl bg-surface border border-hairline p-3.5">
      <div className="flex items-start gap-3">
        <span className="flex-1 min-w-0">
          <p className="text-[14.5px] font-[700] text-ink leading-snug">{coach.name}</p>
          <span className="flex items-center gap-1.5 mt-0.5">
            {showActivity && activity && (
              <>
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: CATEGORY_COLOR[activity.category] }}
                />
                <span className="text-[12px] font-[600] text-ink-soft">{activity.name}</span>
                <span className="text-[12px] text-ink-soft" aria-hidden>
                  ·
                </span>
              </>
            )}
            <span className="text-[12px] text-ink-soft tabular-nums">
              {coach.reviewCount.toLocaleString()} review{coach.reviewCount === 1 ? "" : "s"}
              {coach.distanceMi !== undefined && ` · ${coach.distanceMi} mi`}
            </span>
          </span>
        </span>

        <span className="flex items-center gap-1 shrink-0 bg-gold-soft text-gold rounded-full px-2 py-1">
          <Star size={12} className="fill-current" />
          <span className="text-[12px] font-[700] tabular-nums">{coach.rating.toFixed(1)}</span>
        </span>

        <button
          onClick={() => {
            removeSaved(coach.id);
            showToast("Removed from saved");
          }}
          aria-label={`Remove ${coach.name} from saved`}
          className="shrink-0 grid place-items-center w-8 h-8 rounded-full active:scale-90 transition-transform"
        >
          <Bookmark size={18} className="text-teal fill-current" />
        </button>
      </div>

      {coach.location && (
        <p className="flex items-start gap-1.5 text-[12.5px] text-ink-soft mt-2 leading-snug">
          <MapPin size={13} className="shrink-0 mt-[2px]" />
          <span className="min-w-0">{coach.location}</span>
        </p>
      )}

      <a
        href={coach.googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 h-10 w-full rounded-xl bg-canvas border border-hairline flex items-center justify-center gap-1.5 text-[13.5px] font-[600] text-ink active:scale-[0.99] transition-transform"
      >
        View on Google <ExternalLink size={14} />
      </a>
    </div>
  );
}
