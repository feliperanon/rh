import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { InviteController } from './invite.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ApplicationsController, InviteController],
    providers: [ApplicationsService],
})
export class ApplicationsModule { }
