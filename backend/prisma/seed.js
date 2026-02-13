/**
 * Seed em JavaScript para rodar no Render Shell com: node prisma/seed.js
 * Não depende de ts-node nem de prisma.config.ts
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { PrismaPg } = require('@prisma/adapter-pg');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    console.error('Erro: DATABASE_URL não está definida no ambiente.');
    process.exit(1);
}

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function main() {
    console.log('Iniciando seed do banco de dados...');

    const passwordHashAdmin = await bcrypt.hash('admin123', 10);

    await prisma.user.upsert({
        where: { email: 'admin@rh.com' },
        update: {},
        create: {
            name: 'Administrador',
            email: 'admin@rh.com',
            password_hash: passwordHashAdmin,
            role: 'ADMIN',
        },
    });
    console.log('Usuario admin@rh.com criado (senha: admin123)');

    await prisma.user.upsert({
        where: { email: 'psicologa@rh.com' },
        update: {},
        create: {
            name: 'Psicologa',
            email: 'psicologa@rh.com',
            password_hash: passwordHashAdmin,
            role: 'PSICOLOGA',
        },
    });
    console.log('Usuario psicologa@rh.com criado (senha: admin123)');

    const senhaFelipe = await bcrypt.hash('571232Ce!', 10);
    await prisma.user.upsert({
        where: { email: 'feliperanon@live.com' },
        update: { password_hash: senhaFelipe },
        create: {
            name: 'Felipe',
            email: 'feliperanon@live.com',
            password_hash: senhaFelipe,
            role: 'ADMIN',
        },
    });
    console.log('Usuario feliperanon@live.com criado/atualizado');

    console.log('Seed concluido com sucesso!');
    console.log('Credenciais: admin@rh.com / admin123 | psicologa@rh.com / admin123 | feliperanon@live.com / 571232Ce!');
}

main()
    .catch((e) => {
        console.error('Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
