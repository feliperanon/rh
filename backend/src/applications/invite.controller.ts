import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApplicationsService } from './applications.service';

@Controller('invite')
export class InviteController {
    constructor(private readonly applicationsService: ApplicationsService) { }

    @Get(':token')
    async getByToken(@Param('token') token: string) {
        return this.applicationsService.findByToken(token);
    }

    @Post(':token')
    async submitByToken(@Param('token') token: string, @Body() data: any) {
        return this.applicationsService.submitByToken(token, data);
    }
}
