import { useState, useMemo, useEffect } from "react";
import { formatRate } from "@/helpers/rate";
import { formatChartDate } from "./tooltip";

interface ChartPoint {
  date: string;
  rate: number;
}

interface CurrencyDataTableProps {
  chartPoints: ChartPoint[];
  currentRate: number;
  activePeriodLabel: string;
  activePeriodDays: number;
}

const PAGE_SIZE = 10;

export function CurrencyDataTable({
  chartPoints,
  currentRate,
  activePeriodLabel,
  activePeriodDays,
}: CurrencyDataTableProps) {
  const [page, setPage] = useState(1);

  // Reverse to show latest first
  const reversed = useMemo(() => [...chartPoints].reverse(), [chartPoints]);

  const totalPages = Math.max(1, Math.ceil(reversed.length / PAGE_SIZE));

  // Reset to page 1 when data changes
  useEffect(() => {
    setPage(1);
  }, [chartPoints]);

  const pageRows = useMemo(
    () => reversed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [reversed, page]
  );

  return (
    <div
      className="rounded-2xl border border-white/[0.07] overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(10,11,20,0.95) 0%, rgba(8,9,15,0.98) 100%)",
      }}
    >
      <div className="h-px w-full bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-purple-500/0" />
      <div className="p-5">
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-4">
          Data Points — {activePeriodLabel}
        </p>
        {chartPoints.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-zinc-700 text-xs font-mono">
            Loading…
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    <th className="pb-2 text-left text-zinc-600 uppercase tracking-widest font-medium">
                      Date
                    </th>
                    <th className="pb-2 text-right text-zinc-600 uppercase tracking-widest font-medium">
                      Rate
                    </th>
                    <th className="pb-2 text-right text-zinc-600 uppercase tracking-widest font-medium">
                      Change
                    </th>
                    <th className="pb-2 text-right text-zinc-600 uppercase tracking-widest font-medium hidden md:table-cell">
                      vs Current
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {pageRows.map((pt, i) => {
                    // Change relative to the chronologically older point (next in reversed array)
                    const globalIdx = (page - 1) * PAGE_SIZE + i;
                    const olderPt = reversed[globalIdx + 1];
                    const chg = olderPt
                      ? ((pt.rate - olderPt.rate) / olderPt.rate) * 100
                      : null;
                    const vsCurrent = ((currentRate - pt.rate) / pt.rate) * 100;
                    const isPos = chg !== null && chg >= 0;
                    const vsPos = vsCurrent >= 0;
                    return (
                      <tr
                        key={pt.date}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-2.5 text-zinc-400">
                          {formatChartDate(pt.date, activePeriodDays)}
                        </td>
                        <td className="py-2.5 text-right text-zinc-200 tabular-nums">
                          {formatRate(pt.rate)}
                        </td>
                        <td
                          className={`py-2.5 text-right tabular-nums ${
                            chg === null
                              ? "text-zinc-700"
                              : isPos
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {chg === null
                            ? "—"
                            : `${isPos ? "+" : ""}${chg.toFixed(3)}%`}
                        </td>
                        <td
                          className={`py-2.5 text-right tabular-nums hidden md:table-cell ${
                            vsPos ? "text-emerald-400/60" : "text-red-400/60"
                          }`}
                        >
                          {`${vsPos ? "+" : ""}${vsCurrent.toFixed(3)}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.05]">
                <span className="text-xs text-zinc-600 font-mono">
                  {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, reversed.length)} of{" "}
                  {reversed.length} data points
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="px-2 py-1.5 rounded-lg text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    «
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-2 py-1.5 rounded-lg text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 || p === totalPages || Math.abs(p - page) <= 1
                    )
                    .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                        acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, idx) =>
                      p === "…" ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-2 py-1.5 text-xs text-zinc-600 font-mono"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p as number)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                            page === p
                              ? "text-white font-semibold"
                              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]"
                          }`}
                          style={
                            page === p
                              ? {
                                  background:
                                    "linear-gradient(135deg, #3b82f6, #7c3aed)",
                                }
                              : {}
                          }
                        >
                          {p}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-2 py-1.5 rounded-lg text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="px-2 py-1.5 rounded-lg text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
