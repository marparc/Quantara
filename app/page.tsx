"use client";

import { useState, useMemo, useEffect } from "react";

// hooks
import { useExchangeRates } from "@/hooks/useExchangeRate";
import { useChange } from "@/hooks/useChange";
import { useHistoricalRates } from "@/hooks/useHistoricalRates";
import { useConvert } from "@/hooks/useConvert";
import { useTimeframe } from "@/hooks/useTimeframe";
// constants
import { CURRENCY_LABELS } from "@/constants/currency-labels";
import { PINNED_CURRENCIES } from "@/constants/pinned-currencies";

// ─── Currency → Country code map for flag API ─────────────────────────────────
const CURRENCY_TO_COUNTRY: Record<string, string> = {
  AED: "ae",
  AFN: "af",
  ALL: "al",
  AMD: "am",
  ANG: "an",
  AOA: "ao",
  ARS: "ar",
  AUD: "au",
  AWG: "aw",
  AZN: "az",
  BAM: "ba",
  BBD: "bb",
  BDT: "bd",
  BGN: "bg",
  BHD: "bh",
  BIF: "bi",
  BMD: "bm",
  BND: "bn",
  BOB: "bo",
  BRL: "br",
  BSD: "bs",
  BTN: "bt",
  BWP: "bw",
  BYN: "by",
  BZD: "bz",
  CAD: "ca",
  CDF: "cd",
  CHF: "ch",
  CLP: "cl",
  CNY: "cn",
  COP: "co",
  CRC: "cr",
  CUP: "cu",
  CVE: "cv",
  CZK: "cz",
  DJF: "dj",
  DKK: "dk",
  DOP: "do",
  DZD: "dz",
  EGP: "eg",
  ERN: "er",
  ETB: "et",
  EUR: "eu",
  FJD: "fj",
  FKP: "fk",
  GBP: "gb",
  GEL: "ge",
  GHS: "gh",
  GIP: "gi",
  GMD: "gm",
  GNF: "gn",
  GTQ: "gt",
  GYD: "gy",
  HKD: "hk",
  HNL: "hn",
  HRK: "hr",
  HTG: "ht",
  HUF: "hu",
  IDR: "id",
  ILS: "il",
  INR: "in",
  IQD: "iq",
  IRR: "ir",
  ISK: "is",
  JMD: "jm",
  JOD: "jo",
  JPY: "jp",
  KES: "ke",
  KGS: "kg",
  KHR: "kh",
  KMF: "km",
  KPW: "kp",
  KRW: "kr",
  KWD: "kw",
  KYD: "ky",
  KZT: "kz",
  LAK: "la",
  LBP: "lb",
  LKR: "lk",
  LRD: "lr",
  LSL: "ls",
  LYD: "ly",
  MAD: "ma",
  MDL: "md",
  MGA: "mg",
  MKD: "mk",
  MMK: "mm",
  MNT: "mn",
  MOP: "mo",
  MRU: "mr",
  MUR: "mu",
  MVR: "mv",
  MWK: "mw",
  MXN: "mx",
  MYR: "my",
  MZN: "mz",
  NAD: "na",
  NGN: "ng",
  NIO: "ni",
  NOK: "no",
  NPR: "np",
  NZD: "nz",
  OMR: "om",
  PAB: "pa",
  PEN: "pe",
  PGK: "pg",
  PHP: "ph",
  PKR: "pk",
  PLN: "pl",
  PYG: "py",
  QAR: "qa",
  RON: "ro",
  RSD: "rs",
  RUB: "ru",
  RWF: "rw",
  SAR: "sa",
  SBD: "sb",
  SCR: "sc",
  SDG: "sd",
  SEK: "se",
  SGD: "sg",
  SHP: "sh",
  SLL: "sl",
  SOS: "so",
  SRD: "sr",
  STN: "st",
  SVC: "sv",
  SYP: "sy",
  SZL: "sz",
  THB: "th",
  TJS: "tj",
  TMT: "tm",
  TND: "tn",
  TOP: "to",
  TRY: "tr",
  TTD: "tt",
  TWD: "tw",
  TZS: "tz",
  UAH: "ua",
  UGX: "ug",
  USD: "us",
  UYU: "uy",
  UZS: "uz",
  VES: "ve",
  VND: "vn",
  VUV: "vu",
  WST: "ws",
  XAF: "cm",
  XCD: "ag",
  XOF: "sn",
  XPF: "pf",
  YER: "ye",
  ZAR: "za",
  ZMW: "zm",
  ZWL: "zw",
};

