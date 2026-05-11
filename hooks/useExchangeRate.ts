import { useState, useEffect, useCallback } from "react";

export interface ExchangeRates {
  [currencyPair: string]: number;
}

export interface ExchangeRateData {
  success: boolean;
  timestamp: number;
  source: string;
  quotes: ExchangeRates;
}

export interface UseExchangeRatesReturn {
  data: ExchangeRateData | null;
  rates: ExchangeRates;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => void;
  convert: (amount: number, from: string, to: string) => number | null;
  getRate: (from: string, to: string) => number | null;
}

const API_BASE_URL = "https://api.exchangerate.host/live";

export function useExchangeRates(
  autoRefreshMs?: number
): UseExchangeRatesReturn {
  const [data, setData] = useState<ExchangeRateData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call your own API route — no key needed client-side
      const response = await fetch("/api/rates/live");

      if (!response.ok) {
        throw new Error(
          `HTTP error: ${response.status} ${response.statusText}`
        );
      }

      const json: ExchangeRateData = await response.json();

      if (!json.success) {
        throw new Error("API returned an unsuccessful response.");
      }

      setData(json);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();

    if (autoRefreshMs && autoRefreshMs > 0) {
      const interval = setInterval(fetchRates, autoRefreshMs);
      return () => clearInterval(interval);
    }
  }, [fetchRates, autoRefreshMs]);

  /**
   * Get the exchange rate between two currencies (using USD as the pivot).
   * Returns null if data isn't loaded or the currency isn't found.
   */
  const getRate = useCallback(
    (from: string, to: string): number | null => {
      if (!data?.quotes) return null;

      const fromUpper = from.toUpperCase();
      const toUpper = to.toUpperCase();

      // Direct USD → target
      if (fromUpper === "USD") {
        return data.quotes[`USD${toUpper}`] ?? null;
      }

      // target → USD
      if (toUpper === "USD") {
        const fromRate = data.quotes[`USD${fromUpper}`];
        return fromRate ? 1 / fromRate : null;
      }

      // Cross rate: from → USD → to
      const fromRate = data.quotes[`USD${fromUpper}`];
      const toRate = data.quotes[`USD${toUpper}`];
      if (!fromRate || !toRate) return null;

      return toRate / fromRate;
    },
    [data]
  );

  /**
   * Convert an amount from one currency to another.
   * Returns null if the rate cannot be determined.
   */
  const convert = useCallback(
    (amount: number, from: string, to: string): number | null => {
      const rate = getRate(from, to);
      return rate !== null ? amount * rate : null;
    },
    [getRate]
  );

  return {
    data,
    rates: data?.quotes ?? {},
    isLoading,
    error,
    lastUpdated,
    refetch: fetchRates,
    convert,
    getRate,
  };
}
