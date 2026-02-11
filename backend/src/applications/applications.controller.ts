import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    UseGuards,
    Query,
    Res,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role, ApplicationStatus } from '@prisma/client';

@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationsController {
    constructor(private readonly applicationsService: ApplicationsService) { }

    @Post()
    @Roles(Role.ADMIN, Role.PSICOLOGA)
    create(@Body() createApplicationDto: CreateApplicationDto, @CurrentUser() user: any) {
        return this.applicationsService.create(createApplicationDto, user.id);
    }

    @Get()
    @Roles(Role.ADMIN, Role.PSICOLOGA)
    findAll(
        @Query('status') status?: ApplicationStatus,
        @Query('company_id') companyId?: string,
        @Query('sector_id') sectorId?: string,
    ) {
        return this.applicationsService.findAll(status, companyId, sectorId);
    }

    @Get('export/all')
    @Roles(Role.ADMIN, Role.PSICOLOGA)
    async export(@Res() res: any) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="inscricoes.xlsx"');
        return this.applicationsService.exportApplications(res);
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.PSICOLOGA)
    findOne(@Param('id') id: string) {
        return this.applicationsService.findOne(id);
    }

    @Patch(':id/status')
    @Roles(Role.ADMIN, Role.PSICOLOGA)
    updateStatus(
        @Param('id') id: string,
        @Body() updateApplicationDto: UpdateApplicationDto,
        @CurrentUser() user: any,
    ) {
        return this.applicationsService.updateStatus(id, updateApplicationDto, user.id);
    }

    @Post(':id/whatsapp-opened')
    @Roles(Role.ADMIN, Role.PSICOLOGA)
    markWhatsAppOpened(@Param('id') id: string, @CurrentUser() user: any) {
        return this.applicationsService.markWhatsAppOpened(id, user.id);
    }

    @Post(':id/mark-sent')
    @Roles(Role.ADMIN, Role.PSICOLOGA)
    markSent(@Param('id') id: string, @CurrentUser() user: any) {
        return this.applicationsService.markSent(id, user.id);
    }
}
