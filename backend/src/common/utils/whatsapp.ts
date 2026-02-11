import { phoneToE164 } from '../validators/validators';

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
    const message = `Olá! 😊 Tudo bem?\nPara concluir seu cadastro no processo seletivo, preencha este link: ${link}\nProtocolo: ${protocol}\nObrigado!`;

    return `https://wa.me/${phoneE164}?text=${encodeURIComponent(message)}`;
}
