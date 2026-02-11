import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class SetupController {
    constructor(private prisma: PrismaService) { }

    @Post('setup')
    @HttpCode(HttpStatus.OK)
    async setup() {
        const passwordHash = await bcrypt.hash('admin123', 10);

        const admin = await this.prisma.user.upsert({
            where: { email: 'admin@rh.com' },
            update: {},
            create: {
                name: 'Administrador',
                email: 'admin@rh.com',
                password_hash: passwordHash,
                role: 'ADMIN',
            },
        });

        const psicologa = await this.prisma.user.upsert({
            where: { email: 'psicologa@rh.com' },
            update: {},
            create: {
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
