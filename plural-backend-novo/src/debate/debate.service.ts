/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Arquivo: src/debate/debate.service.ts
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
    const where: Prisma.TopicWhereInput = {}; // Cria um objeto de filtro

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        // Procura a palavra-chave no título OU na descrição
        {
          title: {
            contains: search,
            mode: 'insensitive', // Ignora maiúsculas/minúsculas
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
      where, // Aplica os filtros construídos
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
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!argument) {
      throw new NotFoundException('Argumento não encontrado.');
    }

    return argument;
  }

  async voteOnArgument(userId: string, argumentId: string, type: VoteType) {
    const argument = await this.prisma.argument.findUnique({
      where: { id: argumentId },
    });
    if (!argument) {
      throw new NotFoundException('Argumento não encontrado.');
    }

    const existingVote = await this.prisma.vote.findUnique({
      where: {
        userId_argumentId: {
          userId,
          argumentId,
        },
      },
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
          data: {
            userId,
            argumentId,
            type,
          },
        });
        await tx.argument.update({
          where: { id: argumentId },
          data: { votesCount: { increment: voteValue } },
        });
        return { message: 'Voto registrado.' };
      }
    });
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
    await this.prisma.argument.delete({
      where: { id: argumentId },
    });
    return { message: 'Argumento deletado com sucesso.' };
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
}
