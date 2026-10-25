import { VersioningType } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { loadConfig } from './config/env';

/**
 * Applies the HTTP policy shared by the local server and the Vercel function.
 *
 * Keeping this separate from NestFactory.create means the prefix, versioning, security
 * headers, and CORS allowlist cannot drift between the two entry points.
 */
export function configureApp(app: NestExpressApplication): NestExpressApplication {
  const config = loadConfig();

  app.use(helmet());
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.enableCors({
    origin: config.corsOrigins.length > 0 ? [...config.corsOrigins] : false,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86_400,
  });

  app.enableShutdownHooks();

  return app;
}
