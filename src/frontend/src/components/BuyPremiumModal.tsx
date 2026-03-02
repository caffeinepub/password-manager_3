import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Check, Copy, Crown, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRequestPremium } from "../hooks/useQueries";

const CARD_NUMBER = "5413525250607278";
const CARD_FORMATTED = "5413 5252 5060 7278";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function BuyPremiumModal({ open, onClose }: Props) {
  const [cardCopied, setCardCopied] = useState(false);
  const [success, setSuccess] = useState(false);
  const requestPremium = useRequestPremium();

  const copyCard = async () => {
    await navigator.clipboard.writeText(CARD_NUMBER);
    setCardCopied(true);
    toast.success("Номер карты скопирован");
    setTimeout(() => setCardCopied(false), 2000);
  };

  const handlePaymentConfirm = async () => {
    try {
      await requestPremium.mutateAsync();
      setSuccess(true);
    } catch {
      toast.error("Ошибка при отправке запроса");
    }
  };

  const handleClose = () => {
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2 text-foreground">
            <Crown className="w-5 h-5 text-premium-gold" />
            Купить Premium
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Запрос отправлен!
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ожидайте активации. Администратор проверит оплату и активирует
                Premium в течение 24 часов.
              </p>
            </div>
            <Button
              onClick={handleClose}
              className="bg-primary text-primary-foreground hover:opacity-90"
            >
              Закрыть
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Premium benefits */}
            <div className="rounded-lg bg-gradient-to-br from-[oklch(0.85_0.18_88_/_0.08)] to-[oklch(0.83_0.16_80_/_0.05)] border border-[oklch(0.83_0.16_80_/_0.3)] p-4 space-y-2">
              <p className="text-sm font-semibold text-foreground">
                Что вы получите:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  До 50 аккаунтов (сейчас: 5)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  Генератор паролей без ограничений
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  Срок действия: 30 дней
                </li>
              </ul>
            </div>

            {/* Payment instructions */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Для активации Premium переведите оплату на карту:
              </p>

              {/* Card display */}
              <button
                type="button"
                className="relative rounded-xl p-4 cursor-pointer group transition-all w-full text-left"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.28 0.06 260), oklch(0.22 0.04 248))",
                  border: "1px solid oklch(0.83 0.16 80 / 0.4)",
                  boxShadow: "0 4px 24px oklch(0.83 0.16 80 / 0.1)",
                }}
                onClick={copyCard}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">
                    Visa
                  </span>
                  <div className="flex gap-1">
                    <div className="w-6 h-6 rounded-full bg-[oklch(0.75_0.15_40_/_0.6)]" />
                    <div className="w-6 h-6 rounded-full bg-[oklch(0.65_0.18_22_/_0.7)] -ml-2" />
                  </div>
                </div>
                <p className="font-mono text-lg font-bold tracking-widest text-foreground">
                  {CARD_FORMATTED}
                </p>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  {cardCopied ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>
              <p className="text-xs text-muted-foreground text-center">
                Нажмите на карту, чтобы скопировать номер
              </p>
            </div>

            {/* Warning */}
            <div className="flex gap-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3 border border-border">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
              <span>
                После перевода нажмите кнопку ниже. Premium будет активирован
                только после подтверждения оплаты администратором.
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-border hover:bg-secondary hover:text-foreground"
              >
                Отмена
              </Button>
              <Button
                onClick={handlePaymentConfirm}
                disabled={requestPremium.isPending}
                className="flex-1 bg-gradient-to-r from-[oklch(0.83_0.16_80)] to-[oklch(0.75_0.18_70)] text-[oklch(0.12_0.02_250)] hover:opacity-90 font-semibold"
              >
                {requestPremium.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Я перевёл оплату
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
