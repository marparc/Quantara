import { formatRate } from "@/helpers/rate";

function formatChartDate(dateStr: string, totalDays: number): string {
  const d = new Date(dateStr);
  if (totalDays <= 1)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (totalDays <= 7) return d.toLocaleDateString([], { weekday: "short" });
  if (totalDays <= 90)
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  return d.toLocaleDateString([], { month: "short", year: "2-digit" });
}

export { formatChartDate };

export function CustomTooltip({
  active,
  payload,
  label,
  totalDays,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  totalDays: number;
}) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div
      className="rounded-xl border border-white/[0.08] px-3 py-2.5 text-xs font-mono"
      style={{
        background: "rgba(8,9,18,0.95)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      <p className="text-zinc-500 mb-1">{formatChartDate(label, totalDays)}</p>
      <p className="text-zinc-100 font-semibold tabular-nums">
        {formatRate(payload[0].value)}
      </p>
    </div>
  );
}
