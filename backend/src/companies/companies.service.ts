import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { QuestionMode } from '@prisma/client';

@Injectable()
export class CompaniesService {
    constructor(private prisma: PrismaService) { }

    async create(createCompanyDto: CreateCompanyDto) {
        // Validação: se sigilosa=true, modo deve ser GENERICO
        if (createCompanyDto.sigilosa && createCompanyDto.modo_pergunta_recontratacao === QuestionMode.COM_NOME) {
            throw new BadRequestException(
                'Empresa sigilosa não pode ter modo de pergunta COM_NOME. Use GENERICO.',
            );
        }

        return this.prisma.company.create({
            data: createCompanyDto,
        });
    }

    async findAll() {
        return this.prisma.company.findMany({
            where: { ativo: true },
            include: {
                _count: {
                    select: { sectors: true, applications: true },
                },
            },
            orderBy: { nome_interno: 'asc' },
        });
    }

    async findOne(id: string) {
        const company = await this.prisma.company.findUnique({
            where: { id },
            include: {
                sectors: true,
                _count: {
                    select: { applications: true },
                },
            },
        });

        if (!company) {
            throw new NotFoundException(`Empresa com ID ${id} não encontrada`);
        }

        return company;
    }

    async update(id: string, updateCompanyDto: UpdateCompanyDto) {
        // Busca empresa atual
        const company = await this.findOne(id);

        // Validação: se sigilosa=true, modo deve ser GENERICO
        const sigilosa = updateCompanyDto.sigilosa ?? company.sigilosa;
        const modo = updateCompanyDto.modo_pergunta_recontratacao ?? company.modo_pergunta_recontratacao;

        if (sigilosa && modo === QuestionMode.COM_NOME) {
            throw new BadRequestException(
                'Empresa sigilosa não pode ter modo de pergunta COM_NOME. Use GENERICO.',
            );
        }

        return this.prisma.company.update({
            where: { id },
            data: updateCompanyDto,
        });
    }

    async remove(id: string) {
        await this.findOne(id); // Verifica se existe

        return this.prisma.company.update({
            where: { id },
            data: { ativo: false },
        });
    }
}
