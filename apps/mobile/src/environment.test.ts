import { describe, expect, it } from 'vitest';

describe('mobile environment', () => {
  it('has a safe localhost API fallback', () => {
    expect(process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').toMatch(/^https?:\/\//);
  });
});
