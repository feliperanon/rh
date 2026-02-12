import { Controller, Get, Param, UseGuards, Query, Patch, Delete, Body } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateCandidateDto } from './dto/update-candidate.dto';


@Controller('candidates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CandidatesController {
    constructor(private readonly candidatesService: CandidatesService) { }

    @Get()
    @Roles(Role.ADMIN, Role.PSICOLOGA)
    findAll(@Query('search') search?: string, @Query('protocol') protocol?: string) {
        return this.candidatesService.findAll(search, protocol);
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.PSICOLOGA)
    findOne(@Param('id') id: string) {
        return this.candidatesService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.PSICOLOGA)
    update(@Param('id') id: string, @Body() data: UpdateCandidateDto) {
        return this.candidatesService.update(id, data);
    }

    @Delete(':id')
    @Roles(Role.ADMIN, Role.PSICOLOGA)
    remove(@Param('id') id: string) {
        return this.candidatesService.remove(id);
    }
}
