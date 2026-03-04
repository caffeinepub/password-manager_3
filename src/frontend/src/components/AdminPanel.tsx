import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Principal } from "@icp-sdk/core/principal";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Crown,
  Dices,
  Key,
  Loader2,
  LogOut,
  Mail,
  MessageCircle,
  Plus,
  RefreshCw,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend.d";
import {
  useActivatePremium,
  useCreatePremiumCode,
  useGetAllUsers,
  useGetPendingPremiumRequests,
  useGetPremiumCodes,
} from "../hooks/useQueries";
import { SupportChatBot } from "./SupportChatBot";

interface Props {
  onLogout: () => void;
}

function truncatePrincipal(principal: Principal): string {
  const str = principal.toString();
  if (str.length <= 12) return str;
  return `${str.slice(0, 8)}...${str.slice(-4)}`;
}

function formatDate(time?: bigint): string {
  if (!time) return "—";
  const ms = Number(time / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function UserRow({
  principal,
  profile,
  adminPassword,
}: {
  principal: Principal;
  profile: UserProfile;
  adminPassword: string;
}) {
  const activatePremium = useActivatePremium();
  const [done, setDone] = useState(false);

  const handleActivate = async () => {
    try {
      await activatePremium.mutateAsync({ user: principal, adminPassword });
      setDone(true);
      toast.success("Premium активирован");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка активации";
      toast.error(msg);
    }
  };

  return (
    <TableRow className="border-border hover:bg-secondary/30 transition-colors">
      {/* Пользователь: email + contact + principal */}
      <TableCell className="text-xs text-muted-foreground">
        <div className="flex flex-col gap-0.5">
          {profile.email ? (
            <span className="font-semibold text-foreground flex items-center gap-1">
              <Mail className="w-3 h-3 text-primary shrink-0" />
              {profile.email}
            </span>
          ) : (
            <span className="font-mono opacity-60" title={principal.toString()}>
              {truncatePrincipal(principal)}
            </span>
          )}
          {profile.contact && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <MessageCircle className="w-3 h-3 text-accent shrink-0" />
              <span className="text-[11px]">TG/WA: {profile.contact}</span>
            </span>
          )}
          <span
            className="font-mono text-[10px] opacity-40"
            title={principal.toString()}
          >
            {truncatePrincipal(principal)}
          </span>
        </div>
      </TableCell>
      {/* Сессий */}
      <TableCell className="text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3 text-muted-foreground shrink-0" />
          {Number(profile.loginCount)}
        </span>
      </TableCell>
      {/* Регистрация */}
      <TableCell className="text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <CalendarDays className="w-3 h-3 shrink-0" />
          {formatDate(profile.registeredAt)}
        </span>
      </TableCell>
      {/* Последний вход */}
      <TableCell className="text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 shrink-0" />
          {formatDate(profile.lastLoginAt)}
        </span>
      </TableCell>
      {/* Статус */}
      <TableCell>
        {profile.isPremium ? (
          <Badge className="bg-[oklch(0.83_0.16_80_/_0.15)] text-[oklch(0.9_0.15_80)] border-[oklch(0.83_0.16_80_/_0.3)] text-xs">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        ) : profile.pendingPremium ? (
          <Badge className="bg-accent/10 text-accent border-accent/30 text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Ожидание
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            Бесплатный
          </Badge>
        )}
      </TableCell>
      {/* Premium до */}
      <TableCell className="text-xs text-muted-foreground">
        {formatDate(profile.premiumUntil)}
      </TableCell>
      {/* Действия */}
      <TableCell>
        {done ? (
          <span className="flex items-center gap-1 text-xs text-primary">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Активирован
          </span>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={handleActivate}
            disabled={activatePremium.isPending || done}
            className="text-xs h-7 border-border hover:bg-secondary hover:text-foreground"
          >
            {activatePremium.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <Crown className="w-3 h-3 mr-1" />
            )}
            Активировать
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

interface PremiumCodesTabProps {
  adminPassword: string;
}

function generateRandomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const suffix = Array.from({ length: 5 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join("");
  return `PROMO${suffix}`;
}

function PremiumCodesTab({ adminPassword }: PremiumCodesTabProps) {
  const premiumCodes = useGetPremiumCodes(adminPassword);
  const createCode = useCreatePremiumCode();
  const [codeInput, setCodeInput] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = codeInput.trim();
    if (!trimmed) return;
    try {
      await createCode.mutateAsync({ code: trimmed, adminPassword });
      toast.success(`Код "${trimmed}" создан`);
      setCodeInput("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка создания кода";
      toast.error(msg);
    }
  };

  const handleGenerateAndFill = () => {
    setCodeInput(generateRandomCode());
  };

  const handleCreateRandom = async () => {
    const code = generateRandomCode();
    try {
      await createCode.mutateAsync({ code, adminPassword });
      toast.success(`Случайный код "${code}" создан`);
      setCodeInput("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка создания кода";
      toast.error(msg);
    }
  };

  function formatCodeDate(time: bigint): string {
    const ms = Number(time / BigInt(1_000_000));
    return new Date(ms).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-4">
      {/* Create form — always visible when admin is logged in */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          Создать код Premium
        </p>

        {/* Manual input form */}
        <form onSubmit={handleCreate} className="flex gap-2">
          <Input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            placeholder="Введите код, напр. PROMO2024"
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground font-mono"
            data-ocid="codes.input"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateAndFill}
            title="Сгенерировать случайный код"
            className="border-border hover:bg-secondary shrink-0 gap-1.5"
            data-ocid="codes.generate.button"
          >
            <Dices className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Генерировать</span>
          </Button>
          <Button
            type="submit"
            disabled={createCode.isPending || !codeInput.trim()}
            className="bg-primary text-primary-foreground hover:opacity-90 shrink-0"
            data-ocid="codes.submit_button"
          >
            {createCode.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span className="ml-1 hidden sm:inline">Создать</span>
          </Button>
        </form>

        {/* One-click random */}
        <div className="pt-1 border-t border-border/50">
          <Button
            variant="outline"
            onClick={handleCreateRandom}
            disabled={createCode.isPending}
            className="w-full border-dashed border-border hover:bg-secondary gap-2 text-sm"
            data-ocid="codes.random.primary_button"
          >
            {createCode.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-primary" />
            )}
            Создать случайный код (одним нажатием)
          </Button>
        </div>
      </div>

      {/* Codes list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {premiumCodes.isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full bg-secondary" />
            ))}
          </div>
        ) : !premiumCodes.data?.length ? (
          <div
            className="p-8 text-center text-muted-foreground"
            data-ocid="codes.empty_state"
          >
            <Key className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Кодов пока нет. Создайте первый!</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs font-medium">
                  Код
                </TableHead>
                <TableHead className="text-muted-foreground text-xs font-medium">
                  Создан
                </TableHead>
                <TableHead className="text-muted-foreground text-xs font-medium">
                  Статус
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {premiumCodes.data.map((item) => (
                <TableRow
                  key={item.code}
                  className="border-border hover:bg-secondary/30 transition-colors"
                >
                  <TableCell className="font-mono text-sm font-bold text-foreground">
                    {item.code}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatCodeDate(item.createdAt)}
                  </TableCell>
                  <TableCell>
                    {item.isUsed ? (
                      <Badge variant="secondary" className="text-xs">
                        Использован
                      </Badge>
                    ) : (
                      <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Активен
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

export function AdminPanel({ onLogout }: Props) {
  const adminPassword = localStorage.getItem("adminPassword") || "";
  const allUsers = useGetAllUsers(adminPassword);
  const pendingRequests = useGetPendingPremiumRequests(adminPassword);
  const premiumCodes = useGetPremiumCodes(adminPassword);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    localStorage.removeItem("adminPassword");
    onLogout();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        allUsers.refetch(),
        pendingRequests.refetch(),
        premiumCodes.refetch(),
      ]);
      toast.success("Данные обновлены");
    } catch {
      toast.error("Ошибка обновления");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border glass sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display font-bold text-foreground text-lg">
                  Панель администратора
                </h1>
                <p className="text-xs text-muted-foreground">
                  Password Manager
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Admin status indicator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden sm:flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-primary font-medium">
                  Администратор
                </span>
              </motion.div>
              <Button
                variant="ghost"
                onClick={handleRefresh}
                disabled={isRefreshing}
                title="Обновить данные"
                data-ocid="admin.refresh_button"
                className="gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary w-9 h-9 p-0"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary"
                data-ocid="admin.logout.button"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Выйти</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8">
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="bg-secondary/50 border border-border">
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                data-ocid="admin.users.tab"
              >
                <Users className="w-4 h-4" />
                Все пользователи
                {allUsers.data && (
                  <span className="bg-muted text-muted-foreground text-xs rounded-full px-1.5">
                    {allUsers.data.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                data-ocid="admin.pending.tab"
              >
                <Clock className="w-4 h-4" />
                Запросы Premium
                {pendingRequests.data && pendingRequests.data.length > 0 && (
                  <span className="bg-accent text-accent-foreground text-xs rounded-full px-1.5 font-bold">
                    {pendingRequests.data.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="codes"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                data-ocid="admin.codes.tab"
              >
                <Key className="w-4 h-4" />
                Коды Premium
              </TabsTrigger>
            </TabsList>

            {/* All Users Tab */}
            <TabsContent value="users">
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                {allUsers.isLoading ? (
                  <div className="p-6 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full bg-secondary" />
                    ))}
                  </div>
                ) : allUsers.isError ? (
                  <div
                    className="p-8 text-center text-muted-foreground"
                    data-ocid="admin.users.error_state"
                  >
                    <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">
                      Ошибка загрузки пользователей. Попробуйте обновить
                      страницу.
                    </p>
                  </div>
                ) : !allUsers.data?.length ? (
                  <div
                    className="p-8 text-center text-muted-foreground"
                    data-ocid="admin.users.empty_state"
                  >
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Пользователей пока нет</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground text-xs font-medium">
                          Пользователь
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs font-medium">
                          Сессий
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs font-medium">
                          Регистрация
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs font-medium">
                          Последний вход
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs font-medium">
                          Статус
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs font-medium">
                          Premium до
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs font-medium">
                          Действия
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsers.data.map(([principal, profile]) => (
                        <UserRow
                          key={principal.toString()}
                          principal={principal}
                          profile={profile}
                          adminPassword={adminPassword}
                        />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>

            {/* Premium Codes Tab */}
            <TabsContent value="codes">
              <PremiumCodesTab adminPassword={adminPassword} />
            </TabsContent>

            {/* Pending Tab */}
            <TabsContent value="pending">
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                {pendingRequests.isLoading ? (
                  <div className="p-6 space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-10 w-full bg-secondary" />
                    ))}
                  </div>
                ) : pendingRequests.isError ? (
                  <div
                    className="p-8 text-center text-muted-foreground"
                    data-ocid="admin.pending.error_state"
                  >
                    <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">
                      Ошибка загрузки запросов. Попробуйте обновить страницу.
                    </p>
                  </div>
                ) : !pendingRequests.data?.length ? (
                  <div
                    className="p-8 text-center text-muted-foreground"
                    data-ocid="admin.pending.empty_state"
                  >
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Нет ожидающих запросов</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground text-xs font-medium">
                          Пользователь
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs font-medium">
                          Сессий
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs font-medium">
                          Регистрация
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs font-medium">
                          Последний вход
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs font-medium">
                          Статус
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs font-medium">
                          Premium до
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs font-medium">
                          Действия
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRequests.data.map(([principal, profile]) => (
                        <UserRow
                          key={principal.toString()}
                          principal={principal}
                          profile={profile}
                          adminPassword={adminPassword}
                        />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="border-t border-border mt-12 py-6">
          <div className="max-w-5xl mx-auto px-4 text-center text-xs text-muted-foreground">
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

      <SupportChatBot />
    </div>
  );
}
