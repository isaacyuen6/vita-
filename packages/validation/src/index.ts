import { z } from 'zod';

export const healthResponseSchema = z.object({
  service: z.enum(['vita-api', 'vita-ai-service']),
  status: z.enum(['ok', 'degraded']),
  timestamp: z.iso.datetime(),
  version: z.string().min(1),
});

export const readinessResponseSchema = healthResponseSchema.extend({
  dependencies: z.record(z.string(), z.enum(['up', 'down'])),
});
