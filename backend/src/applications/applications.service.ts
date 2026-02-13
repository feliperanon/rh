import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { SubmitApplicationDto } from './dto/submit-application.dto';
import { normalizePhone, phoneToE164, validatePhone } from '../common/validators/phone-validators';
import { generateProtocol } from '../common/utils/protocol';
import { generateToken, hashToken } from '../common/utils/tokens';
import { generateWhatsAppLink } from '../common/utils/whatsapp';
import { ApplicationStatus, EventType } from '@prisma/client';

@Injectable()
export class ApplicationsService {
    constructor(private prisma: PrismaService) { }

    async create(createApplicationDto: CreateApplicationDto, userId: string) {
        const { phone, company_id, sector_id } = createApplicationDto;

        // Valida telefone
        if (!validatePhone(phone)) {
            throw new BadRequestException('Telefone inválido');
        }

        const phoneNormalized = normalizePhone(phone);
        const phoneE164 = phoneToE164(phoneNormalized);

        // Busca ou cria candidato
        let candidate = await this.prisma.candidate.findUnique({
            where: { phone_normalizado: phoneNormalized },
        });

        if (!candidate) {
            candidate = await this.prisma.candidate.create({
                data: {
                    phone_normalizado: phoneNormalized,
                    phone_e164: phoneE164,
                },
            });
        }

        // Evita duplicidade de inscrição na mesma empresa/setor enquanto existirem estados abertos
        const existingApplication = await this.prisma.application.findFirst({
            where: {
                candidate_id: candidate.id,
                company_id,
                sector_id,
                status: {
                    notIn: [
                        ApplicationStatus.REPROVADO,
                        ApplicationStatus.DESISTIU,
                        ApplicationStatus.APROVADO,
                    ],
                },
            },
        });

        if (existingApplication) {
            throw new BadRequestException("Já existe uma inscrição ativa para este candidato e vaga");
        }

        // Gera protocolo e token
        const protocol = generateProtocol();
        const token = generateToken();
        const tokenHash = hashToken(token);

        // Cria application
        const application = await this.prisma.application.create({
            data: {
                candidate_id: candidate.id,
                company_id,
                sector_id,
                protocol,
                status: ApplicationStatus.PRE_CADASTRO,
            },
            include: {
                candidate: true,
                company: true,
                sector: true,
            },
        });

        // Cria token de convite
        const inviteToken = await this.prisma.inviteToken.create({
            data: {
                application_id: application.id,
                token_hash: tokenHash,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
            },
        });

        // Registra eventos
        await this.prisma.event.createMany({
            data: [
                {
                    application_id: application.id,
                    candidate_id: candidate.id,
                    user_id: userId,
                    type: EventType.PRE_CADASTRO_CRIADO,
                },
                {
                    application_id: application.id,
                    candidate_id: candidate.id,
                    user_id: userId,
                    type: EventType.EMPRESA_SETOR_DEFINIDOS,
                },
                {
                    application_id: application.id,
                    candidate_id: candidate.id,
                    user_id: userId,
                    type: EventType.PROTOCOLO_GERADO,
                },
                {
                    application_id: application.id,
                    candidate_id: candidate.id,
                    user_id: userId,
                    type: EventType.LINK_GERADO,
                },
            ],
        });

        // Gera link de cadastro e WhatsApp
        const cadastroLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/cadastro/t/${token}`;
        const whatsappLink = generateWhatsAppLink(phoneE164, protocol, cadastroLink);

        return {
            ...application,
            cadastro_link: cadastroLink,
            whatsapp_link: whatsappLink,
            token, // Retorna token apenas na criação
        };
    }

    async findAll(
        status?: ApplicationStatus,
        companyId?: string,
        sectorId?: string,
        startDate?: string,
        endDate?: string,
    ) {
        const where: any = {};
        if (status) where.status = status;
        if (companyId) where.company_id = companyId;
        if (sectorId) where.sector_id = sectorId;
        if (startDate || endDate) {
            where.created_at = {};
            if (startDate) where.created_at.gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.created_at.lte = end;
            }
        }

        return this.prisma.application.findMany({
            where,
            include: {
                candidate: true,
                company: true,
                sector: true,
            },
            orderBy: { created_at: 'desc' },
        });
    }

    async remove(id: string) {
        const app = await this.prisma.application.findUnique({ where: { id } });
        if (!app) throw new NotFoundException(`Inscrição com ID ${id} não encontrada`);
        await this.prisma.application.delete({ where: { id } });
        return { message: 'Candidatura excluída com sucesso' };
    }

    async findOne(id: string) {
        const application = await this.prisma.application.findUnique({
            where: { id },
            include: {
                candidate: true,
                company: true,
                sector: true,
                invite_tokens: {
                    where: {
                        used_at: null, // Only unused tokens
                        // expires_at: { gt: new Date() } // Optional: only non-expired.
                    },
                    orderBy: { created_at: 'desc' },
                    take: 1
                },
                events: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                    orderBy: { occurred_at: 'desc' },
                },
            },
        });

        if (!application) {
            throw new NotFoundException(`Inscrição com ID ${id} não encontrada`);
        }

        return application;
    }

    async refreshInviteLink(id: string, userId: string) {
        const application = await this.findOne(id);
        const { phone_e164 } = application.candidate;

        // Invalidate old tokens? Or just create new one?
        // Let's just create a new one.

        const token = generateToken();
        const tokenHash = hashToken(token);

        await this.prisma.inviteToken.create({
            data: {
                application_id: application.id,
                token_hash: tokenHash,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });

        // Log event
        await this.prisma.event.create({
            data: {
                application_id: application.id,
                candidate_id: application.candidate_id,
                user_id: userId,
                type: EventType.REENVIO_LINK,
            },
        });

        const cadastroLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/cadastro/t/${token}`;
        const whatsappLink = generateWhatsAppLink(phone_e164, application.protocol, cadastroLink);

        return { whatsapp_link: whatsappLink, cadastro_link: cadastroLink };
    }


