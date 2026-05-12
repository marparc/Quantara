import * as React from "react";

type ButtonVariant = "primary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed select-none";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-gradient-to-r from-teal-500 to-violet-600 text-white hover:opacity-90 shadow-lg shadow-teal-900/20",
    ghost:
      "bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08] hover:text-white border border-white/[0.07]",
    outline:
      "bg-transparent text-teal-400 border border-teal-500/40 hover:bg-teal-500/10 hover:border-teal-400/60",
  };

  const sizes: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-4 py-2 text-sm rounded-xl gap-2",
    lg: "px-6 py-2.5 text-sm rounded-xl gap-2",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
