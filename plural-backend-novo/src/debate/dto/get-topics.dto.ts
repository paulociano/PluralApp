import { IsOptional, IsString, IsEnum, IsBooleanString } from 'class-validator';
import { TopicCategory } from '@prisma/client';

export class GetTopicsDto {
  @IsOptional()
  @IsEnum(TopicCategory)
  category?: TopicCategory;

  @IsOptional()
  @IsString()
  search?: string;
  
  @IsOptional()
  @IsBooleanString({
    message: 'O valor de includeArgumentCount deve ser "true" ou "false".'
  })
  includeArgumentCount?: string;
  
  @IsOptional()
  @IsBooleanString({
    message: 'O valor de includeParticipantCount deve ser "true" ou "false".'
  })
  includeParticipantCount?: string;
}