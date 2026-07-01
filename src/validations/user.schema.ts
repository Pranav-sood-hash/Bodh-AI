import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  title: z.string().max(100).optional(),
  goal: z.string().optional(),
  level: z.string().optional(),
  topics: z.array(z.string()).optional(),
});

export const onboardingSchema = z.object({
  goal: z.string().min(1, 'Learning goal is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  topics: z.array(z.string()).min(1, 'Select at least one topic'),
});

export const updatePreferencesSchema = z.object({
  theme: z.string().optional(),
  language: z.string().optional(),
  aiResponseLang: z.string().optional(),
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
  codeCommentsLang: z.string().optional(),
  rtlSupport: z.boolean().optional(),
  voiceEnabled: z.boolean().optional(),
  selectedVoice: z.string().optional(),
  voiceSpeed: z.number().min(0.5).max(2).optional(),
  autoPlayVoice: z.boolean().optional(),
  micSensitivity: z.number().min(0).max(100).optional(),
  notifLearning: z.boolean().optional(),
  notifRoadmap: z.boolean().optional(),
  notifProject: z.boolean().optional(),
  notifAchievement: z.boolean().optional(),
  notifAiUsage: z.boolean().optional(),
  notifWeekly: z.boolean().optional(),
  emailDigest: z.enum(['daily', 'weekly', 'none']).optional(),
});
