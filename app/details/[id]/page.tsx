"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useConvert } from "@/hooks/useConvert";
import { useExchangeRates } from "@/hooks/useExchangeRate";
import { formatRate } from "@/helpers/rate";
import { getCurrencyInfo } from "@/helpers/currency";
import { POPULAR_PAIRS } from "@/constants/popular-pairs";

// ─── Types & constants ───────────────────────────────────────────────────────

interface CurrencyMeta {
  code: string;
  name: string;
  flag: string;
}

const QUICK_AMOUNTS = [1, 5, 10, 50, 100, 500, 1000];

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
  currencies,
}: {
  value: string;
  onChange: (code: string) => void;
  excludeCode?: string;
  label: string;
  currencies: CurrencyMeta[];
}) {
  const meta = currencies.find((c) => c.code === value) ?? {
    code: value,
    name: value,
    flag: "💱",
  };
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return currencies.filter(
      (c) =>
        c.code !== excludeCode &&
        (c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
    );
  }, [search, excludeCode, currencies]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 10);
  }, [open]);

  function select(code: string) {
    onChange(code);
    setOpen(false);
    setSearch("");
  }

  return (
    <div className="flex flex-col gap-1.5 flex-1 relative" ref={containerRef}>
      <span className="text-[11px] text-zinc-500 font-mono uppercase tracking-widest font-medium">
        {label}
      </span>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center gap-3 rounded-xl border border-white/[0.07] px-4 py-3.5 cursor-pointer w-full text-left transition-colors hover:border-white/[0.12]"
        style={{ background: "rgba(255,255,255,0.03)" }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
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
        <span
          className="text-zinc-600 text-xs shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border border-white/[0.08] z-50 overflow-hidden"
          style={{
            background: "rgba(10,11,20,0.98)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
          }}
          role="listbox"
        >
          <div className="p-2 border-b border-white/[0.06]">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search currency…"
              className="w-full rounded-lg px-3 py-2 text-[12px] font-mono text-zinc-300 placeholder-zinc-600 outline-none border border-white/[0.06] focus:border-white/[0.12] transition-colors"
              style={{ background: "rgba(255,255,255,0.04)" }}
            />
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-[11px] text-zinc-600 font-mono">
                No results
              </li>
            ) : (
              filtered.map((c) => {
                const isSelected = c.code === value;
                return (
                  <li
                    key={c.code}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => select(c.code)}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-white/[0.06] text-zinc-200"
                        : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                    }`}
                  >
                    <span className="text-base leading-none w-6 text-center shrink-0">
                      {c.flag}
                    </span>
                    <span className="text-[12px] font-semibold font-mono text-zinc-200 w-10 shrink-0">
                      {c.code}
                    </span>
                    <span className="text-[11px] text-zinc-500 truncate">
                      {c.name}
                    </span>
                    {isSelected && (
                      <span className="ml-auto text-blue-400 text-xs shrink-0">
                        ✓
                      </span>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
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

// ─── Inline Converter ────────────────────────────────────────────────────────

function InlineConverter({
  fromCode,
  toCode,
  fromAmount,
  toAmount,
  isLoading,
  onFromAmountChange,
  onSwap,
  onConvert,
}: {
  fromCode: string;
  toCode: string;
  fromAmount: string;
  toAmount: string;
  isLoading: boolean;
  onFromAmountChange: (val: string) => void;
  onSwap: () => void;
  onConvert: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* From */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] text-zinc-500 font-mono uppercase tracking-widest font-medium">
          {fromCode}
        </span>
        <div
          className="flex items-center gap-2 rounded-xl border border-white/[0.07] px-4 py-3.5 focus-within:border-blue-500/40 transition-colors"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          <span className="text-xs font-mono text-zinc-600 shrink-0">
            {fromCode}
          </span>
          <input
            type="number"
            inputMode="decimal"
            value={fromAmount}
            onChange={(e) => onFromAmountChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onConvert()}
            placeholder="0"
            className="flex-1 min-w-0 bg-transparent text-sm font-semibold font-mono text-zinc-200 outline-none placeholder-zinc-700 tabular-nums"
          />
        </div>
      </div>

      {/* Swap */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/[0.05]" />
        <button
          onClick={onSwap}
          aria-label="Swap currencies"
          className="w-7 h-7 rounded-lg border border-white/[0.07] flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:border-white/[0.12] text-xs transition-all cursor-pointer"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          ⇅
        </button>
        <div className="flex-1 h-px bg-white/[0.05]" />
      </div>

      {/* To (read-only) */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] text-zinc-500 font-mono uppercase tracking-widest font-medium">
          {toCode}
        </span>
        <div
          className="flex items-center gap-2 rounded-xl border border-white/[0.07] px-4 py-3.5"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <span className="text-xs font-mono text-zinc-600 shrink-0">
            {toCode}
          </span>
          <input
            type="text"
            readOnly
            value={isLoading ? "…" : toAmount}
            placeholder="0"
            className="flex-1 min-w-0 bg-transparent text-sm font-semibold font-mono text-zinc-400 outline-none placeholder-zinc-700 cursor-default tabular-nums"
          />
        </div>
      </div>
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
  const { rates: exchangeRates } = useExchangeRates();
  const [popularRates, setPopularRates] = useState<Record<string, number>>({});

  // Build live currency list from exchange rate data
  const currencies: CurrencyMeta[] = useMemo(() => {
    return Object.keys(exchangeRates)
      .map((key) => key.replace(/^USD/, ""))
      .filter((code) => code.length === 3 && !/^\d/.test(code))
      .map((code) => {
        const { name, flag } = getCurrencyInfo(code);
        return { code, name, flag };
      })
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [exchangeRates]);

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
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
          Currency Converter
        </p>

        {/* ── Main converter card ── */}
        <div
          className="rounded-2xl border border-white/[0.07] overflow-visible"
          style={cardBg}
        >
          <CardAccent />
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <CurrencySelect
                label="From"
                value={fromCode}
                onChange={(code) => {
                  setFromCode(code);
                  setQuickAmount(null);
                }}
                excludeCode={toCode}
                currencies={currencies}
              />
              <CurrencySelect
                label="To"
                value={toCode}
                onChange={(code) => {
                  setToCode(code);
                  setQuickAmount(null);
                }}
                excludeCode={fromCode}
                currencies={currencies}
              />
            </div>

            <InlineConverter
              fromCode={fromCode}
              toCode={toCode}
              fromAmount={fromAmount}
              toAmount={toAmount}
              isLoading={isLoading}
              onFromAmountChange={setFromAmount}
              onSwap={handleSwap}
              onConvert={doConvert}
            />

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

            {error && (
              <p className="text-[11px] text-red-400 font-mono text-center -mt-1">
                {error}
              </p>
            )}

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
                const fromMeta = currencies.find((c) => c.code === from) ?? {
                  code: from,
                  name: from,
                  flag: "💱",
                };
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
