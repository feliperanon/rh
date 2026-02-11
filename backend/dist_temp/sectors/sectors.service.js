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
exports.SectorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SectorsService = class SectorsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createSectorDto) {
        return this.prisma.sector.create({
            data: createSectorDto,
            include: { company: true },
        });
    }
    async findAll(companyId) {
        return this.prisma.sector.findMany({
            where: {
                ativo: true,
                ...(companyId && { company_id: companyId }),
            },
            include: {
                company: true,
                _count: {
                    select: { applications: true },
                },
            },
            orderBy: { nome: 'asc' },
        });
    }
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Setor com ID ${id} não encontrado`);
        }
        return sector;
    }
    async update(id, updateSectorDto) {
        await this.findOne(id);
        return this.prisma.sector.update({
            where: { id },
            data: updateSectorDto,
            include: { company: true },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.sector.update({
            where: { id },
            data: { ativo: false },
        });
    }
};
exports.SectorsService = SectorsService;
exports.SectorsService = SectorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SectorsService);
