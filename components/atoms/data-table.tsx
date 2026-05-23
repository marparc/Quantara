"use client";

import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";

// ─── Internal: GlassCard ──────────────────────────────────────────────────────
function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.07] overflow-hidden ${className}`}
      style={{
        background:
          "linear-gradient(135deg, rgba(10,11,20,0.95) 0%, rgba(8,9,15,0.98) 100%)",
      }}
    >
      <div className="h-px w-full bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-purple-500/0" />
      {children}
    </div>
  );
}

// ─── Internal: SortIcon ───────────────────────────────────────────────────────
function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  return (
    <span
      className={`ml-1 inline-flex flex-col gap-[2px] ${
        active ? "opacity-100" : "opacity-30"
      }`}
    >
      <span
        className={`block w-0 h-0 border-l-[3px] border-r-[3px] border-b-[4px] border-transparent ${
          active && dir === "asc" ? "border-b-blue-400" : "border-b-zinc-400"
        }`}
      />
      <span
        className={`block w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-transparent ${
          active && dir === "desc" ? "border-t-blue-400" : "border-t-zinc-400"
        }`}
      />
    </span>
  );
}

// ─── Internal: page-number list with ellipsis ─────────────────────────────────
function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const nearby = new Set<number>();
  nearby.add(1);
  nearby.add(total);
  for (let i = current - 1; i <= current + 1; i++) {
    if (i >= 1 && i <= total) nearby.add(i);
  }
  const sorted = Array.from(nearby).sort((a, b) => a - b);
  const result: (number | "…")[] = [];
  let prev = 0;
  for (const n of sorted) {
    if (n - prev > 1) result.push("…");
    result.push(n);
    prev = n;
  }
  return result;
}

// ─── Internal: custom page-size dropdown ─────────────────────────────────────
function PageSizeDropdown({
  value,
  options,
  onChange,
}: {
  value: number;
  options: number[];
  onChange: (n: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`h-7 min-w-[44px] px-2.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all duration-150 border ${
          open
            ? "text-white border-blue-500/40 bg-blue-500/15"
            : "text-zinc-300 border-white/[0.08] bg-white/[0.03] hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-zinc-100"
        }`}
      >
        {value}
        {/* chevron */}
        <svg
          className={`w-2.5 h-2.5 text-zinc-500 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 10 6"
          fill="none"
        >
          <path
            d="M1 1l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Panel — opens upward */}
      {open && (
        <div
          className="absolute bottom-full left-0 mb-1.5 min-w-[72px] rounded-xl border border-white/[0.08] overflow-hidden z-50"
          style={{
            background:
              "linear-gradient(135deg, rgba(12,13,24,0.98) 0%, rgba(8,9,16,0.99) 100%)",
            boxShadow:
              "0 -8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          <div className="h-px w-full bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-purple-500/0" />
          <div className="py-1">
            {options.map((n) => {
              const isActive = n === value;
              return (
                <button
                  key={n}
                  onClick={() => {
                    onChange(n);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-xs font-mono text-left flex items-center justify-between gap-2 transition-colors duration-100 ${
                    isActive
                      ? "text-blue-300 bg-blue-500/10"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]"
                  }`}
                >
                  {n}
                  {isActive && (
                    <svg
                      className="w-2.5 h-2.5 text-blue-400 flex-shrink-0"
                      viewBox="0 0 10 8"
                      fill="none"
                    >
                      <path
                        d="M1 4l3 3 5-6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Column definition ────────────────────────────────────────────────────────
export interface DataTableColumn<T> {
  /** Unique identifier; used as sort key when `sortable: true`. */
  id: string;
  header: ReactNode;
  sortable?: boolean;
  align?: "left" | "right";
  /** Hide column on screens narrower than this breakpoint. */
  hideBelow?: "sm" | "md";
  /** Extra Tailwind classes appended to the <th> element. */
  thClassName?: string;
  /** Extra Tailwind classes appended to every <td> element. */
  tdClassName?: string;
  cell: (row: T) => ReactNode;
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  sortKey: string;
  sortDir: "asc" | "desc";
  onSort: (key: string) => void;
  /** Initial page size (default 50). User can change it via the UI. */
  pageSize?: number;
  /** Available page-size options shown in the selector. */
  pageSizeOptions?: number[];
  /** Noun shown in the footer count (default: "results"). */
  rowLabel?: string;
  /** Optional row click handler. */
  onRowClick?: (row: T) => void;
}

// ─── DataTable ────────────────────────────────────────────────────────────────
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  sortKey,
  sortDir,
  onSort,
  pageSize = 50,
  pageSizeOptions = [10, 25, 50, 100],
  rowLabel = "results",
  onRowClick,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  const totalPages = Math.max(1, Math.ceil(rows.length / currentPageSize));
  // clamp so page never exceeds available pages after filter/sort changes
  const safePage = Math.min(page, totalPages);

  const startIdx = (safePage - 1) * currentPageSize;
  const endIdx = Math.min(safePage * currentPageSize, rows.length);
  const paginated = rows.slice(startIdx, endIdx);

  const pageNums = getPageNumbers(safePage, totalPages);

  function goTo(p: number) {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }

  function handlePageSizeChange(n: number) {
    setCurrentPageSize(n);
    setPage(1);
  }

  // ─── class builders ────────────────────────────────────────────────────────
  function thClass(col: DataTableColumn<T>): string {
    return [
      "px-4 py-3",
      col.align === "right" ? "text-right" : "text-left",
      "text-xs font-medium text-zinc-500 uppercase tracking-wider",
      col.sortable
        ? "cursor-pointer select-none hover:text-zinc-300 transition-colors"
        : "",
      col.hideBelow === "md"
        ? "hidden md:table-cell"
        : col.hideBelow === "sm"
        ? "hidden sm:table-cell"
        : "",
      col.thClassName ?? "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  function tdClass(col: DataTableColumn<T>): string {
    return [
      "px-4 py-3",
      col.align === "right" ? "text-right" : "text-left",
      col.hideBelow === "md"
        ? "hidden md:table-cell"
        : col.hideBelow === "sm"
        ? "hidden sm:table-cell"
        : "",
      col.tdClassName ?? "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  // ─── shared pagination button styles ──────────────────────────────────────
  const pageBtn =
    "h-7 min-w-[28px] px-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-150 flex items-center justify-center";
  const pageBtnActive = "text-white border border-blue-500/40 bg-blue-500/20";
  const pageBtnIdle =
    "text-zinc-400 border border-transparent hover:border-white/[0.08] hover:bg-white/[0.05] hover:text-zinc-200";
  const pageBtnDisabled =
    "text-zinc-700 border border-transparent cursor-not-allowed";

  return (
    <GlassCard>
      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={thClass(col)}
                  onClick={col.sortable ? () => onSort(col.id) : undefined}
                >
                  <span
                    className={`flex items-center ${
                      col.align === "right" ? "justify-end" : ""
                    }`}
                  >
                    {col.header}
                    {col.sortable && (
                      <SortIcon active={sortKey === col.id} dir={sortDir} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {paginated.map((row) => (
              <tr
                key={rowKey(row)}
                className="hover:bg-white/[0.03] transition-colors duration-150 group"
                onClick={() => onRowClick?.(row)}
                style={onRowClick ? { cursor: "pointer" } : undefined}
              >
                {columns.map((col) => (
                  <td key={col.id} className={tdClass(col)}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      <div className="px-4 py-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
        {/* Left: page-size selector + range label */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-600 uppercase tracking-widest hidden sm:block">
              Rows
            </span>
            <PageSizeDropdown
              value={currentPageSize}
              options={pageSizeOptions}
              onChange={handlePageSizeChange}
            />
          </div>
          <span className="text-xs text-zinc-600 font-mono tabular-nums">
            {rows.length === 0
              ? `0 ${rowLabel}`
              : `${startIdx + 1}–${endIdx} of ${rows.length} ${rowLabel}`}
          </span>
        </div>

        {/* Right: prev / numbered pages / next */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* First */}
            <button
              onClick={() => goTo(1)}
              disabled={safePage === 1}
              aria-label="First page"
              className={`${pageBtn} ${
                safePage === 1 ? pageBtnDisabled : pageBtnIdle
              }`}
            >
              «
            </button>

            {/* Prev */}
            <button
              onClick={() => goTo(safePage - 1)}
              disabled={safePage === 1}
              aria-label="Previous page"
              className={`${pageBtn} ${
                safePage === 1 ? pageBtnDisabled : pageBtnIdle
              }`}
            >
              ‹
            </button>

            {/* Page numbers + ellipsis */}
            {pageNums.map((n, i) =>
              n === "…" ? (
                <span
                  key={`ellipsis-${i}`}
                  className="h-7 w-5 flex items-center justify-center text-xs text-zinc-600 select-none"
                >
                  …
                </span>
              ) : (
                <button
                  key={n}
                  onClick={() => goTo(n)}
                  aria-current={n === safePage ? "page" : undefined}
                  className={`${pageBtn} ${
                    n === safePage ? pageBtnActive : pageBtnIdle
                  }`}
                >
                  {n}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => goTo(safePage + 1)}
              disabled={safePage === totalPages}
              aria-label="Next page"
              className={`${pageBtn} ${
                safePage === totalPages ? pageBtnDisabled : pageBtnIdle
              }`}
            >
              ›
            </button>

            {/* Last */}
            <button
              onClick={() => goTo(totalPages)}
              disabled={safePage === totalPages}
              aria-label="Last page"
              className={`${pageBtn} ${
                safePage === totalPages ? pageBtnDisabled : pageBtnIdle
              }`}
            >
              »
            </button>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
