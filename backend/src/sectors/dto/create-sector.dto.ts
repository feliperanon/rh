import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

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
}
