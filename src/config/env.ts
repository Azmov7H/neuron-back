import { Logger } from '@nestjs/common';

export interface AppConfig {
  readonly nodeEnv: string;
  readonly isProduction: boolean;
  readonly corsOrigins: readonly string[];
}

const DEFAULT_DEVELOPMENT_ORIGINS = ['http://localhost:3000'] as const;

function parseOrigins(value: string, logger: Logger): string[] {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)
    .map((origin) => {
      const url = new URL(origin);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error(`CORS_ORIGINS contains an unsupported protocol: ${origin}`);
      }
      return url.origin;
    })
    .filter((origin, index, origins) => {
      if (origins.indexOf(origin) !== index) {
        logger.warn(`CORS_ORIGINS contains a duplicate entry: ${origin}`, 'Config');
        return false;
      }
      return true;
    });
}

/**
 * Reads and validates the runtime configuration once, at boot.
 *
 * Only values that are safe to expose in a deployment dashboard live here. Database, JWT, and
 * provider credentials are added in T04 with schema validation and secret redaction.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const logger = new Logger('Config');
  const nodeEnv = env.NODE_ENV ?? 'development';
  const isProduction = nodeEnv === 'production' || env.VERCEL_ENV === 'production';
  const rawOrigins = env.CORS_ORIGINS?.trim();

  const corsOrigins = rawOrigins
    ? parseOrigins(rawOrigins, logger)
    : isProduction
      ? []
      : [...DEFAULT_DEVELOPMENT_ORIGINS];

  if (isProduction && corsOrigins.length === 0) {
    logger.warn(
      'CORS_ORIGINS is empty: browser requests from the frontend origin will be rejected.',
      'Config',
    );
  }

  return { nodeEnv, isProduction, corsOrigins };
}
