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
exports.SetupController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcrypt");
let SetupController = class SetupController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async init() {
        // Verificar se já existem usuários
        const existingUsers = await this.prisma.user.count();
        if (existingUsers > 0) {
            const users = await this.prisma.user.findMany({
                select: { email: true, role: true }
            });
            return {
                message: 'Usuários já existem no sistema',
                count: existingUsers,
                users,
            };
        }
        // Criar usuários
        const passwordHash = await bcrypt.hash('admin123', 10);
        const admin = await this.prisma.user.create({
            data: {
                name: 'Administrador',
                email: 'admin@rh.com',
                password_hash: passwordHash,
                role: 'ADMIN',
            },
        });
        const psicologa = await this.prisma.user.create({
            data: {
                name: 'Psicóloga',
                email: 'psicologa@rh.com',
                password_hash: passwordHash,
                role: 'PSICOLOGA',
            },
        });
        return {
            message: 'Usuários criados com sucesso!',
            users: [
                { email: admin.email, role: admin.role },
                { email: psicologa.email, role: psicologa.role },
            ],
        };
    }
};
exports.SetupController = SetupController;
__decorate([
    (0, common_1.Post)('init'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SetupController.prototype, "init", null);
exports.SetupController = SetupController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SetupController);
