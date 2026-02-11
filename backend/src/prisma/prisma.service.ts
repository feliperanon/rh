import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL environment variable when instantiating PrismaService');
}

const prismaAdapter = new PrismaPg({ connectionString: databaseUrl });

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super({ adapter: prismaAdapter });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
