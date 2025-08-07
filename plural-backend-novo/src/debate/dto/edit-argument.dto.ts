import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EditArgumentDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  content?: string;
}