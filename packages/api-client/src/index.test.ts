import { describe, expect, it, vi } from 'vitest';
import { VitaApiClient } from './index.js';

describe('VitaApiClient', () => {
  it('validates a health response', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          service: 'vita-api',
          status: 'ok',
          timestamp: new Date().toISOString(),
          version: '0.1.0',
        }),
        { status: 200 },
      ),
    );
    await expect(new VitaApiClient('http://api.test', request).health()).resolves.toMatchObject({
      status: 'ok',
    });
  });
});
