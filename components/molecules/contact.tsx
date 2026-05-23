"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { useInView } from "@/hooks/useInView";

const CONTACT_ITEMS = [
  {
    label: "Email",
    value: "hello@quantara.io",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
        />
      </svg>
    ),
  },
  {
    label: "API Access",
    value: "docs@quantara.io",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
        />
      </svg>
    ),
  },
  {
    label: "Support",
    value: "support@quantara.io",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
        />
      </svg>
    ),
  },
];

const inputClass =
  "w-full px-4 py-3 rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-all border" +
  " bg-white/[0.03] border-white/[0.08] focus:border-blue-500/40 focus:bg-white/[0.05]";

export function Contact() {
  const { ref, inView } = useInView();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <section
      id="contact"
      className="py-28 px-4 relative"
      ref={ref}
      style={{
        background: "linear-gradient(180deg, #07080f 0%, #080a14 100%)",
      }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-purple-500/20 to-transparent" />

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left — info */}
          <div
            className="transition-all duration-700"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateX(0)" : "translateX(-24px)",
            }}
          >
            <p className="text-xs text-blue-400 font-medium uppercase tracking-widest mb-3">
              Get in touch
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-5">
              Have a question or{" "}
              <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                want API access?
              </span>
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-10">
              Whether you're a developer integrating rates into your product, a
              business looking for bulk data, or just curious — we'd love to
              hear from you.
            </p>

            <div className="space-y-4">
              {CONTACT_ITEMS.map((c) => (
                <div
                  key={c.label}
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/6 bg-white/2 hover:bg-white/4 hover:border-white/10 transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/4] border border-white/[0.07] flex items-center justify-center text-zinc-400 shrink-0">
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">{c.label}</p>
                    <p className="text-sm text-zinc-200">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div
            className="relative rounded-2xl border border-white/8 p-8 transition-all duration-700 delay-200 overflow-hidden"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateX(0)" : "translateX(24px)",
              background:
                "linear-gradient(135deg, rgba(10,11,20,0.95) 0%, rgba(8,9,15,0.98) 100%)",
            }}
          >
            <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-blue-500/0 via-blue-500/40 to-purple-500/0" />

            {sent ? (
              <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
                <div
                  className="w-16 h-16 rounded-full border border-blue-500/30 flex items-center justify-center text-2xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
                  }}
                >
                  ✓
                </div>
                <p className="text-lg font-semibold text-zinc-100">
                  Message sent!
                </p>
                <p className="text-sm text-zinc-500">
                  We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", email: "", message: "" });
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors mt-2"
                >
                  Send another →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1.5 block">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Your name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1.5 block">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-widest mb-1.5 block">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    placeholder="Tell us what you need…"
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  type="submit"
                >
                  Send Message
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                    />
                  </svg>
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
