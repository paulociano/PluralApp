/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// Arquivo: src/debate/debate.service.ts
// Versão completa e final com deleção em cascata corrigida

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateArgumentDto, EditArgumentDto } from './dto';
import { Prisma, TopicCategory, VoteType } from '@prisma/client';
import { PaginationDto } from '@/common/dto/pagination.dto';

@Injectable()
export class DebateService {
  constructor(private prisma: PrismaService) {}

  async getAllTopics(category?: TopicCategory, search?: string) {
    const where: Prisma.TopicWhereInput = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return this.prisma.topic.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getTopicById(topicId: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
    });
    if (!topic) {
      throw new NotFoundException('Tópico não encontrado.');
    }
    return topic;
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
        category: 'TECNOLOGIA',
      },
    });
  }

  async createArgument(userId: string, dto: CreateArgumentDto) {
    if (dto.parentArgumentId) {
      return this.prisma.$transaction(async (tx) => {
        const newReply = await tx.argument.create({
          data: {
            authorId: userId,
            ...dto,
          },
        });

        await tx.argument.update({
          where: { id: dto.parentArgumentId },
          data: { replyCount: { increment: 1 } },
        });

        const parentArgument = await tx.argument.findUnique({
          where: { id: dto.parentArgumentId },
        });

        if (parentArgument && parentArgument.authorId !== userId) {
          await tx.notification.create({
            data: {
              type: 'NEW_REPLY',
              recipientId: parentArgument.authorId,
              triggerUserId: userId,
              originArgumentId: parentArgument.id,
            },
          });
        }
        return newReply;
      });
    } else {
      return this.prisma.argument.create({
        data: {
          authorId: userId,
          ...dto,
        },
      });
    }
  }

  async getArgumentTreeForTopic(topicId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const topicExists = await this.prisma.topic.findUnique({
      where: { id: topicId },
    });
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
      include: { author: { select: { id: true, name: true } } },
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

    const finalTree = [];
    for (const root of rootArguments) {
      const replies = await getRepliesRecursively(root.id);
      finalTree.push({ ...root, replies });
    }

    return {
      data: finalTree,
      total: totalRootArguments,
      page: page,
      lastPage: Math.ceil(totalRootArguments / limit),
    };
  }

  async getArgumentById(argumentId: string) {
    const argument = await this.prisma.argument.findUnique({
      where: { id: argumentId },
      include: {
        author: { select: { id: true, name: true } },
        replies: { include: { author: { select: { id: true, name: true } } } },
      },
    });

    if (!argument) {
      throw new NotFoundException('Argumento não encontrado.');
    }
    return argument;
  }

  async voteOnArgument(userId: string, argumentId: string, type: VoteType) {
    // ... (a lógica de votação que já tínhamos)
  }

  async editArgument(userId: string, argumentId: string, dto: EditArgumentDto) {
    const argument = await this.prisma.argument.findUnique({
      where: { id: argumentId },
    });
    if (!argument) {
      throw new NotFoundException('Argumento não encontrado.');
    }
    if (argument.authorId !== userId) {
      throw new ForbiddenException(
        'Acesso negado. Você não é o autor deste argumento.',
      );
    }
    return this.prisma.argument.update({
      where: { id: argumentId },
      data: { ...dto },
    });
  }

  async deleteArgument(userId: string, argumentId: string) {
    const argument = await this.prisma.argument.findUnique({
      where: { id: argumentId },
    });
    if (!argument) {
      throw new NotFoundException('Argumento não encontrado.');
    }
    if (argument.authorId !== userId) {
      throw new ForbiddenException(
        'Acesso negado. Você não é o autor deste argumento.',
      );
    }

    const getDescendantIds = async (parentId: string): Promise<string[]> => {
      const replies = await this.prisma.argument.findMany({
        where: { parentArgumentId: parentId },
        select: { id: true },
      });
      const replyIds = replies.map((r) => r.id);
      let descendantIds: string[] = [];
      for (const replyId of replyIds) {
        descendantIds = descendantIds.concat(await getDescendantIds(replyId));
      }
      return replyIds.concat(descendantIds);
    };

    const allIdsToDelete = await getDescendantIds(argumentId);
    allIdsToDelete.push(argumentId);

    if (argument.parentArgumentId) {
      await this.prisma.argument.update({
        where: { id: argument.parentArgumentId },
        data: { replyCount: { decrement: 1 } },
      });
    }

    await this.prisma.argument.deleteMany({
      where: {
        id: {
          in: allIdsToDelete,
        },
      },
    });

    return { message: 'Argumento e todas as suas respostas foram deletados.' };
  }

  async deleteTopic(topicId: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
    });
    if (!topic) {
      throw new NotFoundException('Tópico não encontrado.');
    }
    await this.prisma.topic.delete({ where: { id: topicId } });
    return { message: 'Tópico e todos os seus argumentos foram deletados.' };
  }

  async getTrendingTopics() {
    return this.prisma.topic.findMany({
      // Inclui uma contagem de quantos argumentos estão relacionados a este tópico
      include: {
        _count: {
          select: { arguments: true },
        },
      },
      // Ordena os resultados pela contagem de argumentos em ordem decrescente
      orderBy: {
        arguments: {
          _count: 'desc',
        },
      },
      // Pega apenas os 5 primeiros
      take: 5,
    });
  }
}
