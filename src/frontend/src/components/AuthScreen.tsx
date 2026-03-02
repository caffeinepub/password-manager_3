import { Button } from "@/components/ui/button";
import { Eye, Key, Lock, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { AdminLoginModal } from "./AdminLoginModal";

interface Props {
  onAdminLogin: () => void;
}

const FEATURES = [
  {
    icon: Lock,
    title: "Безопасное хранение",
    desc: "Все данные защищены и хранятся в блокчейне",
  },
  {
    icon: Zap,
    title: "Быстрый доступ",
    desc: "Мгновенный доступ к вашим паролям",
  },
  {
    icon: Key,
    title: "Генератор паролей",
    desc: "Создавайте надёжные пароли автоматически",
  },
];

export function AuthScreen({ onAdminLogin }: Props) {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-background bg-mesh flex flex-col">
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 glow-emerald flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-2">
              Pass
              <span className="text-gradient-emerald">Vault</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xs mx-auto">
              Надёжный менеджер паролей на блокчейне
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full max-w-sm space-y-2.5 mb-8"
          >
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.07 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {title}
                  </p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Login Button */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="w-full max-w-sm space-y-3"
          >
            <Button
              onClick={login}
              disabled={isLoggingIn || isInitializing}
              size="lg"
              className="w-full h-12 bg-primary text-primary-foreground hover:opacity-90 font-display font-semibold text-base gap-2 glow-emerald transition-all"
            >
              <Shield className="w-5 h-5" />
              {isLoggingIn ? "Подключение..." : "Войти через Internet Identity"}
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">или</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Войдите с помощью{" "}
              <span className="text-foreground font-medium">
                Internet Identity
              </span>{" "}
              — безопасная и анонимная авторизация без паролей
            </p>
          </motion.div>
        </div>

        {/* Footer with admin link */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="relative z-10 pb-6 px-4 flex flex-col items-center gap-3"
        >
          <p className="text-xs text-muted-foreground/40">
            © {new Date().getFullYear()}{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-muted-foreground transition-colors"
            >
              Built with ♥ using caffeine.ai
            </a>
          </p>
          <button
            type="button"
            onClick={() => setShowAdminLogin(true)}
            className="text-xs text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-3 h-3" />
            Войти как администратор
          </button>
        </motion.footer>
      </div>

      <AdminLoginModal
        open={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onSuccess={onAdminLogin}
      />
    </>
  );
}
