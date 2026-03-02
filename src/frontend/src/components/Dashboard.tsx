import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  Crown,
  Lock,
  LogOut,
  Plus,
  Search,
  Shield,
  Wand2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { PasswordEntry } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetEntries, useGetMyProfile } from "../hooks/useQueries";
import { BuyPremiumModal } from "./BuyPremiumModal";
import { EntryCard } from "./EntryCard";
import { EntryModal } from "./EntryModal";
import { PasswordGeneratorModal } from "./PasswordGeneratorModal";

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

export function Dashboard() {
  const { identity, clear } = useInternetIdentity();
  const entries = useGetEntries();
  const profile = useGetMyProfile();

  const [editEntry, setEditEntry] = useState<PasswordEntry | null>(null);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showBuyPremium, setShowBuyPremium] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [search, setSearch] = useState("");

  const isPremium = profile.data?.isPremium ?? false;
  const isPending = profile.data?.pendingPremium ?? false;
  const limit = isPremium ? PREMIUM_LIMIT : FREE_LIMIT;
  const entryCount = entries.data?.length ?? 0;
  const limitReached = entryCount >= limit;

  const principalStr = identity?.getPrincipal().toString() ?? "";
  const shortPrincipal = principalStr
    ? `${principalStr.slice(0, 5)}...${principalStr.slice(-3)}`
    : "";

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
              <span className="text-xs text-muted-foreground hidden md:block font-mono">
                {shortPrincipal}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                className="gap-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary h-8"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">Выйти</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
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
          <div className="max-w-3xl mx-auto px-4 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Built with ♥ using caffeine.ai
            </a>
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
    </div>
  );
}
