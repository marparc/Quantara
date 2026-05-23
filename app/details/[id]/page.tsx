"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";

// hooks
import { useExchangeRates } from "@/hooks/useExchangeRate";
// subcomponents
import { CurrencyDetailsView } from "@/components/organisms/currency-details-view";

export default function CurrencyDetailsPage() {
  const params = useParams();
  const currencyCode = (params?.id as string)?.toUpperCase();

  const { rates, isLoading, error } = useExchangeRates();

  const currentRate = useMemo(() => {
    if (!currencyCode) return null;
    return rates[`USD${currencyCode}`] ?? null;
  }, [rates, currencyCode]);

  const allCodes = useMemo(() => {
    return Object.keys(rates)
      .map((key) => key.replace(/^USD/, ""))
      .filter((code) => code.length === 3 && !/^\d/.test(code));
  }, [rates]);

  if (!currencyCode) {
    return (
      <div className="min-h-screen bg-[#07080f] text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-500">Invalid currency code</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07080f] text-zinc-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full border-t-2 border-blue-400 animate-spin" />
          <span className="text-zinc-400">Loading exchange rates…</span>
        </div>
      </div>
    );
  }

  if (error || !currentRate) {
    return (
      <div className="min-h-screen bg-[#07080f] text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-500">{error ?? "Currency not found"}</p>
      </div>
    );
  }

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
        .delay-200 { animation-delay: 0.2s; }
      `}</style>

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            animation: "gridPan 8s linear infinite",
          }}
        />
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

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <div className="page-fade delay-200">
          <CurrencyDetailsView
            currencyCode={currencyCode}
            currentRate={currentRate}
            rates={rates}
            allCodes={allCodes}
          />
        </div>
      </div>
    </div>
  );
}
