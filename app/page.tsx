"use client";

import { useExchangeRates } from "@/hooks/useExchangeRate";
import { Hero } from "@/components/molecules/hero";
import { Ticker } from "@/components/atoms/ticker";
import { RatesPreview } from "@/components/molecules/rates-preview";
import { TopMovers } from "@/components/molecules/top-movers";
import { Features } from "@/components/molecules/features";
import { Contact } from "@/components/molecules/contact";

export default function LandingPage() {
  const { rates } = useExchangeRates();

  const rateCount = Object.keys(rates).filter(
    (k) => k.startsWith("USD") && k.length === 6 && !/\d/.test(k.slice(3))
  ).length;

  return (
    <div className="min-h-screen bg-[#07080f] text-zinc-100">
      <Hero rateCount={rateCount} />
      <Ticker rates={rates} />
      <RatesPreview rates={rates} />
      <TopMovers />
      <Features />
      <Contact />
    </div>
  );
}
