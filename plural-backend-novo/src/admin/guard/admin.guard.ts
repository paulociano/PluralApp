/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '@prisma/client';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // 1. Pega o objeto da requisição (request)
    const request = context.switchToHttp().getRequest();

    // 2. Pega o usuário que foi anexado à requisição pelo JwtGuard
    const user = request.user;

    // 3. Verifica se o usuário existe e se a sua 'role' é ADMIN
    if (user && user.role === Role.ADMIN) {
      // Se for, permite o acesso
      return true;
    }

    // 4. Se não for, bloqueia o acesso com uma exceção de "Acesso Proibido"
    throw new ForbiddenException(
      'Acesso negado. Recurso exclusivo para administradores.',
    );
  }
}
