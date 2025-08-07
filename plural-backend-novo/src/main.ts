import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Garante que apenas as propriedades definidas no DTO sejam aceitas
      forbidNonWhitelisted: true, // Lança um erro se propriedades extras forem enviadas
      transform: true, // Transforma os dados de entrada para os tipos do DTO
    }),
  );
  await app.listen(3000);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
