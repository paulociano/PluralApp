import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();

    // Se um parâmetro (como 'id') for passado para o decorador,
    // retorne apenas aquela propriedade do usuário.
    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return request.user?.[data];
    }

    // Caso contrário, retorne o objeto de usuário inteiro.
    return request.user;
  },
);
