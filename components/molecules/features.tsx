"use client";

import { FEATURES } from "@/constants/features";
import { useInView } from "@/hooks/useInView";

export function Features() {
  const { ref, inView } = useInView();

  return (
    <section className="py-28 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div
          className="text-center mb-16 transition-all duration-700"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <p className="text-xs text-blue-400 font-medium uppercase tracking-widest mb-3">
            Everything you need
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white max-w-xl mx-auto leading-tight">
            Built for precision,{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              designed for speed
            </span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="relative p-6 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] group cursor-default overflow-hidden transition-all duration-300"
              style={{
                background:
                  "linear-gradient(135deg, rgba(10,11,20,0.9) 0%, rgba(8,9,15,0.6) 100%)",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.6s ease ${
                  i * 80
                }ms, transform 0.6s ease ${i * 80}ms, border-color 0.2s`,
              }}
            >
              {/* Hover glow */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${f.gradient} pointer-events-none`}
              />

              <div
                className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} border border-white/[0.08] flex items-center justify-center ${f.accent} mb-5`}
              >
                {f.icon}
              </div>
              <h3 className="relative text-md font-semibold text-zinc-100 mb-2">
                {f.title}
              </h3>
              <p className="relative text-sm text-zinc-500 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
