// Arquivo: src/users/user.controller.ts
import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common'; // 1. Adicione o 'Param'
import { User } from '@prisma/client';
import { GetUser } from '@/auth/decorator/get-user.decorator';
import { JwtGuard } from '@/auth/guard/jwt.guard';
import { EditUserDto } from './dto/edit-users.dto';
import { UsersService } from './users.service';

// 2. Remova o @UseGuards daqui para permitir rotas públicas
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Rota: GET /users/me (Protegida)
  @UseGuards(JwtGuard) // 3. Adicione o guardião individualmente aqui
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  // Rota: PATCH /users/me (Protegida)
  @UseGuards(JwtGuard) // 4. E adicione o guardião individualmente aqui
  @Patch('me')
  editUser(@GetUser('id') userId: string, @Body() dto: EditUserDto) {
    return this.usersService.editUser(userId, dto);
  }

  // --- ADICIONE ESTE NOVO ENDPOINT (Público) ---
  @Get(':id/profile')
  getUserProfile(@Param('id') userId: string) {
    return this.usersService.getUserProfile(userId);
  }

  @Get(':id/favorites')
  getFavoritedArguments(@Param('id') userId: string) {
    return this.usersService.getFavoritedArguments(userId);
  }
}
