import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateArticleDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  authorName?: string;

  @IsString()
  @IsOptional()
  authorTitle?: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;
}
