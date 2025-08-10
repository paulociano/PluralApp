// Arquivo: src/notifications/notifications.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getNotificationsForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
      take: 20, // Pega as últimas 20 para não sobrecarregar
      include: {
        triggerUser: { select: { id: true, name: true } },
        // Precisamos incluir os dados do argumento original para pegar o topicId
        originArgument: {
          select: {
            topicId: true,
          },
        },
      },
    });
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notificação não encontrada.');
    }

    if (notification.recipientId !== userId) {
      throw new ForbiddenException('Acesso negado.');
    }
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }
}
