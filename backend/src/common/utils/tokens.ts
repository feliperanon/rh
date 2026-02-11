import { randomBytes, createHash } from 'crypto';

/**
 * Gera um token seguro (32 bytes, base64url)
 * @returns Token em formato base64url
 */
export function generateToken(): string {
    return randomBytes(32).toString('base64url');
}

/**
 * Gera hash SHA-256 de um token
 * @param token - Token em texto puro
 * @returns Hash SHA-256 em hexadecimal
 */
export function hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

/**
 * Verifica se um token corresponde ao hash armazenado
 * @param token - Token em texto puro
 * @param hash - Hash armazenado
 * @returns true se corresponder, false caso contrário
 */
export function verifyToken(token: string, hash: string): boolean {
    return hashToken(token) === hash;
}
