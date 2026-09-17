import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ShieldCheck } from "lucide-react";
import {
  Screen,
  AppHeader,
  AppleButton,
  PrimaryButton,
  GoogleButton,
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
      className="h-[58px] w-full rounded-2xl bg-transparent border border-hairline text-ink font-sans font-[600] text-[15px] tracking-tight flex items-center justify-center gap-3 active:scale-[0.985] active:bg-surface transition-all duration-150"
    >
      {children}
    </button>
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
  onSignIn,
}: {
  onBack: () => void;
  onDone: (name: string) => void;
  onSignIn: () => void;
}) {
  /* The form is revealed in place rather than pushed onto its own screen or
     into a sheet. Sheets in this app are for picking things, not typing into,
     and a three-field form in one fights the keyboard; a second screen buries
     email a navigation step deep. The space below the buttons is empty anyway,
     so the form simply fills it and the social buttons stay in view. */
  const [showEmail, setShowEmail] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  return (
    <Screen>
      <AppHeader title="Create account" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scroll-area px-4 pt-4 flex flex-col">
        <div>
          <h1 className="font-display text-[26px] font-[700] text-ink leading-tight">
            Let's get set up
          </h1>
          <p className="text-[15px] text-ink-soft mt-1">
            One tap with Google or Apple — no password to remember.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <GoogleButton onClick={() => onDone(name)} />
          <AppleButton onClick={() => onDone(name)} />
        </div>

        <div className="mt-6">
          <Divider />
        </div>

        <div className="mt-6">
          {!showEmail ? (
            <GhostButton onClick={() => setShowEmail(true)}>
              <Mail size={18} className="text-ink-soft" />
              Continue with email
            </GhostButton>
          ) : (
            /* The trigger is replaced rather than left sitting above its own
               fields. Nothing is lost by not being able to collapse it again —
               Google and Apple are still right there above. */
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <TextField
                label="Your name"
                value={name}
                onChange={setName}
                placeholder="e.g. Priya"
                autoFocus
              />
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
              <PrimaryButton
                onClick={() => onDone(name)}
                disabled={!name || !email || !pw}
              >
                Create account
              </PrimaryButton>
            </motion.div>
          )}
        </div>

        {/* Same treatment as the reassurance on Connect sources. Both claims
            already exist in-product — "your family's record stays yours" from
            Data & privacy, "nothing is posted or shared" from Connected
            sources — so this asserts nothing new about how data is handled.

            Collapsed only: with the form open this pushed the consent line off
            the bottom by 69px, and tightening every margin enough to absorb
            that would undo the breathing room it was added to create. By then
            the parent has read it and committed. */}
        {!showEmail && (
        <div className="mt-6 flex items-start gap-2.5 rounded-2xl bg-mint/50 px-4 py-3">
          <ShieldCheck size={17} className="text-teal-dark shrink-0 mt-0.5" />
          <p className="text-[12.5px] leading-snug text-teal-dark/90">
            Your family's record stays yours. Nothing is ever posted or shared.
          </p>
        </div>
        )}

        <div className="flex-1 min-h-3" />

        {/* Not TextLinks: teal means tappable everywhere else in this app, and
            there is no Terms or Privacy Policy in the product yet. Weight marks
            them as named documents; they become links when URLs exist. */}
        <p className="text-center text-[11.5px] text-ink-soft/80 leading-snug px-2">
          By continuing you agree to our <span className="font-[600]">Terms</span> and{" "}
          <span className="font-[600]">Privacy Policy</span>.
        </p>
        <p className="text-center text-[14.5px] text-ink-soft pt-3 pb-8">
          Already have an account? <TextLink onClick={onSignIn}>Sign in</TextLink>
        </p>
      </div>
    </Screen>
  );
}
