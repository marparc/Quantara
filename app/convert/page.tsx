"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useConvert } from "@/hooks/useConvert";
import { formatRate } from "@/helpers/rate";

// ─── Types & constants ───────────────────────────────────────────────────────

interface CurrencyMeta {
  code: string;
  name: string;
  flag: string;
}

const CURRENCIES: CurrencyMeta[] = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "PHP", name: "Philippine Peso", flag: "🇵🇭" },
  { code: "KRW", name: "South Korean Won", flag: "🇰🇷" },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "HKD", name: "Hong Kong Dollar", flag: "🇭🇰" },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "MXN", name: "Mexican Peso", flag: "🇲🇽" },
  { code: "BRL", name: "Brazilian Real", flag: "🇧🇷" },
  { code: "SEK", name: "Swedish Krona", flag: "🇸🇪" },
  { code: "NOK", name: "Norwegian Krone", flag: "🇳🇴" },
  { code: "DKK", name: "Danish Krone", flag: "🇩🇰" },
  { code: "NZD", name: "New Zealand Dollar", flag: "🇳🇿" },
  { code: "ZAR", name: "South African Rand", flag: "🇿🇦" },
  { code: "THB", name: "Thai Baht", flag: "🇹🇭" },
  { code: "IDR", name: "Indonesian Rupiah", flag: "🇮🇩" },
  { code: "MYR", name: "Malaysian Ringgit", flag: "🇲🇾" },
  { code: "TRY", name: "Turkish Lira", flag: "🇹🇷" },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "SAR", name: "Saudi Riyal", flag: "🇸🇦" },
  { code: "BTC", name: "Bitcoin", flag: "₿" },
  { code: "ETH", name: "Ethereum", flag: "⟠" },
];

const POPULAR_PAIRS = [
  { from: "USD", to: "EUR" },
  { from: "USD", to: "PHP" },
  { from: "EUR", to: "GBP" },
  { from: "USD", to: "JPY" },
  { from: "BTC", to: "USD" },
  { from: "USD", to: "KRW" },
];

const QUICK_AMOUNTS = [1, 5, 10, 50, 100, 500, 1000];

function getCurrencyMeta(code: string): CurrencyMeta {
  return (
    CURRENCIES.find((c) => c.code === code) ?? { code, name: code, flag: "💱" }
  );
}

// ─── Shared card styles ──────────────────────────────────────────────────────

const cardBg = {
  background:
    "linear-gradient(135deg, rgba(10,11,20,0.95) 0%, rgba(8,9,15,0.98) 100%)",
} as const;

function CardAccent() {
  return (
    <div className="h-px w-full bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-purple-500/0" />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-4">
      {children}
    </p>
  );
}

// ─── Currency dropdown ───────────────────────────────────────────────────────

