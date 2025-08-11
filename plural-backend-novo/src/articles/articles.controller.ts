import { Controller, Get, Param, Post, Patch, Delete, UseGuards, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { JwtGuard } from '@/auth/guard/jwt.guard';
import { AdminGuard } from '@/admin/guard/admin.guard';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private articlesService: ArticlesService) {}

  // --- ROTAS PÚBLICAS ---
  @Get()
  getPublishedArticles() {
    return this.articlesService.getPublishedArticles();
  }

  @Get(':id')
  getArticleById(@Param('id') articleId: string) {
    return this.articlesService.getArticleById(articleId);
  }

  // --- ROTAS DE ADMIN ---
  @UseGuards(JwtGuard, AdminGuard)
  @Get('admin/all')
  getAllArticles() {
    return this.articlesService.getAllArticles();
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createArticle(@Body() dto: CreateArticleDto) {
    return this.articlesService.createArticle(dto);
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Patch(':id')
  updateArticle(@Param('id') articleId: string, @Body() dto: UpdateArticleDto) {
    return this.articlesService.updateArticle(articleId, dto);
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteArticle(@Param('id') articleId: string) {
    return this.articlesService.deleteArticle(articleId);
  }
}