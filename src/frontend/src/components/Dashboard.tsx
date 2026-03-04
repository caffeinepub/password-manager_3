import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  Crown,
  Lock,
  LogOut,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Users,
  Wand2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { PasswordEntry } from "../backend.d";
import { useGetEntries, useGetMyProfile } from "../hooks/useQueries";
import { BuyPremiumModal } from "./BuyPremiumModal";
import { EntryCard } from "./EntryCard";
import { EntryModal } from "./EntryModal";
import { PasswordGeneratorModal } from "./PasswordGeneratorModal";
import { SupportChatBot } from "./SupportChatBot";

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

function ContactLinks({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className ?? ""}`}>
      <a
        href="https://t.me/+992173918530"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs text-[oklch(0.65_0.12_230)] hover:text-[oklch(0.75_0.14_230)] transition-colors"
      >
        <TelegramIcon className="w-3.5 h-3.5" />
        <span>Telegram</span>
      </a>
      <a
        href="https://wa.me/992173918530"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs text-[oklch(0.6_0.14_150)] hover:text-[oklch(0.7_0.16_150)] transition-colors"
      >
        <WhatsAppIcon className="w-3.5 h-3.5" />
        <span>WhatsApp</span>
      </a>
    </div>
  );
}

const FREE_LIMIT = 5;
const PREMIUM_LIMIT = 50;

function formatPremiumDate(time?: bigint): string {
  if (!time) return "";
  const ms = Number(time / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

interface DashboardProps {
  email?: string;
  passwordHash?: string;
  onLogout?: () => void;
}

export function Dashboard({
  email,
  passwordHash: _passwordHash,
  onLogout,
}: DashboardProps) {
  const entries = useGetEntries();
  const profile = useGetMyProfile();

  const [editEntry, setEditEntry] = useState<PasswordEntry | null>(null);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showBuyPremium, setShowBuyPremium] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([entries.refetch(), profile.refetch()]);
    setIsRefreshing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("emailSession");
    if (onLogout) onLogout();
  };

  const isPremium = profile.data?.isPremium ?? false;
  const isPending = profile.data?.pendingPremium ?? false;
  const limit = isPremium ? PREMIUM_LIMIT : FREE_LIMIT;
  const entryCount = entries.data?.length ?? 0;
  const limitReached = entryCount >= limit;
  const loginCount = profile.data ? Number(profile.data.loginCount) : 0;
  const isMultiSession = loginCount > 1;

  const displayIdentifier = email ? email : "";

  const filteredEntries = (entries.data ?? []).filter(
    (e) =>
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.username.toLowerCase().includes(search.toLowerCase()) ||
      e.url.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border glass sticky top-0 z-20">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Lock className="w-4 h-4 text-primary" />
              </div>
              <span className="font-display font-bold text-foreground hidden sm:block">
                PassVault
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isPremium && (
                <Badge className="bg-[oklch(0.83_0.16_80_/_0.15)] text-[oklch(0.9_0.15_80)] border-[oklch(0.83_0.16_80_/_0.3)] text-xs gap-1">
                  <Crown className="w-3 h-3" />
                  Premium
                </Badge>
              )}
              {displayIdentifier && (
                <span className="text-xs text-muted-foreground hidden md:flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {displayIdentifier}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                title="Обновить данные"
                className="gap-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary h-8 w-8 p-0"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                data-ocid="dashboard.logout_button"
                className="gap-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary h-8"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">Выйти</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
          {/* Multi-session notification */}
          {isMultiSession && !profile.isLoading && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-3 flex items-center gap-3 bg-accent/5 border border-accent/20"
            >
              <Users className="w-4 h-4 text-accent shrink-0" />
              <p className="text-xs text-muted-foreground">
                Аккаунт используется с нескольких устройств (сессий:{" "}
                <span className="font-semibold text-foreground">
                  {loginCount}
                </span>
                )
              </p>
            </motion.div>
          )}

          {/* Premium Status Banner */}
          {profile.isLoading ? (
            <Skeleton className="h-14 w-full rounded-lg bg-secondary" />
          ) : isPremium ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4 flex items-center justify-between gap-3"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.83 0.16 80 / 0.08), oklch(0.85 0.18 88 / 0.05))",
                border: "1px solid oklch(0.83 0.16 80 / 0.25)",
              }}
            >
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-[oklch(0.9_0.15_80)]" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Premium активен
                  </p>
                  {profile.data?.premiumUntil && (
                    <p className="text-xs text-muted-foreground">
                      до {formatPremiumDate(profile.data.premiumUntil)}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {entryCount} / {limit}
              </span>
            </motion.div>
          ) : isPending ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4 flex items-center gap-3 bg-accent/5 border border-accent/20"
            >
              <Clock className="w-5 h-5 text-accent animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Ожидание активации Premium...
                </p>
                <p className="text-xs text-muted-foreground">
                  Администратор проверит оплату и активирует Premium в течение
                  24 часов
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4 flex items-center justify-between gap-3 bg-secondary/40 border border-border"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-foreground">
                    Бесплатный план —{" "}
                    <span
                      className={
                        limitReached ? "text-destructive font-semibold" : ""
                      }
                    >
                      добавлено {entryCount} из {FREE_LIMIT}
                    </span>{" "}
                    аккаунтов
                  </p>
                  {limitReached && (
                    <p className="text-xs text-destructive">
                      Лимит достигнут. Купите Premium для доступа к 50
                      аккаунтам.
                    </p>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setShowBuyPremium(true)}
                className="shrink-0 bg-gradient-to-r from-[oklch(0.83_0.16_80)] to-[oklch(0.75_0.18_70)] text-[oklch(0.12_0.02_250)] hover:opacity-90 font-semibold text-xs h-8 gap-1.5"
              >
                <Crown className="w-3.5 h-3.5" />
                Купить Premium
              </Button>
            </motion.div>
          )}

          {/* Action Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по аккаунтам..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-secondary/50 border-border focus:border-primary"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowGenerator(true)}
              className="border-border hover:bg-secondary hover:text-foreground gap-1.5 px-3"
              title="Генератор паролей"
            >
              <Wand2 className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Генератор</span>
            </Button>
            <Button
              onClick={() => {
                if (limitReached) {
                  if (!isPending) setShowBuyPremium(true);
                  return;
                }
                setEditEntry(null);
                setShowAddEntry(true);
              }}
              disabled={limitReached && isPremium}
              title={
                limitReached
                  ? `Достигнут лимит ${limit} аккаунтов`
                  : "Добавить аккаунт"
              }
              className="bg-primary text-primary-foreground hover:opacity-90 gap-1.5 px-3"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Добавить</span>
            </Button>
          </div>

          {/* Entries List */}
          {entries.isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl bg-card" />
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 space-y-3"
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7 text-muted-foreground opacity-50" />
              </div>
              <div>
                <p className="font-display text-foreground font-semibold">
                  {search ? "Ничего не найдено" : "Нет сохранённых аккаунтов"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {search
                    ? "Попробуйте другой запрос"
                    : "Добавьте первый аккаунт, нажав кнопку «Добавить»"}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-2.5">
              <AnimatePresence mode="popLayout">
                {filteredEntries.map((entry, i) => (
                  <EntryCard
                    key={entry.id.toString()}
                    entry={entry}
                    onEdit={(e) => {
                      setEditEntry(e);
                      setShowAddEntry(true);
                    }}
                    index={i}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border mt-12 py-6">
          <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <ContactLinks />
            <span>
              © {new Date().getFullYear()}.{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Built with ♥ using caffeine.ai
              </a>
            </span>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <EntryModal
        open={showAddEntry}
        onClose={() => {
          setShowAddEntry(false);
          setEditEntry(null);
        }}
        entry={editEntry}
      />

      <BuyPremiumModal
        open={showBuyPremium}
        onClose={() => setShowBuyPremium(false)}
      />

      <PasswordGeneratorModal
        open={showGenerator}
        onClose={() => setShowGenerator(false)}
      />

      <SupportChatBot />
    </div>
  );
}
