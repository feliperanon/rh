"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface DateInputBRProps extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  /** Valor em formato ISO yyyy-MM-dd. */
  value: string;
  /** Chamado com o valor em formato ISO yyyy-MM-dd. */
  onChange: (value: string) => void;
  placeholder?: string;
}

/** Converte yyyy-MM-dd para DD/MM/AAAA */
function isoToBr(iso: string): string {
  if (!iso || iso.length !== 10) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
}

/** Converte DD/MM/AAAA para yyyy-MM-dd */
function brToIso(br: string): string {
  const digits = br.replace(/\D/g, "");
  if (digits.length < 8) return "";
  const d = digits.slice(0, 2);
  const m = digits.slice(2, 4);
  const y = digits.slice(4, 8);
  const day = parseInt(d, 10);
  const month = parseInt(m, 10);
  const year = parseInt(y, 10);
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) return "";
  return `${y}-${m}-${d}`;
}

/** Aplica máscara DD/MM/AAAA durante digitação */
function formatBrDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

const DateInputBR = React.forwardRef<HTMLInputElement, DateInputBRProps>(
  ({ value, onChange, placeholder = "DD/MM/AAAA", className, ...props }, ref) => {
    const displayValue = isoToBr(value);
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
      const iso = brToIso(localValue);
      setLocalValue("");
      onChange(iso);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const formatted = formatBrDateInput(raw);
      setLocalValue(formatted);
      const iso = brToIso(formatted);
      if (iso) onChange(iso);
      else if (formatted.replace(/\D/g, "").length === 0) onChange("");
    };

    const inputValue = isFocused ? localValue : displayValue;

    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        autoComplete="bday"
        placeholder={placeholder}
        maxLength={10}
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
DateInputBR.displayName = "DateInputBR";

export { DateInputBR };
