import { useState, useCallback } from "react";

export interface HistoricalRatesData {
  success: boolean;
  historical: boolean;
  date: string;
  timestamp: number;
  source: string;
  quotes: Record<string, number>;
}

export interface UseHistoricalRatesReturn {
  data: HistoricalRatesData | null;
  isLoading: boolean;
  error: string | null;
  fetchHistorical: (date: string) => Promise<void>;
  getRate: (currency: string) => number | null;
}

export function useHistoricalRates(): UseHistoricalRatesReturn {
  const [data, setData] = useState<HistoricalRatesData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistorical = useCallback(async (date: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rates/historical?date=${date}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: HistoricalRatesData = await res.json();
      if (!json.success) throw new Error("API returned unsuccessful response");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRate = useCallback(
    (currency: string): number | null => {
      if (!data?.quotes) return null;
      return data.quotes[`USD${currency.toUpperCase()}`] ?? null;
    },
    [data]
  );

  return { data, isLoading, error, fetchHistorical, getRate };
}
