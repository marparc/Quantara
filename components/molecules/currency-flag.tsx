import { getFlagUrl } from "@/helpers/flag";
import { getCurrencyInfo } from "@/helpers/currency";

export function CurrencyFlag({
  code,
  className = "",
}: {
  code: string;
  className?: string;
}) {
  const url = getFlagUrl(code);
  const { name } = getCurrencyInfo(code);
  if (!url)
    return <span className={`text-xl leading-none ${className}`}>🌐</span>;
  return (
    <img
      src={url}
      alt={`${name} flag`}
      width={24}
      height={24}
      className={`object-cover flex-shrink-0 ${className}`}
      onError={(e) => {
        const target = e.currentTarget;
        target.style.display = "none";
        const span = document.createElement("span");
        span.textContent = "🌐";
        span.className = "text-xl leading-none";
        target.parentNode?.insertBefore(span, target);
      }}
    />
  );
}
