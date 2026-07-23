import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOkResponse, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import type { HealthResponse, ReadinessResponse } from '@vita/types';
import { HealthService } from './health.service.js';

@ApiTags('platform')
@Controller()
export class HealthController {
  public constructor(private readonly healthService: HealthService) {}

  @Get('health')
  @ApiOkResponse({ description: 'Process liveness' })
  public health(): HealthResponse {
    return this.healthService.health();
  }

  @Get('ready')
  @ApiOkResponse({ description: 'Infrastructure readiness' })
  @ApiServiceUnavailableResponse({ description: 'One or more dependencies are unavailable' })
  public async ready(): Promise<ReadinessResponse> {
    const readiness = await this.healthService.readiness();
    if (readiness.status === 'degraded') throw new ServiceUnavailableException(readiness);
    return readiness;
  }
}
