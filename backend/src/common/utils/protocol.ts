import { randomBytes } from 'crypto';

/**
 * Gera um protocolo único para uma inscrição
 * Formato: RH-YYYYMMDD-XXXX
 * @returns Protocolo único
 */
export function generateProtocol(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = randomBytes(2).toString('hex').toUpperCase();

    return `RH-${year}${month}${day}-${random}`;
}
