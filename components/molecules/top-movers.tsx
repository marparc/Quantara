"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CurrencyFlag } from "@/components/molecules/currency-flag";
import { Button } from "@/components/atoms/button";
import { CURRENCY_NAMES } from "@/constants/currency-names";
import { todayStr, daysAgoStr } from "@/helpers/date";
import { useChange } from "@/hooks/useChange";
import { useInView } from "@/hooks/useInView";

export function TopMovers() {
  const { ref, inView } = useInView();
  const { fetchChange, topMovers, isLoading } = useChange();

  useEffect(() => {
    fetchChange(daysAgoStr(1), todayStr());
  }, []);

  const displayed = topMovers.slice(0, 6);

  return (
    <section
      className="py-28 px-4 relative"
      ref={ref}
      style={{
        background:
          "linear-gradient(180deg, #07080f 0%, #080a14 50%, #07080f 100%)",
      }}
    >
      {/* Side glows */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div
          className="flex items-end justify-between mb-10 flex-wrap gap-4 transition-all duration-700"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <div>
            <p className="text-xs text-purple-400 font-medium uppercase tracking-widest mb-2">
              Market Movers
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Top movers today
            </h2>
          </div>
        </div>

        {/* Cards */}
        {isLoading || displayed.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-xl border border-white/[0.06] bg-white/[0.02] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayed.map((m, i) => {
              const up = m.change_pct >= 0;
              const barW = Math.min(Math.abs(m.change_pct) * 8, 100);
              return (
                <div
                  key={m.code}
                  className="relative overflow-hidden flex items-center justify-between px-5 py-4 rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 group"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(10,11,20,0.9) 0%, rgba(8,9,15,0.95) 100%)",
                    opacity: inView ? 1 : 0,
                    transform: inView ? "translateY(0)" : "translateY(20px)",
                    transition: `opacity 0.5s ease ${
                      i * 60
                    }ms, transform 0.5s ease ${i * 60}ms, border-color 0.2s`,
                  }}
                >
                  {/* Progress bar */}
                  <div
                    className={`absolute bottom-0 left-0 h-0.5 transition-all duration-1000 ${
                      up
                        ? "bg-gradient-to-r from-blue-500/60 to-blue-400/20"
                        : "bg-gradient-to-r from-red-500/60 to-red-400/20"
                    }`}
                    style={{
                      width: inView ? `${barW}%` : "0%",
                      transitionDelay: `${i * 60 + 300}ms`,
                    }}
                  />

                  <div className="flex items-center gap-3">
                    <CurrencyFlag code={m.code} />
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">
                        {m.code}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {CURRENCY_NAMES[m.code] ?? m.code}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-1 text-sm font-bold font-mono tabular-nums ${
                      up ? "text-blue-400" : "text-red-400"
                    }`}
                  >
                    <span className="text-xs">{up ? "▲" : "▼"}</span>
                    <span>
                      {up ? "+" : ""}
                      {m.change_pct.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
