// Arquivo: src/debate/debate.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateArgumentDto } from './dto/create-argument.dto';
import { ArgType, VoteType } from '@prisma/client';
import { PaginationDto } from '@/common/dto/pagination.dto';

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

  async getArgumentTreeForTopic(topicId: string, paginationDto: PaginationDto) {
    // CORREÇÃO 1: Adiciona valores padrão para garantir que page e limit sempre sejam números.
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const topicExists = await this.prisma.topic.findUnique({ where: { id: topicId } });
    if (!topicExists) {
      throw new NotFoundException('Tópico não encontrado.');
    }

    const totalRootArguments = await this.prisma.argument.count({
      where: { topicId, parentArgumentId: null },
    });

    const rootArguments = await this.prisma.argument.findMany({
      where: { topicId, parentArgumentId: null },
      skip: skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const getRepliesRecursively = async (parentId: string): Promise<any[]> => {
      const replies = await this.prisma.argument.findMany({
        where: { parentArgumentId: parentId },
        include: { author: { select: { name: true, id: true } } },
      });
      for (const reply of replies) {
        (reply as any).replies = await getRepliesRecursively(reply.id);
      }
      return replies;
    };

    // CORREÇÃO 2: Define o tipo do array para que o TypeScript saiba o que esperar.
    const finalTree: any[] = [];
    for (const root of rootArguments) {
      const author = await this.prisma.user.findUnique({
        where: { id: root.authorId },
        select: { id: true, name: true },
      });
      const replies = await getRepliesRecursively(root.id);
      finalTree.push({ ...root, author, replies });
    }

    return {
      data: finalTree,
      total: totalRootArguments,
      page: page,
      lastPage: Math.ceil(totalRootArguments / limit),
    };
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
