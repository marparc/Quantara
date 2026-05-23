export function SectionHeader({
  eyebrow,
  title,
  accent = "blue",
}: {
  eyebrow: string;
  title: React.ReactNode;
  accent?: "blue" | "purple";
}) {
  return (
    <div className="mb-8">
      <p
        className={`text-xs font-medium uppercase tracking-widest mb-2 ${
          accent === "blue" ? "text-blue-400" : "text-purple-400"
        }`}
      >
        {eyebrow}
      </p>
      <h2 className="text-2xl sm:text-3xl font-bold text-white">{title}</h2>
    </div>
  );
}
