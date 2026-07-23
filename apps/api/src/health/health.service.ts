import { Injectable } from '@nestjs/common';
import type { HealthResponse, ReadinessResponse } from '@vita/types';
import { InfrastructureHealthService } from '../platform/infrastructure/infrastructure.module.js';

@Injectable()
export class HealthService {
  public constructor(private readonly infrastructure: InfrastructureHealthService) {}

  public health(): HealthResponse {
    return {
      service: 'vita-api',
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    };
  }

  public async readiness(): Promise<ReadinessResponse> {
    const [postgres, redis] = await Promise.all([
      this.infrastructure.postgresIsReady(),
      this.infrastructure.redisIsReady(),
    ]);
    return {
      ...this.health(),
      status: postgres && redis ? 'ok' : 'degraded',
      dependencies: { postgres: postgres ? 'up' : 'down', redis: redis ? 'up' : 'down' },
    };
  }
}
