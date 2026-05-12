"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "../atoms/button";

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Glass backdrop */}
      <div className="absolute inset-0 bg-[#090c0f]/80 backdrop-blur-md border-b border-white/[0.06]" />

      <nav className="relative max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 group">
          {/* Icon mark */}
          <div className="relative w-7 h-7 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Quantara logo"
              width={28}
              height={28}
              className="w-7 h-7"
            />
          </div>

          {/* Wordmark */}
          <span
            className="text-[15px] font-semibold tracking-tight text-zinc-100 group-hover:text-white transition-colors"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            Quantara
          </span>
        </Link>

        {/* ── Right side ── */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm">
              Rates
            </Button>
          </Link>

          <Link href="/convert">
            <Button variant="primary" size="sm">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
              Convert
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
