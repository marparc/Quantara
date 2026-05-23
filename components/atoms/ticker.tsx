"use client";

import { CurrencyFlag } from "@/components/molecules/currency-flag";
import { CURRENCY_TO_COUNTRY } from "@/constants/currency-to-country";
import { formatRate } from "@/helpers/rate";

interface TickerProps {
  rates: Record<string, number>;
}

export function Ticker({ rates }: TickerProps) {
  const codes = Object.keys(CURRENCY_TO_COUNTRY).filter(
    (c) => rates[`USD${c}`]
  );
  if (codes.length === 0) return null;

  // Duplicate for seamless loop
  const items = [...codes, ...codes];

  return (
    <div
      className="py-5 border-y border-white/[0.05] overflow-hidden relative"
      style={{
        background:
          "linear-gradient(90deg, #07080f 0%, #0a0b16 50%, #07080f 100%)",
      }}
    >
      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .animate-ticker { animation: ticker 28s linear infinite; }
      `}</style>

      {/* Edge fades */}
      <div
        className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(90deg, #07080f, transparent)" }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(-90deg, #07080f, transparent)" }}
      />

      <div className="animate-ticker flex gap-8 whitespace-nowrap">
        {items.map((code, i) => (
          <div
            key={`${code}-${i}`}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <CurrencyFlag code={code} />
            <span className="text-xs font-medium text-zinc-400">{code}</span>
            <span className="text-xs font-mono text-zinc-300 tabular-nums">
              {formatRate(rates[`USD${code}`])}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
