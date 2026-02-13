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
            const senhaFelipe = await bcrypt.hash('571232Ce!', 10);
            await this.prisma.user.upsert({
                where: { email: 'feliperanon@live.com' },
                update: { password_hash: senhaFelipe },
                create: {
                    name: 'Felipe',
                    email: 'feliperanon@live.com',
                    password_hash: senhaFelipe,
                    role: 'ADMIN',
                },
            });
            const users = await this.prisma.user.findMany({
                select: { email: true, role: true }
            });
            return {
                message: 'Usuários já existem; feliperanon@live.com foi criado/atualizado.',
                count: users.length,
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

        const senhaFelipe = await bcrypt.hash('571232Ce!', 10);
        const felipe = await this.prisma.user.upsert({
            where: { email: 'feliperanon@live.com' },
            update: { password_hash: senhaFelipe },
            create: {
                name: 'Felipe',
                email: 'feliperanon@live.com',
                password_hash: senhaFelipe,
                role: 'ADMIN',
            },
        });

        return {
            message: 'Usuários criados com sucesso!',
            users: [
                { email: admin.email, role: admin.role },
                { email: psicologa.email, role: psicologa.role },
                { email: felipe.email, role: felipe.role },
            ],
        };
    }

    /** Cria ou atualiza apenas o usuário feliperanon@live.com (pode chamar mesmo se já existirem usuários). */
    @Post('init-felipe')
    @HttpCode(HttpStatus.OK)
    async initFelipe() {
        const senhaFelipe = await bcrypt.hash('571232Ce!', 10);
        const user = await this.prisma.user.upsert({
            where: { email: 'feliperanon@live.com' },
            update: { password_hash: senhaFelipe },
            create: {
                name: 'Felipe',
                email: 'feliperanon@live.com',
                password_hash: senhaFelipe,
                role: 'ADMIN',
            },
        });
        return { message: 'Usuário feliperanon@live.com criado/atualizado.', email: user.email };
    }
}
