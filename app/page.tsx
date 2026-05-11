"use client";

import { useState, useMemo } from "react";

//hooks
import { useExchangeRates } from "@/hooks/useExchangeRate";

//constants
import { CURRENCY_LABELS } from "@/constants/currency-labels";
import { PINNED_CURRENCIES } from "@/constants/pinned-currencies";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatRate(rate: number): string {
  if (rate >= 1000)
    return rate.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (rate >= 1) return rate.toFixed(4);
  return rate.toFixed(6);
}

function getCurrencyInfo(code: string) {
  return CURRENCY_LABELS[code] ?? { name: code, flag: "🌐" };
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-2 border-amber-200/20" />
        <div className="absolute inset-0 rounded-full border-t-2 border-amber-400 animate-spin" />
      </div>
    </div>
  );
}

interface RateCardProps {
  code: string;
  rate: number;
  convertedAmount: number | null;
  fromCurrency: string;
}

function RateCard({
  code,
  rate,
  convertedAmount,
  fromCurrency,
}: RateCardProps) {
  const { name, flag } = getCurrencyInfo(code);
  const isBase = code === fromCurrency;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-900/20 ${
        isBase
          ? "border-amber-400/40 bg-amber-400/5"
          : "border-zinc-700/50 bg-zinc-800/60 hover:border-zinc-600/70"
      }`}
    >
      {/* Subtle shimmer on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-2xl leading-none">{flag}</span>
          </div>
          <span
            className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
              isBase
                ? "bg-amber-400/20 text-amber-300"
                : "bg-zinc-700 text-zinc-400"
            }`}
          >
            {code}
          </span>
        </div>

        <p className="text-xs text-zinc-500 mb-0.5 truncate">{name}</p>
        <p className="text-lg font-mono font-semibold text-zinc-100 tabular-nums">
          {formatRate(rate)}
        </p>
        {convertedAmount !== null && (
          <p className="text-sm font-mono text-amber-400/80 mt-1 tabular-nums">
            ={" "}
            {convertedAmount.toLocaleString("en-US", {
              maximumFractionDigits: 4,
            })}{" "}
            {code}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ExchangeRatePage() {
  const {
    data,
    rates,
    isLoading,
    error,
    lastUpdated,
    refetch,
    convert,
    getRate,
  } = useExchangeRates();

  const [search, setSearch] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("PHP");
  const [amount, setAmount] = useState("1");
  const [activeTab, setActiveTab] = useState<"dashboard" | "converter">(
    "dashboard"
  );

  // All available currency codes from the API
  const allCodes = useMemo(() => {
    return Object.keys(rates)
      .map((key) => key.replace(/^USD/, ""))
      .filter((code) => code.length === 3 && !/^\d/.test(code));
  }, [rates]);

  // Filtered + sorted cards for the dashboard
  const filteredCodes = useMemo(() => {
    const q = search.trim().toUpperCase();
    const pool = q
      ? allCodes.filter(
          (c) =>
            c.includes(q) || getCurrencyInfo(c).name.toUpperCase().includes(q)
        )
      : PINNED_CURRENCIES.filter((c) => allCodes.includes(c));
    return pool.slice(0, 30);
  }, [allCodes, search]);

  const parsedAmount = parseFloat(amount) || 0;
  const convertedResult = convert(parsedAmount, fromCurrency, toCurrency);
  const crossRate = getRate(fromCurrency, toCurrency);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div
      className="min-h-screen bg-zinc-950 text-zinc-100"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Google Font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .mono { font-family: 'DM Mono', monospace; }
      `}</style>

      {/* Background texture */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(251,191,36,0.06),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">
        {/* ── Header ── */}
        <header className="mb-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-400 text-xl">◈</span>
                <span className="text-xs font-medium tracking-widest text-zinc-500 uppercase">
                  Live Exchange Rates
                </span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
                FX Dashboard
              </h1>
              {lastUpdated && (
                <p className="text-xs text-zinc-600 mt-1 mono">
                  Updated {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>

            <button
              onClick={refetch}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>

          {/* ── Source badge ── */}
          {data && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700/50 text-xs text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Base currency:{" "}
              <span className="text-zinc-200 font-medium mono">
                {data.source}
              </span>
              <span className="text-zinc-600">·</span>
              <span className="mono">{Object.keys(rates).length} pairs</span>
            </div>
          )}
        </header>

        {/* ── Tab Nav ── */}
        <nav className="flex gap-1 p-1 rounded-xl bg-zinc-800/60 border border-zinc-700/40 mb-8 w-fit">
          {(["dashboard", "converter"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                activeTab === tab
                  ? "bg-amber-400 text-zinc-900 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab === "dashboard" ? "📊 Rates" : "🔄 Converter"}
            </button>
          ))}
        </nav>

        {/* ── Error ── */}
        {error && (
          <div className="mb-8 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
            <strong className="font-semibold">Error:</strong> {error}
          </div>
        )}

        {/* ── Loading ── */}
        {isLoading && !data && <Spinner />}

        {/* ════════════════════════════════════════════════════
            TAB: DASHBOARD
        ════════════════════════════════════════════════════ */}
        {activeTab === "dashboard" && data && (
          <section>
            {/* Search */}
            <div className="relative mb-6">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search currency (e.g. EUR, yen, peso…)"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {!search && (
              <p className="text-xs text-zinc-600 mb-4 uppercase tracking-widest">
                Popular currencies · 1 USD =
              </p>
            )}

            {/* Rate grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredCodes.map((code) => {
                const key = `USD${code}`;
                const rate = rates[key];
                if (!rate) return null;
                return (
                  <RateCard
                    key={code}
                    code={code}
                    rate={rate}
                    convertedAmount={null}
                    fromCurrency=""
                  />
                );
              })}
            </div>

            {filteredCodes.length === 0 && search && (
              <p className="text-center text-zinc-600 py-16 text-sm">
                No currencies found for "
                <span className="text-zinc-400">{search}</span>"
              </p>
            )}
          </section>
        )}

        {/* ════════════════════════════════════════════════════
            TAB: CONVERTER
        ════════════════════════════════════════════════════ */}
        {activeTab === "converter" && data && (
          <section className="max-w-lg mx-auto">
            <div className="rounded-2xl border border-zinc-700/50 bg-zinc-800/40 p-6 space-y-5">
              {/* Amount */}
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">
                  Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="any"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-xl font-medium mono text-zinc-100 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/20 transition-all"
                  placeholder="0.00"
                />
              </div>

              {/* From / To */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">
                    From
                  </label>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-amber-400/60 transition-all appearance-none cursor-pointer"
                  >
                    {["USD", ...allCodes].map((c) => (
                      <option key={c} value={c}>
                        {getCurrencyInfo(c).flag} {c} —{" "}
                        {getCurrencyInfo(c).name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleSwap}
                  className="mt-6 p-2.5 rounded-xl bg-zinc-700 hover:bg-amber-400/20 border border-zinc-600 hover:border-amber-400/40 text-zinc-400 hover:text-amber-400 transition-all duration-200"
                  title="Swap currencies"
                >
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
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                </button>

                <div className="flex-1">
                  <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">
                    To
                  </label>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-amber-400/60 transition-all appearance-none cursor-pointer"
                  >
                    {["USD", ...allCodes].map((c) => (
                      <option key={c} value={c}>
                        {getCurrencyInfo(c).flag} {c} —{" "}
                        {getCurrencyInfo(c).name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Result */}
              <div className="rounded-xl bg-zinc-900/80 border border-zinc-700/40 p-5">
                <p className="text-xs text-zinc-600 uppercase tracking-widest mb-3">
                  Result
                </p>
                {convertedResult !== null ? (
                  <>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-4xl font-semibold mono text-amber-400 tabular-nums">
                        {convertedResult.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 4,
                        })}
                      </span>
                      <span className="text-xl text-zinc-400">
                        {toCurrency}
                      </span>
                    </div>
                    {crossRate && (
                      <p className="text-xs text-zinc-600 mt-3 mono">
                        1 {fromCurrency} = {formatRate(crossRate)} {toCurrency}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-zinc-600 text-sm">
                    Enter an amount to convert
                  </p>
                )}
              </div>

              {/* Quick amounts */}
              <div>
                <p className="text-xs text-zinc-600 uppercase tracking-widest mb-2">
                  Quick amounts
                </p>
                <div className="flex flex-wrap gap-2">
                  {[1, 10, 100, 500, 1000, 10000].map((q) => (
                    <button
                      key={q}
                      onClick={() => setAmount(String(q))}
                      className={`px-3 py-1.5 rounded-lg text-xs mono transition-all ${
                        parseFloat(amount) === q
                          ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                          : "bg-zinc-800 text-zinc-500 border border-zinc-700 hover:text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      {q.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cross rate table for selected pair */}
            {crossRate && (
              <div className="mt-6 rounded-2xl border border-zinc-700/50 bg-zinc-800/40 p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">
                  {fromCurrency} → {toCurrency} reference
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 5, 10, 50, 100, 500, 1000, 5000].map((ref) => (
                    <div
                      key={ref}
                      className="flex justify-between items-center py-2 border-b border-zinc-700/30 last:border-0"
                    >
                      <span className="text-xs text-zinc-500 mono">
                        {ref.toLocaleString()} {fromCurrency}
                      </span>
                      <span className="text-sm font-medium mono text-zinc-200">
                        {(ref * crossRate).toLocaleString("en-US", {
                          maximumFractionDigits: 2,
                        })}{" "}
                        {toCurrency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
