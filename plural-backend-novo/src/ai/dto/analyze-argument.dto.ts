import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AnalyzeArgumentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(20) // Exige um mínimo de 20 caracteres para a análise fazer sentido
  content: string;
}