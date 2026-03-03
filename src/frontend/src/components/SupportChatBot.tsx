import { MessageCircle, Send, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SiTelegram, SiWhatsapp } from "react-icons/si";

type MessageRole = "bot" | "user";

interface Message {
  id: number;
  role: MessageRole;
  text: string;
  extras?: React.ReactNode;
}

const QUICK_REPLIES = [
  "Как купить Premium?",
  "Сколько стоит Premium?",
  "Я заплатил, но Premium не дали",
  "Как добавить пароль?",
  "Лимит записей",
  "Как использовать промокод?",
  "Как генерировать пароль?",
  "Как связаться с поддержкой?",
] as const;

const TG_LINK = "https://t.me/+992173918530";
const WA_LINK = "https://wa.me/992173918530";

function ContactButtons() {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      <a href={TG_LINK} target="_blank" rel="noreferrer">
        <button
          type="button"
          data-ocid="chatbot.telegram_button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: "#2BA8E0" }}
        >
          <SiTelegram className="w-3.5 h-3.5" />
          Telegram
        </button>
      </a>
      <a href={WA_LINK} target="_blank" rel="noreferrer">
        <button
          type="button"
          data-ocid="chatbot.whatsapp_button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: "#25D366" }}
        >
          <SiWhatsapp className="w-3.5 h-3.5" />
          WhatsApp
        </button>
      </a>
    </div>
  );
}

function RefundFlow() {
  const [cardNumber, setCardNumber] = useState("");

  return (
    <div className="mt-2 space-y-2">
      <p className="text-[11px] opacity-80">
        Укажите номер карты, с которой переводили, и напишите нам:
      </p>
      <Input
        data-ocid="chatbot.card_input"
        placeholder="Номер вашей карты"
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
        className="h-8 text-xs bg-secondary/60 border-border/50 text-foreground placeholder:text-muted-foreground"
        maxLength={19}
      />
      <div className="flex flex-wrap gap-2">
        <a href={TG_LINK} target="_blank" rel="noreferrer">
          <button
            type="button"
            data-ocid="chatbot.telegram_button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: "#2BA8E0" }}
          >
            <SiTelegram className="w-3.5 h-3.5" />
            Написать в Telegram
          </button>
        </a>
        <a href={WA_LINK} target="_blank" rel="noreferrer">
          <button
            type="button"
            data-ocid="chatbot.whatsapp_button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: "#25D366" }}
          >
            <SiWhatsapp className="w-3.5 h-3.5" />
            Написать в WhatsApp
          </button>
        </a>
      </div>
    </div>
  );
}

// ─── Knowledge base ────────────────────────────────────────────────────────────

interface KBEntry {
  keywords: string[];
  answer: () => { text: string; extras?: React.ReactNode };
}

