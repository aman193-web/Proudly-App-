import { useState } from "react";
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

/* Apple sign-in is UI-only until the provider is configured. Both social
   buttons run through the same handler as the email flow, so wiring a real
   provider later means replacing these two callbacks and nothing else. */

function Divider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="flex-1 h-px bg-hairline" />
      <span className="text-[12.5px] text-ink-soft font-[500]">or</span>
      <span className="flex-1 h-px bg-hairline" />
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
      <div className="flex-1 px-4 pt-4 flex flex-col">
        <div>
          <h1 className="font-display text-[26px] font-[700] text-ink leading-tight">
            Welcome back
          </h1>
          <p className="text-[15px] text-ink-soft mt-1">
            Pick up right where you left off.
          </p>
        </div>

        <div className="mt-7 space-y-4">
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

        <div className="mt-6 space-y-4">
          <PrimaryButton onClick={onDone} disabled={!email || !pw}>
            Sign in
          </PrimaryButton>
          <Divider />
          <GoogleButton onClick={onDone} />
          <AppleButton onClick={onDone} />
        </div>

        <div className="flex-1" />
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  return (
    <Screen>
      <AppHeader title="Create account" onBack={onBack} />
      <div className="flex-1 px-4 pt-4 flex flex-col">
        <div>
          <h1 className="font-display text-[26px] font-[700] text-ink leading-tight">
            Let's get set up
          </h1>
          <p className="text-[15px] text-ink-soft mt-1">
            A few details and you're in.
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

        <div className="mt-6 space-y-4">
          <PrimaryButton onClick={() => onDone(name)} disabled={!name || !email || !pw}>
            Create account
          </PrimaryButton>
          <Divider />
          <GoogleButton onClick={() => onDone(name || "there")} />
          <AppleButton onClick={() => onDone(name || "there")} />
        </div>

        <div className="flex-1" />
        <p className="text-center text-[14.5px] text-ink-soft pb-8">
          Already have an account? <TextLink onClick={onSignIn}>Sign in</TextLink>
        </p>
      </div>
    </Screen>
  );
}
