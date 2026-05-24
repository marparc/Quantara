"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useConvert } from "@/hooks/useConvert";
import { useExchangeRates } from "@/hooks/useExchangeRate";
import { formatRate } from "@/helpers/rate";
import { getCurrencyInfo } from "@/helpers/currency";
import { getFlagUrl } from "@/helpers/flag";
import { POPULAR_PAIRS } from "@/constants/popular-pairs";
import { QUICK_AMOUNTS } from "@/constants/quick-amounts";

// ─── Types & constants ───────────────────────────────────────────────────────

interface CurrencyMeta {
  code: string;
  name: string;
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

// ─── Inline flag (mirrors CurrencyFlag without the import cycle) ──────────────

function FlagImg({ code, size = 20 }: { code: string; size?: number }) {
  const url = getFlagUrl(code);
  const { name } = getCurrencyInfo(code);
  if (!url)
    return (
      <span className="leading-none" style={{ fontSize: size }}>
        🌐
      </span>
    );
  return (
    <img
      src={url}
      alt={`${name} flag`}
      width={size}
      height={size}
      className="object-cover flex-shrink-0 rounded-sm"
      onError={(e) => {
        const t = e.currentTarget;
        t.style.display = "none";
        const s = document.createElement("span");
        s.textContent = "🌐";
        s.className = "leading-none";
        s.style.fontSize = `${size}px`;
        t.parentNode?.insertBefore(s, t);
      }}
    />
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
  const { name: selectedName } = getCurrencyInfo(value);
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

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-xl border border-white/[0.07] px-4 py-3 cursor-pointer w-full text-left transition-all hover:border-white/[0.14] hover:bg-white/[0.04]"
        style={{ background: "rgba(255,255,255,0.03)" }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <FlagImg code={value} size={22} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-200 font-mono leading-tight">
            {value}
          </p>
          <p className="text-[11px] text-zinc-500 leading-tight truncate">
            {selectedName}
          </p>
        </div>
        <svg
          className="w-3.5 h-3.5 text-zinc-600 shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border border-white/[0.08] z-50 flex flex-col"
          style={{
            background: "rgba(8,9,18,0.98)",
            backdropFilter: "blur(16px)",
            boxShadow:
              "0 20px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
          }}
          role="listbox"
        >
          {/* Search */}
          <div className="p-2.5 border-b border-white/[0.06]">
            <div
              className="flex items-center gap-2 rounded-lg border border-white/[0.07] px-3 py-2 focus-within:border-blue-500/40 transition-colors"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <svg
                className="w-3.5 h-3.5 text-zinc-600 shrink-0"
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
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search currency…"
                className="flex-1 bg-transparent text-[12px] font-mono text-zinc-300 placeholder-zinc-600 outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <ul className="overflow-y-auto py-1.5" style={{ maxHeight: "224px" }}>
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-[11px] text-zinc-600 font-mono">
                No results for "{search}"
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
                    className={`flex items-center gap-3 mx-1.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "bg-blue-500/10 border border-blue-500/20"
                        : "border border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]"
                    }`}
                  >
                    <FlagImg code={c.code} size={18} />
                    <span
                      className={`text-[12px] font-semibold font-mono w-10 shrink-0 ${
                        isSelected ? "text-blue-300" : "text-zinc-200"
                      }`}
                    >
                      {c.code}
                    </span>
                    <span className="text-[11px] text-zinc-500 truncate flex-1">
                      {c.name}
                    </span>
                    {isSelected && (
                      <svg
                        className="w-3.5 h-3.5 text-blue-400 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </li>
                );
              })
            )}
          </ul>

          {/* Footer count */}
          <div className="px-4 py-2 border-t border-white/[0.05]">
            <p className="text-[10px] text-zinc-700 font-mono">
              {filtered.length} of {currencies.length} currencies
            </p>
          </div>
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
        const { name } = getCurrencyInfo(code);
        return { code, name };
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
        <p className="text-xs text-zinc-500 mt-10 uppercase tracking-widest font-medium">
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
                const { name: fromName } = getCurrencyInfo(from);
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
                    <FlagImg code={from} size={18} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-200 font-mono">
                        {from}/{to}
                      </p>
                      <p className="text-[11px] text-zinc-500 truncate">
                        {fromName}
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
