import { Controller, Get, Header } from '@nestjs/common';
import { SERVICE_NAME } from '../app.constants';

export interface HealthStatus {
  readonly status: 'ok';
  readonly service: string;
  readonly version: string;
  readonly commit: string | null;
  readonly environment: string;
  readonly uptimeSeconds: number;
  readonly timestamp: string;
}

@Controller('health')
export class HealthController {
  /**
   * Liveness probe. T04 adds the Mongo and Redis readiness checks once those clients exist;
   * until then this endpoint only proves that the process booted and can serve traffic.
   */
  @Get()
  @Header('Cache-Control', 'no-store')
  check(): HealthStatus {
    return {
      status: 'ok',
      service: SERVICE_NAME,
      version: process.env.npm_package_version ?? '0.0.0',
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
