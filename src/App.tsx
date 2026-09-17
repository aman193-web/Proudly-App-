import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { PhoneShell } from "./components/ui";
import { Welcome } from "./screens/Welcome";
import { SignIn, CreateAccount } from "./screens/Auth";
import { AddChild } from "./screens/AddChild";
import { ConnectSources } from "./screens/ConnectSources";
import { Processing } from "./screens/Processing";
import { Review } from "./screens/Review";
import { MainApp } from "./screens/MainApp";

type Route =
  | "welcome"
  | "signin"
  | "create"
  | "addChild"
  | "connect"
  | "processing"
  | "review"
  | "app";

export default function App() {
  const [route, setRoute] = useState<Route>("welcome");
  const [childName, setChildName] = useState("Reet");
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
            childName={childName}
            onBack={() => go("addChild")}
            onContinue={() => go("processing")}
          />
        )}
        {route === "processing" && (
          <Processing key="processing" childName={childName} onDone={() => go("review")} />
        )}
        {/* Review hands straight to the app — the "history is ready" screen is
            hidden for now. Restore it by routing onDone to "aha" again. */}
        {route === "review" && (
          <Review
            key="review"
            childName={childName}
            onBack={() => go("connect")}
            onDone={() => go("app")}
          />
        )}
        {route === "app" && <MainApp key="app" onSignOut={() => go("welcome")} />}
      </AnimatePresence>
    </PhoneShell>
  );
}
