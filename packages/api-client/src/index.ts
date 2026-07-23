import type { HealthResponse } from '@vita/types';
import { healthResponseSchema } from '@vita/validation';

export class VitaApiClient {
  public constructor(
    private readonly baseUrl: string,
    private readonly request: typeof fetch = fetch,
  ) {}

  public async health(signal?: AbortSignal): Promise<HealthResponse> {
    const response = await this.request(
      `${this.baseUrl}/v1/health`,
      signal === undefined ? {} : { signal },
    );
    if (!response.ok)
      throw new Error(`Vita API health request failed with status ${response.status}`);
    return healthResponseSchema.parse(await response.json());
  }
}
