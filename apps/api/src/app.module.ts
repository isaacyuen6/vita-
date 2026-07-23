import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module.js';
import { ConfigModule } from './platform/config/config.module.js';
import { InfrastructureModule } from './platform/infrastructure/infrastructure.module.js';

@Module({
  imports: [ConfigModule, InfrastructureModule, HealthModule],
})
export class AppModule {}
