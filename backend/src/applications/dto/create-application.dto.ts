import { IsString, IsNotEmpty } from 'class-validator';

export class CreateApplicationDto {
    @IsString()
    @IsNotEmpty({ message: 'Telefone é obrigatório' })
    phone: string;

    @IsString()
    @IsNotEmpty({ message: 'ID da empresa é obrigatório' })
    company_id: string;

    @IsString()
    @IsNotEmpty({ message: 'ID do setor é obrigatório' })
    sector_id: string;
}
