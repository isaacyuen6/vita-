export type ServiceStatus = 'ok' | 'degraded';
export type DependencyStatus = 'up' | 'down';

export interface HealthResponse {
  service: 'vita-api' | 'vita-ai-service';
  status: ServiceStatus;
  timestamp: string;
  version: string;
}

export interface ReadinessResponse extends HealthResponse {
  dependencies: Record<string, DependencyStatus>;
}
