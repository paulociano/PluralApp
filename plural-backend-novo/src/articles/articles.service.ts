import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

// --- CORREÇÃO AQUI: Mudança no estilo da importação ---
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Configuração do DOMPurify para rodar no ambiente Node.js
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window as any);

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  // --- MÉTODOS PÚBLICOS (READ) ---
  async getPublishedArticles() {
    return this.prisma.article.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' } });
  }

  async getArticleById(articleId: string) {
    const article = await this.prisma.article.findUnique({ where: { id: articleId, published: true } });
    if (!article) throw new NotFoundException('Artigo não encontrado.');
    return article;
  }

  // --- MÉTODOS DE ADMIN (CRUD) ---

  async getAllArticles() {
    return this.prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createArticle(dto: CreateArticleDto) {
    // Limpa o conteúdo HTML antes de criar
    const sanitizedContent = DOMPurify.sanitize(dto.content);
    return this.prisma.article.create({ 
      data: { ...dto, content: sanitizedContent } 
    });
  }

  async updateArticle(articleId: string, dto: UpdateArticleDto) {
    const article = await this.prisma.article.findUnique({ where: { id: articleId } });
    if (!article) throw new NotFoundException('Artigo não encontrado.');

    // Limpa o conteúdo HTML antes de atualizar (se ele for enviado)
    if (dto.content) {
      dto.content = DOMPurify.sanitize(dto.content);
    }
    
    return this.prisma.article.update({
      where: { id: articleId },
      data: dto,
    });
  }

  async deleteArticle(articleId: string) {
    const article = await this.prisma.article.findUnique({ where: { id: articleId } });
    if (!article) throw new NotFoundException('Artigo não encontrado.');
    await this.prisma.article.delete({ where: { id: articleId } });
    return { message: 'Artigo deletado com sucesso.' };
  }
}