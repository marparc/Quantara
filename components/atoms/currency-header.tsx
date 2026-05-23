import { CurrencyFlag } from "@/components/molecules/currency-flag";
import { formatRate } from "@/helpers/rate";

interface Stats {
  change: number;
}

interface CurrencyHeaderProps {
  currencyCode: string;
  name: string;
  currentRate: number;
  stats: Stats | null;
}

export function CurrencyHeader({
  currencyCode,
  name,
  currentRate,
  stats,
}: CurrencyHeaderProps) {
  const changePos = stats && stats.change >= 0;
  const changeNeg = stats && stats.change < 0;

  return (
    <div
      className="rounded-2xl border border-white/[0.07] p-6 overflow-hidden relative"
      style={{
        background:
          "linear-gradient(135deg, rgba(10,11,20,0.95) 0%, rgba(8,9,15,0.98) 100%)",
      }}
    >
      <div className="h-px w-full absolute top-0 left-0 bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-purple-500/0" />
      <div
        className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
        }}
      />
      <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <CurrencyFlag code={currencyCode} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
                {currencyCode}
              </h1>
              {stats && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold font-mono px-2 py-0.5 rounded-md ${
                    changePos
                      ? "text-emerald-400 bg-emerald-400/10"
                      : changeNeg
                      ? "text-red-400 bg-red-400/10"
                      : "text-zinc-400 bg-white/[0.04]"
                  }`}
                >
                  {changePos && "▲"}
                  {changeNeg && "▼"}
                  {changePos ? "+" : ""}
                  {stats.change.toFixed(4)}%
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-500 mt-0.5">{name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">
            1 USD =
          </p>
          <p className="text-4xl font-bold text-zinc-100 font-mono tabular-nums leading-none">
            {formatRate(currentRate)}
          </p>
        </div>
      </div>
    </div>
  );
}
