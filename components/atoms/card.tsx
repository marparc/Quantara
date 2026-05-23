// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.07] overflow-hidden ${className}`}
      style={{
        background:
          "linear-gradient(135deg, rgba(10,11,20,0.95) 0%, rgba(8,9,15,0.98) 100%)",
      }}
    >
      {children}
    </div>
  );
}
