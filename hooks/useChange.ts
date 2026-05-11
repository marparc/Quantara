import { useState, useCallback } from "react";

export interface CurrencyChangeQuote {
  start_rate: number;
  end_rate: number;
  change: number;
  change_pct: number;
}

export interface ChangeData {
  success: boolean;
  change: boolean;
  start_date: string;
  end_date: string;
  source: string;
  quotes: Record<string, CurrencyChangeQuote>;
}

export interface TopMover extends CurrencyChangeQuote {
  code: string;
}

export interface UseChangeReturn {
  data: ChangeData | null;
  isLoading: boolean;
  error: string | null;
  fetchChange: (
    startDate: string,
    endDate: string,
    currencies?: string[]
  ) => Promise<void>;
  /** Get change info for a specific currency code e.g. "EUR" */
  getChange: (currency: string) => CurrencyChangeQuote | null;
  /** All quotes sorted by absolute % change descending */
  topMovers: TopMover[];
}

export function useChange(): UseChangeReturn {
  const [data, setData] = useState<ChangeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChange = useCallback(
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
        const res = await fetch(`/api/rates/change?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ChangeData = await res.json();
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

  const getChange = useCallback(
    (currency: string): CurrencyChangeQuote | null => {
      if (!data?.quotes) return null;
      return data.quotes[`USD${currency.toUpperCase()}`] ?? null;
    },
    [data]
  );

  const topMovers: TopMover[] = data
    ? Object.entries(data.quotes)
        .map(([key, val]) => ({ code: key.replace(/^USD/, ""), ...val }))
        .filter((m) => m.code.length === 3 && m.code !== "USD")
        .sort((a, b) => Math.abs(b.change_pct) - Math.abs(a.change_pct))
    : [];

  return { data, isLoading, error, fetchChange, getChange, topMovers };
}
