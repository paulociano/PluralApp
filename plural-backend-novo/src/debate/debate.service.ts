// Arquivo: src/debate/debate.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateArgumentDto } from './dto/create-argument.dto';
import { ArgType, VoteType } from '@prisma/client';

@Injectable()
export class DebateService {
  constructor(private prisma: PrismaService) {}

  createArgument(userId: string, dto: CreateArgumentDto) {
    return this.prisma.argument.create({
      data: {
        authorId: userId,
        ...dto,
      },
    });
  }

  async findOrCreateFeaturedTopic() {
    const featuredTopic = await this.prisma.topic.findFirst();
    if (featuredTopic) return featuredTopic;

    return this.prisma.topic.create({
      data: {
        title:
          'Tópico Principal: A Inteligência Artificial irá mais ajudar ou atrapalhar a sociedade?',
        description:
          'Debata os prós e contras do avanço da IA no nosso dia a dia, carreira e relações sociais.',
      },
    });
  }

  async getArgumentTreeForTopic(topicId: string) {
    const topicExists = await this.prisma.topic.findUnique({ where: { id: topicId } });
    if (!topicExists) {
      throw new NotFoundException('Tópico não encontrado.');
    }

    const allArguments = await this.prisma.argument.findMany({
      where: { topicId },
      include: { author: { select: { name: true, id: true } } },
    });

    const argumentMap: Record<string, any> = {};
    const rootArguments: any[] = [];

    for (const arg of allArguments) {
      argumentMap[arg.id] = { ...arg, replies: [] };
    }

    for (const arg of allArguments) {
      if (arg.parentArgumentId && argumentMap[arg.parentArgumentId]) {
        argumentMap[arg.parentArgumentId].replies.push(argumentMap[arg.id]);
      } else {
        rootArguments.push(argumentMap[arg.id]);
      }
    }
    return rootArguments;
  }

  async voteOnArgument(userId: string, argumentId: string, type: VoteType) {
    const argument = await this.prisma.argument.findUnique({
      where: { id: argumentId },
    });
    if (!argument) {
      throw new NotFoundException('Argumento não encontrado.');
    }

    const existingVote = await this.prisma.vote.findUnique({
      where: { userId_argumentId: { userId, argumentId } },
    });

    const voteValue = type === 'UPVOTE' ? 1 : -1;

    return this.prisma.$transaction(async (tx) => {
      if (existingVote) {
        if (existingVote.type === type) {
          await tx.vote.delete({ where: { id: existingVote.id } });
          await tx.argument.update({
            where: { id: argumentId },
            data: { votesCount: { decrement: voteValue } },
          });
          return { message: 'Voto removido.' };
        } else {
          await tx.vote.update({
            where: { id: existingVote.id },
            data: { type },
          });
          await tx.argument.update({
            where: { id: argumentId },
            data: { votesCount: { increment: voteValue * 2 } },
          });
          return { message: 'Voto alterado.' };
        }
      } else {
        await tx.vote.create({
          data: { userId, argumentId, type },
        });
        await tx.argument.update({
          where: { id: argumentId },
          data: { votesCount: { increment: voteValue } },
        });
        return { message: 'Voto registrado.' };
      }
    });
  }
}
