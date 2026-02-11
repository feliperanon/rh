import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CandidatesService {
    constructor(private prisma: PrismaService) { }

    async findAll(search?: string) {
        return this.prisma.candidate.findMany({
            where: search
                ? {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { cpf: { contains: search } },
                        { phone_normalizado: { contains: search } },
                    ],
                }
                : {},
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
                    },
                    orderBy: { created_at: 'desc' },
                },
            },
        });

        if (!candidate) {
            throw new NotFoundException(`Candidato com ID ${id} não encontrado`);
        }

        return candidate;
    }
}
