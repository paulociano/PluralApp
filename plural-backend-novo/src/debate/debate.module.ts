import { Module } from '@nestjs/common';
import { DebateController } from './debate.controller';
import { DebateService } from './debate.service';
import { ReportsModule } from '@/reports/reports.module';

@Module({
  imports: [ReportsModule],
  controllers: [DebateController],
  providers: [DebateService],
  // 1. Adicione esta linha para exportar o serviço
  exports: [DebateService],
})
export class DebateModule {}