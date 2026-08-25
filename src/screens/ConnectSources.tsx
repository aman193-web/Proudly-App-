import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Screen, AppHeader, PrimaryButton, TextLink } from "../components/ui";
import { StepDots } from "../components/StepDots";
import { SourceCard, type SourceState } from "../components/SourceCard";

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

  const connect = (set: (s: SourceState) => void, current: SourceState) => {
    if (current === "connected") return;
    set("connecting");
    setTimeout(() => set("connected"), 1400);
  };

  const anyConnected = cal === "connected" || photos === "connected";

  return (
    <Screen>
      <AppHeader title="Connect sources" onBack={onBack} />
      <div className="flex-1 px-4 pt-3 flex flex-col overflow-y-auto scroll-area">
        <StepDots total={3} current={1} />

        <h1 className="font-display text-[25px] font-[700] text-ink leading-tight mt-5">
          Where should we look?
        </h1>
        <p className="text-[15px] text-ink-soft mt-1 pr-2">
          Connect at least one source so we can start building {childName}'s history.
        </p>

        <div className="mt-6 space-y-3.5">
          <SourceCard
            kind="calendar"
            title="Google Calendar"
            purpose="Find activity events, practices, and milestones."
            state={cal}
            onAction={() => connect(setCal, cal)}
          />
          <SourceCard
            kind="photos"
            title="Google Photos"
            purpose="Connect real memories to each activity."
            state={photos}
            onAction={() => connect(setPhotos, photos)}
          />
        </div>

        <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-mint/50 px-4 py-3">
          <ShieldCheck size={17} className="text-teal-dark shrink-0 mt-0.5" />
          <p className="text-[12.5px] leading-snug text-teal-dark/90">
            PROUDLY only reads what it needs to organize activities. You stay in control and
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
