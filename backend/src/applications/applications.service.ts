import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { normalizePhone, phoneToE164, validatePhone } from '../common/validators/validators';
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

    async findAll(status?: ApplicationStatus, companyId?: string, sectorId?: string) {
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

    async findOne(id: string) {
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
            throw new NotFoundException(`Inscrição com ID ${id} não encontrada`);
        }

        return application;
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

        // Registra evento de mudança de status
        await this.prisma.event.create({
            data: {
                application_id: application.id,
                candidate_id: application.candidate_id,
                user_id: userId,
                type: updateApplicationDto.status as unknown as EventType,
            },
        });

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
}
