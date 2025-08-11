import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class EditArgumentDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  content?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Por favor, insira uma URL válida.' })
  referenceUrl?: string;
}