import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Screen, AppHeader, PrimaryButton, TextLink } from "../components/ui";
import { SourceCard, type SourceState } from "../components/SourceCard";
import { DEFAULT_FETCH_RANGE } from "../components/FetchRange";

export function ConnectSources({
  childName,
  onBack,
  onContinue,
}: {
  childName: string;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [cal, setCal] = useState<SourceState>("not_connected");
  const [photos, setPhotos] = useState<SourceState>("not_connected");
  /* Set before Processing runs, so the first sync is already scoped. */
  const [calRange, setCalRange] = useState(DEFAULT_FETCH_RANGE);
  const [photoRange, setPhotoRange] = useState(DEFAULT_FETCH_RANGE);

  const connect = (set: (s: SourceState) => void, current: SourceState) => {
    if (current === "connected") return;
    set("connecting");
    setTimeout(() => set("connected"), 1400);
  };

  const anyConnected = cal === "connected" || photos === "connected";

  return (
    <Screen>
      <AppHeader title="Where should we look?" onBack={onBack} step="Step 2 of 3" />
      <div className="flex-1 px-4 pt-3 flex flex-col overflow-y-auto scroll-area">
        <p className="text-[15px] text-ink-soft pr-2">
          Connect at least one source so we can start building {childName}'s history.
        </p>

        <div className="mt-6 space-y-3.5">
          <SourceCard
            kind="calendar"
            title="Google Calendar"
            purpose="Find activity events, practices, and milestones."
            state={cal}
            onAction={() => connect(setCal, cal)}
            range={calRange}
            onRangeChange={setCalRange}
          />
          <SourceCard
            kind="photos"
            title="Google Photos"
            purpose="Connect real memories to each activity."
            state={photos}
            onAction={() => connect(setPhotos, photos)}
            range={photoRange}
            onRangeChange={setPhotoRange}
          />
        </div>

        <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-mint/50 px-4 py-3">
          <ShieldCheck size={17} className="text-teal-dark shrink-0 mt-0.5" />
          <p className="text-[12.5px] leading-snug text-teal-dark/90">
            BragOn only reads what it needs to organize activities. You stay in control and
            can disconnect anytime.
          </p>
        </div>

        <div className="mt-auto pt-8 pb-6 space-y-3">
          <PrimaryButton onClick={onContinue} disabled={!anyConnected}>
            Continue
          </PrimaryButton>
          {!anyConnected && (
            <div className="text-center">
              <TextLink onClick={onContinue}>I'll connect later</TextLink>
            </div>
          )}
        </div>
      </div>
    </Screen>
  );
}
