import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: 'http://localhost:3001', // A origem exata do nosso frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
    credentials: true, // Permite que o frontend envie credenciais (importante para o futuro)
  });

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
