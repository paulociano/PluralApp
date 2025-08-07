import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { DebateService } from './debate.service';
import { CreateArgumentDto } from './dto/create-argument.dto';
import { CreateVoteDto } from './dto/create-vote.dto';
import express from 'express';

@Controller('debate')
export class DebateController {
  constructor(private debateService: DebateService) {}

  // ROTA PÚBLICA: Pega o tópico em destaque
  @Get('featured-topic')
  getFeaturedTopic() {
    return this.debateService.findOrCreateFeaturedTopic();
  }

  // ROTA PÚBLICA: Pega a árvore de argumentos de um tópico específico
  @Get('tree/:topicId')
  getArgumentTree(@Param('topicId') topicId: string) {
    return this.debateService.getArgumentTreeForTopic(topicId);
  }

  // ROTA PROTEGIDA: Cria um novo argumento (requer login)
  @UseGuards(JwtGuard)
  @Post('argument')
  createArgument(@Body() dto: CreateArgumentDto, @Req() req: express.Request) {
    // A anotação de tipo aqui ajuda o TypeScript e o autocomplete
    const user = req.user as { id: string; email: string };
    return this.debateService.createArgument(user.id, dto);
  }

  // NOVA ROTA PROTEGIDA PARA VOTOS
  @UseGuards(JwtGuard)
  @Post('argument/:argumentId/vote')
  voteOnArgument(
    @Param('argumentId') argumentId: string,
    @Body() dto: CreateVoteDto,
    @Req() req: express.Request,
  ) {
    const user = req.user as { id: string };
    return this.debateService.voteOnArgument(user.id, argumentId, dto.type);
  }
}
