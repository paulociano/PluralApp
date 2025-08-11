import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { TrainingService } from './training.service';
import { JwtGuard } from '@/auth/guard/jwt.guard';

@UseGuards(JwtGuard)
@Controller('training')
export class TrainingController {
  constructor(private trainingService: TrainingService) {}

  @Get('exercise')
  getRandomExercise() {
    return this.trainingService.getRandomExercise();
  }

  @Post('exercise/:id/check')
  checkAnswer(@Param('id') exerciseId: string, @Body('answerId') answerId: string) {
    return this.trainingService.checkAnswer(exerciseId, answerId);
  }
}