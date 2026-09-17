import { useState } from "react";
import { Mail } from "lucide-react";
import {
  Screen,
  AppHeader,
  AppleButton,
  AppleGlyph,
  PrimaryButton,
  GoogleButton,
  GoogleGlyph,
  TextField,
  PasswordField,
  TextLink,
} from "../components/ui";

/* Auth
   ----
   Google and Apple come first on both screens: they are one tap and they are
   what most people will use. Email stays a first-class route, just a step
   behind.

   Apple sign-in is UI-only until the provider is configured. Both social
   buttons run through the same handler as the email flow, so wiring a real
   provider later means replacing those callbacks and nothing else. */

function Divider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex-1 h-px bg-hairline" />
      <span className="text-[12.5px] text-ink-soft font-[500] whitespace-nowrap">{label}</span>
      <span className="flex-1 h-px bg-hairline" />
    </div>
  );
}

/* Flat rather than white, so it sits a step below the social buttons on the
   canvas background without becoming a text link — email registration still
   has to look like a real route. */
function GhostButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="h-[54px] w-full rounded-2xl bg-transparent border border-hairline text-ink font-sans font-[600] text-[15px] tracking-tight flex items-center justify-center gap-3 active:scale-[0.985] active:bg-surface transition-all duration-150"
    >
      {children}
    </button>
  );
}

/* The email screen's social option. The full-width labelled buttons already
   had their turn on the screen before it, so repeating them at the same weight
   would just be the same choice twice. Icon-only, half height, centred. */
function SocialFallback({
  onGoogle,
  onApple,
}: {
  onGoogle: () => void;
  onApple: () => void;
}) {
  return (
    <div>
      <Divider label="or continue with" />
      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          onClick={onGoogle}
          aria-label="Continue with Google"
          className="h-11 w-[76px] grid place-items-center rounded-xl bg-surface border border-hairline active:scale-95 transition-transform"
        >
          <GoogleGlyph size={20} />
        </button>
        <button
          onClick={onApple}
          aria-label="Continue with Apple"
          className="h-11 w-[76px] grid place-items-center rounded-xl bg-surface border border-hairline active:scale-95 transition-transform"
        >
          <AppleGlyph size={20} />
        </button>
      </div>
    </div>
  );
}

export function SignIn({
  onBack,
  onDone,
  onCreate,
}: {
  onBack: () => void;
  onDone: () => void;
  onCreate: () => void;
}) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  return (
    <Screen>
      <AppHeader title="Sign in" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scroll-area px-4 pt-4 flex flex-col">
        <div>
          <h1 className="font-display text-[26px] font-[700] text-ink leading-tight">
            Welcome back
          </h1>
          <p className="text-[15px] text-ink-soft mt-1">
            One tap with Google or Apple, or use your email.
          </p>
        </div>

        {/* Social first */}
        <div className="mt-6 space-y-3">
          <GoogleButton onClick={onDone} />
          <AppleButton onClick={onDone} />
        </div>

        {/* Returning email users keep the form in place — making them tap
            through to another screen just to type a password they already know
            would be a step backwards. */}
        <div className="mt-6">
          <Divider label="or sign in with email" />
        </div>

        <div className="mt-5 space-y-4">
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
          />
          <div>
            <PasswordField
              label="Password"
              value={pw}
              onChange={setPw}
              placeholder="Enter your password"
            />
            <div className="text-right mt-2">
              <TextLink>Forgot password?</TextLink>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <PrimaryButton onClick={onDone} disabled={!email || !pw}>
            Sign in
          </PrimaryButton>
        </div>

        <div className="flex-1 min-h-6" />
        <p className="text-center text-[14.5px] text-ink-soft pb-8">
          New to PROUDLY? <TextLink onClick={onCreate}>Create account</TextLink>
        </p>
      </div>
    </Screen>
  );
}

export function CreateAccount({
  onBack,
  onDone,
  onEmail,
  onSignIn,
}: {
  onBack: () => void;
  onDone: () => void;
  /** Opens the email form on its own screen. */
  onEmail: () => void;
  onSignIn: () => void;
}) {
  return (
    <Screen>
      <AppHeader title="Create account" onBack={onBack} />
      <div className="flex-1 px-4 pt-4 flex flex-col">
        <div>
          <h1 className="font-display text-[26px] font-[700] text-ink leading-tight">
            Let's get set up
          </h1>
          <p className="text-[15px] text-ink-soft mt-1">
            One tap with Google or Apple — no password to remember.
          </p>
        </div>

        {/* Top-aligned, with the slack left at the bottom. Centring three
            buttons in a 874pt screen detaches them from the heading. */}
        <div className="mt-8 space-y-3">
          <GoogleButton onClick={onDone} />
          <AppleButton onClick={onDone} />
        </div>

        <div className="mt-6">
          <Divider />
        </div>

        <div className="mt-6">
          <GhostButton onClick={onEmail}>
            <Mail size={18} className="text-ink-soft" />
            Continue with email
          </GhostButton>
        </div>

        <div className="flex-1 min-h-6" />
        <p className="text-center text-[14.5px] text-ink-soft pb-8">
          Already have an account? <TextLink onClick={onSignIn}>Sign in</TextLink>
        </p>
      </div>
    </Screen>
  );
}

/** The three fields, on their own screen behind "Continue with email". */
export function CreateAccountEmail({
  onBack,
  onDone,
  onSignIn,
}: {
  onBack: () => void;
  onDone: (name: string) => void;
  onSignIn: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  return (
    <Screen>
      <AppHeader title="Create account" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scroll-area px-4 pt-4 flex flex-col">
        <div>
          <h1 className="font-display text-[26px] font-[700] text-ink leading-tight">
            Your details
          </h1>
          <p className="text-[15px] text-ink-soft mt-1">
            Three things and you're in.
          </p>
        </div>

        <div className="mt-7 space-y-4">
          <TextField label="Your name" value={name} onChange={setName} placeholder="e.g. Priya" />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
          />
          <PasswordField
            label="Password"
            value={pw}
            onChange={setPw}
            placeholder="Create a password"
          />
        </div>

        <div className="mt-6">
          <PrimaryButton onClick={() => onDone(name)} disabled={!name || !email || !pw}>
            Create account
          </PrimaryButton>
        </div>

        <div className="mt-6">
          <SocialFallback
            onGoogle={() => onDone(name)}
            onApple={() => onDone(name)}
          />
        </div>

        <div className="flex-1 min-h-6" />
        <p className="text-center text-[14.5px] text-ink-soft pb-8">
          Already have an account? <TextLink onClick={onSignIn}>Sign in</TextLink>
        </p>
      </div>
    </Screen>
  );
}
