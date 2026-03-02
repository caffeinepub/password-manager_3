import { Button } from "@/components/ui/button";
import { Eye, Key, Lock, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { AdminLoginModal } from "./AdminLoginModal";

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.247l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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
          {/* Contact links */}
          <div className="flex items-center gap-5">
            <a
              href="https://t.me/+992173918530"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[oklch(0.55_0.10_230)] hover:text-[oklch(0.68_0.12_230)] transition-colors"
            >
              <TelegramIcon className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </a>
            <a
              href="https://wa.me/992173918530"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[oklch(0.5_0.12_150)] hover:text-[oklch(0.63_0.14_150)] transition-colors"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
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
