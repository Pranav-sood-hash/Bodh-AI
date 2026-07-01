import { z } from 'zod';

export const sendMessageSchema = z.object({
  chatId: z.string().min(1, 'Chat ID is required'),
  content: z.string().min(1, 'Message content is required'),
  provider: z.string().optional().default('auto'),
  model: z.string().optional(),
  mode: z.string().optional(),
});

export const createChatSchema = z.object({
  title: z.string().optional().default('New Chat'),
  mode: z.enum(['LEARNING', 'CODE_HELPER', 'PROJECT_BUILDER', 'ROADMAP_BUILDER', 'STUDY_PLANNER', 'INTERVIEW_PREP', 'QUIZ', 'FREE_CHAT']).optional().default('FREE_CHAT'),
  aiProvider: z.string().optional().default('auto'),
  folderId: z.string().optional(),
});
