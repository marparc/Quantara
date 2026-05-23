import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      prefix,
      suffix,
      className,
      containerClassName,
      type = "text",
      disabled,
      readOnly,
      ...props
    },
    ref
  ) => {
    // Build class strings manually
    const containerClasses = `flex flex-col ${containerClassName || ""}`;

    const wrapperClasses = [
      "flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 transition-all",
      !readOnly && !disabled && "focus-within:border-blue-500/40",
      disabled && "opacity-50 cursor-not-allowed",
      readOnly && "cursor-default",
      error && "border-red-500/40",
    ]
      .filter(Boolean)
      .join(" ");

    const inputClasses = [
      "flex-1 bg-transparent text-sm font-mono text-zinc-100 outline-none tabular-nums min-w-0",
      type === "number" &&
        "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
      readOnly && "cursor-default select-none",
      disabled && "cursor-not-allowed",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={containerClasses}>
        {/* Label */}
        {label && (
          <label className="text-[10px] text-zinc-600 uppercase tracking-widest block mb-1.5">
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className={wrapperClasses}>
          {/* Prefix */}
          {prefix && (
            <span className="text-xs text-zinc-500 font-mono flex-shrink-0">
              {prefix}
            </span>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={type}
            disabled={disabled}
            readOnly={readOnly}
            className={inputClasses}
            {...props}
          />

          {/* Suffix */}
          {suffix && (
            <span className="text-xs text-zinc-500 font-mono flex-shrink-0">
              {suffix}
            </span>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-[11px] text-red-400 font-mono mt-1.5">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
