// Arquivo: src/debate/controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { DebateService } from './debate.service';
import { CreateArgumentDto } from './dto/create-argument.dto';
import { EditArgumentDto } from './dto/edit-argument.dto';
@Controller('debate')
export class DebateController {
  constructor(private debateService: DebateService) {}

  @Get('featured-topic')
  getFeaturedTopic() {
    return this.debateService.findOrCreateFeaturedTopic();
  }

  @Get('tree/:topicId')
  getArgumentTree(@Param('topicId') topicId: string) {
    return this.debateService.getArgumentTreeForTopic(topicId, {
      page: 1,
      limit: 10,
    }); // Ajustado para passar valores padrão
  }

  @UseGuards(JwtGuard)
  @Post('argument')
  createArgument(@Body() dto: CreateArgumentDto, @GetUser() user: User) {
    return this.debateService.createArgument(user.id, dto);
  }

  @UseGuards(JwtGuard)
  @Patch('argument/:id')
  editArgument(
    @Param('id') argumentId: string,
    @Body() dto: EditArgumentDto,
    @GetUser() user: User,
  ) {
    return this.debateService.editArgument(user.id, argumentId, dto);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('argument/:id')
  deleteArgument(@Param('id') argumentId: string, @GetUser() user: User) {
    return this.debateService.deleteArgument(user.id, argumentId);
  }

  @Get('argument/:id')
  getArgumentById(@Param('id') argumentId: string) {
    return this.debateService.getArgumentById(argumentId);
  }
}
