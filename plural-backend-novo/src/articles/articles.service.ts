import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  // --- MÉTODOS PÚBLICOS (READ) ---
  async getPublishedArticles() {
    return this.prisma.article.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
  }

  async getArticleById(articleId: string) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId, published: true },
    });
    if (!article) {
      throw new NotFoundException('Artigo não encontrado.');
    }
    return article;
  }

  // --- MÉTODOS DE ADMIN (CRUD) ---

  // GET ALL (para o painel de admin, inclui não publicados)
  async getAllArticles() {
    return this.prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
  }

  // CREATE (agora salva o 'content' como texto simples)
  async createArticle(dto: CreateArticleDto) {
    return this.prisma.article.create({ data: dto });
  }

  // UPDATE (agora salva o 'content' como texto simples)
  async updateArticle(articleId: string, dto: UpdateArticleDto) {
    const article = await this.prisma.article.findUnique({ where: { id: articleId } });
    if (!article) {
      throw new NotFoundException('Artigo não encontrado.');
    }
    return this.prisma.article.update({
      where: { id: articleId },
      data: dto,
    });
  }

  // DELETE
  async deleteArticle(articleId: string) {
    const article = await this.prisma.article.findUnique({ where: { id: articleId } });
    if (!article) {
      throw new NotFoundException('Artigo não encontrado.');
    }
    await this.prisma.article.delete({ where: { id: articleId } });
    return { message: 'Artigo deletado com sucesso.' };
  }
}