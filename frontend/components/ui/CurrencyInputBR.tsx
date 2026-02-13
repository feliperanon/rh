"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatBrCurrency, parseBrCurrency, formatBrCurrencyInput } from "@/lib/currency-br";

export interface CurrencyInputBRProps extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  /** Valor em reais (número). */
  value: number | string;
  /** Chamado com o valor em reais (número). */
  onChange: (value: number) => void;
  /** Placeholder quando vazio. */
  placeholder?: string;
}

/**
 * Input de valor no padrão brasileiro: vírgula decimal e ponto para milhares.
 * Exibe e aceita "1.234,56". O valor controlado é sempre número (reais).
 */
const CurrencyInputBR = React.forwardRef<HTMLInputElement, CurrencyInputBRProps>(
  ({ value, onChange, placeholder = "0,00", className, ...props }, ref) => {
    const numericValue =
      value === "" || value === undefined || value === null
        ? 0
        : typeof value === "string"
          ? parseBrCurrency(value)
          : Number(value) || 0;
    const displayValue = formatBrCurrency(numericValue);

    const [localValue, setLocalValue] = React.useState("");
    const [isFocused, setIsFocused] = React.useState(false);

    React.useEffect(() => {
      if (!isFocused) setLocalValue("");
    }, [isFocused]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      setLocalValue(displayValue);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      const num = parseBrCurrency(localValue);
      setLocalValue("");
      onChange(num);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const formatted = formatBrCurrencyInput(raw);
      setLocalValue(formatted);
      const num = parseBrCurrency(formatted);
      onChange(num);
    };

    const inputValue = isFocused ? localValue : displayValue;

    return (
      <input
        ref={ref}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder={placeholder}
        value={inputValue}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        {...props}
      />
    );
  }
);
CurrencyInputBR.displayName = "CurrencyInputBR";

export { CurrencyInputBR };
