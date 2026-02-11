import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('candidates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CandidatesController {
    constructor(private readonly candidatesService: CandidatesService) { }

    @Get()
    @Roles(Role.ADMIN, Role.PSICOLOGA)
    findAll(@Query('search') search?: string) {
        return this.candidatesService.findAll(search);
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.PSICOLOGA)
    findOne(@Param('id') id: string) {
        return this.candidatesService.findOne(id);
    }
}
