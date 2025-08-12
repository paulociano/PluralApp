import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { DebateModule } from '@/debate/debate.module';

@Module({
  imports: [DebateModule],
  providers: [AiService],
  controllers: [AiController],
})
export class AiModule {}