    async updateStatus(id: string, updateApplicationDto: UpdateApplicationDto, userId: string) {
        const application = await this.findOne(id);

        const updated = await this.prisma.application.update({
            where: { id },
            data: { status: updateApplicationDto.status },
            include: {
                candidate: true,
                company: true,
                sector: true,
            },
        });

        // Mapeia status para tipo de evento
        const statusToEvent: Partial<Record<ApplicationStatus, EventType>> = {
            [ApplicationStatus.EM_CONTATO]: EventType.CONTATO_REALIZADO,
            [ApplicationStatus.WHATSAPP_ABERTO]: EventType.WHATSAPP_ABERTO_PARA_ENVIO,
            [ApplicationStatus.LINK_ENVIADO]: EventType.LINK_ENVIADO_CONFIRMADO,
            [ApplicationStatus.PRE_CADASTRO]: EventType.PRE_CADASTRO_CRIADO,
        };

        const status = updateApplicationDto.status;
        const eventType = status != null
            ? (statusToEvent[status] ?? (status as unknown as EventType))
            : undefined;

        if (eventType != null) {
            await this.prisma.event.create({
                data: {
                    application_id: application.id,
                    candidate_id: application.candidate_id,
                    user_id: userId,
                    type: eventType,
                },
            });
        }

        return updated;
    }

    async markWhatsAppOpened(id: string, userId: string) {
        const application = await this.findOne(id);

        await this.prisma.event.create({
            data: {
                application_id: application.id,
                candidate_id: application.candidate_id,
                user_id: userId,
                type: EventType.WHATSAPP_ABERTO_PARA_ENVIO,
            },
        });

        return { message: 'Evento registrado com sucesso' };
    }

    async markSent(id: string, userId: string) {
        const application = await this.findOne(id);

        await this.prisma.application.update({
            where: { id },
            data: { status: ApplicationStatus.LINK_ENVIADO },
        });

        await this.prisma.event.create({
            data: {
                application_id: application.id,
                candidate_id: application.candidate_id,
                user_id: userId,
                type: EventType.LINK_ENVIADO_CONFIRMADO,
            },
        });

        return { message: 'Link marcado como enviado' };
    }

