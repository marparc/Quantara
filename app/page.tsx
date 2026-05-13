"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { useExchangeRates } from "@/hooks/useExchangeRate";
import { useChange } from "@/hooks/useChange";

//helpers
import { CURRENCY_TO_COUNTRY } from "@/constants/currency-to-country";
import { CURRENCY_NAMES } from "@/constants/currency-names";
import { PREVIEW_CODES } from "@/constants/preview-codes";
import { todayStr } from "@/helpers/date";
import { daysAgoStr } from "@/helpers/date";
import { formatRate } from "@/helpers/rate";

function getFlagUrl(code: string) {
  const c = CURRENCY_TO_COUNTRY[code];
  return c ? `https://flagsapi.com/${c.toUpperCase()}/flat/64.png` : null;
}

// ─── useInView hook ───────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── FlagImg ──────────────────────────────────────────────────────────────────
function FlagImg({ code, size = 20 }: { code: string; size?: number }) {
  const url = getFlagUrl(code);
  if (!url) return <span className="text-lg">🌐</span>;
  return (
    <img
      src={url}
      alt={code}
      width={size}
      height={size}
      className="object-cover flex-shrink-0"
    />
  );
}

// ─── Animated number counter ──────────────────────────────────────────────────
function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const { ref, inView } = useInView();
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= to) {
        setVal(to);
        clearInterval(timer);
      } else setVal(Math.floor(start));
    }, 30);
    return () => clearInterval(timer);
  }, [inView, to]);
  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

