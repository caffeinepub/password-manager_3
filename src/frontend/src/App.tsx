import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { AdminPanel } from "./components/AdminPanel";
import { AuthScreen } from "./components/AuthScreen";
import { Dashboard } from "./components/Dashboard";

interface PhoneSession {
  phone: string;
  passwordHash?: string;
  principalStr: string;
}

function AppContent() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPhoneLoggedIn, setIsPhoneLoggedIn] = useState(false);
  const [phone, setPhone] = useState<string>("");
  const [passwordHash, setPasswordHash] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const adminSession = localStorage.getItem("adminSession");
    if (adminSession === "true") {
      setIsAdmin(true);
    }

    const phoneSessionRaw = localStorage.getItem("phoneSession");
    if (phoneSessionRaw) {
      try {
        const session: PhoneSession = JSON.parse(phoneSessionRaw);
        if (session.phone) {
          setPhone(session.phone);
          setPasswordHash(session.passwordHash ?? "");
          setIsPhoneLoggedIn(true);
        }
      } catch {
        localStorage.removeItem("phoneSession");
      }
    }

    setIsInitializing(false);
  }, []);

  const handleAdminLogin = () => {
    setIsAdmin(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("adminSession");
    setIsAdmin(false);
  };

  const handlePhoneLogin = (phoneNumber: string) => {
    const raw = localStorage.getItem("phoneSession");
    let hash = "";
    if (raw) {
      try {
        const parsed: PhoneSession = JSON.parse(raw);
        hash = parsed.passwordHash ?? "";
      } catch {
        // ignore
      }
    }
    setPhone(phoneNumber);
    setPasswordHash(hash);
    setIsPhoneLoggedIn(true);
  };

  const handlePhoneLogout = () => {
    localStorage.removeItem("phoneSession");
    setPhone("");
    setPasswordHash("");
    setIsPhoneLoggedIn(false);
  };

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

  if (isPhoneLoggedIn) {
    return (
      <Dashboard
        phone={phone}
        passwordHash={passwordHash}
        onLogout={handlePhoneLogout}
      />
    );
  }

  return (
    <AuthScreen
      onAdminLogin={handleAdminLogin}
      onPhoneLogin={handlePhoneLogin}
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
