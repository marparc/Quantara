"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

// hooks
import { useExchangeRates } from "@/hooks/useExchangeRate";
import { useChange } from "@/hooks/useChange";
// constants
import { PINNED_CURRENCIES } from "@/constants/pinned-currencies";
import { PERIODS } from "@/constants/periods";
// components
import { DataTable } from "@/components/atoms/data-table";
import type { DataTableColumn } from "@/components/atoms/data-table";
import { CurrencyFlag } from "@/components/molecules/currency-flag";
import { SectionHeader } from "@/components/atoms/section-header";
//helpers
import { formatRate } from "@/helpers/rate";
import { getCurrencyInfo } from "@/helpers/currency";
import { todayStr } from "@/helpers/date";
import { daysAgoStr } from "@/helpers/date";

// ─── Section header ───────────────────────────────────────────────────────────

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
  const router = useRouter();
  const { isLoading: changeLoading, fetchChange, topMovers } = useChange();
  const [activePeriod, setActivePeriod] = useState(PERIODS[1]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const PAGE_SIZE = 50;

  useEffect(() => {
    fetchChange(daysAgoStr(activePeriod.days), todayStr());
  }, [activePeriod]);

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

  const rows: ListRow[] = useMemo(() => {
    const pool = PINNED_CURRENCIES.filter((c) => allCodes.includes(c));
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

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "rank" ? "asc" : "desc");
    }
  }

  // ─── Column definitions ───────────────────────────────────────────────────
  const columns: DataTableColumn<ListRow>[] = [
    {
      id: "rank",
      header: "#",
      sortable: true,
      align: "left",
      thClassName: "w-12",
      cell: (row) => (
        <span className="text-sm text-zinc-600 font-mono tabular-nums">
          {row.rank}
        </span>
      ),
    },
    {
      id: "currency",
      header: "Currency",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <CurrencyFlag code={row.code} />
          <div className="min-w-0">
            <span className="text-sm font-semibold text-zinc-100">
              {row.code}
            </span>
            <span className="text-xs text-zinc-500 truncate block max-w-[140px]">
              {row.name}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "rate",
      header: "1 USD =",
      sortable: true,
      align: "right",
      cell: (row) => (
        <span className="text-sm font-medium text-zinc-100 font-mono tabular-nums">
          {formatRate(row.rate)}
        </span>
      ),
    },
    {
      id: "change_pct",
      header: `${activePeriod.label} %`,
      sortable: true,
      align: "right",
      cell: (row) => {
        const isPos = row.change_pct !== null && row.change_pct >= 0;
        const isNeg = row.change_pct !== null && row.change_pct < 0;
        return row.change_pct !== null ? (
          <span
            className={`inline-flex items-center gap-1 text-sm font-semibold font-mono tabular-nums px-2 py-0.5 rounded-md ${
              isPos
                ? "text-emerald-400 bg-emerald-400/10"
                : isNeg
                ? "text-red-400 bg-red-400/10"
                : "text-zinc-400 bg-white/[0.04]"
            }`}
          >
            {isPos && "▲"}
            {isNeg && "▼"}
            {isPos ? "+" : ""}
            {row.change_pct.toFixed(4)}%
          </span>
        ) : (
          <span className="text-zinc-700 text-sm font-mono">—</span>
        );
      },
    },
    {
      id: "start_rate",
      header: "Start Rate",
      align: "right",
      hideBelow: "md",
      cell: (row) => (
        <span className="text-xs text-zinc-500 font-mono tabular-nums">
          {row.start_rate !== null ? formatRate(row.start_rate) : "—"}
        </span>
      ),
    },
    {
      id: "end_rate",
      header: "End Rate",
      align: "right",
      hideBelow: "md",
      cell: (row) => (
        <span className="text-xs text-zinc-400 font-mono tabular-nums">
          {row.end_rate !== null ? formatRate(row.end_rate) : "—"}
        </span>
      ),
    },
  ];

  return (
    <section>
      <SectionHeader
        eyebrow="Live Market Data"
        title={
          <>
            USD exchange{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              rates
            </span>
          </>
        }
        accent="blue"
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search currency…"
            className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/40 transition-all"
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
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-600 uppercase tracking-widest hidden sm:block">
            Change
          </span>
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            {PERIODS.map((p) => (
              <button
                key={p.label}
                onClick={() => setActivePeriod(p)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  activePeriod.label === p.label
                    ? "text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
                style={
                  activePeriod.label === p.label
                    ? {
                        background: "linear-gradient(135deg, #3b82f6, #7c3aed)",
                      }
                    : {}
                }
              >
                {p.label}
              </button>
            ))}
          </div>
          {changeLoading && (
            <div className="w-4 h-4 rounded-full border-t border-blue-400 animate-spin" />
          )}
        </div>
      </div>

      <DataTable<ListRow>
        key={`${search}__${activePeriod.label}`}
        columns={columns}
        rows={filtered}
        rowKey={(row) => row.code}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={(key) => toggleSort(key as SortKey)}
        pageSize={PAGE_SIZE}
        rowLabel="currencies"
        onRowClick={(row) => router.push(`/details/${row.code.toLowerCase()}`)}
      />
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ExchangeRatePage() {
  const { data, rates, isLoading, error, lastUpdated, refetch } =
    useExchangeRates();

  const allCodes = useMemo(() => {
    return Object.keys(rates)
      .map((key) => key.replace(/^USD/, ""))
      .filter((code) => code.length === 3 && !/^\d/.test(code));
  }, [rates]);

  return (
    <div className="min-h-screen bg-[#07080f] text-zinc-100">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gridPan {
          from { background-position: 0 0; }
          to   { background-position: 40px 40px; }
        }
        .page-fade { animation: fadeUp 0.5s ease both; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
      `}</style>

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Animated grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            animation: "gridPan 8s linear infinite",
          }}
        />
        {/* Orbs */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(59,130,246,0.05) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* ── Content ── */}
        <div className="page-fade delay-200">
          {data && <DashboardListView rates={rates} allCodes={allCodes} />}
        </div>
      </div>
    </div>
  );
}