const KB: KBEntry[] = [
  {
    keywords: ["купить", "приобрести", "оплатить", "как premium", "как купит"],
    answer: () => ({
      text: "Чтобы купить Premium:\n1. Нажмите кнопку «Купить Premium» на главном экране.\n2. Переведите $3 на карту 5413 5252 5060 7278.\n3. Нажмите «Я перевёл оплату».\n4. Администратор активирует Premium в течение нескольких часов.",
    }),
  },
  {
    keywords: [
      "стоит",
      "цена",
      "сколько",
      "стоимость",
      "price",
      "dollar",
      "доллар",
    ],
    answer: () => ({
      text: "Premium стоит $3 в месяц (30 дней). Оплата переводом на карту 5413 5252 5060 7278.",
    }),
  },
  {
    keywords: [
      "заплатил",
      "перевёл",
      "оплатил",
      "не дали",
      "не пришло",
      "не активировали",
      "деньги отправил",
    ],
    answer: () => ({
      text: "Если вы уже оплатили, но Premium не активирован — напишите нам. Укажите номер карты, с которой делали перевод, и мы разберёмся.",
      extras: <RefundFlow />,
    }),
  },
  {
    keywords: ["вернуть", "возврат", "refund", "деньги назад"],
    answer: () => ({
      text: "Для возврата средств напишите нам и укажите номер карты, с которой был перевод. Мы вернём деньги.",
      extras: <ContactButtons />,
    }),
  },
  {
    keywords: [
      "сколько длится",
      "длится",
      "срок",
      "истекает",
      "закончится",
      "30 дней",
    ],
    answer: () => ({
      text: "Premium активируется на 30 дней с момента активации администратором. После истечения срока возвращается бесплатный план (до 5 записей).",
    }),
  },
  {
    keywords: ["промокод", "promo", "код", "активационный код", "скидка"],
    answer: () => ({
      text: "Если у вас есть промокод:\n1. Нажмите «Купить Premium».\n2. Выберите «У меня есть промокод».\n3. Введите код и нажмите «Применить».\nPremium активируется сразу после применения кода.",
    }),
  },
  {
    keywords: [
      "лимит",
      "сколько записей",
      "максимум",
      "ограничение",
      "5 записей",
      "50 записей",
      "аккаунтов",
    ],
    answer: () => ({
      text: "Лимиты по количеству записей:\n• Бесплатный план — до 5 записей.\n• Premium план — до 50 записей.",
    }),
  },
  {
    keywords: [
      "добавить",
      "добавит",
      "создать",
      "создат",
      "новый пароль",
      "новую запись",
      "новый аккаунт",
    ],
    answer: () => ({
      text: "Чтобы добавить запись:\n1. Нажмите кнопку «Добавить» (или «+») на главном экране.\n2. Введите название сайта/сервиса, логин и пароль.\n3. Нажмите «Сохранить».\n\nЕсли хотите, можно использовать встроенный генератор паролей прямо в форме.",
    }),
  },
  {
    keywords: ["удалить", "удалит", "убрать", "стереть", "удаление"],
    answer: () => ({
      text: "Чтобы удалить запись:\n1. Найдите нужную запись в списке.\n2. Нажмите на значок корзины рядом с ней.\n3. Подтвердите удаление.\n\nВосстановить удалённую запись невозможно.",
    }),
  },
  {
    keywords: [
      "изменить",
      "изменит",
      "редактировать",
      "обновить",
      "поменять пароль",
    ],
    answer: () => ({
      text: "Чтобы изменить запись:\n1. Нажмите на запись или на значок карандаша.\n2. Внесите изменения.\n3. Нажмите «Сохранить».",
    }),
  },
  {
    keywords: [
      "генератор",
      "сгенерировать",
      "генерировать",
      "случайный пароль",
      "придумать пароль",
    ],
    answer: () => ({
      text: "Генератор паролей:\n1. Нажмите «Генератор паролей» на главном экране.\n2. Выберите длину пароля (8–32 символа) и нужные символы (буквы, цифры, спецсимволы).\n3. Нажмите «Сгенерировать».\n4. Скопируйте пароль или сразу вставьте в форму добавления записи.",
    }),
  },
  {
    keywords: [
      "надёжность",
      "сила пароля",
      "сильный пароль",
      "слабый пароль",
      "strength",
    ],
    answer: () => ({
      text: "Под полем пароля отображается индикатор надёжности. Чем длиннее пароль и чем больше разных символов — тем выше уровень: Слабый → Средний → Хороший → Отличный.",
    }),
  },
  {
    keywords: [
      "войти",
      "войт",
      "вход",
      "логин",
      "авторизация",
      "зайти",
      "зайт",
      "регистрация",
      "зарегистрироваться",
      "аккаунт",
      "создать аккаунт",
    ],
    answer: () => ({
      text: "Вход и регистрация:\n• На экране входа выберите вкладку «Вход» или «Регистрация».\n• Введите номер телефона и пароль.\n• При регистрации подтвердите пароль повторно.\n\nАдминистратор входит через кнопку «Войти как администратор» внизу страницы.",
    }),
  },
  {
    keywords: ["admin", "админ", "администратор", "панель", "управление"],
    answer: () => ({
      text: "Панель администратора:\n1. Нажмите «Войти как администратор» внизу экрана.\n2. Введите пароль администратора.\n\nВ панели можно:\n• Видеть всех пользователей и их номера телефонов.\n• Активировать Premium для любого пользователя.\n• Создавать одноразовые промокоды для Premium.",
    }),
  },
  {
    keywords: [
      "телеграм",
      "telegram",
      "ватсап",
      "whatsapp",
      "связаться",
      "контакт",
      "поддержка",
      "support",
    ],
    answer: () => ({
      text: "Наши контакты для связи:",
      extras: <ContactButtons />,
    }),
  },
  {
    keywords: ["что такое", "что за", "о приложении", "опиши", "расскажи"],
    answer: () => ({
      text: "Password Manager — это безопасное приложение для хранения паролей и аккаунтов.\n\n• Храните логины и пароли от любых сайтов в одном месте.\n• Генерируйте надёжные пароли встроенным генератором.\n• Бесплатно: до 5 записей. Premium ($3/мес): до 50 записей.\n• Регистрация по номеру телефона и паролю.",
    }),
  },
  {
    keywords: ["копировать", "скопировать", "copy"],
    answer: () => ({
      text: "Чтобы скопировать пароль из записи, нажмите на значок копирования рядом с полем пароля. Пароль будет скопирован в буфер обмена.",
    }),
  },
  {
    keywords: ["безопасность", "безопасно", "шифрование", "хранится", "данные"],
    answer: () => ({
      text: "Ваши данные хранятся в защищённом блокчейне Internet Computer (ICP). Никто, кроме вас, не имеет доступа к вашим записям — даже администратор приложения не видит ваши пароли.",
    }),
  },
  {
    keywords: [
      "кто тебя создал",
      "кто тебя сделал",
      "кто создал",
      "кто разработал",
      "кто сделал",
      "создатель",
      "разработчик",
      "кем создан",
      "кем сделан",
      "кто ты",
      "кто твой создатель",
    ],
    answer: () => ({
      text: "Я был создан компанией DonatX-FF. DonatX-FF разрабатывает современные приложения и сервисы для пользователей.",
    }),
  },
  {
    keywords: [
      "компания",
      "кампания",
      "организация",
      "фирма",
      "твоя компания",
      "твоя кампания",
      "donatx",
      "донатх",
    ],
    answer: () => ({
      text: "Это приложение разработано компанией DonatX-FF. Мы создаём удобные и безопасные инструменты для хранения паролей и управления аккаунтами.",
    }),
  },
  {
    keywords: [
      "как тебя зовут",
      "твоё имя",
      "твое имя",
      "ты бот",
      "ты робот",
      "кто ты такой",
    ],
    answer: () => ({
      text: "Я — умный помощник приложения Password Manager, созданного компанией DonatX-FF. Я знаю всё об этом приложении и готов ответить на любые вопросы.",
    }),
  },
];

