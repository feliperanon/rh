"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCPF = validateCPF;
exports.normalizeCPF = normalizeCPF;
exports.normalizePhone = normalizePhone;
exports.phoneToE164 = phoneToE164;
exports.validatePhone = validatePhone;
/**
 * Valida CPF brasileiro (dígitos verificadores)
 * @param cpf - CPF com ou sem formatação
 * @returns true se válido, false caso contrário
 */
function validateCPF(cpf) {
    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, '');
    // Verifica se tem 11 dígitos
    if (cleanCPF.length !== 11) {
        return false;
    }
    // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(cleanCPF)) {
        return false;
    }
    // Valida primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    const digit1 = remainder >= 10 ? 0 : remainder;
    if (digit1 !== parseInt(cleanCPF.charAt(9))) {
        return false;
    }
    // Valida segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    const digit2 = remainder >= 10 ? 0 : remainder;
    return digit2 === parseInt(cleanCPF.charAt(10));
}
/**
 * Normaliza CPF removendo pontos e traços
 * @param cpf - CPF com ou sem formatação
 * @returns CPF apenas com números
 */
function normalizeCPF(cpf) {
    return cpf.replace(/\D/g, '');
}
/**
 * Normaliza telefone removendo caracteres especiais
 * @param phone - Telefone com ou sem formatação
 * @returns Telefone apenas com números
 */
function normalizePhone(phone) {
    return phone.replace(/\D/g, '');
}
/**
 * Converte telefone para formato E.164 (internacional)
 * @param phone - Telefone normalizado (apenas números)
 * @returns Telefone no formato E.164 (ex: 5511987654321)
 */
function phoneToE164(phone) {
    const normalized = normalizePhone(phone);
    // Se já começa com 55, retorna como está
    if (normalized.startsWith('55')) {
        return normalized;
    }
    // Adiciona código do Brasil (55)
    return `55${normalized}`;
}
/**
 * Valida formato de telefone brasileiro
 * @param phone - Telefone normalizado
 * @returns true se válido, false caso contrário
 */
function validatePhone(phone) {
    const normalized = normalizePhone(phone);
    // Telefone brasileiro: DDD (2 dígitos) + número (8 ou 9 dígitos)
    // Total: 10 ou 11 dígitos
    if (normalized.length < 10 || normalized.length > 11) {
        return false;
    }
    // DDD válido (11-99)
    const ddd = parseInt(normalized.substring(0, 2));
    if (ddd < 11 || ddd > 99) {
        return false;
    }
    return true;
}
