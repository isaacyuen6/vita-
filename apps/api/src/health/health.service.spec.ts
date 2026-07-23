import { describe, expect, it } from 'vitest';
import type { InfrastructureHealthService } from '../platform/infrastructure/infrastructure.module.js';
import { HealthService } from './health.service.js';

describe('HealthService', () => {
  it('reports ready when both dependencies respond', async () => {
    const infrastructure = {
      postgresIsReady: () => Promise.resolve(true),
      redisIsReady: () => Promise.resolve(true),
    } as InfrastructureHealthService;
    await expect(new HealthService(infrastructure).readiness()).resolves.toMatchObject({
      status: 'ok',
      dependencies: { postgres: 'up', redis: 'up' },
    });
  });

  it('reports degraded without inventing dependency detail', async () => {
    const infrastructure = {
      postgresIsReady: () => Promise.resolve(false),
      redisIsReady: () => Promise.resolve(true),
    } as InfrastructureHealthService;
    await expect(new HealthService(infrastructure).readiness()).resolves.toMatchObject({
      status: 'degraded',
      dependencies: { postgres: 'down', redis: 'up' },
    });
  });
});