function getFlagUrl(code: string): string | null {
  const country = CURRENCY_TO_COUNTRY[code];
  if (!country) return null;
  return `https://flagsapi.com/${country.toUpperCase()}/flat/64.png`;
}

// ─── Flag image component ─────────────────────────────────────────────────────
function CurrencyFlag({
  code,
  className = "",
}: {
  code: string;
  className?: string;
}) {
  const url = getFlagUrl(code);
  const { name } = getCurrencyInfo(code);

  if (!url) {
    return <span className={`text-xl leading-none ${className}`}>🌐</span>;
  }

  return (
    <img
      src={url}
      alt={`${name} flag`}
      width={24}
      height={24}
      className={`object-cover flex-shrink-0 ${className}`}
      onError={(e) => {
        // Fallback to globe emoji if image fails
        const target = e.currentTarget;
        target.style.display = "none";
        const span = document.createElement("span");
        span.textContent = "🌐";
        span.className = "text-xl leading-none";
        target.parentNode?.insertBefore(span, target);
      }}
    />
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatRate(raw: number | string): string {
  const rate = Number(raw);
  if (!isFinite(rate)) return "—";
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
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-2 border-teal-300/20" />
        <div className="absolute inset-0 rounded-full border-t-2 border-teal-400 animate-spin" />
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

// ─── Sort icon ─────────────────────────────────────────────────────────────────
function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  return (
    <span
      className={`ml-1 inline-flex flex-col gap-[2px] ${
        active ? "opacity-100" : "opacity-30"
      }`}
    >
      <span
        className={`block w-0 h-0 border-l-[3px] border-r-[3px] border-b-[4px] border-transparent ${
          active && dir === "asc" ? "border-b-teal-400" : "border-b-zinc-400"
        }`}
      />
      <span
        className={`block w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-transparent ${
          active && dir === "desc" ? "border-t-teal-400" : "border-t-zinc-400"
        }`}
      />
    </span>
  );
}

// ─── Dashboard: List View ─────────────────────────────────────────────────────
const PERIODS = [
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
  { label: "3Y", days: 1095 },
  { label: "5Y", days: 1825 },
];

type SortKey = "rank" | "rate" | "change_pct";
type SortDir = "asc" | "desc";

interface ListRow {
  rank: number;
  code: string;
  name: string;
  flag: string;
  rate: number;
  change_pct: number | null;
  start_rate: number | null;
  end_rate: number | null;
}

function DashboardListView({
  rates,
  allCodes,
}: {
  rates: Record<string, number>;
  allCodes: string[];
}) {
  const { isLoading: changeLoading, fetchChange, topMovers } = useChange();
  const [activePeriod, setActivePeriod] = useState(PERIODS[1]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  useEffect(() => {
    fetchChange(daysAgoStr(activePeriod.days), todayStr());
  }, [activePeriod]);

  // Build change map
  const changeMap = useMemo(() => {
    const m: Record<
      string,
      { change_pct: number; start_rate: number; end_rate: number }
    > = {};
    topMovers.forEach((mv) => {
      m[mv.code] = {
        change_pct: mv.change_pct,
        start_rate: mv.start_rate,
        end_rate: mv.end_rate,
      };
    });
    return m;
  }, [topMovers]);

  // Build rows
  const rows: ListRow[] = useMemo(() => {
    const pool = PINNED_CURRENCIES.filter((c) => allCodes.includes(c));
    // add remaining codes not in pinned
    const rest = allCodes.filter((c) => !pool.includes(c));
    const all = [...pool, ...rest];

    return all
      .map((code, idx) => {
        const key = `USD${code}`;
        const rate = rates[key];
        if (!rate) return null;
        const { name, flag } = getCurrencyInfo(code);
        const ch = changeMap[code] ?? null;
        return {
          rank: idx + 1,
          code,
          name,
          flag,
          rate,
          change_pct: ch?.change_pct ?? null,
          start_rate: ch?.start_rate ?? null,
          end_rate: ch?.end_rate ?? null,
        } as ListRow;
      })
      .filter(Boolean) as ListRow[];
  }, [rates, allCodes, changeMap]);

  // Filter + sort
  const filtered = useMemo(() => {
    const q = search.trim().toUpperCase();
    let r = q
      ? rows.filter(
          (row) => row.code.includes(q) || row.name.toUpperCase().includes(q)
        )
      : rows;

    r = [...r].sort((a, b) => {
      let av: number, bv: number;
      if (sortKey === "rank") {
        av = a.rank;
        bv = b.rank;
      } else if (sortKey === "rate") {
        av = a.rate;
        bv = b.rate;
      } else {
        av = a.change_pct ?? -Infinity;
        bv = b.change_pct ?? -Infinity;
      }
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return r;
  }, [rows, search, sortKey, sortDir]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "rank" ? "asc" : "desc");
    }
  }

  return (
    <section>
      {/* Controls row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none"
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
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search currency…"
            className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-teal-500/40 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Period filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-600 uppercase tracking-widest hidden sm:block">
            Change
          </span>
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            {PERIODS.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setActivePeriod(p);
                  setPage(1);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  activePeriod.label === p.label
                    ? "bg-gradient-to-r from-teal-500 to-violet-600 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {changeLoading && (
            <div className="w-4 h-4 rounded-full border-t border-teal-400 animate-spin" />
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117]/80 overflow-hidden">
        {/* Table header */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer select-none hover:text-zinc-300 transition-colors w-12"
                  onClick={() => toggleSort("rank")}
                >
                  <span className="flex items-center">
                    #<SortIcon active={sortKey === "rank"} dir={sortDir} />
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Currency
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer select-none hover:text-zinc-300 transition-colors"
                  onClick={() => toggleSort("rate")}
                >
                  <span className="flex items-center justify-end">
                    1 USD =
                    <SortIcon active={sortKey === "rate"} dir={sortDir} />
                  </span>
                </th>
                <th
                  className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer select-none hover:text-zinc-300 transition-colors"
                  onClick={() => toggleSort("change_pct")}
                >
                  <span className="flex items-center justify-end">
                    {activePeriod.label} %
                    <SortIcon active={sortKey === "change_pct"} dir={sortDir} />
                  </span>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">
                  Start Rate
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">
                  End Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {paginated.map((row) => {
                const isPos = row.change_pct !== null && row.change_pct >= 0;
                const isNeg = row.change_pct !== null && row.change_pct < 0;
                return (
                  <tr
                    key={row.code}
                    className="hover:bg-white/[0.03] transition-colors duration-150 group"
                  >
                    {/* Rank */}
                    <td className="px-4 py-3 text-sm text-zinc-600 mono tabular-nums">
                      {row.rank}
                    </td>

                    {/* Currency */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <CurrencyFlag code={row.code} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-zinc-100">
                              {row.code}
                            </span>
                          </div>
                          <span className="text-xs text-zinc-500 truncate block max-w-[140px]">
                            {row.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Rate */}
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-zinc-100 mono tabular-nums">
                        {formatRate(row.rate)}
                      </span>
                    </td>

                    {/* Change % */}
                    <td className="px-4 py-3 text-right">
                      {row.change_pct !== null ? (
                        <span
                          className={`inline-flex items-center gap-1 text-sm font-semibold mono tabular-nums px-2 py-0.5 rounded-md ${
                            isPos
                              ? "text-emerald-400 bg-emerald-400/10"
                              : isNeg
                              ? "text-red-400 bg-red-400/10"
                              : "text-zinc-400 bg-[#0d1117]"
                          }`}
                        >
                          {isPos && "▲"}
                          {isNeg && "▼"}
                          {isPos ? "+" : ""}
                          {row.change_pct.toFixed(4)}%
                        </span>
                      ) : (
                        <span className="text-zinc-700 text-sm mono">—</span>
                      )}
                    </td>

                    {/* Start Rate */}
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span className="text-xs text-zinc-500 mono tabular-nums">
                        {row.start_rate !== null
                          ? formatRate(row.start_rate)
                          : "—"}
                      </span>
                    </td>

                    {/* End Rate */}
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span className="text-xs text-zinc-400 mono tabular-nums">
                        {row.end_rate !== null ? formatRate(row.end_rate) : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-xs text-zinc-600 mono">
            {filtered.length} currencies · showing {paginated.length}
          </span>
          {hasMore && (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="text-xs text-teal-400 hover:text-teal-300 transition-colors font-medium"
            >
              Show more ↓
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── RateCard (kept for other tabs) ───────────────────────────────────────────
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
  const { name } = getCurrencyInfo(code);
  const isBase = code === fromCurrency;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-900/20 ${
        isBase
          ? "border-teal-500/30 bg-teal-500/5"
          : "border-white/[0.06] bg-[#0d1117]/70 hover:border-teal-500/30"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <CurrencyFlag code={code} />
          <span
            className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
              isBase
                ? "bg-teal-500/15 text-teal-300"
                : "bg-white/[0.05] text-zinc-400"
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
          <p className="text-sm font-mono text-teal-400/80 mt-1 tabular-nums">
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
            className="px-3 py-2.5 rounded-xl bg-[#0d1117] border border-white/[0.08] text-sm text-zinc-200 focus:outline-none focus:border-teal-500/40 transition-all font-mono"
          />
        </div>
        <button
          onClick={() => fetchHistorical(date)}
          disabled={isLoading || !date}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? "Loading…" : "Fetch Rates"}
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {data && (
        <>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            Historical rates for{" "}
            <span className="text-zinc-200 font-medium mono">{data.date}</span>
            <span className="text-zinc-600">·</span>
            <span className="mono">Base: {data.source}</span>
          </div>
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
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07] text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-teal-500/40 transition-all"
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
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-5">
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
            className="w-full px-4 py-3 rounded-xl bg-[#0a0e12] border border-white/[0.08] text-xl font-medium mono text-zinc-100 focus:outline-none focus:border-teal-500/40 transition-all"
            placeholder="0.00"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">
              From
            </label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#0a0e12] border border-white/[0.08] text-sm text-zinc-200 focus:outline-none focus:border-teal-500/40 transition-all appearance-none cursor-pointer"
            >
              {["USD", ...allCodes].map((c) => (
                <option key={c} value={c}>
                  {c} — {getCurrencyInfo(c).name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSwap}
            className="mt-6 p-2.5 rounded-xl bg-white/[0.04] hover:bg-violet-500/20 border border-white/[0.07] hover:border-violet-500/40 text-zinc-400 hover:text-violet-400 transition-all duration-200"
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
              className="w-full px-4 py-3 rounded-xl bg-[#0a0e12] border border-white/[0.08] text-sm text-zinc-200 focus:outline-none focus:border-teal-500/40 transition-all appearance-none cursor-pointer"
            >
              {["USD", ...allCodes].map((c) => (
                <option key={c} value={c}>
                  {c} — {getCurrencyInfo(c).name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleConvert}
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-violet-600 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? "Converting…" : "Convert via API"}
        </button>

        {error && <ErrorBanner message={error} />}

        {data && result !== null && (
          <div className="rounded-xl bg-[#0a0e12]/80 border border-white/[0.05] p-5">
            <p className="text-xs text-zinc-600 uppercase tracking-widest mb-3">
              Result
            </p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-4xl font-semibold mono text-teal-300 tabular-nums">
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
                    ? "bg-teal-500/15 text-teal-300 border border-violet-500/40"
                    : "bg-[#0d1117] text-zinc-500 border border-white/[0.08] hover:text-zinc-300 hover:border-zinc-600"
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
  const minRate = series.length
    ? Math.min(...series.map((p: { date: string; rate: number }) => p.rate))
    : 0;
  const maxRate = series.length
    ? Math.max(...series.map((p: { date: string; rate: number }) => p.rate))
    : 1;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-zinc-500 uppercase tracking-widest">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[#0d1117] border border-white/[0.08] text-sm text-zinc-200 focus:outline-none focus:border-teal-500/40 transition-all font-mono"
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
            className="px-3 py-2.5 rounded-xl bg-[#0d1117] border border-white/[0.08] text-sm text-zinc-200 focus:outline-none focus:border-teal-500/40 transition-all font-mono"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-zinc-500 uppercase tracking-widest">
            Currency (vs USD)
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[#0d1117] border border-white/[0.08] text-sm text-zinc-200 focus:outline-none focus:border-teal-500/40 transition-all appearance-none cursor-pointer"
          >
            {allCodes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => fetchTimeframe(startDate, endDate)}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? "Loading…" : "Fetch Timeframe"}
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {data && (
        <>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <span className="mono">
              {data.start_date} → {data.end_date}
            </span>
            <span className="text-zinc-600">·</span>
            <span className="mono">{dates.length} days</span>
          </div>

          {series.length > 1 && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">
                USD → {currency} rate over time
              </p>
              <div className="relative">
                <svg
                  viewBox="0 0 600 160"
                  className="w-full h-40 overflow-visible"
                  preserveAspectRatio="none"
                >
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
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#2dd4bf"
                        stopOpacity="0.15"
                      />
                      <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points={[
                      ...series.map(
                        (p: { date: string; rate: number }, i: number) => {
                          const x = (i / (series.length - 1)) * 600;
                          const y =
                            160 -
                            ((p.rate - minRate) / (maxRate - minRate || 1)) *
                              140 -
                            10;
                          return `${x},${y}`;
                        }
                      ),
                      `600,160`,
                      `0,160`,
                    ].join(" ")}
                    fill="url(#areaGrad)"
                  />
                  <polyline
                    points={series
                      .map((p: { date: string; rate: number }, i: number) => {
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
                    stroke="#2dd4bf"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
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

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.06]">
              <p className="text-xs text-zinc-500 uppercase tracking-widest">
                Daily rates — USD → {currency}
              </p>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.04]">
              {series.map((p: { date: string; rate: number }) => (
                <div
                  key={p.date}
                  className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.03] transition-colors"
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
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-zinc-500 uppercase tracking-widest">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[#0d1117] border border-white/[0.08] text-sm text-zinc-200 focus:outline-none focus:border-teal-500/40 transition-all font-mono"
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
            className="px-3 py-2.5 rounded-xl bg-[#0d1117] border border-white/[0.08] text-sm text-zinc-200 focus:outline-none focus:border-teal-500/40 transition-all font-mono"
          />
        </div>
        <button
          onClick={() => fetchChange(startDate, endDate)}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? "Loading…" : "Fetch Changes"}
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {data && (
        <>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            Change from{" "}
            <span className="text-zinc-200 font-medium mono">
              {data.start_date}
            </span>{" "}
            to{" "}
            <span className="text-zinc-200 font-medium mono">
              {data.end_date}
            </span>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <p className="text-xs text-zinc-500 uppercase tracking-widest">
                Top movers (by % change vs USD)
              </p>
              <span className="text-xs text-zinc-600 mono">
                {topMovers.length} currencies
              </span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {displayed.map((m) => {
                const { name } = getCurrencyInfo(m.code);
                const isPositive = m.change_pct >= 0;
                const barWidth = Math.min(Math.abs(m.change_pct) * 10, 100);
                return (
                  <div
                    key={m.code}
                    className="px-5 py-3.5 hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <CurrencyFlag code={m.code} />
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
                    <div className="h-1 rounded-full bg-violet-900/40 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isPositive ? "bg-teal-500/60" : "bg-red-500/60"
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
              className="w-full py-2.5 rounded-xl border border-white/[0.08] text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-all"
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
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  const allCodes = useMemo(() => {
    return Object.keys(rates)
      .map((key) => key.replace(/^USD/, ""))
      .filter((code) => code.length === 3 && !/^\d/.test(code));
  }, [rates]);

  const tabs: { id: TabId; label: string }[] = [
    { id: "dashboard", label: "📊 Rates" },
    { id: "historical", label: "🗓 Historical" },
    { id: "convert-api", label: "⚡ Convert" },
    { id: "timeframe", label: "📈 Timeframe" },
    { id: "change", label: "📉 Change" },
  ];

  return (
    <div
      className="min-h-screen bg-[#090c0f] text-zinc-100"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .mono { font-family: 'DM Mono', monospace; }
        tbody tr { cursor: default; }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(20,184,166,0.07),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgba(139,92,246,0.06),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_20%_at_20%_80%,rgba(20,184,166,0.04),transparent)]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* ── Error ── */}
        {error && activeTab === "dashboard" && <ErrorBanner message={error} />}

        {/* ── Loading ── */}
        {isLoading && !data && <Spinner />}

        {/* ════ DASHBOARD ════ */}
        {activeTab === "dashboard" && data && (
          <DashboardListView rates={rates} allCodes={allCodes} />
        )}

        {/* ════ HISTORICAL ════ */}
        {activeTab === "historical" && <HistoricalTab allCodes={allCodes} />}

        {/* ════ CONVERT ════ */}
        {activeTab === "convert-api" && <ConvertTab allCodes={allCodes} />}

        {/* ════ TIMEFRAME ════ */}
        {activeTab === "timeframe" && <TimeframeTab allCodes={allCodes} />}

        {/* ════ CHANGE ════ */}
        {activeTab === "change" && <ChangeTab />}
      </div>
    </div>
  );
}
