import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

/**
 * Builds the HTTP application without binding a port. Used by the HTTP test suite.
 */
export async function createApp(): Promise<NestExpressApplication> {
  return configureApp(await NestFactory.create<NestExpressApplication>(AppModule));
}
