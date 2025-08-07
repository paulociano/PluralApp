// Arquivo: src/reports/reports.module.ts
import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Module({
  providers: [ReportsService],
  // A LINHA ABAIXO É CRUCIAL. ELA DISPONIBILIZA O ReportsService PARA OUTROS MÓDULOS.
  exports: [ReportsService],
})
export class ReportsModule {}
