// Arquivo: src/users/user.controller.ts
import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '@/auth/decorator/get-user.decorator';
import { JwtGuard } from '@/auth/guard/jwt.guard';
import { EditUserDto } from './dto/edit-users.dto';
import { UsersService } from './users.service';

@UseGuards(JwtGuard) // Protege todas as rotas deste controlador com nosso guardião
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Rota: GET /users/me
  @Get('me')
  getMe(@GetUser() user: User) {
    // O decorador @GetUser simplesmente extrai o usuário que o JwtGuard já validou
    return user;
  }

  // Rota: PATCH /users/me
  @Patch('me')
  editUser(@GetUser('id') userId: string, @Body() dto: EditUserDto) {
    // A mudança para @GetUser('id') garante que estamos passando apenas o ID (string).
    return this.usersService.editUser(userId, dto);
  }
}
