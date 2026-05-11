import { useState, useCallback } from "react";

export interface ConvertData {
  success: boolean;
  query: {
    from: string;
    to: string;
    amount: number;
  };
  info: {
    timestamp: number;
    quote: number;
  };
  result: number;
}

export interface UseConvertReturn {
  data: ConvertData | null;
  isLoading: boolean;
  error: string | null;
  convertCurrency: (from: string, to: string, amount: number) => Promise<void>;
  result: number | null;
  rate: number | null;
}

export function useConvert(): UseConvertReturn {
  const [data, setData] = useState<ConvertData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertCurrency = useCallback(
    async (from: string, to: string, amount: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          from,
          to,
          amount: String(amount),
        });
        const res = await fetch(`/api/rates/convert?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ConvertData = await res.json();
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

  return {
    data,
    isLoading,
    error,
    convertCurrency,
    result: data?.result ?? null,
    rate: data?.info.quote ?? null,
  };
}
