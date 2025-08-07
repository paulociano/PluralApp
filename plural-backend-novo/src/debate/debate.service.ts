// Arquivo: src/debate/debate.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateArgumentDto } from './dto/create-argument.dto';
import { VoteType } from '@prisma/client';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { EditArgumentDto } from './dto/edit-argument.dto';

@Injectable()
export class DebateService {
  constructor(private prisma: PrismaService) {}

  // Dentro da classe DebateService...

  async createArgument(userId: string, dto: CreateArgumentDto) {
    if (dto.parentArgumentId) {
      return this.prisma.$transaction(async (tx) => {
        const newReply = await tx.argument.create({
          data: { authorId: userId, ...dto },
        });

        await tx.argument.update({
          where: { id: dto.parentArgumentId },
          data: { replyCount: { increment: 1 } },
        });

        // LÓGICA DE NOTIFICAÇÃO
        const parentArgument = await tx.argument.findUnique({
          where: { id: dto.parentArgumentId },
        });

        // Só cria notificação se o autor da resposta for diferente do autor do argumento pai
        if (parentArgument && parentArgument.authorId !== userId) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
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
        data: { authorId: userId, ...dto },
      });
    }
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
    });

    const getRepliesRecursively = async (parentId: string): Promise<any[]> => {
      const replies = await this.prisma.argument.findMany({
        where: { parentArgumentId: parentId },
        include: { author: { select: { name: true, id: true } } },
      });
      for (const reply of replies) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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

  async editArgument(userId: string, argumentId: string, dto: EditArgumentDto) {
    // 1. Busca o argumento no banco de dados
    const argument = await this.prisma.argument.findUnique({
      where: { id: argumentId },
    });

    // 2. Verifica se o argumento existe
    if (!argument) {
      throw new NotFoundException('Argumento não encontrado.');
    }

    // 3. VERIFICAÇÃO DE POSSE (A LÓGICA DE AUTORIZAÇÃO)
    if (argument.authorId !== userId) {
      throw new ForbiddenException(
        'Acesso negado. Você não é o autor deste argumento.',
      );
    }

    // 4. Se tudo estiver certo, atualiza o argumento
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

    // Se o argumento que está sendo deletado era uma resposta,
    // precisamos decrementar a contagem do pai.
    if (argument.parentArgumentId) {
      await this.prisma.argument.update({
        where: { id: argument.parentArgumentId },
        data: { replyCount: { decrement: 1 } },
      });
    }

    // Agora, deleta o argumento (e suas respostas, graças ao onDelete: Cascade)
    await this.prisma.argument.delete({
      where: { id: argumentId },
    });

    return { message: 'Argumento deletado com sucesso.' };
  }

  // Dentro da classe DebateService...

  async getArgumentById(argumentId: string) {
    const argument = await this.prisma.argument.findUnique({
      where: { id: argumentId },
      include: {
        // Inclui os dados do autor para mostrar quem escreveu
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        // Inclui as respostas diretas (primeiro nível de replies)
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
}
