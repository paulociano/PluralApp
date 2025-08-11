import { Controller, Get, Param, UseGuards, Post, Body } from '@nestjs/common';
import { JwtGuard } from '@/auth/guard/jwt.guard';
import { AiService } from './ai.service';
import { AnalyzeArgumentDto } from './dto/analyze-argument.dto';

@UseGuards(JwtGuard)
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Get('summarize/topic/:id')
  summarizeTopic(@Param('id') topicId: string) {
    return this.aiService.summarizeTopic(topicId);
  }

  @Post('analyze/argument')
  analyzeArgumentQuality(@Body() dto: AnalyzeArgumentDto) {
    return this.aiService.analyzeArgumentQuality(dto);
  }
}