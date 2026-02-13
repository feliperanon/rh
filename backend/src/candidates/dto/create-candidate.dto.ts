import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCandidateDto {
    @IsString()
    @MinLength(10, { message: 'Telefone deve ter pelo menos 10 dígitos' })
    phone: string;

    @IsOptional()
    @IsString()
    @MinLength(1)
    name?: string;
}
