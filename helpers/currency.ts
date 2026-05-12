import { CURRENCY_LABELS } from "@/constants/currency-labels";

export function getCurrencyInfo(code: string) {
  return CURRENCY_LABELS[code] ?? { name: code, flag: "🌐" };
}
