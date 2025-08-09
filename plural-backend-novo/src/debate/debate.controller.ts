/* eslint-disable prettier/prettier */
// Arquivo: src/debate/debate.controller.ts
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
import { User, VoteType } from '@prisma/client';
import { GetUser } from '@/auth/decorator/get-user.decorator';
import { JwtGuard } from '@/auth/guard/jwt.guard';
import { DebateService } from './debate.service';
import {
  CreateArgumentDto,
  EditArgumentDto,
  CreateReportDto,
  CreateVoteDto,
} from './dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ReportsService } from '@/reports/reports.service';
import { Request } from 'express';
import { GetTopicsDto } from './dto/get-topics.dto';

@Controller('debate')
export class DebateController {
  constructor(
    private debateService: DebateService,
    private reportsService: ReportsService,
  ) {}

  @UseGuards(JwtGuard)
  @Get('argument/:argumentId/favorite')
  getFavoriteStatus(
    @Param('argumentId') argumentId: string,
    @GetUser('id') userId: string,
  ) {
    return this.debateService.getFavoriteStatus(userId, argumentId);
  }

  @UseGuards(JwtGuard)
  @Post('argument/:argumentId/favorite')
  toggleFavorite(
    @Param('argumentId') argumentId: string,
    @GetUser('id') userId: string,
  ) {
    return this.debateService.toggleFavorite(userId, argumentId);
  }

  @Get('topics')
  getAllTopics(@Query() dto: GetTopicsDto) {
    // Converte o parâmetro de string 'true' para um booleano real
    const shouldIncludeCount = dto.includeArgumentCount === 'true';

    return this.debateService.getAllTopics(
      dto.category,
      dto.search,
      shouldIncludeCount, // Passa o valor booleano para o serviço
    );
  }

  @Get('topic/:id')
  getTopicById(@Param('id') topicId: string) {
    return this.debateService.getTopicById(topicId);
  }

  @Get('featured-topic')
  getFeaturedTopic() {
    return this.debateService.findOrCreateFeaturedTopic();
  }

  @Get('trending')
  getTrendingTopics() {
    return this.debateService.getTrendingTopics();
  }

  @Get('argument/:id/ancestors')
  getArgumentAncestors(@Param('id') argumentId: string) {
    return this.debateService.getArgumentAncestors(argumentId);
  }

  @Get('tree/:topicId')
  getArgumentTree(
    @Param('topicId') topicId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.debateService.getArgumentTreeForTopic(topicId, paginationDto);
  }

  @Get('argument/:id')
  getArgumentById(@Param('id') argumentId: string) {
    return this.debateService.getArgumentById(argumentId);
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
    @GetUser('id') userId: string,
  ) {
    return this.debateService.editArgument(userId, argumentId, dto);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('argument/:id')
  deleteArgument(
    @Param('id') argumentId: string,
    @GetUser('id') userId: string,
  ) {
    return this.debateService.deleteArgument(userId, argumentId);
  }

  @UseGuards(JwtGuard)
  @Post('argument/:argumentId/vote')
  voteOnArgument(
    @Param('argumentId') argumentId: string,
    @Body() dto: CreateVoteDto,
    @GetUser('id') userId: string,
  ) {
    return this.debateService.voteOnArgument(userId, argumentId, dto.type);
  }

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

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('topic/:id')
  deleteTopic(@Param('id') topicId: string) {
    return this.debateService.deleteTopic(topicId);
  }
}
