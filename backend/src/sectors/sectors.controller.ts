import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common';
import { SectorsService } from './sectors.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('sectors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SectorsController {
    constructor(private readonly sectorsService: SectorsService) { }

    @Post()
    @Roles(Role.ADMIN, Role.PSICOLOGA)
    create(@Body() createSectorDto: CreateSectorDto) {
        return this.sectorsService.create(createSectorDto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.PSICOLOGA)
    findAll(@Query('company_id') companyId?: string) {
        return this.sectorsService.findAll(companyId);
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.PSICOLOGA)
    findOne(@Param('id') id: string) {
        return this.sectorsService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.PSICOLOGA)
    update(@Param('id') id: string, @Body() updateSectorDto: UpdateSectorDto) {
        return this.sectorsService.update(id, updateSectorDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.sectorsService.remove(id);
    }
}
