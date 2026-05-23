"use client";

import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { CountUp } from "@/components/atoms/count-up";

interface HeroProps {
  rateCount: number;
}

export function Hero({ rateCount }: HeroProps) {
  return (
    <section className="relative min-h-[calc(100vh-14rem)] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes gridPan {
          from { background-position: 0 0; }
          to   { background-position: 40px 40px; }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(-50%, 0) scale(1); }
          50%       { transform: translate(-50%, -30px) scale(1.04); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translateY(0) scale(1); }
          50%       { transform: translateY(20px) scale(1.06); }
        }
        @keyframes shimmer {
          from { background-position: -200% center; }
          to   { background-position: 200% center; }
        }
        .animate-fade-up { animation: fadeUp 0.7s ease both; }
        .animate-fade-in { animation: fadeIn 0.6s ease both; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .gradient-shimmer {
          background: linear-gradient(90deg, #60a5fa, #818cf8, #a855f7, #c084fc, #60a5fa);
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
      `}</style>

      {/* Animated grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          animation: "gridPan 8s linear infinite",
        }}
      />

      {/* Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 left-1/2 w-[700px] h-[700px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)",
            animation: "orbFloat 9s ease-in-out infinite",
            transform: "translateX(-50%)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
            animation: "orbFloat2 11s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/5 w-[400px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)",
            animation: "orbFloat 13s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* Badge */}
      <div className="animate-fade-up relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/[0.07] text-blue-400 text-xs font-medium mb-8 backdrop-blur-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
        Live rates ·{" "}
        {rateCount > 0 ? `${rateCount}+ currencies` : "170+ currencies"}
      </div>

      {/* Headline */}
      <h1 className="animate-fade-up delay-100 relative text-5xl sm:text-6xl lg:text-[76px] font-bold text-white leading-[1.03] tracking-tight max-w-4xl mb-6">
        The world's currencies,{" "}
        <span className="gradient-shimmer">quantified.</span>
      </h1>

      {/* Sub */}
      <p className="animate-fade-up delay-200 relative text-lg text-zinc-400 max-w-lg mb-10 leading-relaxed">
        Real-time exchange rates, historical data, and currency tools — built
        for professionals who need precision.
      </p>

      {/* CTAs */}
      <div className="animate-fade-up delay-300 relative flex items-center gap-3 flex-wrap justify-center">
        <Link href="/exchange">
          <Button variant="primary" size="lg">
            View Live Rates
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Button>
        </Link>
        <Link href="/convert">
          <Button variant="ghost" size="lg">
            Convert Currency
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div
        className="animate-fade-up delay-400 relative mt-20 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-white/[0.07] max-w-2xl w-full"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        {[
          {
            label: "Currencies",
            value: rateCount > 0 ? rateCount : 170,
            suffix: "+",
          },
          { label: "Historical data", value: 10, suffix: "yr" },
          { label: "Uptime", value: 99, suffix: ".9%" },
          { label: "Refresh rate", value: 1, suffix: "s" },
        ].map((s) => (
          <div key={s.label} className="bg-[#07080f] px-6 py-5 text-center">
            <p className="text-2xl font-bold text-white mb-0.5 tabular-nums">
              <CountUp to={s.value} suffix={s.suffix} />
            </p>
            <p className="text-xs text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
