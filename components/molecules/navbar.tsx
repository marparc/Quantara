"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <style>{`
        @keyframes shimmerBorder {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .nav-shimmer-line {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(59,130,246,0) 15%,
            rgba(99,102,241,0.6) 35%,
            rgba(168,85,247,0.8) 50%,
            rgba(99,102,241,0.6) 65%,
            rgba(59,130,246,0) 85%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmerBorder 4s linear infinite;
        }
        .gem-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          color: #fff;
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 60%, #a855f7 100%);
          border: none;
          cursor: pointer;
          overflow: hidden;
          transition: opacity 0.2s, transform 0.15s;
        }
        .gem-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%);
          pointer-events: none;
        }
        .gem-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .gem-btn:active { transform: translateY(0); opacity: 1; }
        .ghost-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(161,174,211,0.85);
          background: transparent;
          border: 0.5px solid rgba(99,102,241,0.2);
          cursor: pointer;
          transition: color 0.2s, background 0.2s, border-color 0.2s;
        }
        .ghost-btn:hover {
          color: #a5b4fc;
          background: rgba(99,102,241,0.08);
          border-color: rgba(99,102,241,0.35);
        }
        .logo-wrap {
          transition: filter 0.3s;
          filter: drop-shadow(0 0 8px rgba(99,102,241,0.45));
        }
        .logo-wrap:hover {
          filter: drop-shadow(0 0 14px rgba(168,85,247,0.65));
        }
      `}</style>

      {/* Main bar */}
      <div
        style={{
          background: scrolled
            ? "linear-gradient(180deg, rgba(7,8,15,0.92) 0%, rgba(9,10,20,0.88) 100%)"
            : "linear-gradient(180deg, rgba(7,8,15,0.70) 0%, rgba(9,10,20,0.60) 100%)",
          backdropFilter: "blur(18px) saturate(160%)",
          WebkitBackdropFilter: "blur(18px) saturate(160%)",
          transition: "background 0.3s",
        }}
      >
        <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex-shrink-0 logo-wrap">
              {/* Radial halo behind logo */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 70%)",
                  transform: "scale(1.7)",
                }}
              />
              <Image
                src="/logo.png"
                alt="Quantara logo"
                width={28}
                height={28}
                className="relative w-7 h-7"
              />
            </div>

            {/* Wordmark with gem gradient */}
            <span
              style={{
                fontFamily: "var(--font-orbitron)",
                fontSize: "15px",
                fontWeight: 600,
                letterSpacing: "-0.01em",
                background:
                  "linear-gradient(90deg, #c7d2fe 0%, #a78bfa 50%, #c084fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Quantara
            </span>
          </Link>

          {/* ── Right side ── */}
          <div className="flex items-center gap-2">
            <button
              className="ghost-btn"
              onClick={() => router.push("/exchange")}
            >
              Exchange
            </button>

            <button className="gem-btn" onClick={() => router.push("/convert")}>
              Convert
              <svg
                width="14"
                height="14"
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
            </button>
          </div>
        </nav>

        {/* Animated shimmer border */}
        <div className="nav-shimmer-line h-px w-full" />
      </div>
    </header>
  );
}
