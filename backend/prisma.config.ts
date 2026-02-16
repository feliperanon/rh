import { defineConfig, env } from '@prisma/config';
import { config } from 'dotenv';

// Garante que .env seja carregado antes do Prisma acessar DATABASE_URL
config();

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    provider: 'postgresql',
    url: env('DATABASE_URL'),
  },
  migrations: {
    seed: 'ts-node ./prisma/seed.ts',
  },
});
