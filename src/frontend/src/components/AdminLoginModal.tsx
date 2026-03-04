import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Shield, X } from "lucide-react";
import { useState } from "react";

const ADMIN_PASSWORD = "fftr56#^";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminLoginModal({ open, onClose, onSuccess }: Props) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    await new Promise((r) => setTimeout(r, 400));

    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("adminSession", "true");
      localStorage.setItem("adminPassword", ADMIN_PASSWORD);
      setPassword("");
      setLoading(false);
      onSuccess();
    } else {
      setError("Неверный пароль");
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2 text-foreground">
            <Shield className="w-5 h-5 text-primary" />
            Вход как администратор
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="admin-password"
              className="text-sm text-muted-foreground"
            >
              Пароль администратора
            </Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className={`bg-secondary/50 border-border focus:border-primary pr-10 font-mono ${
                  error ? "border-destructive focus:border-destructive" : ""
                }`}
                autoFocus
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
            {error && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <X className="w-3 h-3" />
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-border hover:bg-secondary hover:text-foreground"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={loading || !password}
              className="flex-1 bg-primary text-primary-foreground hover:opacity-90"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Войти
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
