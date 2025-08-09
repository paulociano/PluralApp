/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { TopicCategory } from '@prisma/client';
import { IsBooleanString, IsEnum, IsOptional, IsString } from 'class-validator';

export class GetTopicsDto {
  @IsEnum(TopicCategory)
  @IsOptional()
  category?: TopicCategory;

  @IsString() // <-- Adicione
  @IsOptional() // <-- Adicione
  search?: string; // <-- Adicione
  @IsBooleanString() // Valida se é 'true' ou 'false'
  includeArgumentCount?: string;
}
