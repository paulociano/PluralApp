// Arquivo: src/debate/debate.module.ts
import { Module } from '@nestjs/common';
import { DebateController } from './debate.controller';
import { DebateService } from './debate.service';
import { ReportsModule } from '@/reports/reports.module';

@Module({
  // A LINHA ABAIXO GARANTE QUE ESTE MÓDULO TEM ACESSO AOS SERVIÇOS DO ReportsModule.
  imports: [ReportsModule],
  controllers: [DebateController],
  providers: [DebateService],
})
export class DebateModule {}