// ─── FEATURES ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
        />
      </svg>
    ),
    title: "Real-Time Rates",
    desc: "Live exchange rates refreshed every second across 170+ currency pairs from trusted sources.",
    gradient: "from-blue-500/20 to-blue-600/10",
    accent: "text-blue-400",
  },
  {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
    title: "Historical Analysis",
    desc: "Explore up to 10 years of daily rate history. Visualise trends for any currency pair.",
    gradient: "from-purple-500/20 to-purple-600/10",
    accent: "text-purple-400",
  },
  {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
        />
      </svg>
    ),
    title: "Instant Converter",
    desc: "Convert any amount between 170+ currencies instantly at the most accurate live rate.",
    gradient: "from-blue-500/20 to-purple-500/10",
    accent: "text-blue-400",
  },
  {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
        />
      </svg>
    ),
    title: "Rate Alerts",
    desc: "Set a target rate and get notified the moment the market hits your price.",
    gradient: "from-purple-500/20 to-fuchsia-500/10",
    accent: "text-purple-400",
  },
  {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
        />
      </svg>
    ),
    title: "Developer API",
    desc: "Integrate live and historical rate data into your app with a clean, well-documented REST API.",
    gradient: "from-blue-500/20 to-indigo-400/10",
    accent: "text-blue-400",
  },
  {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
    title: "Trusted Data",
    desc: "Sourced from central banks and top-tier financial providers with transparent methodology.",
    gradient: "from-purple-500/20 to-purple-400/10",
    accent: "text-purple-400",
  },
];

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ rateCount }: { rateCount: number }) {
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
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes shimmer {
          from { background-position: -200% center; }
          to   { background-position: 200% center; }
        }
        .animate-fade-up   { animation: fadeUp 0.7s ease both; }
        .animate-fade-in   { animation: fadeIn 0.6s ease both; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        .animate-ticker { animation: ticker 28s linear infinite; }
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
        <Link href="/rates">
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

// ─── Live Rates Preview ───────────────────────────────────────────────────────
function RatesPreview({ rates }: { rates: Record<string, number> }) {
  const { ref, inView } = useInView();
  const rows = PREVIEW_CODES.map((code) => ({
    code,
    rate: rates[`USD${code}`],
  })).filter((r) => r.rate);

  return (
    <section className="py-28 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
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

        <div
          className="rounded-2xl border border-white/[0.07] overflow-hidden transition-all duration-700 delay-100"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(24px)",
            background:
              "linear-gradient(135deg, rgba(10,11,20,0.95) 0%, rgba(8,9,15,0.98) 100%)",
          }}
        >
          {/* Gradient top bar */}
          <div className="h-px w-full bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-purple-500/0" />

          <div className="grid grid-cols-4 px-5 py-3 border-b border-white/[0.05]">
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
                  className="grid grid-cols-4 px-5 py-4 border-b border-white/[0.04] animate-pulse"
                >
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-5 h-5 rounded bg-white/[0.05]" />
                    <div className="h-3 w-20 rounded bg-white/[0.05]" />
                  </div>
                  <div className="h-3 w-16 rounded bg-white/[0.05] ml-auto self-center" />
                  <div className="h-3 w-10 rounded bg-white/[0.05] ml-auto self-center" />
                </div>
              ))
            : rows.map((r, i) => (
                <div
                  key={r.code}
                  className="grid grid-cols-4 px-5 py-4 hover:bg-white/[0.03] transition-all duration-200 group"
                  style={{
                    borderBottom:
                      i < rows.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                    transitionDelay: `${i * 40}ms`,
                  }}
                >
                  <div className="col-span-2 flex items-center gap-3">
                    <FlagImg code={r.code} size={20} />
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

// ─── Top Movers ───────────────────────────────────────────────────────────────
function TopMovers() {
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
      {/* Side glow */}
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
          <Link href="/change">
            <Button variant="ghost" size="sm">
              Full analysis →
            </Button>
          </Link>
        </div>

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
                  {/* Progress bar bg */}
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
                    <FlagImg code={m.code} size={22} />
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

// ─── Features ─────────────────────────────────────────────────────────────────
function Features() {
  const { ref, inView } = useInView();
  return (
    <section className="py-28 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <div
          className="text-center mb-16 transition-all duration-700"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <p className="text-xs text-blue-400 font-medium uppercase tracking-widest mb-3">
            Everything you need
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white max-w-xl mx-auto leading-tight">
            Built for precision,{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              designed for speed
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="relative p-6 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] group cursor-default overflow-hidden transition-all duration-300"
              style={{
                background:
                  "linear-gradient(135deg, rgba(10,11,20,0.9) 0%, rgba(8,9,15,0.6) 100%)",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.6s ease ${
                  i * 80
                }ms, transform 0.6s ease ${i * 80}ms, border-color 0.2s`,
              }}
            >
              {/* Hover glow */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${f.gradient} pointer-events-none`}
              />

              <div
                className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} border border-white/[0.08] flex items-center justify-center ${f.accent} mb-5`}
              >
                {f.icon}
              </div>
              <h3 className="relative text-md font-semibold text-zinc-100 mb-2">
                {f.title}
              </h3>
              <p className="relative text-sm text-zinc-500 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Ticker ───────────────────────────────────────────────────────────────────
function Ticker({ rates }: { rates: Record<string, number> }) {
  const codes = Object.keys(CURRENCY_TO_COUNTRY).filter(
    (c) => rates[`USD${c}`]
  );
  if (codes.length === 0) return null;
  const items = [...codes, ...codes]; // duplicate for seamless loop

  return (
    <div
      className="py-5 border-y border-white/[0.05] overflow-hidden relative"
      style={{
        background:
          "linear-gradient(90deg, #07080f 0%, #0a0b16 50%, #07080f 100%)",
      }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(90deg, #07080f, transparent)" }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(-90deg, #07080f, transparent)" }}
      />

      <div className="animate-ticker flex gap-8 whitespace-nowrap">
        {items.map((code, i) => {
          const rate = rates[`USD${code}`];
          return (
            <div
              key={`${code}-${i}`}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <FlagImg code={code} size={16} />
              <span className="text-xs font-medium text-zinc-400">{code}</span>
              <span className="text-xs font-mono text-zinc-300 tabular-nums">
                {formatRate(rate)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Contact ─────────────────────────────────────────────────────────────────
function Contact() {
  const { ref, inView } = useInView();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-all border" +
    " bg-white/[0.03] border-white/[0.08] focus:border-blue-500/40 focus:bg-white/[0.05]";

  return (
    <section
      id="contact"
      className="py-28 px-4 relative"
      ref={ref}
      style={{
        background: "linear-gradient(180deg, #07080f 0%, #080a14 100%)",
      }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div
            className="transition-all duration-700"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateX(0)" : "translateX(-24px)",
            }}
          >
            <p className="text-xs text-blue-400 font-medium uppercase tracking-widest mb-3">
              Get in touch
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-5">
              Have a question or{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                want API access?
              </span>
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-10">
              Whether you're a developer integrating rates into your product, a
              business looking for bulk data, or just curious — we'd love to
              hear from you.
            </p>

            <div className="space-y-4">
              {[
                { icon: "✉️", label: "Email", value: "hello@quantara.io" },
                { icon: "📄", label: "API Access", value: "docs@quantara.io" },
                { icon: "💬", label: "Support", value: "support@quantara.io" },
              ].map((c) => (
                <div
                  key={c.label}
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.10] transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-base flex-shrink-0">
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">{c.label}</p>
                    <p className="text-sm text-zinc-200">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="relative rounded-2xl border border-white/[0.08] p-8 transition-all duration-700 delay-200 overflow-hidden"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateX(0)" : "translateX(24px)",
              background:
                "linear-gradient(135deg, rgba(10,11,20,0.95) 0%, rgba(8,9,15,0.98) 100%)",
            }}
          >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-purple-500/0" />

            {sent ? (
              <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
                <div
                  className="w-16 h-16 rounded-full border border-blue-500/30 flex items-center justify-center text-2xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
                  }}
                >
                  ✓
                </div>
                <p className="text-lg font-semibold text-zinc-100">
                  Message sent!
                </p>
                <p className="text-sm text-zinc-500">
                  We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", email: "", message: "" });
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors mt-2"
                >
                  Send another →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1.5 block">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Your name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1.5 block">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1.5 block">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    placeholder="Tell us what you need…"
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  type="submit"
                >
                  Send Message
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
                      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                    />
                  </svg>
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { rates, isLoading } = useExchangeRates();

  const rateCount = Object.keys(rates).filter(
    (k) => k.startsWith("USD") && k.length === 6 && !/\d/.test(k.slice(3))
  ).length;

  return (
    <div className="min-h-screen bg-[#07080f] text-zinc-100">
      <Hero rateCount={rateCount} />
      <Ticker rates={rates} />
      <RatesPreview rates={rates} />
      <TopMovers />
      <Features />
      <Contact />
    </div>
  );
}
