// Arquivo: src/users/user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { EditUserDto } from './dto/edit-users.dto';
import { FavoriteArgument, Argument, Topic } from '@prisma/client';

// 1. DEFINIÇÃO DO NOVO TIPO
// Este tipo descreve um FavoriteArgument com seu 'argument' e 'topic' aninhados.
type FavoriteWithArgumentDetails = FavoriteArgument & {
  argument: Argument & {
    topic: Pick<Topic, 'id' | 'title'>; // Pick<Topic, ...> pega apenas os campos 'id' e 'title' do Topic
  };
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async editUser(userId: string, dto: EditUserDto) {
    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            arguments: true,
            votes: true,
          },
        },
        badges: {
          include: {
            badge: true, // Inclui os detalhes de cada conquista
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const recentArguments = await this.prisma.argument.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        topic: { select: { id: true, title: true } },
      },
    });

    return {
      ...user,
      recentArguments,
    };
  }

  // 2. ADIÇÃO DA ANOTAÇÃO DE TIPO DE RETORNO
  async getFavoritedArguments(
    userId: string,
  ): Promise<FavoriteWithArgumentDetails[]> {
    // <-- Adicionamos o tipo de retorno aqui
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return this.prisma.favoriteArgument.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        argument: {
          include: {
            topic: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });
  }
}
