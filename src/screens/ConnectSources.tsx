import { useState } from "react";
import { Icon } from "../components/Icon";
import { AppleGlyph, GoogleGlyph, Screen, AppHeader } from "../components/ui";
import { PARENT } from "../data";

/* Connect — Oct-1 redesign.
   ------------------------
   The prototype turns this from "connect these two sources" into "which
   account should we read?": one choice from three, then Continue. Google
   Photos is gone from onboarding entirely — the client's note reads "Photos
   removed for the test run" — and manual entry is promoted from a text link
   to a second full-width button, because it is a real third way in.

   The source still being read is the calendar; which account it belongs to is
   what this screen now asks. */

export type ConnectChoice = "this-google" | "other-google" | "apple" | "manual";

/* The brand each row connects to, rather than a generic calendar glyph —
   which account this is is the whole question the screen asks. */
const OPTIONS: {
  id: Exclude<ConnectChoice, "manual">;
  brand: "google" | "apple";
  title: string;
  sub: string;
}[] = [
  {
    id: "this-google",
    brand: "google",
    title: `Use ${PARENT.email}`,
    sub: "Your signed-in Google account",
  },
  {
    id: "other-google",
    brand: "google",
    title: "Connect another Google account",
    sub: "Partner or shared family calendar",
  },
  {
    id: "apple",
    brand: "apple",
    title: "Connect Apple Calendar",
    sub: "iCloud calendar on this phone",
  },
];

export function ConnectSources({
  onBack,
  onContinue,
  onManual,
}: {
  onBack: () => void;
  /** Runs the scan with the chosen account. */
  onContinue: (choice: ConnectChoice) => void;
  /** Skips the scan and goes straight to typing an activity in. */
  onManual: () => void;
}) {
  const [choice, setChoice] = useState<Exclude<ConnectChoice, "manual">>("this-google");

  return (
    <Screen>
      <AppHeader title="Where do their activities live?" onBack={onBack} step="Step 2 of 3" />
      <div className="flex-1 overflow-y-auto scroll-area px-6 pb-4 flex flex-col">
        <p className="text-[15px] leading-[1.45] text-ink-soft mb-3">
          We look for events that mention your kids.
        </p>

        <div className="flex flex-col">
          {OPTIONS.map((o) => {
            const on = o.id === choice;
            return (
              <button
                key={o.id}
                onClick={() => setChoice(o.id)}
                aria-pressed={on}
                className="flex items-center gap-3.5 min-h-[72px] text-left"
              >
                <span
                  className={`grid place-items-center w-11 h-11 rounded-[14px] shrink-0 transition-colors ${
                    on ? "bg-pine-soft" : "bg-[#f3f4f1]"
                  }`}
                >
                  {o.brand === "google" ? <GoogleGlyph size={22} /> : <AppleGlyph size={22} />}
                </span>
                <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span className="text-[16px] font-[600] text-ink">{o.title}</span>
                  <span className="text-[13px] text-ink-soft">{o.sub}</span>
                </span>
                {on ? (
                  <Icon name="radio_button_checked" size={24} className="text-pine shrink-0" />
                ) : (
                  <Icon name="radio_button_unchecked" size={24} className="text-[#9aa09c] shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex-1 min-h-2" />

        <div className="pt-2 pb-5 flex flex-col gap-2.5">
          <p className="flex items-center justify-center gap-2 text-[12px] text-ink-soft">
            <Icon name="lock" size={16} /> Read-only. Disconnect anytime.
          </p>
          <button
            onClick={() => onContinue(choice)}
            className="h-14 w-full rounded-[28px] bg-pine text-white font-[600] text-[16px] active:scale-[0.98] transition-transform"
          >
            Continue
          </button>
          <div className="flex items-center gap-3">
            <span className="flex-1 h-px bg-[#e3e5e1]" />
            <span className="text-[12px] font-[500] text-[#8a908c]">or</span>
            <span className="flex-1 h-px bg-[#e3e5e1]" />
          </div>
          <button
            onClick={onManual}
            className="h-14 w-full rounded-[28px] bg-surface border-[1.5px] border-pine text-pine font-[600] text-[16px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Icon name="edit_note" size={22} /> Skip and enter activities manually
          </button>
        </div>
      </div>
    </Screen>
  );
}
