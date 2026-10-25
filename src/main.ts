import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

const logger = new Logger('Bootstrap');

async function bootstrap(): Promise<void> {
  const app = configureApp(await NestFactory.create<NestExpressApplication>(AppModule));
  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Neuron API listening on port ${process.env.PORT ?? 3000}`, 'Bootstrap');
}

bootstrap().catch((error: unknown) => {
  logger.error(
    'Neuron API failed to start',
    error instanceof Error ? error.stack : String(error),
    'Bootstrap',
  );
  process.exitCode = 1;
});