    async findByToken(token: string) {
        const tokenHash = hashToken(token);

        const inviteToken = await this.prisma.inviteToken.findUnique({
            where: { token_hash: tokenHash },
            include: {
                application: {
                    include: {
                        candidate: true,
                        company: true,
                        sector: true,
                    },
                },
            },
        });

        if (!inviteToken) {
            throw new NotFoundException('Token inválido ou não encontrado');
        }

        if (inviteToken.expires_at && inviteToken.expires_at < new Date()) {
            throw new BadRequestException('Token expirado');
        }

        if (inviteToken.used_at) {
            throw new BadRequestException('Este link já foi utilizado');
        }

        const app = inviteToken.application;

        // Regra de Sigilo
        let companyName = app.company.nome_interno;

        if (app.company.sigilosa) {
            companyName = "Empresa Confidencial";
        }

        return {
            id: app.id,
            protocol: app.protocol,
            status: app.status,
            candidate: {
                id: app.candidate.id,
                name: app.candidate.name,
                phone_normalizado: app.candidate.phone_normalizado,
                cpf: app.candidate.cpf,
                birth_date: app.candidate.birth_date,
                education: app.candidate.education,
                vt_value_cents: app.candidate.vt_value_cents,
                schedule_prefs: app.candidate.schedule_prefs,
                worked_here_before: app.candidate.worked_here_before,
            },
            company: {
                id: app.company.id,
                nome: companyName, // Retorna nome mascarado ou real
                perguntar_recontratacao: app.company.perguntar_recontratacao,
                modo_pergunta_recontratacao: app.company.modo_pergunta_recontratacao,
                sigilosa: app.company.sigilosa,
            },
            sector: {
                id: app.sector.id,
                nome: app.sector.nome,
            },
        };
    }



    async submitByToken(token: string, data: SubmitApplicationDto) {
        // Valida token novamente
        const tokenHash = hashToken(token);
        const inviteToken = await this.prisma.inviteToken.findUnique({
            where: { token_hash: tokenHash },
            include: { application: true },
        });

        if (!inviteToken || (inviteToken.expires_at && inviteToken.expires_at < new Date()) || inviteToken.used_at) {
            throw new BadRequestException('Token inválido ou expirado');
        }

        const applicationId = inviteToken.application_id;
        const candidateId = inviteToken.application.candidate_id;

        // Atualiza Candidato
        await this.prisma.candidate.update({
            where: { id: candidateId },
            data: {
                name: data.name,
                cpf: data.cpf,
                birth_date: data.birth_date ? new Date(data.birth_date) : null,
                education: data.education,
                vt_value_cents: typeof data.vt_value_cents === 'string' ? parseInt(data.vt_value_cents) : data.vt_value_cents,
                schedule_prefs: data.schedule_prefs, // Array de string/enum
                worked_here_before: data.worked_here_before,
            },
        });

        // Atualiza Aplicação e Token
        await this.prisma.$transaction([
            this.prisma.application.update({
                where: { id: applicationId },
                data: { status: ApplicationStatus.CADASTRO_PREENCHIDO },
            }),
            this.prisma.inviteToken.update({
                where: { id: inviteToken.id },
                data: { used_at: new Date() },
            }),
            this.prisma.event.create({
                data: {
                    application_id: applicationId,
                    candidate_id: candidateId,
                    type: EventType.CADASTRO_PREENCHIDO,
                    notes: 'Candidato completou o formulário via link público',
                }
            })
        ]);

        return { message: 'Cadastro realizado com sucesso' };
    }


