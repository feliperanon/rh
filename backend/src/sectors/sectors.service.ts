import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';

@Injectable()
export class SectorsService {
    constructor(private prisma: PrismaService) { }

    async create(createSectorDto: CreateSectorDto) {
        return this.prisma.sector.create({
            data: createSectorDto,
            include: { company: true },
        });
    }

    async findAll(companyId?: string, includeInactive = false) {
        const where: any = {
            ...(companyId && { company_id: companyId }),
        };
        if (!includeInactive) where.ativo = true;

        return this.prisma.sector.findMany({
            where,
            include: {
                company: true,
                _count: {
                    select: { applications: true },
                },
            },
            orderBy: { nome: 'asc' },
        });
    }

    async findOne(id: string) {
        const sector = await this.prisma.sector.findUnique({
            where: { id },
            include: {
                company: true,
                _count: {
                    select: { applications: true },
                },
            },
        });

        if (!sector) {
            throw new NotFoundException(`Setor com ID ${id} não encontrado`);
        }

        return sector;
    }

    async update(id: string, updateSectorDto: UpdateSectorDto) {
        await this.findOne(id);

        return this.prisma.sector.update({
            where: { id },
            data: updateSectorDto,
            include: { company: true },
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        return this.prisma.sector.update({
            where: { id },
            data: { ativo: false },
        });
    }
}
