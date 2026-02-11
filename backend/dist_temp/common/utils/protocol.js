"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProtocol = generateProtocol;
const crypto_1 = require("crypto");
/**
 * Gera um protocolo único para uma inscrição
 * Formato: RH-YYYYMMDD-XXXX
 * @returns Protocolo único
 */
function generateProtocol() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = (0, crypto_1.randomBytes)(2).toString('hex').toUpperCase();
    return `RH-${year}${month}${day}-${random}`;
}
