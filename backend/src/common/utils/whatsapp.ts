import { phoneToE164 } from '../validators/phone-validators';

/** Mensagem padrão enviada ao candidato (recrutador pode editar no front antes de abrir o WhatsApp). */
export function getDefaultWhatsAppMessage(protocol: string, link: string): string {
    return `Olá! 😊 Tudo bem?\nPara concluir seu cadastro no processo seletivo, preencha este link: ${link}\nProtocolo: ${protocol}\nObrigado!`;
}

/**
 * Gera link do WhatsApp com mensagem pré-preenchida
 * @param phone - Telefone do candidato (normalizado)
 * @param protocol - Protocolo da inscrição
 * @param link - Link de cadastro
 * @returns URL do WhatsApp (wa.me)
 */
export function generateWhatsAppLink(
    phone: string,
    protocol: string,
    link: string,
): string {
    const phoneE164 = phoneToE164(phone);
    const message = getDefaultWhatsAppMessage(protocol, link);
    return `https://wa.me/${phoneE164}?text=${encodeURIComponent(message)}`;
}
