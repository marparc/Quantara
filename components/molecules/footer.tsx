"use client";

import Link from "next/link";
import Image from "next/image";

const FOOTER_LINKS = [
  {
    heading: "Markets",
    links: [
      { label: "Live Rates", href: "/" },
      { label: "Top Movers", href: "/movers" },
      { label: "Historical Rates", href: "/historical" },
      { label: "Timeframe Chart", href: "/timeframe" },
    ],
  },
  {
    heading: "Tools",
    links: [
      { label: "Currency Converter", href: "/convert" },
      { label: "Change Analysis", href: "/change" },
      { label: "Compare Pairs", href: "/compare" },
      { label: "Rate Alerts", href: "/alerts" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "API Docs", href: "/docs" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative bg-[#07080f]">
      <style>{`
        @keyframes shimmerBorder {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .footer-shimmer-line {
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
        .footer-logo-wrap {
          filter: drop-shadow(0 0 8px rgba(99,102,241,0.45));
          transition: filter 0.3s;
        }
        .footer-logo-wrap:hover {
          filter: drop-shadow(0 0 14px rgba(168,85,247,0.65));
        }
        .footer-social-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(99,102,241,0.2);
          color: rgba(161,174,211,0.5);
          transition: color 0.2s, border-color 0.2s, background 0.2s;
        }
        .footer-social-btn:hover {
          color: #a5b4fc;
          border-color: rgba(99,102,241,0.4);
          background: rgba(99,102,241,0.08);
        }
        .footer-link {
          font-size: 14px;
          color: rgba(113,113,122,0.9);
          transition: color 0.2s;
        }
        .footer-link:hover { color: #a5b4fc; }
      `}</style>

      {/* Shimmer top border — mirrors navbar bottom border */}
      <div className="footer-shimmer-line h-px w-full" />

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Top row: brand + links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="relative flex-shrink-0 footer-logo-wrap">
                {/* Radial halo — same as navbar */}
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

              {/* Wordmark — gem gradient, same as navbar */}
              <span
                style={{
                  fontFamily: "var(--font-orbitron)",
                  fontSize: "14px",
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

            <p className="text-xs text-zinc-500 leading-relaxed max-w-[180px]">
              Real-time currency intelligence for traders, developers, and
              businesses worldwide.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-5">
              {[
                {
                  label: "X / Twitter",
                  path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.638 5.904-5.638zm-1.161 17.52h1.833L7.084 4.126H5.117z",
                },
                {
                  label: "GitHub",
                  path: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z",
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="footer-social-btn"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
                {col.heading}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Quantara. All rights reserved.
          </p>
          <p className="text-xs text-zinc-600">
            Exchange rate data for informational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
