// Arquivo: src/users/dto/edit-user.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class EditUserDto {
  @IsString()
  @IsOptional()
  name?: string;
}