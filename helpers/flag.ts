import { CURRENCY_TO_COUNTRY } from "@/constants/currency-to-country";

export function getFlagUrl(code: string) {
  if (code === "EUR") return "https://flagsapi.com/EU/flat/64.png";
  const c = CURRENCY_TO_COUNTRY[code];
  return c ? `https://flagsapi.com/${c.toUpperCase()}/flat/64.png` : null;
}
