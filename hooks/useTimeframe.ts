import { useState, useCallback } from "react";

export interface TimeframeData {
  success: boolean;
  timeframe: boolean;
  start_date: string;
  end_date: string;
  source: string;
  /** { "2020-01-01": { "USDEUR": 0.89, ... }, ... } */
  quotes: Record<string, Record<string, number>>;
}

export interface TimeframePoint {
  date: string;
  rate: number;
}

export interface UseTimeframeReturn {
  data: TimeframeData | null;
  isLoading: boolean;
  error: string | null;
  fetchTimeframe: (
    startDate: string,
    endDate: string,
    currencies?: string[]
  ) => Promise<void>;
  /** Sorted array of { date, rate } for a given currency e.g. "EUR" */
  getSeries: (currency: string) => TimeframePoint[];
  /** All dates in the response, sorted ascending */
  dates: string[];
}

export function useTimeframe(): UseTimeframeReturn {
  const [data, setData] = useState<TimeframeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeframe = useCallback(
    async (startDate: string, endDate: string, currencies?: string[]) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          start_date: startDate,
          end_date: endDate,
        });
        if (currencies?.length) {
          params.set("currencies", currencies.join(","));
        }
        const res = await fetch(`/api/rates/timeframe?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: TimeframeData = await res.json();
        if (!json.success)
          throw new Error("API returned unsuccessful response");
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const dates = data ? Object.keys(data.quotes).sort() : [];

  const getSeries = useCallback(
    (currency: string): TimeframePoint[] => {
      if (!data?.quotes) return [];
      const key = `USD${currency.toUpperCase()}`;
      return Object.entries(data.quotes)
        .map(([date, dayQuotes]) => ({ date, rate: dayQuotes[key] }))
        .filter((p) => p.rate !== undefined)
        .sort((a, b) => a.date.localeCompare(b.date));
    },
    [data]
  );

  return { data, isLoading, error, fetchTimeframe, getSeries, dates };
}
