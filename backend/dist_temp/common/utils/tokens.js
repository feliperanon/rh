"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.hashToken = hashToken;
exports.verifyToken = verifyToken;
const crypto_1 = require("crypto");
/**
 * Gera um token seguro (32 bytes, base64url)
 * @returns Token em formato base64url
 */
function generateToken() {
    return (0, crypto_1.randomBytes)(32).toString('base64url');
}
/**
 * Gera hash SHA-256 de um token
 * @param token - Token em texto puro
 * @returns Hash SHA-256 em hexadecimal
 */
function hashToken(token) {
    return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
}
/**
 * Verifica se um token corresponde ao hash armazenado
 * @param token - Token em texto puro
 * @param hash - Hash armazenado
 * @returns true se corresponder, false caso contrário
 */
function verifyToken(token, hash) {
    return hashToken(token) === hash;
}
