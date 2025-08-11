import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtGuard } from '@/auth/guard/jwt.guard';
import { AiService } from './ai.service';

@UseGuards(JwtGuard)
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Get('summarize/topic/:id')
  summarizeTopic(@Param('id') topicId: string) {
    return this.aiService.summarizeTopic(topicId);
  }
}