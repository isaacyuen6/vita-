import { describe, expect, it } from 'vitest';
import { healthResponseSchema } from './index.js';

describe('healthResponseSchema', () => {
  it('accepts a valid health contract', () => {
    expect(
      healthResponseSchema.parse({
        service: 'vita-api',
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '0.1.0',
      }).status,
    ).toBe('ok');
  });

  it('rejects an invalid timestamp', () => {
    expect(() =>
      healthResponseSchema.parse({
        service: 'vita-api',
        status: 'ok',
        timestamp: 'today',
        version: '0.1.0',
      }),
    ).toThrow();
  });
});
