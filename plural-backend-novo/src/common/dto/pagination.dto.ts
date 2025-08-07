import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number) // Converte a string da URL para número
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number) // Converte a string da URL para número
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}