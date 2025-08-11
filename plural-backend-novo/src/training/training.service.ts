import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class TrainingService {
  constructor(private prisma: PrismaService) {}

  async getRandomExercise() {
    // Pega todos os exercícios
    const allExercises = await this.prisma.trainingExercise.findMany({
      select: { id: true },
    });
    if (allExercises.length === 0) return null;

    // Escolhe um aleatoriamente
    const randomExercise = allExercises[Math.floor(Math.random() * allExercises.length)];

    // Pega os detalhes completos do exercício escolhido
    const exercise = await this.prisma.trainingExercise.findUnique({
      where: { id: randomExercise.id },
      include: { correctFallacy: true },
    });

    // Pega 3 tipos de falácias aleatórias (que não sejam a correta) para as opções
    const incorrectOptions = await this.prisma.fallacyType.findMany({
      where: { id: { not: exercise.correctFallacyId } },
      take: 3,
    });

    // Junta a resposta correta com as incorretas e embaralha
    const options = [exercise.correctFallacy, ...incorrectOptions]
      .sort(() => Math.random() - 0.5);

    return { exercise, options };
  }

  async checkAnswer(exerciseId: string, answerId: string) {
    const exercise = await this.prisma.trainingExercise.findUnique({
      where: { id: exerciseId },
    });
    const isCorrect = exercise.correctFallacyId === answerId;
    return { isCorrect, explanation: exercise.explanation };
  }
}