import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Copy,
  Crown,
  Loader2,
  Tag,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRedeemPremiumCode, useRequestPremium } from "../hooks/useQueries";

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

const CARD_NUMBER = "5413525250607278";
const CARD_FORMATTED = "5413 5252 5060 7278";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function BuyPremiumModal({ open, onClose }: Props) {
  const [cardCopied, setCardCopied] = useState(false);
  const [success, setSuccess] = useState(false);
  const [promoExpanded, setPromoExpanded] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const requestPremium = useRequestPremium();
  const redeemCode = useRedeemPremiumCode();

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = promoCode.trim();
    if (!trimmed) return;
    try {
      await redeemCode.mutateAsync(trimmed);
      toast.success("Premium активирован по промокоду!");
      setPromoCode("");
      setPromoExpanded(false);
      handleClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Неверный или использованный код";
      toast.error(msg);
    }
  };

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
    setPromoExpanded(false);
    setPromoCode("");
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
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  Что вы получите:
                </p>
                <span className="text-lg font-bold text-[oklch(0.9_0.15_80)]">
                  $3 / мес
                </span>
              </div>
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
                Для активации Premium переведите{" "}
                <span className="text-foreground font-semibold">$3</span> на
                карту:
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

            {/* Promo code section */}
            <div className="rounded-lg border border-border bg-secondary/30 overflow-hidden">
              <button
                type="button"
                onClick={() => setPromoExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-primary" />У меня есть
                  промокод
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${promoExpanded ? "rotate-180" : ""}`}
                />
              </button>
              {promoExpanded && (
                <form
                  onSubmit={handleRedeemCode}
                  className="px-4 pb-4 pt-1 flex gap-2 border-t border-border"
                >
                  <Input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Промокод"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground text-sm"
                  />
                  <Button
                    type="submit"
                    disabled={redeemCode.isPending || !promoCode.trim()}
                    className="bg-primary text-primary-foreground hover:opacity-90 shrink-0"
                  >
                    {redeemCode.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Активировать"
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* Warning */}
            <div className="flex gap-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3 border border-border">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
              <span>
                После перевода нажмите кнопку ниже. Premium будет активирован
                только после подтверждения оплаты администратором.
              </span>
            </div>

            {/* Contact links */}
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Есть вопросы? Напишите нам:
              </p>
              <div className="flex items-center justify-center gap-5">
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
