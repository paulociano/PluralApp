// Arquivo: src/users/dto/edit-user.dto.ts
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class EditUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @Matches(/^[a-z0-9-]+$/, {
    message:
      'O nome de usuário pode conter apenas letras minúsculas, números e hífens.',
  })
  username?: any;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  bio?: string;
}
