"use client";

import { useState, useMemo, useEffect } from "react";

// hooks
import { useExchangeRates } from "@/hooks/useExchangeRate";
import { useHistoricalRates } from "@/hooks/useHistoricalRates";
import { useConvert } from "@/hooks/useConvert";
import { useTimeframe } from "@/hooks/useTimeframe";
import { useChange } from "@/hooks/useChange";
// constants
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

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function daysAgoStr(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// ─── Shared sub-components ────────────────────────────────────────────────────
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

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
      <strong className="font-semibold">Error:</strong> {message}
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
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <span className="text-2xl leading-none">{flag}</span>
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

// ─── Dashboard: Top Movers ────────────────────────────────────────────────────
const PERIODS = [
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
  { label: "3Y", days: 1095 },
  { label: "5Y", days: 1825 },
  { label: "10Y", days: 3650 },
];

function TopMoversSection() {
  const { isLoading, error, fetchChange, topMovers } = useChange();
  const [activePeriod, setActivePeriod] = useState(PERIODS[0]);

  useEffect(() => {
    fetchChange(daysAgoStr(activePeriod.days), todayStr());
  }, [activePeriod]);

  return (
    <div className="mt-10">
      {/* Header + period filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-xs text-zinc-600 uppercase tracking-widest">
          Top Movers · 1 USD =
        </p>
        <div className="flex gap-1 p-1 rounded-xl bg-zinc-800/60 border border-zinc-700/40">
          {PERIODS.map((p) => (
            <button
              key={p.label}
              onClick={() => setActivePeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                activePeriod.label === p.label
                  ? "bg-amber-400 text-zinc-900"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-2 border-amber-200/20" />
            <div className="absolute inset-0 rounded-full border-t-2 border-amber-400 animate-spin" />
          </div>
        </div>
      )}

      {!isLoading && topMovers.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {topMovers.slice(0, 20).map((m) => {
            const { name, flag } = getCurrencyInfo(m.code);
            const isPositive = m.change_pct >= 0;
            return (
              <div
                key={m.code}
                className="group relative overflow-hidden rounded-2xl border border-zinc-700/50 bg-zinc-800/60 hover:border-zinc-600/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-900/20"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl leading-none">{flag}</span>
                    <span
                      className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
                        isPositive
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-red-500/15 text-red-400"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {m.change_pct.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mb-0.5 truncate">
                    {name}
                  </p>
                  <p className="text-sm font-mono font-semibold text-zinc-100 tabular-nums">
                    {m.code}
                  </p>
                  <p className="text-xs text-zinc-600 mono mt-1 tabular-nums">
                    {formatRate(m.start_rate)} → {formatRate(m.end_rate)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── TAB: Historical ──────────────────────────────────────────────────────────
function HistoricalTab({ allCodes }: { allCodes: string[] }) {
  const { data, isLoading, error, fetchHistorical } = useHistoricalRates();
  const [date, setDate] = useState(daysAgoStr(30));
  const [search, setSearch] = useState("");

  const filteredCodes = useMemo(() => {
    const q = search.trim().toUpperCase();
    return (
      q
        ? allCodes.filter(
            (c) =>
              c.includes(q) || getCurrencyInfo(c).name.toUpperCase().includes(q)
          )
        : PINNED_CURRENCIES.filter((c) => allCodes.includes(c))
    ).slice(0, 30);
  }, [allCodes, search]);

  return (
    <section className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-zinc-500 uppercase tracking-widest">
            Date
          </label>
          <input
            type="date"
            value={date}
            max={daysAgoStr(1)}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all font-mono"
          />
        </div>
        <button
          onClick={() => fetchHistorical(date)}
          disabled={isLoading || !date}
          className="px-5 py-2.5 rounded-xl bg-amber-400 text-zinc-900 text-sm font-semibold hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? "Loading…" : "Fetch Rates"}
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {data && (
        <>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700/50 text-xs text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Historical rates for{" "}
            <span className="text-zinc-200 font-medium mono">{data.date}</span>
            <span className="text-zinc-600">·</span>
            <span className="mono">Base: {data.source}</span>
          </div>

          {/* Search */}
          <div className="relative">
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
              placeholder="Search currency…"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredCodes.map((code) => {
              const rate = data.quotes[`USD${code}`];
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
        </>
      )}

      {!data && !isLoading && (
        <p className="text-zinc-600 text-sm">
          Pick a date and press{" "}
          <span className="text-zinc-400">Fetch Rates</span> to load historical
          exchange rates.
        </p>
      )}
    </section>
  );
}

// ─── TAB: Convert API ─────────────────────────────────────────────────────────
function ConvertTab({ allCodes }: { allCodes: string[] }) {
  const { data, isLoading, error, convertCurrency, result, rate } =
    useConvert();

  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("PHP");
  const [amount, setAmount] = useState("100");

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleConvert = () => {
    const n = parseFloat(amount);
    if (!isNaN(n) && n > 0) convertCurrency(from, to, n);
  };

  return (
    <section className="max-w-lg mx-auto space-y-5">
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

        {/* From / Swap / To */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">
              From
            </label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-amber-400/60 transition-all appearance-none cursor-pointer"
            >
              {["USD", ...allCodes].map((c) => (
                <option key={c} value={c}>
                  {getCurrencyInfo(c).flag} {c} — {getCurrencyInfo(c).name}
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
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-amber-400/60 transition-all appearance-none cursor-pointer"
            >
              {["USD", ...allCodes].map((c) => (
                <option key={c} value={c}>
                  {getCurrencyInfo(c).flag} {c} — {getCurrencyInfo(c).name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Convert button */}
        <button
          onClick={handleConvert}
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-amber-400 text-zinc-900 font-semibold text-sm hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? "Converting…" : "Convert via API"}
        </button>

        {error && <ErrorBanner message={error} />}

        {/* Result */}
        {data && result !== null && (
          <div className="rounded-xl bg-zinc-900/80 border border-zinc-700/40 p-5">
            <p className="text-xs text-zinc-600 uppercase tracking-widest mb-3">
              Result
            </p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-4xl font-semibold mono text-amber-400 tabular-nums">
                {result.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })}
              </span>
              <span className="text-xl text-zinc-400">{data.query.to}</span>
            </div>
            {rate !== null && (
              <p className="text-xs text-zinc-600 mt-3 mono">
                1 {data.query.from} = {formatRate(rate)} {data.query.to}
              </p>
            )}
            <p className="text-xs text-zinc-700 mt-1 mono">
              {data.query.amount.toLocaleString()} {data.query.from} converted
              at live rate
            </p>
          </div>
        )}

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
    </section>
  );
}

// ─── TAB: Timeframe ───────────────────────────────────────────────────────────
function TimeframeTab({ allCodes }: { allCodes: string[] }) {
  const { data, isLoading, error, fetchTimeframe, getSeries, dates } =
    useTimeframe();

  const [startDate, setStartDate] = useState(daysAgoStr(7));
  const [endDate, setEndDate] = useState(todayStr());
  const [currency, setCurrency] = useState("EUR");

  const series = getSeries(currency);
  const minRate = series.length ? Math.min(...series.map((p) => p.rate)) : 0;
  const maxRate = series.length ? Math.max(...series.map((p) => p.rate)) : 1;

  return (
    <section className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-zinc-500 uppercase tracking-widest">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all font-mono"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-zinc-500 uppercase tracking-widest">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all font-mono"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-zinc-500 uppercase tracking-widest">
            Currency (vs USD)
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-amber-400/50 transition-all appearance-none cursor-pointer"
          >
            {allCodes.map((c) => (
              <option key={c} value={c}>
                {getCurrencyInfo(c).flag} {c}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => fetchTimeframe(startDate, endDate)}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-xl bg-amber-400 text-zinc-900 text-sm font-semibold hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? "Loading…" : "Fetch Timeframe"}
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {data && (
        <>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700/50 text-xs text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span className="mono">
              {data.start_date} → {data.end_date}
            </span>
            <span className="text-zinc-600">·</span>
            <span className="mono">{dates.length} days</span>
          </div>

          {/* SVG line chart */}
          {series.length > 1 && (
            <div className="rounded-2xl border border-zinc-700/50 bg-zinc-800/40 p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">
                USD → {currency} rate over time
              </p>
              <div className="relative">
                <svg
                  viewBox={`0 0 600 160`}
                  className="w-full h-40 overflow-visible"
                  preserveAspectRatio="none"
                >
                  {/* Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                    <line
                      key={t}
                      x1="0"
                      y1={t * 160}
                      x2="600"
                      y2={t * 160}
                      stroke="rgba(255,255,255,0.04)"
                      strokeWidth="1"
                    />
                  ))}
                  {/* Area fill */}
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#fbbf24"
                        stopOpacity="0.15"
                      />
                      <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points={[
                      ...series.map((p, i) => {
                        const x = (i / (series.length - 1)) * 600;
                        const y =
                          160 -
                          ((p.rate - minRate) / (maxRate - minRate || 1)) *
                            140 -
                          10;
                        return `${x},${y}`;
                      }),
                      `600,160`,
                      `0,160`,
                    ].join(" ")}
                    fill="url(#areaGrad)"
                  />
                  {/* Line */}
                  <polyline
                    points={series
                      .map((p, i) => {
                        const x = (i / (series.length - 1)) * 600;
                        const y =
                          160 -
                          ((p.rate - minRate) / (maxRate - minRate || 1)) *
                            140 -
                          10;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {/* Y axis labels */}
                <div className="flex justify-between mt-2 text-xs text-zinc-600 mono">
                  <span>{series[0]?.date}</span>
                  <span>{series[series.length - 1]?.date}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-500 mono mt-1">
                  <span>Min: {formatRate(minRate)}</span>
                  <span>Max: {formatRate(maxRate)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Data table */}
          <div className="rounded-2xl border border-zinc-700/50 bg-zinc-800/40 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-700/50">
              <p className="text-xs text-zinc-500 uppercase tracking-widest">
                Daily rates — USD → {currency}
              </p>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-zinc-700/30">
              {series.map((p) => (
                <div
                  key={p.date}
                  className="flex items-center justify-between px-5 py-3 hover:bg-zinc-700/20 transition-colors"
                >
                  <span className="text-sm text-zinc-400 mono">{p.date}</span>
                  <span className="text-sm font-medium text-zinc-100 mono tabular-nums">
                    {formatRate(p.rate)} {currency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!data && !isLoading && (
        <p className="text-zinc-600 text-sm">
          Select a date range and press{" "}
          <span className="text-zinc-400">Fetch Timeframe</span> to see
          day-by-day rates.
        </p>
      )}
    </section>
  );
}

// ─── TAB: Change ─────────────────────────────────────────────────────────────
function ChangeTab() {
  const { data, isLoading, error, fetchChange, topMovers } = useChange();

  const [startDate, setStartDate] = useState(daysAgoStr(7));
  const [endDate, setEndDate] = useState(todayStr());
  const [showAll, setShowAll] = useState(false);

  const displayed = showAll ? topMovers : topMovers.slice(0, 20);

  return (
    <section className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-zinc-500 uppercase tracking-widest">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all font-mono"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-zinc-500 uppercase tracking-widest">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all font-mono"
          />
        </div>
        <button
          onClick={() => fetchChange(startDate, endDate)}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-xl bg-amber-400 text-zinc-900 text-sm font-semibold hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? "Loading…" : "Fetch Changes"}
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {data && (
        <>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700/50 text-xs text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Change from{" "}
            <span className="text-zinc-200 font-medium mono">
              {data.start_date}
            </span>{" "}
            to{" "}
            <span className="text-zinc-200 font-medium mono">
              {data.end_date}
            </span>
          </div>

          {/* Top movers table */}
          <div className="rounded-2xl border border-zinc-700/50 bg-zinc-800/40 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-700/50 flex items-center justify-between">
              <p className="text-xs text-zinc-500 uppercase tracking-widest">
                Top movers (by % change vs USD)
              </p>
              <span className="text-xs text-zinc-600 mono">
                {topMovers.length} currencies
              </span>
            </div>
            <div className="divide-y divide-zinc-700/30">
              {displayed.map((m) => {
                const { flag, name } = getCurrencyInfo(m.code);
                const isPositive = m.change_pct >= 0;
                const barWidth = Math.min(Math.abs(m.change_pct) * 10, 100);
                return (
                  <div
                    key={m.code}
                    className="px-5 py-3.5 hover:bg-zinc-700/20 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg leading-none">{flag}</span>
                        <div>
                          <span className="text-sm font-semibold text-zinc-200 mono">
                            {m.code}
                          </span>
                          <span className="text-xs text-zinc-600 ml-2">
                            {name}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-sm font-semibold mono tabular-nums ${
                            isPositive ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {isPositive ? "+" : ""}
                          {m.change_pct.toFixed(4)}%
                        </span>
                        <p className="text-xs text-zinc-600 mono">
                          {formatRate(m.start_rate)} → {formatRate(m.end_rate)}
                        </p>
                      </div>
                    </div>
                    {/* Bar */}
                    <div className="h-1 rounded-full bg-zinc-700/50 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isPositive ? "bg-emerald-500/60" : "bg-red-500/60"
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {topMovers.length > 20 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="w-full py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-all"
            >
              {showAll
                ? "Show fewer"
                : `Show all ${topMovers.length} currencies`}
            </button>
          )}
        </>
      )}

      {!data && !isLoading && (
        <p className="text-zinc-600 text-sm">
          Select a date range and press{" "}
          <span className="text-zinc-400">Fetch Changes</span> to see which
          currencies moved the most.
        </p>
      )}
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type TabId =
  | "dashboard"
  | "historical"
  | "convert-api"
  | "timeframe"
  | "change";

export default function ExchangeRatePage() {
  const { data, rates, isLoading, error, lastUpdated, refetch } =
    useExchangeRates();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

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

  const tabs: { id: TabId; label: string }[] = [
    { id: "dashboard", label: "📊 Rates" },
    { id: "historical", label: "🗓 Historical" },
    { id: "convert-api", label: "⚡ Convert API" },
    { id: "timeframe", label: "📈 Timeframe" },
    { id: "change", label: "📉 Change" },
  ];

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
        <nav className="flex gap-1 p-1 rounded-xl bg-zinc-800/60 border border-zinc-700/40 mb-8 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-amber-400 text-zinc-900 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* ── Error ── */}
        {error && activeTab === "dashboard" && <ErrorBanner message={error} />}

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

            {/* ── Top Movers ── */}
            {!search && <TopMoversSection />}
          </section>
        )}

        {/* ════════════════════════════════════════════════════
            TAB: HISTORICAL
        ════════════════════════════════════════════════════ */}
        {activeTab === "historical" && <HistoricalTab allCodes={allCodes} />}

        {/* ════════════════════════════════════════════════════
            TAB: CONVERT API
        ════════════════════════════════════════════════════ */}
        {activeTab === "convert-api" && <ConvertTab allCodes={allCodes} />}

        {/* ════════════════════════════════════════════════════
            TAB: TIMEFRAME
        ════════════════════════════════════════════════════ */}
        {activeTab === "timeframe" && <TimeframeTab allCodes={allCodes} />}

        {/* ════════════════════════════════════════════════════
            TAB: CHANGE
        ════════════════════════════════════════════════════ */}
        {activeTab === "change" && <ChangeTab />}
      </div>
    </div>
  );
}
