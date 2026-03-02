import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  AlertCircle,
  CheckCircle2,
  Clock,
  Crown,
  Loader2,
  LogOut,
  Shield,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend.d";
import {
  useActivatePremium,
  useGetAllUsers,
  useGetPendingPremiumRequests,
} from "../hooks/useQueries";

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
}: {
  principal: Principal;
  profile: UserProfile;
}) {
  const activatePremium = useActivatePremium();
  const [done, setDone] = useState(false);

  const handleActivate = async () => {
    try {
      await activatePremium.mutateAsync(principal);
      setDone(true);
      toast.success("Premium активирован");
    } catch {
      toast.error(
        "Ошибка активации. Возможно, нужна аутентификация через Internet Identity.",
      );
    }
  };

  return (
    <TableRow className="border-border hover:bg-secondary/30 transition-colors">
      <TableCell className="font-mono text-xs text-muted-foreground">
        <span title={principal.toString()}>{truncatePrincipal(principal)}</span>
      </TableCell>
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
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(profile.premiumUntil)}
      </TableCell>
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
            disabled={
              activatePremium.isPending ||
              (profile.isPremium && !profile.pendingPremium)
            }
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

export function AdminPanel({ onLogout }: Props) {
  const allUsers = useGetAllUsers();
  const pendingRequests = useGetPendingPremiumRequests();

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
            <Button
              variant="ghost"
              onClick={onLogout}
              className="gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Выйти</span>
            </Button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8">
          {/* Warning about auth */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex gap-3 items-start bg-accent/5 border border-accent/20 rounded-lg p-4 text-sm"
          >
            <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              Для работы функций активации Premium необходимо войти через
              Internet Identity. Если вы не авторизованы, запросы к бэкенду
              могут не выполниться.
            </p>
          </motion.div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="bg-secondary/50 border border-border">
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
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
              >
                <Clock className="w-4 h-4" />
                Запросы Premium
                {pendingRequests.data && pendingRequests.data.length > 0 && (
                  <span className="bg-accent text-accent-foreground text-xs rounded-full px-1.5 font-bold">
                    {pendingRequests.data.length}
                  </span>
                )}
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
                  <div className="p-8 text-center text-muted-foreground">
                    <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">
                      Нет доступа. Войдите через Internet Identity как
                      администратор.
                    </p>
                  </div>
                ) : !allUsers.data?.length ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Пользователей пока нет</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground text-xs font-medium">
                          Principal
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
                        />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
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
                  <div className="p-8 text-center text-muted-foreground">
                    <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">
                      Нет доступа. Войдите через Internet Identity как
                      администратор.
                    </p>
                  </div>
                ) : !pendingRequests.data?.length ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Нет ожидающих запросов</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground text-xs font-medium">
                          Principal
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
    </div>
  );
}
