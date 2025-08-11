import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { TopicCategory } from '@prisma/client';

export class CreateTopicDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(TopicCategory)
  @IsNotEmpty()
  category: TopicCategory;
}
