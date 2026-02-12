import { IsOptional, IsString, MinLength, IsEnum, IsBoolean, IsInt, IsArray } from 'class-validator';
import { Education, SchedulePref } from '@prisma/client';

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
    @IsArray()
    @IsEnum(SchedulePref, { each: true })
    schedule_prefs?: SchedulePref[];

    @IsOptional()
    @IsBoolean()
    worked_here_before?: boolean;
}
