/* eslint-disable no-useless-escape */
// Arquivo: src/users/users.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { EditUserDto } from './dto/edit-users.dto';
import { Prisma, FavoriteArgument, Argument, Topic } from '@prisma/client';

// --- TIPOS PARA RETORNO ---
type FavoriteWithArgumentDetails = FavoriteArgument & {
  argument: Argument & {
    topic: Pick<Topic, 'id' | 'title'>;
  };
};

// --- FUNÇÃO AUXILIAR ---
function createSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD') // Normaliza para decompor acentos
    .replace(/[\u0300-\u036f]/g, '') // Remove os acentos
    .replace(/\s+/g, '-') // Substitui espaços por -
    .replace(/[^\w\-]+/g, '') // Remove caracteres inválidos (que não sejam letras, números ou hífen)
    .replace(/\-\-+/g, '-'); // Substitui múltiplos - por um único -
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async editUser(userId: string, dto: EditUserDto) {
    const dataToUpdate: Prisma.UserUpdateInput = { ...dto };

    // Se o usuário está tentando definir ou mudar o username, crie um slug
    if (dto.username) {
      dataToUpdate.username = createSlug(dto.username);
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: dataToUpdate,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        // P2002 é o código para erro de violação de campo único (unique constraint)
        throw new ForbiddenException('Esse nome de usuário já está em uso.');
      }
      throw error;
    }
  }

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        createdAt: true,
        points: true,
        _count: {
          select: {
            arguments: true,
            votes: true,
          },
        },
        badges: {
          include: {
            badge: true,
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

  async getUserProfileByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        createdAt: true,
        points: true,
        _count: {
          select: {
            arguments: true,
            votes: true,
          },
        },
        badges: {
          include: {
            badge: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const recentArguments = await this.prisma.argument.findMany({
      where: { authorId: user.id },
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

  async getFavoritedArguments(
    userId: string,
  ): Promise<FavoriteWithArgumentDetails[]> {
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return this.prisma.favoriteArgument.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
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

  async getTopContributors() {
    return this.prisma.user.findMany({
      where: {
        email: {
          not: 'mediador@plural.ai',
        },
      },
      orderBy: {
        points: 'desc',
      },
      take: 5, // Pega o Top 5
      select: {
        id: true,
        name: true,
        username: true,
        points: true,
      },
    });
  }
}
