/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

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

   async getAllTopics(
    category?: TopicCategory,
    search?: string,
    includeArgumentCount?: boolean,
    includeParticipantCount?: boolean, // 1. Novo parâmetro
  ) {
    const where: Prisma.TopicWhereInput = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const queryOptions: Prisma.TopicFindManyArgs = {
      where,
      orderBy: { createdAt: 'desc' },
    };

    if (includeArgumentCount) {
      queryOptions.include = { _count: { select: { arguments: true } } };
    }

    // Busca inicial dos tópicos
    const topics = await this.prisma.topic.findMany(queryOptions);

    // 2. Se a contagem de participantes for solicitada, execute a lógica
    if (includeParticipantCount && topics.length > 0) {
      const topicIds = topics.map(t => t.id);

      // Agrupa os argumentos por tópico e autor para encontrar participantes únicos
      const distinctAuthorsByTopic = await this.prisma.argument.groupBy({
        by: ['topicId', 'authorId'],
        where: { topicId: { in: topicIds } },
      });

      // Conta quantos autores únicos existem para cada tópico
      const participantCounts = distinctAuthorsByTopic.reduce((acc, current) => {
        acc[current.topicId] = (acc[current.topicId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Adiciona a contagem a cada objeto de tópico
      return topics.map(topic => ({
        ...topic,
        participantCount: participantCounts[topic.id] || 0,
      }));
    }

    return topics;
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

  async getFavoriteStatus(userId: string, argumentId: string) {
    const favorite = await this.prisma.favoriteArgument.findUnique({
      where: {
        userId_argumentId: {
          userId,
          argumentId,
        },
      },
    });
    return { isFavorited: !!favorite };
  }

  async toggleFavorite(userId: string, argumentId: string) {
    const existingFavorite = await this.prisma.favoriteArgument.findUnique({
      where: {
        userId_argumentId: {
          userId,
          argumentId,
        },
      },
    });

    if (existingFavorite) {
      await this.prisma.favoriteArgument.delete({
        where: { id: existingFavorite.id },
      });
      return { message: 'Argumento desfavoritado.', status: 'unfavorited' };
    } else {
      await this.prisma.favoriteArgument.create({
        data: {
          userId,
          argumentId,
        },
      });
      return { message: 'Argumento favoritado.', status: 'favorited' };
    }
  }


  async createArgument(userId: string, dto: CreateArgumentDto) {
    return this.prisma.$transaction(async (tx) => {
      const argument = await tx.argument.create({
        data: {
          authorId: userId,
          ...dto,
        },
      });

      if (dto.parentArgumentId) {
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
      }

      // Atribui pontos por criar um argumento
      await tx.user.update({
        where: { id: userId },
        data: { points: { increment: 5 } },
      });
      
      await this.checkAndAwardBadgesOnArgumentCreation(userId, tx);
      return argument;
    });
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
      include: { author: { select: { id: true, name: true, username: true } } },
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
        replies: { include: { author: { select: { id: true, name: true, username: true } } } },
      },
    });

    if (!argument) {
      throw new NotFoundException('Argumento não encontrado.');
    }
    return argument;
  }

  async voteOnArgument(userId: string, argumentId: string, type: VoteType) {
    return this.prisma.$transaction(async (tx) => {
      const argument = await tx.argument.findUnique({
        where: { id: argumentId },
      });
      if (!argument) {
        throw new NotFoundException('Argumento não encontrado.');
      }

      const existingVote = await tx.vote.findUnique({
        where: {
          userId_argumentId: { userId, argumentId },
        },
      });

      let voteCountChange = 0;
      let pointsChange = 0; // Lógica de pontos

      if (existingVote) {
        if (existingVote.type === type) { // Cancelando o voto
          await tx.vote.delete({ where: { id: existingVote.id } });
          voteCountChange = type === 'UPVOTE' ? -1 : 1;
          pointsChange = type === 'UPVOTE' ? -2 : 1; // Reverte os pontos do autor
        } else { // Mudando o voto
          await tx.vote.update({ where: { id: existingVote.id }, data: { type } });
          voteCountChange = type === 'UPVOTE' ? 2 : -2;
          pointsChange = type === 'UPVOTE' ? 3 : -3; // UPVOTE -> DOWNVOTE (-2 -1 = -3); DOWNVOTE -> UPVOTE (+1 +2 = +3)
        }
      } else { // Novo voto
        await tx.vote.create({ data: { userId, argumentId, type } });
        voteCountChange = type === 'UPVOTE' ? 1 : -1;
        pointsChange = type === 'UPVOTE' ? 2 : -1; // Concede pontos ao autor
      }

      const updatedArgument = await tx.argument.update({
        where: { id: argumentId },
        data: {
          votesCount: { increment: voteCountChange },
        },
        select: {
          votesCount: true,
          authorId: true,
        },
      });

      // Aplica a mudança de pontos ao AUTOR do argumento (se for diferente de quem votou)
      if (pointsChange !== 0 && argument.authorId !== userId) {
        await tx.user.update({
          where: { id: updatedArgument.authorId },
          data: { points: { increment: pointsChange } },
        });
      }

      if (type === 'UPVOTE' && updatedArgument.votesCount >= 10) {
        await this.checkAndAwardPopularArgumentBadge(updatedArgument.authorId, tx);
      }

      return { votesCount: updatedArgument.votesCount };
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
      include: {
        _count: {
          select: { arguments: true },
        },
      },
      orderBy: {
        arguments: {
          _count: 'desc',
        },
      },
      take: 5,
    });
  }

  async getArgumentAncestors(argumentId: string) {
    const ancestors = [];
    let currentArgument = await this.prisma.argument.findUnique({
      where: { id: argumentId },
      include: { parentArgument: true },
    });

    while (currentArgument && currentArgument.parentArgumentId) {
      const parent = await this.prisma.argument.findUnique({
        where: { id: currentArgument.parentArgumentId },
      });
      if (parent) {
        ancestors.push(parent);
        currentArgument = { ...parent, parentArgument: null };
      } else {
        break;
      }
    }
    
    return ancestors.reverse();
  }

  private async checkAndAwardBadgesOnArgumentCreation(userId: string, tx: Prisma.TransactionClient) {
    const userBadges = await tx.userBadge.findMany({
      where: { userId },
      include: { badge: true },
    });
    const userBadgeNames = userBadges.map(ub => ub.badge.name);

    if (!userBadgeNames.includes('Iniciante Curioso')) {
      const argumentCount = await tx.argument.count({ where: { authorId: userId } });
      if (argumentCount === 1) {
        const badge = await tx.badge.findUnique({ where: { name: 'Iniciante Curioso' } });
        if (badge) await tx.userBadge.create({ data: { userId, badgeId: badge.id } });
      }
    }
    
    if (!userBadgeNames.includes('Voz Ativa')) {
        const argumentCount = await tx.argument.count({ where: { authorId: userId } });
        if(argumentCount >= 10) {
            const badge = await tx.badge.findUnique({ where: { name: 'Voz Ativa' } });
            if (badge) await tx.userBadge.create({ data: { userId, badgeId: badge.id } });
        }
    }
  }

  private async checkAndAwardPopularArgumentBadge(authorId: string, tx: Prisma.TransactionClient) {
    const userBadges = await tx.userBadge.findMany({
      where: { userId: authorId },
      include: { badge: true },
    });
    const userBadgeNames = userBadges.map(ub => ub.badge.name);

    if (!userBadgeNames.includes('Argumento Popular')) {
      const badge = await tx.badge.findUnique({ where: { name: 'Argumento Popular' } });
      if (badge) {
        await tx.userBadge.create({
          data: { userId: authorId, badgeId: badge.id },
        });
      }
    }
  }
}