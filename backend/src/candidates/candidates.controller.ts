import { Controller, Get, Param, Post, Body, UseGuards, Query, Patch, Delete } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { CreateCandidateDto } from './dto/create-candidate.dto';

@Controller('candidates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CandidatesController {
    constructor(private readonly candidatesService: CandidatesService) { }

    @Post()
    @Roles(Role.ADMIN, Role.PSICOLOGA)
    create(@Body() dto: CreateCandidateDto) {
        return this.candidatesService.create(dto);
    }

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
