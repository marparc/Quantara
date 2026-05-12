export function formatRate(raw: number | string): string {
  const rate = Number(raw);
  if (!isFinite(rate)) return "—";
  if (rate >= 1000)
    return rate.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (rate >= 1) return rate.toFixed(4);
  return rate.toFixed(6);
}
