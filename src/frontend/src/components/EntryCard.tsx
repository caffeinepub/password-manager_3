import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { PasswordEntry } from "../backend.d";
import { useDeleteEntry } from "../hooks/useQueries";

interface Props {
  entry: PasswordEntry;
  onEdit: (entry: PasswordEntry) => void;
  index: number;
}

export function EntryCard({ entry, onEdit, index }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const deleteEntry = useDeleteEntry();

  const copyUsername = async () => {
    await navigator.clipboard.writeText(entry.username);
    setCopiedUser(true);
    toast.success("Логин скопирован");
    setTimeout(() => setCopiedUser(false), 2000);
  };

  const copyPassword = async () => {
    await navigator.clipboard.writeText(entry.password);
    setCopiedPass(true);
    toast.success("Пароль скопирован");
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const handleDelete = async () => {
    try {
      await deleteEntry.mutateAsync(entry.id);
      toast.success("Аккаунт удалён");
    } catch {
      toast.error("Ошибка при удалении");
    }
  };

  const getFavicon = (url: string) => {
    if (!url) return null;
    try {
      const u = new URL(url.startsWith("http") ? url : `https://${url}`);
      return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=32`;
    } catch {
      return null;
    }
  };

  const favicon = getFavicon(entry.url);
  const displayPassword = showPassword
    ? entry.password
    : "•".repeat(Math.min(entry.password.length, 16));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
    >
      <Card className="bg-card border-border card-hover p-4 group">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-lg bg-secondary/80 border border-border flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
            {favicon ? (
              <img
                src={favicon}
                alt={entry.title}
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (
                    e.target as HTMLImageElement
                  ).nextElementSibling?.classList.remove("hidden");
                }}
              />
            ) : null}
            <Lock
              className={`w-4 h-4 text-muted-foreground ${favicon ? "hidden" : ""}`}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title + actions */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="font-display font-semibold text-foreground truncate">
                  {entry.title}
                </h3>
                {entry.url && (
                  <a
                    href={
                      entry.url.startsWith("http")
                        ? entry.url
                        : `https://${entry.url}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mt-0.5"
                  >
                    <Globe className="w-3 h-3" />
                    <span className="truncate max-w-[200px]">{entry.url}</span>
                  </a>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(entry)}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-secondary"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-display text-foreground">
                        Удалить аккаунт?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        Запись &ldquo;{entry.title}&rdquo; будет удалена
                        навсегда. Это действие нельзя отменить.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-border hover:bg-secondary hover:text-foreground">
                        Отмена
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:opacity-90"
                      >
                        Удалить
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Username row */}
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground truncate flex-1">
                {entry.username}
              </span>
              <button
                type="button"
                onClick={copyUsername}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100"
                title="Копировать логин"
              >
                {copiedUser ? (
                  <Check className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Password row */}
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-sm font-mono text-muted-foreground truncate flex-1 tracking-wider">
                {displayPassword}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  title={showPassword ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={copyPassword}
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  title="Копировать пароль"
                >
                  {copiedPass ? (
                    <Check className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Notes */}
            {entry.notes && (
              <p className="text-xs text-muted-foreground/70 truncate border-t border-border pt-2 mt-2">
                {entry.notes}
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
