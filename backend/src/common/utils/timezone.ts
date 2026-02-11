import { toZonedTime, fromZonedTime, format } from 'date-fns-tz';

const TIMEZONE = 'America/Sao_Paulo';

/**
 * Converte data UTC para timezone de São Paulo
 * @param date - Data em UTC
 * @returns Data no timezone de São Paulo
 */
export function utcToBrasilia(date: Date): Date {
    return toZonedTime(date, TIMEZONE);
}

/**
 * Converte data de São Paulo para UTC
 * @param date - Data no timezone de São Paulo
 * @returns Data em UTC
 */
export function brasiliaToUTC(date: Date): Date {
    return fromZonedTime(date, TIMEZONE);
}

/**
 * Formata data no padrão brasileiro (dd/MM/yyyy HH:mm)
 * @param date - Data a ser formatada
 * @returns String formatada
 */
export function formatBR(date: Date): string {
    const zonedDate = utcToBrasilia(date);
    return format(zonedDate, 'dd/MM/yyyy HH:mm', { timeZone: TIMEZONE });
}

/**
 * Formata data no padrão ISO brasileiro (dd/MM/yyyy)
 * @param date - Data a ser formatada
 * @returns String formatada
 */
export function formatDateBR(date: Date): string {
    const zonedDate = utcToBrasilia(date);
    return format(zonedDate, 'dd/MM/yyyy', { timeZone: TIMEZONE });
}
