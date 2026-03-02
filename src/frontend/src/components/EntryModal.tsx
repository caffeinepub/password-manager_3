import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, Loader2, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { PasswordEntry } from "../backend.d";
import { useAddEntry, useUpdateEntry } from "../hooks/useQueries";
import { PasswordGeneratorModal } from "./PasswordGeneratorModal";
import { PasswordStrengthBar } from "./PasswordStrengthBar";

interface Props {
  open: boolean;
  onClose: () => void;
  entry?: PasswordEntry | null;
}

export function EntryModal({ open, onClose, entry }: Props) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  const addEntry = useAddEntry();
  const updateEntry = useUpdateEntry();
  const isEditing = !!entry;
  const isPending = addEntry.isPending || updateEntry.isPending;

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setUrl(entry.url);
      setUsername(entry.username);
      setPassword(entry.password);
      setNotes(entry.notes);
    } else {
      setTitle("");
      setUrl("");
      setUsername("");
      setPassword("");
      setNotes("");
    }
    setShowPassword(false);
  }, [entry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Введите название");
      return;
    }
    if (!username.trim()) {
      toast.error("Введите логин");
      return;
    }
    if (!password.trim()) {
      toast.error("Введите пароль");
      return;
    }

    try {
      if (isEditing && entry) {
        await updateEntry.mutateAsync({
          id: entry.id,
          title: title.trim(),
          url: url.trim(),
          username: username.trim(),
          password,
          notes: notes.trim(),
        });
        toast.success("Запись обновлена");
      } else {
        await addEntry.mutateAsync({
          title: title.trim(),
          url: url.trim(),
          username: username.trim(),
          password,
          notes: notes.trim(),
        });
        toast.success("Аккаунт добавлен");
      }
      onClose();
    } catch {
      toast.error("Ошибка при сохранении");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-foreground">
              {isEditing ? "Редактировать аккаунт" : "Добавить аккаунт"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm text-muted-foreground">
                Название *
              </Label>
              <Input
                id="title"
                placeholder="Google, GitHub, ВКонтакте..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-secondary/50 border-border focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="url" className="text-sm text-muted-foreground">
                URL сайта
              </Label>
              <Input
                id="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-secondary/50 border-border focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="username"
                className="text-sm text-muted-foreground"
              >
                Логин / Email *
              </Label>
              <Input
                id="username"
                placeholder="user@example.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="bg-secondary/50 border-border focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-sm text-muted-foreground"
              >
                Пароль *
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="bg-secondary/50 border-border focus:border-primary pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowGenerator(true)}
                  className="px-3 border-border hover:bg-secondary hover:text-foreground gap-1.5"
                  title="Сгенерировать пароль"
                >
                  <Wand2 className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">Создать</span>
                </Button>
              </div>
              <PasswordStrengthBar password={password} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-sm text-muted-foreground">
                Заметки
              </Label>
              <Textarea
                id="notes"
                placeholder="Дополнительные заметки..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="bg-secondary/50 border-border focus:border-primary resize-none"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-border hover:bg-secondary hover:text-foreground"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-primary text-primary-foreground hover:opacity-90"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {isEditing ? "Сохранить" : "Добавить"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <PasswordGeneratorModal
        open={showGenerator}
        onClose={() => setShowGenerator(false)}
        onUse={(p) => setPassword(p)}
      />
    </>
  );
}
