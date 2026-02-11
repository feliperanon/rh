const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createUsers() {
    console.log('🌱 Criando usuários...');

    const passwordHash = await bcrypt.hash('admin123', 10);

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

    console.log('✅ Admin criado:', admin.email);

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

    console.log('✅ Psicóloga criada:', psicologa.email);
    console.log('🎉 Usuários criados com sucesso!');

    await prisma.$disconnect();
}

createUsers()
    .catch((e) => {
        console.error('❌ Erro:', e);
        process.exit(1);
    });
