"use client";

import Link from "next/link";
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
            <svg
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7"
            >
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              {/* Hexagon-inspired Q mark */}
              <path
                d="M14 2L24.39 8V20L14 26L3.61 20V8L14 2Z"
                stroke="url(#logoGrad)"
                strokeWidth="1.5"
                fill="none"
                strokeLinejoin="round"
              />
              <path
                d="M10 14h5m0 0l-2-3m2 3l-2 3"
                stroke="url(#logoGrad)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="17" cy="14" r="1.5" fill="url(#logoGrad)" />
            </svg>
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
