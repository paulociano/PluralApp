import { ReportReason } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateReportDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @IsEnum(ReportReason)
  @IsNotEmpty()
  reason: ReportReason;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
