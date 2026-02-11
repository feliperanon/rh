const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL environment variable when running seed-simple');
}

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function seed() {
    console.log('🌱 Iniciando seed...');

    const hash = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@rh.com' },
        update: {},
        create: {
            name: 'Administrador',
            email: 'admin@rh.com',
            password_hash: hash,
            role: 'ADMIN'
        }
    });

    console.log('✅ Admin criado:', admin.email);

    const psicologa = await prisma.user.upsert({
        where: { email: 'psicologa@rh.com' },
        update: {},
        create: {
            name: 'Psicóloga',
            email: 'psicologa@rh.com',
            password_hash: hash,
            role: 'PSICOLOGA'
        }
    });

    console.log('✅ Psicóloga criada:', psicologa.email);
    console.log('🎉 Seed concluído com sucesso!');

    await prisma.$disconnect();
}

seed()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    });
