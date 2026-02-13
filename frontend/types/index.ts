export interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'PSICOLOGA';
}

export enum ApplicationStatus {
    PRE_CADASTRO = 'PRE_CADASTRO',
    LINK_GERADO = 'LINK_GERADO',
    WHATSAPP_ABERTO = 'WHATSAPP_ABERTO',
    LINK_ENVIADO = 'LINK_ENVIADO',
    CADASTRO_PREENCHIDO = 'CADASTRO_PREENCHIDO',
    EM_CONTATO = 'EM_CONTATO',
    ENTREVISTA_MARCADA = 'ENTREVISTA_MARCADA',
    ENCAMINHADO = 'ENCAMINHADO',
    APROVADO = 'APROVADO',
    REPROVADO = 'REPROVADO',
    DESISTIU = 'DESISTIU',
}

export interface Company {
    id: string;
    nome_interno: string;
    ativo: boolean;
    sigilosa: boolean;
    perguntar_recontratacao: boolean;
    modo_pergunta_recontratacao: 'GENERICO' | 'COM_NOME';
    createdAt: string;
    updatedAt: string;
}

export interface Sector {
    id: string;
    nome: string;
    ativo: boolean;
    company_id: string;
    company?: Company;
    createdAt: string;
    updatedAt: string;
}

export interface CandidateEvent {
    id: string;
    type: string;
    occurred_at: string;
    notes?: string;
    user?: {
        id?: string;
        name?: string;
    };
}

export interface Candidate {
    id: string;
    name?: string;
    phone_normalizado: string;
    cpf?: string;
    birth_date?: string | null;
    education?: string | null;
    vt_value_cents?: number | null;
    worked_here_before?: boolean | null;
    _count?: {
        applications: number;
    };
    applications?: Application[];
    events?: CandidateEvent[];
}

export interface ApplicationEvent {
    id: string;
    type: string;
    occurred_at: string;
    notes?: string;
    user?: {
        id?: string;
        name?: string;
    };
}

export interface Application {
    id: string;
    protocol: string;
    status: ApplicationStatus;
    candidate: Candidate;
    company: Company;
    sector: Sector;
    createdAt: string;
    events?: ApplicationEvent[];
}
