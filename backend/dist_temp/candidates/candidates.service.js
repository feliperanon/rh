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
exports.CandidatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CandidatesService = class CandidatesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(search) {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Candidato com ID ${id} não encontrado`);
        }
        return candidate;
    }
};
exports.CandidatesService = CandidatesService;
exports.CandidatesService = CandidatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CandidatesService);
