import { describe, expect, it } from 'vitest';
import { parseApiEnvironment } from './index.js';

describe('parseApiEnvironment', () => {
  it('coerces the port and applies defaults', () => {
    const config = parseApiEnvironment({
      DATABASE_URL: 'postgresql://localhost/vita',
      REDIS_URL: 'redis://localhost:6379',
      API_PORT: '3100',
    });
    expect(config.API_PORT).toBe(3100);
    expect(config.NODE_ENV).toBe('development');
  });

  it('rejects a non-PostgreSQL database', () => {
    expect(() =>
      parseApiEnvironment({
        DATABASE_URL: 'mysql://localhost/vita',
        REDIS_URL: 'redis://localhost:6379',
      }),
    ).toThrow();
  });
});