    async exportApplications(res: any, filters?: {
        status?: ApplicationStatus;
        companyId?: string;
        sectorId?: string;
        startDate?: string;
        endDate?: string;
    }) {
        const where: any = {};

        if (filters?.status) where.status = filters.status;
        if (filters?.companyId) where.company_id = filters.companyId;
        if (filters?.sectorId) where.sector_id = filters.sectorId;

        if (filters?.startDate || filters?.endDate) {
            where.created_at = {};
            if (filters.startDate) where.created_at.gte = new Date(filters.startDate);
            if (filters.endDate) where.created_at.lte = new Date(filters.endDate); // Consider end of day if needed
        }

        const applications = await this.prisma.application.findMany({
            where,
            include: {
                candidate: true,
                company: true,
                sector: true,
                events: {
                    include: {
                        user: { select: { name: true } }
                    },
                    orderBy: { occurred_at: 'asc' }
                }
            },
            orderBy: { created_at: 'desc' },
        });

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Workbook = require('exceljs').Workbook;
        const workbook = new Workbook();

        // --- ABA 1: INSCRIÇÕES ---
        const sheet = workbook.addWorksheet('Inscrições');

        sheet.columns = [
            { header: 'Data', key: 'date', width: 15 },
            { header: 'Protocolo', key: 'protocol', width: 15 },
            { header: 'Nome', key: 'name', width: 30 },
            { header: 'Telefone', key: 'phone', width: 20 },
            { header: 'CPF', key: 'cpf', width: 15 },
            { header: 'Empresa', key: 'company', width: 20 },
            { header: 'Setor', key: 'sector', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
        ];

        applications.forEach((app: any) => {
            sheet.addRow({
                date: app.created_at,
                protocol: app.protocol,
                name: app.candidate.name || 'N/A',
                phone: app.candidate.phone_normalizado,
                cpf: app.candidate.cpf || 'N/A',
                company: app.company.sigilosa ? 'Confidencial' : app.company.nome_interno,
                sector: app.sector.nome,
                status: app.status,
            });
        });

        sheet.getColumn('date').numFmt = 'dd/mm/yyyy';

        // --- ABA 2: EVENTOS (TIMELINE) ---
        const eventsSheet = workbook.addWorksheet('Eventos');

        eventsSheet.columns = [
            { header: 'Protocolo', key: 'protocol', width: 15 },
            { header: 'Data/Hora', key: 'occurred_at', width: 20 },
            { header: 'Tipo', key: 'type', width: 25 },
            { header: 'Usuário', key: 'user', width: 20 },
            { header: 'Notas', key: 'notes', width: 30 },
        ];

        applications.forEach((app: any) => {
            if (app.events && app.events.length > 0) {
                app.events.forEach((event: any) => {
                    eventsSheet.addRow({
                        protocol: app.protocol,
                        occurred_at: event.occurred_at,
                        type: event.type,
                        user: event.user?.name || 'Sistema/Candidato',
                        notes: event.notes || '',
                    });
                });
            }
        });

        eventsSheet.getColumn('occurred_at').numFmt = 'dd/mm/yyyy hh:mm';

        await workbook.xlsx.write(res);
    }
    async getDashboardStats() {
        const total = await this.prisma.application.count();
        const preCadastro = await this.prisma.application.count({ where: { status: ApplicationStatus.PRE_CADASTRO } });
        const linkGerado = await this.prisma.application.count({ where: { status: ApplicationStatus.LINK_GERADO } });
        const whatsappAberto = await this.prisma.application.count({ where: { status: ApplicationStatus.WHATSAPP_ABERTO } });
        const linkEnviado = await this.prisma.application.count({ where: { status: ApplicationStatus.LINK_ENVIADO } });
        const cadastroPreenchido = await this.prisma.application.count({ where: { status: ApplicationStatus.CADASTRO_PREENCHIDO } });
        const emContato = await this.prisma.application.count({ where: { status: ApplicationStatus.EM_CONTATO } });
        const entrevistaMarcada = await this.prisma.application.count({ where: { status: ApplicationStatus.ENTREVISTA_MARCADA } });
        const encaminhado = await this.prisma.application.count({ where: { status: ApplicationStatus.ENCAMINHADO } });
        const aprovado = await this.prisma.application.count({ where: { status: ApplicationStatus.APROVADO } });
        const reprovado = await this.prisma.application.count({ where: { status: ApplicationStatus.REPROVADO } });
        const desistiu = await this.prisma.application.count({ where: { status: ApplicationStatus.DESISTIU } });

        const recent = await this.prisma.application.findMany({
            take: 5,
            orderBy: { created_at: 'desc' },
            include: {
                candidate: true,
                company: true,
                sector: true,
            },
        });

        return {
            counts: {
                total,
                aguardando_envio: preCadastro + linkGerado + whatsappAberto,
                aguardando_preenchimento: linkEnviado,
                cadastro_completo: cadastroPreenchido,
                em_processo: emContato + entrevistaMarcada + encaminhado,
                finalizados: aprovado + reprovado + desistiu,
            },
            recent,
        };
    }
}
