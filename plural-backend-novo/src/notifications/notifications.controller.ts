// Arquivo: src/notifications/notifications.controller.ts
import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { GetUser } from '@/auth/decorator/get-user.decorator';
import { JwtGuard } from '@/auth/guard/jwt.guard';
import { NotificationsService } from './notifications.service';

@UseGuards(JwtGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotifications(@GetUser('id') userId: string) {
    return this.notificationsService.getNotificationsForUser(userId);
  }

  @Patch(':id/read')
  markAsRead(
    @GetUser('id') userId: string,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.markAsRead(userId, notificationId);
  }
}
