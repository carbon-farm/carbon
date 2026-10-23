import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression = require('compression');
import { AppModule } from './app.module';
import { allowedOrigins, isOriginAllowed } from './common/cors-origins';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Render (like most hosts) puts a proxy in front of the app. Trust exactly one hop so the
  // rate limiter sees each visitor's own address instead of the proxy's — otherwise everyone
  // would share one limit.
  app.set('trust proxy', 1);

  // Standard security headers (no sniffing, no framing, strict transport on HTTPS…). This is a
  // JSON API, so the default policy is fine as it is.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  // Smaller responses on slow mobile networks.
  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unknown properties — matches Mission FR-M3's
      // "structured, not optional" data discipline at the API boundary
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Only our own web app (and local development) may call the API from a browser. Requests with
  // no Origin header (the health ping, curl, server-to-server) are not browsers and pass.
  const origins = allowedOrigins(process.env.CORS_ORIGINS);
  app.enableCors({
    origin: (origin, callback) => callback(null, isOriginAllowed(origin, origins)),
    credentials: false,
  });
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT ?? 7000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Organic Carbon Farming backend (Stage 1) listening on http://localhost:${port}/api/v1`);
}

bootstrap();
