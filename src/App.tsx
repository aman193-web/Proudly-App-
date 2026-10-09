import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { PhoneShell } from "./components/ui";
import { Welcome } from "./screens/Welcome";
import { SignIn, CreateAccount } from "./screens/Auth";
import { AddChild } from "./screens/AddChild";
import { ConnectSources } from "./screens/ConnectSources";
import { Processing } from "./screens/Processing";
import { AllSet, ReviewMatched, ReviewUnnamed } from "./screens/ReviewFlow";
import { ManualEntry } from "./screens/ManualEntry";
import { MainApp } from "./screens/MainApp";

type Route =
  | "welcome"
  | "signin"
  | "create"
  | "addChild"
  | "connect"
  | "manual"
  | "processing"
  | "review1"
  | "review2"
  | "allSet"
  | "app";

export default function App() {
  const [route, setRoute] = useState<Route>("welcome");
  const [childName, setChildName] = useState("Reet");
  /* True when the parent skipped the calendar scan: Home then leads with
     "add your first activity" instead of a review queue they never got. */
  const [skippedSync, setSkippedSync] = useState(false);
  const go = (r: Route) => setRoute(r);

  return (
    <PhoneShell>
      <AnimatePresence mode="wait">
        {route === "welcome" && (
          <Welcome key="welcome" onStart={() => go("create")} onSignIn={() => go("signin")} />
        )}
        {route === "signin" && (
          <SignIn
            key="signin"
            onBack={() => go("welcome")}
            onDone={() => go("app")}
            onCreate={() => go("create")}
          />
        )}
        {route === "create" && (
          <CreateAccount
            key="create"
            onBack={() => go("welcome")}
            onDone={() => go("addChild")}
            onSignIn={() => go("signin")}
          />
        )}
        {route === "addChild" && (
          <AddChild
            key="addChild"
            onBack={() => go("create")}
            onContinue={(name) => {
              setChildName(name);
              go("connect");
            }}
          />
        )}
        {route === "connect" && (
          <ConnectSources
            key="connect"
            onBack={() => go("addChild")}
            onContinue={() => {
              setSkippedSync(false);
              go("processing");
            }}
            onManual={() => {
              setSkippedSync(true);
              go("app");
            }}
          />
        )}
        {route === "manual" && (
          <ManualEntry
            key="manual"
            onClose={() => go("connect")}
            onSaved={() => go("app")}
          />
        )}
        {route === "processing" && (
          <Processing key="processing" childName={childName} onDone={() => go("review1")} />
        )}
        {/* Two-step review, then the "all set" hand-off, per the prototype. */}
        {route === "review1" && (
          <ReviewMatched
            key="review1"
            onBack={() => go("connect")}
            onAccept={() => go("review2")}
          />
        )}
        {route === "review2" && (
          <ReviewUnnamed
            key="review2"
            onBack={() => go("review1")}
            onAccept={() => go("allSet")}
          />
        )}
        {route === "allSet" && (
          <AllSet
            key="allSet"
            onAddActivities={() => go("manual")}
            onDone={() => go("app")}
          />
        )}
        {route === "app" && (
          <MainApp
            key="app"
            firstRun={skippedSync}
            onConnectCalendar={() => go("connect")}
            onSignOut={() => go("welcome")}
          />
        )}
      </AnimatePresence>
    </PhoneShell>
  );
}
