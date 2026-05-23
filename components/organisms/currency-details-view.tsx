"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

// hooks
import { useChange } from "@/hooks/useChange";
import { useTimeframe } from "@/hooks/useTimeframe";
// constants
import { PERIODS } from "@/constants/periods";
// helpers
import { getCurrencyInfo } from "@/helpers/currency";
import { todayStr, daysAgoStr } from "@/helpers/date";
// subcomponents
import { CurrencyHeader } from "../atoms/currency-header";
import { CurrencyChart } from "../molecules/currency-chart";
import { CurrencyConverter } from "../molecules/currency-converter";
import { CurrencyStats } from "../molecules/currency-stats";
import { CurrencyDataTable } from "../atoms/currency-data-point";

export function CurrencyDetailsView({
  currencyCode,
  currentRate,
  rates,
  allCodes,
}: {
  currencyCode: string;
  currentRate: number;
  rates: Record<string, number>;
  allCodes: string[];
}) {
  const router = useRouter();
  const { fetchChange: fetchOthersChange, topMovers: othersMovers } =
    useChange();
  const { fetchTimeframe, getSeries, isLoading: isBuilding } = useTimeframe();
  const [activePeriod, setActivePeriod] = useState(PERIODS[1]);

  const { name } = getCurrencyInfo(currencyCode);

  // Fetch 1W change for the other currencies list on mount
  useEffect(() => {
    fetchOthersChange(daysAgoStr(7), todayStr());
  }, [currencyCode]);

  const othersChangeMap = useMemo(() => {
    const m: Record<string, number> = {};
    othersMovers.forEach((mv) => {
      m[mv.code] = mv.change_pct;
    });
    return m;
  }, [othersMovers]);

  // Other currencies list (all except current, with a known rate)
  const otherCurrencies = useMemo(() => {
    return allCodes
      .filter((code) => code !== currencyCode)
      .map((code) => {
        const rate = rates[`USD${code}`];
        if (!rate) return null;
        const { name: n, flag } = getCurrencyInfo(code);
        return {
          code,
          name: n,
          flag,
          rate,
          change_pct: othersChangeMap[code] ?? null,
        };
      })
      .filter(Boolean) as {
      code: string;
      name: string;
      flag: string;
      rate: number;
      change_pct: number | null;
    }[];
  }, [allCodes, currencyCode, rates, othersChangeMap]);

  // Fetch chart data whenever period or currency changes
  useEffect(() => {
    fetchTimeframe(daysAgoStr(activePeriod.days), todayStr(), [currencyCode]);
  }, [activePeriod, currencyCode]);

  const chartPoints = useMemo(
    () => (isBuilding ? [] : getSeries(currencyCode)),
    [getSeries, currencyCode, isBuilding]
  );

  // Converter state
  const [usdAmount, setUsdAmount] = useState("");
  const [fxAmount, setFxAmount] = useState("");
  const [isReversed, setIsReversed] = useState(false);

  function handleUsdChange(val: string) {
    setUsdAmount(val);
    // Clear the opposite field when user types
    if (!isReversed) {
      setFxAmount("");
    }
  }

  function handleFxChange(val: string) {
    setFxAmount(val);
    // Clear the opposite field when user types
    if (isReversed) {
      setUsdAmount("");
    }
  }

  function handleSwap() {
    setIsReversed(!isReversed);
    // Clear both fields on swap
    setUsdAmount("");
    setFxAmount("");
  }

  // Derived stats
  const stats = useMemo(() => {
    if (chartPoints.length === 0) return null;
    const rates = chartPoints.map((p) => p.rate);
    const high = Math.max(...rates);
    const low = Math.min(...rates);
    const start = chartPoints[0].rate;
    const end = chartPoints[chartPoints.length - 1].rate;
    const change = ((end - start) / start) * 100;
    const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
    const rangePct = ((high - low) / low) * 100;
    return { high, low, start, end, change, avg, rangePct };
  }, [chartPoints]);

  const changeNeg = !!(stats && stats.change < 0);

  // Chart domain with padding
  const [yMin, yMax] = useMemo(() => {
    if (chartPoints.length === 0) return [0, 1];
    const rates = chartPoints.map((p) => p.rate);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    const pad = (max - min) * 0.15 || max * 0.01;
    return [min - pad, max + pad];
  }, [chartPoints]);

  return (
    <section className="space-y-5">
      {/* ── Header Card ── */}
      <CurrencyHeader
        currencyCode={currencyCode}
        name={name}
        currentRate={currentRate}
        stats={stats}
      />

      {/* ── Chart + Converter (main row) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <CurrencyChart
          currencyCode={currencyCode}
          chartPoints={chartPoints}
          activePeriod={activePeriod}
          isBuilding={isBuilding}
          changeNeg={changeNeg}
          yMin={yMin}
          yMax={yMax}
          onPeriodChange={setActivePeriod}
        />
        <CurrencyConverter
          currencyCode={currencyCode}
          currentRate={currentRate}
          usdAmount={usdAmount}
          fxAmount={fxAmount}
          onUsdChange={handleUsdChange}
          onFxChange={handleFxChange}
          isReversed={isReversed}
          onSwap={handleSwap}
        />
      </div>

      {/* ── Stats Row ── */}
      {stats && (
        <CurrencyStats stats={stats} periodLabel={activePeriod.label} />
      )}

      {/* ── Data Table (full width) ── */}
      <CurrencyDataTable
        chartPoints={chartPoints}
        currentRate={currentRate}
        activePeriodLabel={activePeriod.label}
        activePeriodDays={activePeriod.days}
      />
    </section>
  );
}
