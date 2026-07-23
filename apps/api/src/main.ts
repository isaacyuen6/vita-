import 'reflect-metadata';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { API_ENVIRONMENT } from './platform/config/config.module.js';
import type { ApiEnvironment } from '@vita/config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const environment = app.get<ApiEnvironment>(API_ENVIRONMENT);
  app.useLogger(new ConsoleLogger({ json: true }));
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.setGlobalPrefix('v1');
  app.enableCors({
    origin: environment.API_CORS_ORIGINS.split(',').map((origin) => origin.trim()),
  });
  app.enableShutdownHooks();

  const openApi = new DocumentBuilder().setTitle('Vita AI API').setVersion('0.1.0').build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, openApi));
  await app.listen(environment.API_PORT, environment.API_HOST);
}

void bootstrap();
