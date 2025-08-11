import {
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtGuard } from '@/auth/guard/jwt.guard';
import { AdminGuard } from './guard/admin.guard';
import { AdminService } from './admin.service';
import { ReportStatus } from '@prisma/client';

// 1. Aplica os guardiões a TODOS os endpoints dentro deste controller
@UseGuards(JwtGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('reports')
  getPendingReports() {
    return this.adminService.getPendingReports();
  }

  @Patch('reports/:id/resolve')
  @HttpCode(HttpStatus.OK)
  resolveReport(@Param('id') reportId: string) {
    return this.adminService.updateReportStatus(
      reportId,
      ReportStatus.RESOLVED,
    );
  }

  @Patch('reports/:id/dismiss')
  @HttpCode(HttpStatus.OK)
  dismissReport(@Param('id') reportId: string) {
    return this.adminService.updateReportStatus(
      reportId,
      ReportStatus.DISMISSED,
    );
  }

  @Get('topics/pending')
  getPendingTopics() {
    return this.adminService.getPendingTopics();
  }

  @Patch('topics/:id/approve')
  approveTopic(@Param('id') topicId: string) {
    return this.adminService.updateTopicStatus(topicId, 'APPROVED');
  }

  @Patch('topics/:id/reject')
  rejectTopic(@Param('id') topicId: string) {
    return this.adminService.updateTopicStatus(topicId, 'REJECTED');
  }
}
