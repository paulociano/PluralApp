import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ReportStatus, TopicStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  /**
   * Busca todas as denúncias que ainda estão com o status 'PENDING'.
   * Inclui informações úteis como o nome de quem denunciou e o conteúdo do argumento.
   */
  async getPendingReports() {
    return this.prisma.report.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        reporter: {
          select: { name: true, username: true },
        },
        reportedArgument: {
          select: { id: true, content: true, authorId: true },
        },
      },
      orderBy: {
        createdAt: 'asc', // Mostra as denúncias mais antigas primeiro
      },
    });
  }

  /**
   * Atualiza o status de uma denúncia específica.
   * @param reportId O ID da denúncia a ser atualizada.
   * @param status O novo status ('RESOLVED' ou 'DISMISSED').
   */
  async updateReportStatus(reportId: string, status: ReportStatus) {
    // Primeiro, verifica se a denúncia realmente existe
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });
    if (!report) {
      throw new NotFoundException('Denúncia não encontrada.');
    }

    // Se existir, atualiza o status
    return this.prisma.report.update({
      where: {
        id: reportId,
      },
      data: {
        status,
      },
    });
  }

  async getPendingTopics() {
    return this.prisma.topic.findMany({
      where: { status: 'PENDING' },
      include: { createdBy: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateTopicStatus(topicId: string, status: TopicStatus) {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
    });
    if (!topic) throw new NotFoundException('Tópico não encontrado.');

    return this.prisma.topic.update({
      where: { id: topicId },
      data: { status },
    });
  }
}
