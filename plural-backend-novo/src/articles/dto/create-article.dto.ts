import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  authorName: string;

  @IsString()
  @IsOptional()
  authorTitle?: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;
}
