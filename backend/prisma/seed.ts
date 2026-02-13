import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL environment variable when running seed');
}

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function main() {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Hash da senha padrão: "admin123"
    const passwordHash = await bcrypt.hash('admin123', 10);

    // Criar usuário admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@rh.com' },
        update: {},
        create: {
            name: 'Administrador',
            email: 'admin@rh.com',
            password_hash: passwordHash,
            role: 'ADMIN',
        },
    });

    console.log('✅ Usuário admin criado:', {
        email: admin.email,
        senha: 'admin123',
    });

    // Criar usuária psicóloga
    const psicologa = await prisma.user.upsert({
        where: { email: 'psicologa@rh.com' },
        update: {},
        create: {
            name: 'Psicóloga',
            email: 'psicologa@rh.com',
            password_hash: passwordHash,
            role: 'PSICOLOGA',
        },
    });

    console.log('✅ Usuária psicóloga criada:', {
        email: psicologa.email,
        senha: 'admin123',
    });

    // Usuário principal (e-mail solicitado)
    const senhaFelipe = await bcrypt.hash('571232Ce!', 10);
    const felipe = await prisma.user.upsert({
        where: { email: 'feliperanon@live.com' },
        update: { password_hash: senhaFelipe },
        create: {
            name: 'Felipe',
            email: 'feliperanon@live.com',
            password_hash: senhaFelipe,
            role: 'ADMIN',
        },
    });

    console.log('✅ Usuário feliperanon@live.com criado/atualizado');

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📝 Credenciais de acesso:');
    console.log('Admin: admin@rh.com / admin123');
    console.log('Psicóloga: psicologa@rh.com / admin123');
    console.log('Felipe: feliperanon@live.com / (senha definida no seed)');
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
