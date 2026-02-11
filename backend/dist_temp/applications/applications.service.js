"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const phone_validators_1 = require("../common/validators/phone-validators");
const protocol_1 = require("../common/utils/protocol");
const tokens_1 = require("../common/utils/tokens");
const whatsapp_1 = require("../common/utils/whatsapp");
const client_1 = require("@prisma/client");
let ApplicationsService = class ApplicationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createApplicationDto, userId) {
        const { phone, company_id, sector_id } = createApplicationDto;
        // Valida telefone
        if (!(0, phone_validators_1.validatePhone)(phone)) {
            throw new common_1.BadRequestException('Telefone inválido');
        }
        const phoneNormalized = (0, phone_validators_1.normalizePhone)(phone);
        const phoneE164 = (0, phone_validators_1.phoneToE164)(phoneNormalized);
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
        // Gera protocolo e token
        const protocol = (0, protocol_1.generateProtocol)();
        const token = (0, tokens_1.generateToken)();
        const tokenHash = (0, tokens_1.hashToken)(token);
        // Cria application
        const application = await this.prisma.application.create({
            data: {
                candidate_id: candidate.id,
                company_id,
                sector_id,
                protocol,
                status: client_1.ApplicationStatus.PRE_CADASTRO,
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
                    type: client_1.EventType.PRE_CADASTRO_CRIADO,
                },
                {
                    application_id: application.id,
                    candidate_id: candidate.id,
                    user_id: userId,
                    type: client_1.EventType.EMPRESA_SETOR_DEFINIDOS,
                },
                {
                    application_id: application.id,
                    candidate_id: candidate.id,
                    user_id: userId,
                    type: client_1.EventType.PROTOCOLO_GERADO,
                },
                {
                    application_id: application.id,
                    candidate_id: candidate.id,
                    user_id: userId,
                    type: client_1.EventType.LINK_GERADO,
                },
            ],
        });
        // Gera link de cadastro e WhatsApp
        const cadastroLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/cadastro/t/${token}`;
        const whatsappLink = (0, whatsapp_1.generateWhatsAppLink)(phoneE164, protocol, cadastroLink);
        return {
            ...application,
            cadastro_link: cadastroLink,
            whatsapp_link: whatsappLink,
            token, // Retorna token apenas na criação
        };
    }
    async findAll(status, companyId, sectorId) {
        return this.prisma.application.findMany({
            where: {
                ...(status && { status }),
                ...(companyId && { company_id: companyId }),
                ...(sectorId && { sector_id: sectorId }),
            },
            include: {
                candidate: true,
                company: true,
                sector: true,
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async findOne(id) {
        const application = await this.prisma.application.findUnique({
            where: { id },
            include: {
                candidate: true,
                company: true,
                sector: true,
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
            throw new common_1.NotFoundException(`Inscrição com ID ${id} não encontrada`);
        }
        return application;
    }
    async updateStatus(id, updateApplicationDto, userId) {
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
        // Registra evento de mudança de status
        await this.prisma.event.create({
            data: {
                application_id: application.id,
                candidate_id: application.candidate_id,
                user_id: userId,
                type: updateApplicationDto.status,
            },
        });
        return updated;
    }
    async markWhatsAppOpened(id, userId) {
        const application = await this.findOne(id);
        await this.prisma.event.create({
            data: {
                application_id: application.id,
                candidate_id: application.candidate_id,
                user_id: userId,
                type: client_1.EventType.WHATSAPP_ABERTO_PARA_ENVIO,
            },
        });
        return { message: 'Evento registrado com sucesso' };
    }
    async markSent(id, userId) {
        const application = await this.findOne(id);
        await this.prisma.application.update({
            where: { id },
            data: { status: client_1.ApplicationStatus.LINK_ENVIADO },
        });
        await this.prisma.event.create({
            data: {
                application_id: application.id,
                candidate_id: application.candidate_id,
                user_id: userId,
                type: client_1.EventType.LINK_ENVIADO_CONFIRMADO,
            },
        });
        return { message: 'Link marcado como enviado' };
    }
    async findByToken(token) {
        const tokenHash = (0, tokens_1.hashToken)(token);
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
            throw new common_1.NotFoundException('Token inválido ou não encontrado');
        }
        if (inviteToken.expires_at && inviteToken.expires_at < new Date()) {
            throw new common_1.BadRequestException('Token expirado');
        }
        if (inviteToken.used_at) {
            throw new common_1.BadRequestException('Este link já foi utilizado');
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
    async submitByToken(token, data) {
        // Valida token novamente
        const tokenHash = (0, tokens_1.hashToken)(token);
        const inviteToken = await this.prisma.inviteToken.findUnique({
            where: { token_hash: tokenHash },
            include: { application: true },
        });
        if (!inviteToken || (inviteToken.expires_at && inviteToken.expires_at < new Date()) || inviteToken.used_at) {
            throw new common_1.BadRequestException('Token inválido ou expirado');
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
                data: { status: client_1.ApplicationStatus.CADASTRO_PREENCHIDO },
            }),
            this.prisma.inviteToken.update({
                where: { id: inviteToken.id },
                data: { used_at: new Date() },
            }),
            this.prisma.event.create({
                data: {
                    application_id: applicationId,
                    candidate_id: candidateId,
                    type: client_1.EventType.CADASTRO_PREENCHIDO,
                    notes: 'Candidato completou o formulário via link público',
                }
            })
        ]);
        return { message: 'Cadastro realizado com sucesso' };
    }
    async exportApplications(res) {
        const applications = await this.prisma.application.findMany({
            include: {
                candidate: true,
                company: true,
                sector: true,
            },
            orderBy: { created_at: 'desc' },
        });
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Workbook = require('exceljs').Workbook;
        const workbook = new Workbook();
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
        applications.forEach(app => {
            sheet.addRow({
                date: app.created_at,
                protocol: app.protocol,
                name: app.candidate.name,
                phone: app.candidate.phone_normalizado,
                cpf: app.candidate.cpf,
                company: app.company.nome_interno,
                sector: app.sector.nome,
                status: app.status,
            });
        });
        // Formatar data
        sheet.getColumn('date').numFmt = 'dd/mm/yyyy';
        await workbook.xlsx.write(res);
    }
    async getDashboardStats() {
        const total = await this.prisma.application.count();
        const preCadastro = await this.prisma.application.count({ where: { status: client_1.ApplicationStatus.PRE_CADASTRO } });
        const linkGerado = await this.prisma.application.count({ where: { status: client_1.ApplicationStatus.LINK_GERADO } });
        const whatsappAberto = await this.prisma.application.count({ where: { status: client_1.ApplicationStatus.WHATSAPP_ABERTO } });
        const linkEnviado = await this.prisma.application.count({ where: { status: client_1.ApplicationStatus.LINK_ENVIADO } });
        const cadastroPreenchido = await this.prisma.application.count({ where: { status: client_1.ApplicationStatus.CADASTRO_PREENCHIDO } });
        const emContato = await this.prisma.application.count({ where: { status: client_1.ApplicationStatus.EM_CONTATO } });
        const entrevistaMarcada = await this.prisma.application.count({ where: { status: client_1.ApplicationStatus.ENTREVISTA_MARCADA } });
        const encaminhado = await this.prisma.application.count({ where: { status: client_1.ApplicationStatus.ENCAMINHADO } });
        const aprovado = await this.prisma.application.count({ where: { status: client_1.ApplicationStatus.APROVADO } });
        const reprovado = await this.prisma.application.count({ where: { status: client_1.ApplicationStatus.REPROVADO } });
        const desistiu = await this.prisma.application.count({ where: { status: client_1.ApplicationStatus.DESISTIU } });
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
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApplicationsService);
