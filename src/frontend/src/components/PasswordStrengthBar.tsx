import { getPasswordStrength } from "../utils/passwordGenerator";

interface Props {
  password: string;
}

export function PasswordStrengthBar({ password }: Props) {
  if (!password) return null;
  const { score, label, color } = getPasswordStrength(password);
  const maxScore = 7;
  const percent = Math.min((score / maxScore) * 100, 100);

  const barColor =
    score <= 2
      ? "bg-red-500"
      : score <= 4
        ? "bg-yellow-500"
        : score <= 5
          ? "bg-blue-500"
          : "bg-emerald-500";

  return (
    <div className="mt-1 space-y-1">
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className={`text-xs ${color}`}>{label}</p>
    </div>
  );
}
