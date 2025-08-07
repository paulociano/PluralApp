// src/auth/auth.service.ts
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: AuthDto) {
    // Gerar o hash da senha
    const hash = await bcrypt.hash(dto.password, 10);

    // Salvar o novo usuário no banco de dados
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
          name: dto.email.split('@')[0], // Pega o nome do email como padrão
        },
      });

      // Retornar um token de acesso
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // Código P2002 significa "campo único duplicado"
        if (error.code === 'P2002') {
          throw new ForbiddenException('Este e-mail já está em uso.');
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    // Encontrar o usuário pelo email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Se não existir, lançar um erro
    if (!user) throw new ForbiddenException('Credenciais inválidas.');

    // Comparar a senha digitada com a senha salva no banco
    const pwMatches = await bcrypt.compare(dto.password, user.password);

    // Se as senhas não baterem, lançar um erro
    if (!pwMatches) throw new ForbiddenException('Credenciais inválidas.');

    // Se tudo estiver certo, retornar um token
    return this.signToken(user.id, user.email);
  }

  // Função auxiliar para gerar o token
  async signToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = 'SUPER_SECRET_KEY'; // Em um projeto real, use variáveis de ambiente!

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '60m',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }
}