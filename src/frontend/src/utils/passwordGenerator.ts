export interface GeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  digits: boolean;
  symbols: boolean;
}

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

export function generatePassword(opts: GeneratorOptions): string {
  let charset = "";
  const required: string[] = [];

  if (opts.uppercase) {
    charset += UPPERCASE;
    required.push(UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)]);
  }
  if (opts.lowercase) {
    charset += LOWERCASE;
    required.push(LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)]);
  }
  if (opts.digits) {
    charset += DIGITS;
    required.push(DIGITS[Math.floor(Math.random() * DIGITS.length)]);
  }
  if (opts.symbols) {
    charset += SYMBOLS;
    required.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
  }

  if (!charset) charset = LOWERCASE + DIGITS;

  const remaining = opts.length - required.length;
  const result: string[] = [...required];

  for (let i = 0; i < remaining; i++) {
    result.push(charset[Math.floor(Math.random() * charset.length)]);
  }

  // Shuffle
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.join("");
}

export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Слабый", color: "text-red-400" };
  if (score <= 4) return { score, label: "Средний", color: "text-yellow-400" };
  if (score <= 5) return { score, label: "Хороший", color: "text-blue-400" };
  return { score, label: "Надёжный", color: "text-emerald-400" };
}
