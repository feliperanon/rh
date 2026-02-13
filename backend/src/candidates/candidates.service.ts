import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { normalizePhone, phoneToE164, validatePhone } from '../common/validators/phone-validators';

@Injectable()
export class CandidatesService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateCandidateDto) {
        if (!validatePhone(dto.phone)) {
            throw new BadRequestException('Telefone inválido');
        }
        const phoneNormalized = normalizePhone(dto.phone);
        const phoneE164 = phoneToE164(phoneNormalized);

        const existing = await this.prisma.candidate.findUnique({
            where: { phone_normalizado: phoneNormalized },
        });
        if (existing) {
            throw new BadRequestException('Já existe um candidato com este telefone');
        }

        return this.prisma.candidate.create({
            data: {
                phone_normalizado: phoneNormalized,
                phone_e164: phoneE164,
                name: dto.name?.trim() || null,
            },
        });
    }

    async findAll(search?: string, protocol?: string) {
        const where: any = {};
        const orConditions: any[] = [];

        if (search) {
            orConditions.push(
                { name: { contains: search, mode: 'insensitive' } },
                { cpf: { contains: search } },
                { phone_normalizado: { contains: search } },
            );
        }

        if (protocol) {
            orConditions.push({
                applications: {
                    some: {
                        protocol: { contains: protocol, mode: 'insensitive' },
                    },
                },
            });
        }

        if (orConditions.length) {
            where.OR = orConditions;
        }

        return this.prisma.candidate.findMany({
            where,
            include: {
                _count: {
                    select: { applications: true },
                },
            },
            orderBy: { created_at: 'desc' },
            take: 50,
        });
    }

    async findOne(id: string) {
        const candidate = await this.prisma.candidate.findUnique({
            where: { id },
            include: {
                applications: {
                    include: {
                        company: true,
                        sector: true,
                        events: {
                            orderBy: { occurred_at: 'desc' },
                        },
                    },
                    orderBy: { created_at: 'desc' },
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

        if (!candidate) {
            throw new NotFoundException(`Candidato com ID ${id} não encontrado`);
        }

        return candidate;
    }

    async update(id: string, data: UpdateCandidateDto) {
        try {
            return await this.prisma.candidate.update({
                where: { id },
                data: {
                    name: data.name,
                    cpf: data.cpf,
                    birth_date: data.birth_date ? new Date(data.birth_date) : undefined,
                    education: data.education,
                    vt_value_cents: data.vt_value_cents,
                    schedule_prefs: data.schedule_prefs,
                    worked_here_before: data.worked_here_before,
                },
            });
        } catch (error: any) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new BadRequestException('Dados únicos já utilizados (CPF/tel).');
            }
            throw error;
        }
    }

    async remove(id: string) {
        await this.prisma.candidate.delete({
            where: { id },
        });
        return { message: 'Candidato removido com sucesso' };
    }
}
