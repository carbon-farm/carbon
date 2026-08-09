import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unknown properties — matches Mission FR-M3's
      // "structured, not optional" data discipline at the API boundary
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT ?? 7000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Organic Carbon Farming backend (Stage 1) listening on http://localhost:${port}/api/v1`);
}

bootstrap();
