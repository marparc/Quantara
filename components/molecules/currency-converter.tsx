import { useEffect } from "react";
import { formatRate } from "@/helpers/rate";
import { Button } from "../atoms/button";
import { Input } from "../atoms/input";
import { useConvert } from "@/hooks/useConvert";

interface CurrencyConverterProps {
  currencyCode: string;
  currentRate: number;
  usdAmount: string;
  fxAmount: string;
  onUsdChange: (val: string) => void;
  onFxChange: (val: string) => void;
  isReversed: boolean;
  onSwap: () => void;
}

export function CurrencyConverter({
  currencyCode,
  currentRate,
  usdAmount,
  fxAmount,
  onUsdChange,
  onFxChange,
  isReversed,
  onSwap,
}: CurrencyConverterProps) {
  const { convertCurrency, result, rate, isLoading, error } = useConvert();

  async function handleConvert() {
    if (isReversed) {
      // Converting from FX to USD
      const amount = parseFloat(fxAmount);
      if (isNaN(amount)) return;
      await convertCurrency(currencyCode, "USD", amount);
    } else {
      // Converting from USD to FX
      const amount = parseFloat(usdAmount);
      if (isNaN(amount)) return;
      await convertCurrency("USD", currencyCode, amount);
    }
  }

  // Only update the result field once the API result arrives
  useEffect(() => {
    if (result !== null) {
      if (isReversed) {
        onUsdChange(result.toFixed(4));
      } else {
        onFxChange(result.toFixed(4));
      }
    }
  }, [result]);

  return (
    <div
      className="rounded-2xl border border-white/[0.07] overflow-hidden flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, rgba(10,11,20,0.95) 0%, rgba(8,9,15,0.98) 100%)",
      }}
    >
      <div className="h-px w-full bg-linear-to-r from-blue-500/0 via-blue-500/40 to-purple-500/0" />
      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-5">
          Converter
        </p>
        <div className="flex flex-col gap-3 flex-1 justify-center">
          {/* First input (USD or FX depending on isReversed) */}
          <Input
            type="number"
            label={isReversed ? currencyCode : "USD"}
            prefix={isReversed ? currencyCode : "$"}
            value={isReversed ? fxAmount : usdAmount}
            onChange={(e) =>
              isReversed
                ? onFxChange(e.target.value)
                : onUsdChange(e.target.value)
            }
            placeholder="0"
          />

          {/* Swap button */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/5" />
            <button
              onClick={onSwap}
              className="w-7 h-7 rounded-lg border border-white/[0.07] bg-white/3 hover:bg-white/6 flex items-center justify-center text-zinc-500 hover:text-zinc-300 text-xs transition-all cursor-pointer"
            >
              ⇅
            </button>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Second input (FX or USD depending on isReversed) - Read-only */}
          <Input
            type="text"
            label={isReversed ? "USD" : currencyCode}
            prefix={isReversed ? "$" : currencyCode}
            value={isReversed ? usdAmount : fxAmount}
            readOnly
            placeholder="0"
          />

          {/* Convert button */}
          <Button
            variant="primary"
            size="md"
            className="w-full mt-1"
            onClick={handleConvert}
            disabled={isLoading || (isReversed ? !fxAmount : !usdAmount)}
          >
            {isLoading ? "Converting…" : "Convert"}
          </Button>

          {/* Error */}
          {error && (
            <p className="text-[11px] text-red-400 font-mono text-center">
              {error}
            </p>
          )}
        </div>
        {/* Rate footer */}
        <p className="mt-5 text-[11px] text-zinc-600 font-mono text-center leading-relaxed">
          1 USD = {formatRate(rate ?? currentRate)} {currencyCode}
          <br />1 {currencyCode} = {formatRate(1 / (rate ?? currentRate))} USD
        </p>
      </div>
    </div>
  );
}
