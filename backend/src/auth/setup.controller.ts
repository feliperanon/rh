import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class SetupController {
    constructor(private prisma: PrismaService) { }

    @Post('init')
    @HttpCode(HttpStatus.OK)
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
}
