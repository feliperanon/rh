import { Controller, Get, Post, Body, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { SubmitApplicationDto } from './dto/submit-application.dto';

@Controller('invite')
export class InviteController {
    constructor(private readonly applicationsService: ApplicationsService) { }

    @Get(':token')
    async getByToken(@Param('token') token: string) {
        return this.applicationsService.findByToken(token);
    }

    @Post(':token')
    @UsePipes(new ValidationPipe({ transform: true }))
    async submitByToken(@Param('token') token: string, @Body() data: SubmitApplicationDto) {
        return this.applicationsService.submitByToken(token, data);
    }
}
