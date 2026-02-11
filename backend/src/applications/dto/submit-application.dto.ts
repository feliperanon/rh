import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { IsCPF } from '../../common/validators/is-cpf.validator';
import { Education, SchedulePref } from '@prisma/client';

export class SubmitApplicationDto {
    @IsString()
    @IsNotEmpty({ message: 'Nome é obrigatório' })
    name: string;

    @IsString()
    @IsNotEmpty({ message: 'CPF é obrigatório' })
    @IsCPF({ message: 'CPF inválido' })
    cpf: string;

    @IsString()
    @IsOptional()
    birth_date?: string;

    @IsEnum(Education, { message: 'Escolaridade inválida' })
    @IsOptional()
    education?: Education;

    @IsNumber()
    @Min(0)
    @IsOptional()
    vt_value_cents?: number;

    @IsEnum(SchedulePref, { each: true, message: 'Preferência de horário inválida' })
    @IsOptional()
    schedule_prefs?: SchedulePref[];

    @IsOptional()
    worked_here_before?: boolean;
}
