import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsArray, IsEnum } from 'class-validator';
import { SchedulePref } from '@prisma/client';

export class CreateSectorDto {
    @IsString()
    @IsNotEmpty({ message: 'ID da empresa é obrigatório' })
    company_id: string;

    @IsString()
    @IsNotEmpty({ message: 'Nome do setor é obrigatório' })
    nome: string;

    @IsBoolean()
    @IsOptional()
    ativo?: boolean;

    @IsArray()
    @IsEnum(SchedulePref, { each: true })
    @IsOptional()
    schedule_prefs?: SchedulePref[];
}
