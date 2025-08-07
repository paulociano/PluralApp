import { ArgType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateArgumentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(ArgType)
  @IsNotEmpty()
  type: ArgType;

  @IsString()
  @IsNotEmpty()
  topicId: string;

  @IsString()
  @IsOptional()
  parentArgumentId?: string;
}