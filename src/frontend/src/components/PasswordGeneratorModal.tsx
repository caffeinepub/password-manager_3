import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Check, Copy, RefreshCw } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  type GeneratorOptions,
  generatePassword,
} from "../utils/passwordGenerator";
import { PasswordStrengthBar } from "./PasswordStrengthBar";

interface Props {
  open: boolean;
  onClose: () => void;
  onUse?: (password: string) => void;
}

export function PasswordGeneratorModal({ open, onClose, onUse }: Props) {
  const [options, setOptions] = useState<GeneratorOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    digits: true,
    symbols: true,
  });
  const [password, setPassword] = useState(() =>
    generatePassword({
      length: 16,
      uppercase: true,
      lowercase: true,
      digits: true,
      symbols: true,
    }),
  );
  const [copied, setCopied] = useState(false);

  const regenerate = useCallback(
    (opts: GeneratorOptions = options) => {
      setPassword(generatePassword(opts));
    },
    [options],
  );

  const updateOption = <K extends keyof GeneratorOptions>(
    key: K,
    value: GeneratorOptions[K],
  ) => {
    const newOpts = { ...options, [key]: value };
    setOptions(newOpts);
    regenerate(newOpts);
  };

  const copyPassword = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    toast.success("Пароль скопирован");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUse = () => {
    if (onUse) {
      onUse(password);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            Генератор паролей
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Generated password display */}
          <div className="relative">
            <div className="rounded-lg bg-secondary/50 border border-border p-4 pr-12 font-mono text-base tracking-widest break-all text-foreground min-h-[56px] flex items-center">
              {password}
            </div>
            <button
              type="button"
              onClick={copyPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Копировать"
            >
              {copied ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          <PasswordStrengthBar password={password} />

          {/* Length slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm text-foreground">Длина пароля</Label>
              <span className="font-mono text-sm font-bold text-primary">
                {options.length}
              </span>
            </div>
            <Slider
              min={8}
              max={32}
              step={1}
              value={[options.length]}
              onValueChange={([v]) => updateOption("length", v)}
              className="[&_[role=slider]]:bg-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>8</span>
              <span>32</span>
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "uppercase" as const, label: "Заглавные (A-Z)" },
              { key: "lowercase" as const, label: "Строчные (a-z)" },
              { key: "digits" as const, label: "Цифры (0-9)" },
              { key: "symbols" as const, label: "Символы (!@#...)" },
            ].map(({ key, label }) => (
              <label
                key={key}
                htmlFor={`gen-${key}`}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <Checkbox
                  id={`gen-${key}`}
                  checked={options[key]}
                  onCheckedChange={(checked) =>
                    updateOption(key, checked === true)
                  }
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => regenerate()}
              className="flex-1 gap-2 border-border hover:bg-secondary hover:text-foreground"
            >
              <RefreshCw className="w-4 h-4" />
              Обновить
            </Button>
            {onUse && (
              <Button
                onClick={handleUse}
                className="flex-1 bg-primary text-primary-foreground hover:opacity-90"
              >
                Использовать
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
