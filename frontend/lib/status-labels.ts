/**
 * Rótulos de status padronizados (igual ao Kanban).
 * Use em listagens, selects e avaliação.
 */
/** Rótulos únicos para Kanban, Avaliação e select de status (igual em todas as páginas). */
export const STATUS_LABELS: Record<string, string> = {
    PRE_CADASTRO: "Pré-cadastro",
    LINK_GERADO: "Link gerado",
    WHATSAPP_ABERTO: "WhatsApp aberto",
    LINK_ENVIADO: "Link enviado",
    CADASTRO_PREENCHIDO: "Triagem",
    EM_CONTATO: "Em Contato",
    ENTREVISTA_MARCADA: "Entrevista",
    ENCAMINHADO: "Encaminhado",
    APROVADO: "Aprovado",
    REPROVADO: "Reprovado",
    DESISTIU: "Desistiu",
};

/** Opções para select de status (mesmo texto do Kanban e da página Avaliação). */
export const STATUS_OPTIONS = [
    { value: "PRE_CADASTRO", label: "Pré-cadastro" },
    { value: "LINK_GERADO", label: "Link gerado" },
    { value: "WHATSAPP_ABERTO", label: "WhatsApp aberto" },
    { value: "LINK_ENVIADO", label: "Link enviado" },
    { value: "CADASTRO_PREENCHIDO", label: "Triagem" },
    { value: "EM_CONTATO", label: "Em Contato" },
    { value: "ENTREVISTA_MARCADA", label: "Entrevista" },
    { value: "ENCAMINHADO", label: "Encaminhado" },
    { value: "APROVADO", label: "Aprovado" },
    { value: "REPROVADO", label: "Reprovado" },
    { value: "DESISTIU", label: "Desistiu" },
] as const;

/**
 * Funil da Avaliação: 8 etapas (Reprovado e Desistiu separados).
 * Agrupa status do backend nessas etapas.
 */
export const FUNNEL_STAGE_IDS = [
    "PRE_CADASTRO",
    "TRIAGEM",
    "EM_CONTATO",
    "ENTREVISTA_MARCADA",
    "ENCAMINHADO",
    "APROVADO",
    "REPROVADO",
    "DESISTIU",
] as const;

export const FUNNEL_STAGE_LABELS: Record<string, string> = {
    PRE_CADASTRO: "Pré-cadastro",
    TRIAGEM: "Triagem",
    EM_CONTATO: "Em Contato",
    ENTREVISTA_MARCADA: "Entrevista",
    ENCAMINHADO: "Encaminhado",
    APROVADO: "Aprovado",
    REPROVADO: "Reprovado",
    DESISTIU: "Desistiu",
};

/** Pré-cadastro: todo o processo de envio do link pelo colaborador (até o candidato preencher) */
const PRE_CADASTRO_STATUSES = ["PRE_CADASTRO", "LINK_GERADO", "WHATSAPP_ABERTO", "LINK_ENVIADO"];
/** Triagem: cadastro preenchido pelo candidato, pronto para triagem */
const TRIAGEM_STATUSES = ["CADASTRO_PREENCHIDO"];

export function groupByStatusIntoFunnel(byStatus: { status: string; total: number }[]): { stageId: string; title: string; total: number }[] {
    const map = new Map<string, number>();
    byStatus.forEach(({ status, total }) => {
        if (PRE_CADASTRO_STATUSES.includes(status)) {
            map.set("PRE_CADASTRO", (map.get("PRE_CADASTRO") ?? 0) + total);
        } else if (TRIAGEM_STATUSES.includes(status)) {
            map.set("TRIAGEM", (map.get("TRIAGEM") ?? 0) + total);
        } else if (status === "EM_CONTATO") {
            map.set("EM_CONTATO", (map.get("EM_CONTATO") ?? 0) + total);
        } else if (status === "ENTREVISTA_MARCADA") {
            map.set("ENTREVISTA_MARCADA", (map.get("ENTREVISTA_MARCADA") ?? 0) + total);
        } else if (status === "ENCAMINHADO") {
            map.set("ENCAMINHADO", (map.get("ENCAMINHADO") ?? 0) + total);
        } else if (status === "APROVADO") {
            map.set("APROVADO", (map.get("APROVADO") ?? 0) + total);
        } else if (status === "REPROVADO") {
            map.set("REPROVADO", (map.get("REPROVADO") ?? 0) + total);
        } else if (status === "DESISTIU") {
            map.set("DESISTIU", (map.get("DESISTIU") ?? 0) + total);
        }
    });

    return FUNNEL_STAGE_IDS.map((stageId) => ({
        stageId,
        title: FUNNEL_STAGE_LABELS[stageId] ?? stageId,
        total: map.get(stageId) ?? 0,
    }));
}
