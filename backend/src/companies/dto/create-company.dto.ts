import { IsString, IsNotEmpty, IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { QuestionMode } from '@prisma/client';

export class CreateCompanyDto {
    @IsString()
    @IsNotEmpty({ message: 'Nome interno é obrigatório' })
    nome_interno: string;

    @IsBoolean()
    @IsOptional()
    ativo?: boolean;

    @IsBoolean()
    @IsOptional()
    sigilosa?: boolean;

    @IsBoolean()
    @IsOptional()
    perguntar_recontratacao?: boolean;

    @IsEnum(QuestionMode)
    @IsOptional()
    modo_pergunta_recontratacao?: QuestionMode;
}
