import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@Injectable()
export class CandidatesService {
    constructor(private prisma: PrismaService) { }

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
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
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
