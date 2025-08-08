// Arquivo: src/debate/debate.controller.ts
// Versão completa e final

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
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '@/auth/decorator/get-user.decorator';
import { JwtGuard } from '@/auth/guard/jwt.guard';
import { DebateService } from './debate.service';
import {
  CreateArgumentDto,
  EditArgumentDto,
  CreateReportDto,
} from './dto/index';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ReportsService } from '@/reports/reports.service';

@Controller('debate')
export class DebateController {
  constructor(
    private debateService: DebateService,
    private reportsService: ReportsService,
  ) {}

  // ROTA PÚBLICA: Pega o tópico em destaque
  @Get('featured-topic')
  getFeaturedTopic() {
    return this.debateService.findOrCreateFeaturedTopic();
  }

  // ROTA PÚBLICA: Pega a árvore de argumentos de um tópico específico com paginação
  @Get('tree/:topicId')
  getArgumentTree(
    @Param('topicId') topicId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.debateService.getArgumentTreeForTopic(topicId, paginationDto);
  }

  // ROTA PÚBLICA: Pega um único argumento por ID
  @Get('argument/:id')
  getArgumentById(@Param('id') argumentId: string) {
    return this.debateService.getArgumentById(argumentId);
  }

  // ROTA PROTEGIDA: Cria um novo argumento (requer login)
  @UseGuards(JwtGuard)
  @Post('argument')
  createArgument(@Body() dto: CreateArgumentDto, @GetUser() user: User) {
    return this.debateService.createArgument(user.id, dto);
  }

  // ROTA PROTEGIDA: Edita um argumento existente
  @UseGuards(JwtGuard)
  @Patch('argument/:id')
  editArgument(
    @Param('id') argumentId: string,
    @Body() dto: EditArgumentDto,
    @GetUser('id') userId: string,
  ) {
    return this.debateService.editArgument(userId, argumentId, dto);
  }

  // ROTA PROTEGIDA: Deleta um argumento existente
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('argument/:id')
  deleteArgument(
    @Param('id') argumentId: string,
    @GetUser('id') userId: string,
  ) {
    return this.debateService.deleteArgument(userId, argumentId);
  }

  // ROTA PROTEGIDA: Registra um voto em um argumento
  @UseGuards(JwtGuard)
  @Post('argument/:argumentId/vote')
  voteOnArgument(
    @Param('argumentId') argumentId: string,
    @Body() dto: any, // Ajuste para o DTO de Voto se o tiver criado
    @GetUser('id') userId: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.debateService.voteOnArgument(userId, argumentId, dto.type);
  }

  // ROTA PROTEGIDA: Cria uma denúncia para um argumento
  @UseGuards(JwtGuard)
  @Post('argument/:id/report')
  reportArgument(
    @GetUser('id') reporterId: string,
    @Param('id') reportedArgumentId: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.reportsService.createReport(
      reporterId,
      reportedArgumentId,
      dto,
    );
  }

  // ROTA PÚBLICA: Pega todos os tópicos
  @Get('topics')
  getAllTopics() {
    return this.debateService.getAllTopics();
  }
  // ROTA PÚBLICA: Pega um único tópico por ID
  @Get('topic/:id')
  getTopicById(@Param('id') topicId: string) {
    return this.debateService.getTopicById(topicId);
  }
}
