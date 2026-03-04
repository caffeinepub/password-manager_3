import { Toaster } from "@/components/ui/sonner";
import { useEffect, useRef, useState } from "react";
import { AdminPanel } from "./components/AdminPanel";
import { AuthScreen } from "./components/AuthScreen";
import { Dashboard } from "./components/Dashboard";
import { useActor } from "./hooks/useActor";

interface EmailSession {
  email: string;
  passwordHash?: string;
  principalStr: string;
}

function AppContent() {
  const { actor, isFetching: actorFetching } = useActor();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmailLoggedIn, setIsEmailLoggedIn] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [passwordHash, setPasswordHash] = useState<string>("");
  // null = not yet checked localStorage, true = restoring session, false = done
  const [isRestoringSession, setIsRestoringSession] = useState<boolean | null>(
    null,
  );
  const sessionRestoreAttempted = useRef(false);

  // On mount, read localStorage to see if there's a saved session
  useEffect(() => {
    const adminSession = localStorage.getItem("adminSession");
    if (adminSession === "true") {
      setIsAdmin(true);
    }

    const emailSessionRaw = localStorage.getItem("emailSession");
    if (emailSessionRaw) {
      try {
        const session: EmailSession = JSON.parse(emailSessionRaw);
        if (session.email && session.passwordHash) {
          setEmail(session.email);
          setPasswordHash(session.passwordHash);
          // Mark that we have a pending session restore
          setIsRestoringSession(true);
          return;
        }
      } catch {
        localStorage.removeItem("emailSession");
      }
    }
    // No valid session in storage
    setIsRestoringSession(false);
  }, []);

  // When actor is ready and we have a session to restore, call loginEmailUser
  useEffect(() => {
    if (isRestoringSession !== true) return;
    if (actorFetching || !actor) return;
    if (sessionRestoreAttempted.current) return;
    sessionRestoreAttempted.current = true;

    (async () => {
      try {
        const success = await actor.loginEmailUser(email, passwordHash);
        if (success) {
          setIsEmailLoggedIn(true);
        } else {
          // Credentials no longer valid — clear and show auth screen
          localStorage.removeItem("emailSession");
          setEmail("");
          setPasswordHash("");
        }
      } catch {
        localStorage.removeItem("emailSession");
        setEmail("");
        setPasswordHash("");
      } finally {
        setIsRestoringSession(false);
      }
    })();
  }, [isRestoringSession, actor, actorFetching, email, passwordHash]);

  const handleAdminLogin = () => {
    setIsAdmin(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("adminSession");
    setIsAdmin(false);
  };

  const handleEmailLogin = (emailAddress: string) => {
    const raw = localStorage.getItem("emailSession");
    let hash = "";
    if (raw) {
      try {
        const parsed: EmailSession = JSON.parse(raw);
        hash = parsed.passwordHash ?? "";
      } catch {
        // ignore
      }
    }
    setEmail(emailAddress);
    setPasswordHash(hash);
    setIsEmailLoggedIn(true);
  };

  const handleEmailLogout = () => {
    localStorage.removeItem("emailSession");
    setEmail("");
    setPasswordHash("");
    setIsEmailLoggedIn(false);
  };

  // Still determining initial state
  const isInitializing =
    isRestoringSession === null || isRestoringSession === true;

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center animate-pulse">
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              role="img"
              aria-label="Загрузка"
            >
              <title>Загрузка</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground font-display">
            Инициализация...
          </p>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return <AdminPanel onLogout={handleAdminLogout} />;
  }

  if (isEmailLoggedIn) {
    return (
      <Dashboard
        email={email}
        passwordHash={passwordHash}
        onLogout={handleEmailLogout}
      />
    );
  }

  return (
    <AuthScreen
      onAdminLogin={handleAdminLogin}
      onEmailLogin={handleEmailLogin}
    />
  );
}

export default function App() {
  return (
    <>
      <AppContent />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(0.22 0.02 248)",
            border: "1px solid oklch(0.28 0.02 248)",
            color: "oklch(0.93 0.01 240)",
          },
        }}
      />
    </>
  );
}
