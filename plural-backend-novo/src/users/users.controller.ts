// Arquivo: src/users/users.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '@/auth/decorator/get-user.decorator';
import { JwtGuard } from '@/auth/guard/jwt.guard';
import { EditUserDto } from './dto/edit-users.dto';
import { UsersService } from './users.service';
import { PaginationDto } from '@/common/dto/pagination.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @UseGuards(JwtGuard)
  @Patch('me')
  editUser(@GetUser('id') userId: string, @Body() dto: EditUserDto) {
    return this.usersService.editUser(userId, dto);
  }

  @Get('by-username/:username')
  getUserProfileByUsername(@Param('username') username: string) {
    return this.usersService.getUserProfileByUsername(username);
  }

  @Get(':id/favorites')
  getFavoritedArguments(
    @Param('id') userId: string,
    @Query() paginationDto: PaginationDto, // <-- ADICIONE ISTO
  ) {
    return this.usersService.getFavoritedArguments(userId, paginationDto);
  }

  @Get('top-contributors')
  getTopContributors() {
    return this.usersService.getTopContributors();
  }
}
