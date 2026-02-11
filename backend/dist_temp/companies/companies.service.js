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
exports.CompaniesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let CompaniesService = class CompaniesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCompanyDto) {
        // Validação: se sigilosa=true, modo deve ser GENERICO
        if (createCompanyDto.sigilosa && createCompanyDto.modo_pergunta_recontratacao === client_1.QuestionMode.COM_NOME) {
            throw new common_1.BadRequestException('Empresa sigilosa não pode ter modo de pergunta COM_NOME. Use GENERICO.');
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Empresa com ID ${id} não encontrada`);
        }
        return company;
    }
    async update(id, updateCompanyDto) {
        // Busca empresa atual
        const company = await this.findOne(id);
        // Validação: se sigilosa=true, modo deve ser GENERICO
        const sigilosa = updateCompanyDto.sigilosa ?? company.sigilosa;
        const modo = updateCompanyDto.modo_pergunta_recontratacao ?? company.modo_pergunta_recontratacao;
        if (sigilosa && modo === client_1.QuestionMode.COM_NOME) {
            throw new common_1.BadRequestException('Empresa sigilosa não pode ter modo de pergunta COM_NOME. Use GENERICO.');
        }
        return this.prisma.company.update({
            where: { id },
            data: updateCompanyDto,
        });
    }
    async remove(id) {
        await this.findOne(id); // Verifica se existe
        return this.prisma.company.update({
            where: { id },
            data: { ativo: false },
        });
    }
};
exports.CompaniesService = CompaniesService;
exports.CompaniesService = CompaniesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompaniesService);
