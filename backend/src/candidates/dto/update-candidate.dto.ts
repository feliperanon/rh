import { IsOptional, IsString, MinLength, IsEnum, IsBoolean, IsInt } from 'class-validator';
import { Education } from '@prisma/client';

export class UpdateCandidateDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    name?: string;

    @IsOptional()
    @IsString()
    cpf?: string;

    @IsOptional()
    @IsString()
    birth_date?: string;

    @IsOptional()
    @IsEnum(Education)
    education?: Education;

    @IsOptional()
    @IsInt()
    vt_value_cents?: number;

    @IsOptional()
    @IsBoolean()
    worked_here_before?: boolean;
}
