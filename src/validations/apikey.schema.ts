import { z } from 'zod';

export const addKeySchema = z.object({
  provider: z.enum(['OPENAI', 'ANTHROPIC', 'GEMINI', 'MISTRAL', 'GROQ', 'TOGETHER', 'COHERE', 'CUSTOM']),
  apiKey: z.string().min(10, 'API key is too short'),
  label: z.string().optional(),
  customEndpoint: z.string().url().optional(),
  customModel: z.string().optional(),
});

export const updateKeySchema = z.object({
  label: z.string().optional(),
  isActive: z.boolean().optional(),
  customEndpoint: z.string().url().optional(),
  customModel: z.string().optional(),
});

export const routingSchema = z.object({
  routeLearning: z.string().optional(),
  routeCode: z.string().optional(),
  routeRoadmap: z.string().optional(),
  routePlanner: z.string().optional(),
  routeProject: z.string().optional(),
});
