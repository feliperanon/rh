"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWhatsAppLink = generateWhatsAppLink;
const phone_validators_1 = require("../validators/phone-validators");
/**
 * Gera link do WhatsApp com mensagem pré-preenchida
 * @param phone - Telefone do candidato (normalizado)
 * @param protocol - Protocolo da inscrição
 * @param link - Link de cadastro
 * @returns URL do WhatsApp (wa.me)
 */
function generateWhatsAppLink(phone, protocol, link) {
    const phoneE164 = (0, phone_validators_1.phoneToE164)(phone);
    const message = `Olá! 😊 Tudo bem?\nPara concluir seu cadastro no processo seletivo, preencha este link: ${link}\nProtocolo: ${protocol}\nObrigado!`;
    return `https://wa.me/${phoneE164}?text=${encodeURIComponent(message)}`;
}
