import { Card } from "@/components/atoms/card";
import { formatRate } from "@/helpers/rate";

interface Stats {
  high: number;
  low: number;
  start: number;
  end: number;
  change: number;
  avg: number;
  rangePct: number;
}

interface CurrencyStatsProps {
  stats: Stats;
  periodLabel: string;
}

export function CurrencyStats({ stats, periodLabel }: CurrencyStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <Card className="px-4 py-3 flex flex-col gap-1">
        <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-medium">
          Period Open
        </span>
        <span className="text-sm font-semibold font-mono tabular-nums text-zinc-100">
          {formatRate(stats.start)}
        </span>
      </Card>
      <Card className="px-4 py-3 flex flex-col gap-1">
        <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-medium">
          Period Close
        </span>
        <span className="text-sm font-semibold font-mono tabular-nums text-zinc-100">
          {formatRate(stats.end)}
        </span>
      </Card>
      <Card className="px-4 py-3 flex flex-col gap-1">
        <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-medium">
          {`${periodLabel} High`}
        </span>
        <span className="text-sm font-semibold font-mono tabular-nums text-emerald-400">
          {formatRate(stats.high)}
        </span>
      </Card>
      <Card className="px-4 py-3 flex flex-col gap-1">
        <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-medium">
          {`${periodLabel} Low`}
        </span>
        <span className="text-sm font-semibold font-mono tabular-nums text-red-400">
          {formatRate(stats.low)}
        </span>
      </Card>
      <Card className="px-4 py-3 flex flex-col gap-1">
        <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-medium">
          Average
        </span>
        <span className="text-sm font-semibold font-mono tabular-nums text-zinc-100">
          {formatRate(stats.avg)}
        </span>
      </Card>
      <Card className="px-4 py-3 flex flex-col gap-1">
        <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-medium">
          Range %
        </span>
        <span className="text-sm font-semibold font-mono tabular-nums text-zinc-100">
          {`${stats.rangePct.toFixed(3)}%`}
        </span>
      </Card>
    </div>
  );
}
