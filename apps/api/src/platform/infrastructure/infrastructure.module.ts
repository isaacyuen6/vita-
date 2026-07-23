import { Global, Inject, Injectable, Module, type OnModuleDestroy } from '@nestjs/common';
import type { ApiEnvironment } from '@vita/config';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { API_ENVIRONMENT } from '../config/config.module.js';

@Injectable()
export class InfrastructureHealthService implements OnModuleDestroy {
  private readonly postgres: Pool;
  private readonly redis: Redis;

  public constructor(@Inject(API_ENVIRONMENT) environment: ApiEnvironment) {
    this.postgres = new Pool({
      connectionString: environment.DATABASE_URL,
      max: 5,
      connectionTimeoutMillis: 2_000,
    });
    this.redis = new Redis(environment.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 2_000,
    });
  }

  public async postgresIsReady(): Promise<boolean> {
    try {
      await this.postgres.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  public async redisIsReady(): Promise<boolean> {
    try {
      if (this.redis.status === 'wait') await this.redis.connect();
      return (await this.redis.ping()) === 'PONG';
    } catch {
      return false;
    }
  }

  public async onModuleDestroy(): Promise<void> {
    await this.postgres.end();
    if (this.redis.status !== 'end') this.redis.disconnect();
  }
}

@Global()
@Module({ providers: [InfrastructureHealthService], exports: [InfrastructureHealthService] })
export class InfrastructureModule {}
