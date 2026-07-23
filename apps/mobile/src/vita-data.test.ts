import { describe, expect, it } from 'vitest';
import { coachReply, initialData, readinessScore } from './vita-data';

describe('readinessScore', () => {
  it('is deterministic and bounded', () => {
    expect(readinessScore(initialData)).toBe(63);
    expect(
      readinessScore({ ...initialData, sleepHours: 100, sleepQuality: 5, waterMl: 100_000 }),
    ).toBeLessThanOrEqual(100);
  });
});

describe('coachReply', () => {
  it('interrupts normal optimisation for urgent symptoms', () => {
    expect(coachReply('I have chest pain during training', initialData)).toContain(
      'urgent medical help',
    );
  });

  it('uses confirmed nutrition data in its response', () => {
    expect(coachReply('What should I eat?', initialData)).toContain('76 g protein');
  });
});
