"use client";

import Link from "next/link";
import { CurrencyFlag } from "@/components/molecules/currency-flag";
import { Button } from "@/components/atoms/button";
import { CURRENCY_NAMES } from "@/constants/currency-names";
import { PREVIEW_CODES } from "@/constants/preview-codes";
import { formatRate } from "@/helpers/rate";
import { useInView } from "@/hooks/useInView";

interface RatesPreviewProps {
  rates: Record<string, number>;
}

export function RatesPreview({ rates }: RatesPreviewProps) {
  const { ref, inView } = useInView();

  const rows = PREVIEW_CODES.map((code) => ({
    code,
    rate: rates[`USD${code}`],
  })).filter((r) => r.rate);

  return (
    <section className="py-28 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div
          className="flex items-end justify-between mb-10 flex-wrap gap-4 transition-all duration-700"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <div>
            <p className="text-xs text-blue-400 font-medium uppercase tracking-widest mb-2">
              Live Market Data
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              USD exchange rates
            </h2>
          </div>
          <Link href="/rates">
            <Button variant="ghost" size="sm">
              View all rates →
            </Button>
          </Link>
        </div>

        {/* Table */}
        <div
          className="rounded-2xl border border-white/[0.07] overflow-hidden transition-all duration-700 delay-100"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(24px)",
            background:
              "linear-gradient(135deg, rgba(10,11,20,0.95) 0%, rgba(8,9,15,0.98) 100%)",
          }}
        >
          <div className="h-px w-full bg-linear-to-r from-blue-500/0 via-blue-500/40 to-purple-500/0" />

          <div className="grid grid-cols-4 px-5 py-3 border-b border-white/5">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider col-span-2">
              Currency
            </p>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider text-right">
              1 USD =
            </p>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider text-right">
              Rate
            </p>
          </div>

          {rows.length === 0
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-4 px-5 py-4 border-b border-white/4 animate-pulse"
                >
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-5 h-5 rounded bg-white/5" />
                    <div className="h-3 w-20 rounded bg-white/5" />
                  </div>
                  <div className="h-3 w-16 rounded bg-white/5 ml-auto self-center" />
                  <div className="h-3 w-10 rounded bg-white/5 ml-auto self-center" />
                </div>
              ))
            : rows.map((r, i) => (
                <div
                  key={r.code}
                  className="grid grid-cols-4 px-5 py-4 hover:bg-white/3 transition-all duration-200 group"
                  style={{
                    borderBottom:
                      i < rows.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                    transitionDelay: `${i * 40}ms`,
                  }}
                >
                  <div className="col-span-2 flex items-center gap-3">
                    <CurrencyFlag code={r.code} />
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">
                        {r.code}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {CURRENCY_NAMES[r.code] ?? r.code}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-zinc-200 text-right self-center font-mono tabular-nums">
                    {formatRate(r.rate)}
                  </p>
                  <p className="text-xs text-zinc-500 text-right self-center font-mono">
                    {r.code}
                  </p>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