function CurrencySelect({
  value,
  onChange,
  excludeCode,
  label,
}: {
  value: string;
  onChange: (code: string) => void;
  excludeCode?: string;
  label: string;
}) {
  const meta = getCurrencyMeta(value);

  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <span className="text-[11px] text-zinc-500 font-mono uppercase tracking-widest font-medium">
        {label}
      </span>
      {/* Full-width dropdown styled like the screenshot */}
      <div
        className="relative flex items-center gap-3 rounded-xl border border-white/[0.07] px-4 py-3.5 cursor-pointer w-full"
        style={{ background: "rgba(255,255,255,0.03)" }}
      >
        <span className="text-xl leading-none w-7 text-center shrink-0">
          {meta.flag}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-200 font-mono leading-tight">
            {meta.code}
          </p>
          <p className="text-[11px] text-zinc-500 leading-tight truncate">
            {meta.name}
          </p>
        </div>
        <span className="text-zinc-600 text-xs shrink-0">▾</span>
        <select
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        >
          {CURRENCIES.filter((c) => c.code !== excludeCode).map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code} — {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1"
      style={{ background: "rgba(255,255,255,0.03)" }}
    >
      <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">
        {label}
      </p>
      <p className="text-xl font-semibold text-zinc-200 font-mono tabular-nums">
        {value}
      </p>
      {sub && <p className="text-[11px] text-zinc-600 font-mono">{sub}</p>}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function CurrencyConverterPage() {
  const [fromCode, setFromCode] = useState("USD");
  const [toCode, setToCode] = useState("PHP");
  const [fromAmount, setFromAmount] = useState("1");
  const [quickAmount, setQuickAmount] = useState<number | null>(null);

  const { convertCurrency, result, rate, isLoading, error } = useConvert();
  const [popularRates, setPopularRates] = useState<Record<string, number>>({});

  // Fetch popular pair rates on mount
  const fetchPopularRate = useCallback(async (from: string, to: string) => {
    try {
      const params = new URLSearchParams({ from, to, amount: "1" });
      const res = await fetch(`/api/rates/convert?${params}`);
      const json = await res.json();
      if (json.success) {
        setPopularRates((prev) => ({
          ...prev,
          [`${from}_${to}`]: json.result,
        }));
      }
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    POPULAR_PAIRS.forEach(({ from, to }) => fetchPopularRate(from, to));
  }, [fetchPopularRate]);

  // Convert on pair change
  const doConvert = useCallback(() => {
    const amt = parseFloat(fromAmount);
    if (isNaN(amt) || amt <= 0) return;
    convertCurrency(fromCode, toCode, amt);
  }, [fromCode, toCode, fromAmount, convertCurrency]);

  useEffect(() => {
    doConvert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromCode, toCode]);

  const toAmount = useMemo(
    () => (result !== null ? formatRate(result) : ""),
    [result]
  );
  const inverseRate = rate ? 1 / rate : null;

  function handleSwap() {
    setFromCode(toCode);
    setToCode(fromCode);
    setFromAmount("1");
    setQuickAmount(null);
  }

  function handleQuickAmount(amt: number) {
    setQuickAmount(amt);
    setFromAmount(String(amt));
    if (amt > 0) convertCurrency(fromCode, toCode, amt);
  }

  function handlePopularPair(from: string, to: string) {
    setFromCode(from);
    setToCode(to);
    setFromAmount("1");
    setQuickAmount(null);
  }

  return (
    <section className="w-full flex justify-center px-4 py-2">
      <div className="space-y-5 w-full max-w-2xl">
        {/* ── Header label ── */}
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
          Currency Converter
        </p>

        {/* ── Main converter card ── */}
        <div
          className="rounded-2xl border border-white/[0.07] overflow-hidden"
          style={cardBg}
        >
          <CardAccent />
          <div className="p-5 space-y-4">
            {/* Row 1: FROM and TO dropdowns side by side, full width */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <CurrencySelect
                label="From"
                value={fromCode}
                onChange={(code) => {
                  setFromCode(code);
                  setQuickAmount(null);
                }}
                excludeCode={toCode}
              />
              <CurrencySelect
                label="To"
                value={toCode}
                onChange={(code) => {
                  setToCode(code);
                  setQuickAmount(null);
                }}
                excludeCode={fromCode}
              />
            </div>

            {/* Row 2: amount input + swap + result — all on one line */}
            <div className="flex items-center gap-3">
              <input
                type="number"
                inputMode="decimal"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doConvert()}
                placeholder="1"
                className="flex-1 min-w-0 rounded-xl border border-white/[0.07] px-4 py-3.5 text-2xl font-semibold font-mono text-zinc-200 outline-none focus:border-blue-500/40 transition-colors"
                style={{ background: "rgba(255,255,255,0.03)" }}
              />
              <button
                onClick={handleSwap}
                aria-label="Swap currencies"
                className="w-10 h-10 shrink-0 rounded-xl border border-white/[0.07] flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all cursor-pointer text-base"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                ⇅
              </button>
              <input
                type="text"
                readOnly
                value={isLoading ? "…" : toAmount}
                placeholder="—"
                className="flex-1 min-w-0 rounded-xl border border-white/[0.07] px-4 py-3.5 text-2xl font-semibold font-mono text-zinc-400 outline-none cursor-default"
                style={{ background: "rgba(255,255,255,0.02)" }}
              />
            </div>

            {/* Convert button — full width */}
            <button
              onClick={doConvert}
              disabled={isLoading || !fromAmount}
              className="w-full py-3 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #7c3aed)",
              }}
            >
              {isLoading ? "Converting…" : "Convert"}
            </button>

            {/* Error */}
            {error && (
              <p className="text-[11px] text-red-400 font-mono text-center -mt-1">
                {error}
              </p>
            )}

            {/* Rate footer */}
            {rate !== null && (
              <p className="text-[11px] text-zinc-600 font-mono text-center leading-relaxed -mt-1">
                1 {fromCode} = {formatRate(rate)} {toCode}
                {"  ·  "}1 {toCode} = {formatRate(inverseRate ?? 0)} {fromCode}
              </p>
            )}
          </div>
        </div>

        {/* ── Rate breakdown + Quick convert ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Rate breakdown */}
          <div
            className="rounded-2xl border border-white/[0.07] overflow-hidden"
            style={cardBg}
          >
            <CardAccent />
            <div className="p-5">
              <SectionLabel>Rate Breakdown</SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Rate"
                  value={rate !== null ? formatRate(rate) : "—"}
                  sub={rate !== null ? `1 ${fromCode} → ${toCode}` : undefined}
                />
                <StatCard
                  label="Inverse"
                  value={inverseRate !== null ? formatRate(inverseRate) : "—"}
                  sub={
                    inverseRate !== null
                      ? `1 ${toCode} → ${fromCode}`
                      : undefined
                  }
                />
                <StatCard
                  label="You Send"
                  value={fromAmount ? `${fromAmount} ${fromCode}` : "—"}
                />
                <StatCard
                  label="You Receive"
                  value={toAmount ? `${toAmount} ${toCode}` : "—"}
                />
              </div>
            </div>
          </div>

          {/* Quick convert */}
          <div
            className="rounded-2xl border border-white/[0.07] overflow-hidden"
            style={cardBg}
          >
            <CardAccent />
            <div className="p-5">
              <SectionLabel>Quick Convert</SectionLabel>
              <div className="flex flex-wrap gap-2 mb-4">
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleQuickAmount(amt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                      quickAmount === amt
                        ? "text-white"
                        : "text-zinc-400 hover:text-zinc-200 border border-white/[0.07] hover:bg-white/5"
                    }`}
                    style={
                      quickAmount === amt
                        ? {
                            background:
                              "linear-gradient(135deg, #3b82f6, #7c3aed)",
                          }
                        : { background: "rgba(255,255,255,0.02)" }
                    }
                  >
                    {amt} {fromCode}
                  </button>
                ))}
              </div>
              {quickAmount !== null && result !== null && rate !== null ? (
                <div
                  className="rounded-xl p-4"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <p className="text-[11px] text-zinc-500 font-mono mb-1">
                    {quickAmount} {fromCode} equals
                  </p>
                  <p className="text-2xl font-semibold font-mono text-zinc-200 tabular-nums">
                    {formatRate(quickAmount * rate)}{" "}
                    <span className="text-base text-zinc-500">{toCode}</span>
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-zinc-600 font-mono">
                  Select an amount above to convert quickly
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Popular pairs ── */}
        <div
          className="rounded-2xl border border-white/[0.07] overflow-hidden"
          style={cardBg}
        >
          <CardAccent />
          <div className="p-5">
            <SectionLabel>Popular Pairs</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {POPULAR_PAIRS.map(({ from, to }) => {
                const fromMeta = getCurrencyMeta(from);
                const pairRate = popularRates[`${from}_${to}`];
                const isActive = fromCode === from && toCode === to;

                return (
                  <button
                    key={`${from}_${to}`}
                    onClick={() => handlePopularPair(from, to)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left cursor-pointer w-full ${
                      isActive
                        ? "border-blue-500/30 bg-blue-500/5"
                        : "border-white/[0.05] hover:border-white/[0.10] hover:bg-white/[0.02]"
                    }`}
                  >
                    <span className="text-lg leading-none w-6 text-center shrink-0">
                      {fromMeta.flag}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-200 font-mono">
                        {from}/{to}
                      </p>
                      <p className="text-[11px] text-zinc-500 truncate">
                        {fromMeta.name}
                      </p>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-mono tabular-nums shrink-0">
                      {pairRate !== undefined ? formatRate(pairRate) : "—"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CurrencyConverterPage;
