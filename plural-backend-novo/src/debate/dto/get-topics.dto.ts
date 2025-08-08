/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { TopicCategory } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class GetTopicsDto {
  @IsEnum(TopicCategory)
  @IsOptional()
  category?: TopicCategory;

  @IsString() // <-- Adicione
  @IsOptional() // <-- Adicione
  search?: string; // <-- Adicione
}
