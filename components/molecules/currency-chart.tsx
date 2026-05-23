import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { PERIODS } from "@/constants/periods";
import { formatRate } from "@/helpers/rate";
import { CustomTooltip, formatChartDate } from "../atoms/tooltip";

interface ChartPoint {
  date: string;
  rate: number;
}

interface Period {
  label: string;
  days: number;
}

interface CurrencyChartProps {
  currencyCode: string;
  chartPoints: ChartPoint[];
  activePeriod: Period;
  isBuilding: boolean;
  changeNeg: boolean;
  yMin: number;
  yMax: number;
  onPeriodChange: (period: Period) => void;
}

export function CurrencyChart({
  currencyCode,
  chartPoints,
  activePeriod,
  isBuilding,
  changeNeg,
  yMin,
  yMax,
  onPeriodChange,
}: CurrencyChartProps) {
  return (
    <div
      className="lg:col-span-2 rounded-2xl border border-white/[0.07] overflow-hidden flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, rgba(10,11,20,0.95) 0%, rgba(8,9,15,0.98) 100%)",
      }}
    >
      <div className="h-px w-full bg-linear-to-r from-blue-500/0 via-blue-500/40 to-purple-500/0" />
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-200">
            USD / {currencyCode}
          </span>
          {isBuilding && (
            <div className="w-3.5 h-3.5 rounded-full border-t border-blue-400 animate-spin" />
          )}
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-white/3 border border-white/5">
          {PERIODS.map((p) => (
            <button
              key={p.label}
              onClick={() => onPeriodChange(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                activePeriod.label === p.label
                  ? "text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              style={
                activePeriod.label === p.label
                  ? {
                      background: "linear-gradient(135deg, #3b82f6, #7c3aed)",
                    }
                  : {}
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="px-2 pb-5 flex-1">
        {chartPoints.length >= 2 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={chartPoints}
              margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={changeNeg ? "#f87171" : "#60a5fa"}
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="100%"
                    stopColor={changeNeg ? "#f87171" : "#60a5fa"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={(v: string) =>
                  formatChartDate(v, activePeriod.days)
                }
                tick={{
                  fill: "#52525b",
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[yMin, yMax]}
                tickFormatter={(v: number) => formatRate(v)}
                tick={{
                  fill: "#52525b",
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
                axisLine={false}
                tickLine={false}
                width={72}
              />
              <Tooltip
                content={<CustomTooltip totalDays={activePeriod.days} />}
                cursor={{
                  stroke: "rgba(255,255,255,0.08)",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke={changeNeg ? "#f87171" : "#60a5fa"}
                strokeWidth={2}
                fill="url(#rateGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: changeNeg ? "#f87171" : "#60a5fa",
                  stroke: "rgba(8,9,15,0.9)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-75 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-zinc-600">
              <div className="w-6 h-6 rounded-full border-t border-blue-400/50 animate-spin" />
              <span className="text-xs font-mono">Loading chart data…</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