// ─── Smart matching ────────────────────────────────────────────────────────────

function getBotResponse(question: string): {
  text: string;
  extras?: React.ReactNode;
} {
  const q = question.toLowerCase().replace(/[?!.,]/g, "");

  // First try exact/partial keyword match
  for (const entry of KB) {
    if (entry.keywords.some((kw) => q.includes(kw))) {
      return entry.answer();
    }
  }

  // Fuzzy: split input into words and check if any word matches a keyword
  const words = q.split(/\s+/);
  for (const entry of KB) {
    for (const kw of entry.keywords) {
      const kwWords = kw.split(/\s+/);
      if (
        kwWords.some((kww) =>
          words.some((w) => w.length > 3 && kww.includes(w)),
        )
      ) {
        return entry.answer();
      }
    }
  }

  // Fallback
  return {
    text: "Я не нашёл точного ответа на ваш вопрос. Вот что я умею рассказать:\n• Как купить и что включает Premium\n• Лимиты записей\n• Как добавить, изменить или удалить запись\n• Генератор паролей\n• Промокоды\n• Безопасность данных\n\nИли напишите нам напрямую:",
    extras: <ContactButtons />,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

let msgId = 0;
function nextId() {
  return ++msgId;
}

export function SupportChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [quickRepliesShown, setQuickRepliesShown] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const welcomeSentRef = useRef(false);

  // Initialize welcome message on first open
  useEffect(() => {
    if (isOpen && !welcomeSentRef.current) {
      welcomeSentRef.current = true;
      setMessages([
        {
          id: nextId(),
          role: "bot",
          text: "Привет! Я знаю всё о Password Manager. Задайте любой вопрос или выберите из списка.",
        },
      ]);
      setQuickRepliesShown(true);
    }
  }, [isOpen]);

  // Auto-scroll on new message
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasUnread(false);
  };

  const handleClose = () => setIsOpen(false);

  const handleDeleteMessage = (id: number) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const handleClearChat = () => {
    setMessages([]);
    setQuickRepliesShown(false);
    welcomeSentRef.current = false;
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: nextId(), role: "user", text }]);
    setQuickRepliesShown(false);
  };

  const addBotMessage = (text: string, extras?: React.ReactNode) => {
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "bot", text, extras },
      ]);
    }, 350);
  };

  const handleQuickReply = (question: string) => {
    addUserMessage(question);
    const response = getBotResponse(question);
    addBotMessage(response.text, response.extras);
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");
    addUserMessage(text);
    const response = getBotResponse(text);
    addBotMessage(response.text, response.extras);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-36 right-4 z-50 w-[360px] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: "oklch(0.17 0.018 250)",
              border: "1px solid oklch(0.28 0.02 248)",
              height: "520px",
              boxShadow:
                "0 24px 64px oklch(0.05 0.01 250 / 0.8), 0 0 0 1px oklch(0.72 0.17 158 / 0.08)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{
                background: "oklch(0.15 0.018 252)",
                borderBottom: "1px solid oklch(0.28 0.02 248)",
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "oklch(0.72 0.17 158 / 0.15)" }}
                >
                  <MessageCircle
                    className="w-4 h-4"
                    style={{ color: "oklch(0.72 0.17 158)" }}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground font-display">
                    Помощник
                  </p>
                  <p
                    className="text-[10px]"
                    style={{ color: "oklch(0.72 0.17 158)" }}
                  >
                    Знает всё о приложении
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    type="button"
                    data-ocid="chatbot.clear_button"
                    onClick={handleClearChat}
                    title="Очистить чат"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-secondary/60 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  data-ocid="chatbot.close_button"
                  onClick={handleClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-3 py-3 space-y-3"
              style={{ scrollbarWidth: "thin" }}
            >
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.18 }}
                    className={cn(
                      "flex items-end gap-1 group",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line",
                        msg.role === "user"
                          ? "rounded-br-sm font-medium"
                          : "rounded-bl-sm text-foreground",
                      )}
                      style={
                        msg.role === "user"
                          ? {
                              background: "oklch(0.72 0.17 158)",
                              color: "oklch(0.1 0.02 250)",
                            }
                          : {
                              background: "oklch(0.22 0.02 248)",
                              border: "1px solid oklch(0.28 0.02 248)",
                            }
                      }
                    >
                      {msg.text}
                      {msg.extras}
                    </div>
                    <button
                      type="button"
                      data-ocid={`chatbot.delete_message.${idx + 1}`}
                      onClick={() => handleDeleteMessage(msg.id)}
                      title="Удалить сообщение"
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-400 mb-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Quick reply chips */}
              {quickRepliesShown && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.15 }}
                  className="flex flex-wrap gap-1.5 pt-1"
                >
                  {QUICK_REPLIES.map((reply, i) => (
                    <button
                      type="button"
                      key={reply}
                      data-ocid={`chatbot.quick_reply.${i + 1}`}
                      onClick={() => handleQuickReply(reply)}
                      className="text-[11px] px-2.5 py-1 rounded-full border transition-all hover:scale-105 active:scale-95"
                      style={{
                        borderColor: "oklch(0.72 0.17 158 / 0.4)",
                        color: "oklch(0.72 0.17 158)",
                        background: "oklch(0.72 0.17 158 / 0.06)",
                      }}
                    >
                      {reply}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div
              className="px-3 py-2.5 shrink-0 flex gap-2 items-center"
              style={{ borderTop: "1px solid oklch(0.28 0.02 248)" }}
            >
              <input
                ref={inputRef}
                data-ocid="chatbot.message_input"
                type="text"
                placeholder="Задайте любой вопрос..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-secondary/50 border border-border/50 rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
              />
              <button
                type="button"
                data-ocid="chatbot.send_button"
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 shrink-0"
                style={{ background: "oklch(0.72 0.17 158)" }}
              >
                <Send
                  className="w-3.5 h-3.5"
                  style={{ color: "oklch(0.1 0.02 250)" }}
                />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button — hidden when chat is open */}
      {!isOpen && (
        <motion.button
          type="button"
          data-ocid="chatbot.open_button"
          onClick={handleOpen}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="fixed bottom-20 right-4 z-[60] w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
          style={{
            background: "oklch(0.72 0.17 158)",
            boxShadow:
              "0 8px 24px oklch(0.72 0.17 158 / 0.35), 0 0 0 1px oklch(0.72 0.17 158 / 0.2)",
          }}
          aria-label="Открыть чат поддержки"
        >
          <MessageCircle
            className="w-6 h-6"
            style={{ color: "oklch(0.1 0.02 250)" }}
          />

          {/* Unread dot */}
          {hasUnread && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{ background: "oklch(0.6 0.22 22)" }}
            >
              1
            </motion.span>
          )}
        </motion.button>
      )}
    </>
  );
}
