import { Global, Module } from '@nestjs/common';
import { parseApiEnvironment } from '@vita/config';

export const API_ENVIRONMENT = Symbol('API_ENVIRONMENT');

@Global()
@Module({
  providers: [{ provide: API_ENVIRONMENT, useFactory: () => parseApiEnvironment(process.env) }],
  exports: [API_ENVIRONMENT],
})
export class ConfigModule {}
