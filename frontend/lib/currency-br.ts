/**
 * Padrão brasileiro: vírgula para decimal, ponto para milhares.
 * Ex.: 1234.56 → "1.234,56"
 */

/**
 * Formata um número para exibição no padrão BR (1.234,56).
 */
export function formatBrCurrency(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "0,00";
  const fixed = Math.max(0, Number(value)).toFixed(2);
  const [intPart, decPart] = fixed.split(".");
  const withDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withDots},${decPart}`;
}

/**
 * Converte string no padrão BR para número.
 * Aceita "1.234,56", "1234,56", "1234", "0,50", etc.
 */
export function parseBrCurrency(input: string): number {
  if (!input || typeof input !== "string") return 0;
  const normalized = input
    .trim()
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = parseFloat(normalized);
  return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
}

/**
 * A partir do valor atual do input (string BR), retorna a string
 * formatada para exibição (com ponto nos milhares e vírgula decimal).
 */
export function formatBrCurrencyInput(raw: string): string {
  if (!raw.trim()) return "";
  const hasComma = raw.includes(",");
  const [beforeComma, afterComma] = raw.split(",");
  const onlyDigitsBefore = (beforeComma || "").replace(/\D/g, "");
  const onlyDigitsAfter = (afterComma || "").replace(/\D/g, "").slice(0, 2);
  const intPart = onlyDigitsBefore.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (!hasComma && !onlyDigitsAfter) return intPart || "0";
  return onlyDigitsAfter
    ? `${intPart || "0"},${onlyDigitsAfter}`
    : `${intPart || "0"},`;
}
