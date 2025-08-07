// Arquivo: src/reports/reports.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async createReport(
    reporterId: string,
    reportedArgumentId: string,
    dto: CreateReportDto,
  ) {
    const argument = await this.prisma.argument.findUnique({
      where: { id: reportedArgumentId },
    });

    if (!argument) {
      throw new NotFoundException('Argumento não encontrado.');
    }

    if (argument.authorId === reporterId) {
      throw new ForbiddenException(
        'Você não pode denunciar seu próprio argumento.',
      );
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const report = await this.prisma.report.create({
        data: {
          reporterId,
          reportedArgumentId,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          reason: dto.reason,
          notes: dto.notes,
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return report;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ForbiddenException('Você já denunciou este argumento.');
      }
      throw error;
    }
  }
}
