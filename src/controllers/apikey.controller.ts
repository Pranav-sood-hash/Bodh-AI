import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { encrypt, keyPreview, decrypt } from '../services/encryption.service';
import { addKeySchema, updateKeySchema, routingSchema } from '../validations/apikey.schema';

const testProviderKey = async (
  provider: string,
  rawKey: string,
  customEndpoint?: string
): Promise<boolean> => {
  try {
    switch (provider) {
      case 'OPENAI': {
        const { OpenAI } = await import('openai');
        const client = new OpenAI({ apiKey: rawKey });
        await client.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 1
        });
        return true;
      }
      case 'ANTHROPIC': {
        const Anthropic = await import('@anthropic-ai/sdk');
        const client = new Anthropic.default({ apiKey: rawKey });
        await client.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hi' }]
        });
        return true;
      }
      case 'GEMINI': {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(rawKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        await model.generateContent('Hi');
        return true;
      }
      case 'COHERE': {
        const { CohereClientV2 } = await import('cohere-ai');
        const client = new CohereClientV2({ token: rawKey });
        await client.chat({
          model: 'command-r-plus-08-2024',
          messages: [{ role: 'user', content: 'Hi' }],
          maxTokens: 1
        });
        return true;
      }
      case 'GROQ': {
        const Groq = await import('groq-sdk');
        const client = new Groq.default({ apiKey: rawKey });
        await client.chat.completions.create({
          model: 'llama3-8b-8192',
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 1
        });
        return true;
      }
      default:
        return true;
    }
  } catch (err: any) {
    return false;
  }
};

export const addApiKey = asyncHandler(async (req, res) => {
  const { provider, apiKey, label, customEndpoint, customModel } = addKeySchema.parse(req.body);
  const userId = req.user.id;

  const isValid = await testProviderKey(provider, apiKey, customEndpoint);
  if (!isValid) {
    throw new ApiError(400, 'Invalid API key. Please check and try again.');
  }

  const encryptedKey = encrypt(apiKey);
  const preview = keyPreview(apiKey);

  const existingCount = await prisma.apiKey.count({ where: { userId } });
  const isPrimary = existingCount === 0;

  const key = await prisma.apiKey.create({
    data: {
      userId,
      provider: provider as any,
      encryptedKey,
      keyPreview: preview,
      label,
      isPrimary,
      customEndpoint,
      customModel
    },
    select: {
      id: true,
      provider: true,
      keyPreview: true,
      isActive: true,
      isPrimary: true,
      label: true,
      totalTokens: true,
      totalRequests: true,
      estimatedCost: true
    }
  });

  return res.status(201).json(ApiResponse.success(key, 'API key added successfully'));
});

export const getApiKeys = asyncHandler(async (req, res) => {
  const keys = await prisma.apiKey.findMany({
    where: { userId: req.user.id },
    select: {
      id: true,
      provider: true,
      keyPreview: true,
      isActive: true,
      isPrimary: true,
      label: true,
      totalTokens: true,
      totalRequests: true,
      estimatedCost: true,
      customEndpoint: true,
      customModel: true,
      routeLearning: true,
      routeCode: true,
      routeRoadmap: true,
      routePlanner: true,
      routeProject: true,
      createdAt: true
    }
  });
  return res.json(ApiResponse.success(keys));
});

export const updateApiKey = asyncHandler(async (req, res) => {
  const { label, isActive, customEndpoint, customModel } = updateKeySchema.parse(req.body);
  const key = await prisma.apiKey.update({
    where: { id: req.params.id, userId: req.user.id },
    data: {
      ...(label !== undefined && { label }),
      ...(isActive !== undefined && { isActive }),
      ...(customEndpoint !== undefined && { customEndpoint }),
      ...(customModel !== undefined && { customModel })
    }
  });
  return res.json(ApiResponse.success(key, 'API key updated'));
});

export const setPrimaryApiKey = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const keyId = req.params.id;

  await prisma.apiKey.updateMany({
    where: { userId },
    data: { isPrimary: false }
  });

  const updated = await prisma.apiKey.update({
    where: { id: keyId, userId },
    data: { isPrimary: true }
  });

  return res.json(ApiResponse.success(updated, 'Set primary API key successfully'));
});

export const configureRouting = asyncHandler(async (req, res) => {
  const { routeLearning, routeCode, routeRoadmap, routePlanner, routeProject } = routingSchema.parse(req.body);
  const updated = await prisma.apiKey.update({
    where: { id: req.params.id, userId: req.user.id },
    data: {
      ...(routeLearning !== undefined && { routeLearning }),
      ...(routeCode !== undefined && { routeCode }),
      ...(routeRoadmap !== undefined && { routeRoadmap }),
      ...(routePlanner !== undefined && { routePlanner }),
      ...(routeProject !== undefined && { routeProject })
    }
  });
  return res.json(ApiResponse.success(updated, 'Key routing updated'));
});

export const deleteApiKey = asyncHandler(async (req, res) => {
  await prisma.apiKey.delete({
    where: { id: req.params.id, userId: req.user.id }
  });
  return res.json(ApiResponse.success(null, 'API key deleted'));
});

export const revokeAllApiKeys = asyncHandler(async (req, res) => {
  await prisma.apiKey.deleteMany({
    where: { userId: req.user.id }
  });
  return res.json(ApiResponse.success(null, 'All API keys revoked'));
});

export const getUsageStats = asyncHandler(async (req, res) => {
  const stats = await prisma.apiKey.aggregate({
    where: { userId: req.user.id },
    _sum: {
      totalRequests: true,
      estimatedCost: true
    }
  });
  return res.json(ApiResponse.success({
    totalRequests: stats._sum.totalRequests || 0,
    estimatedCost: stats._sum.estimatedCost || 0
  }));
});

export const testApiKey = asyncHandler(async (req, res) => {
  const key = await prisma.apiKey.findFirst({
    where: { id: req.params.id, userId: req.user.id }
  });
  if (!key) throw new ApiError(404, 'API key not found');

  const rawKey = decrypt(key.encryptedKey);
  const isValid = await testProviderKey(key.provider, rawKey, key.customEndpoint || undefined);

  if (!isValid) {
    return res.json(ApiResponse.success({ valid: false }, 'API key is invalid'));
  }
  return res.json(ApiResponse.success({ valid: true }, 'API key is valid and connected'));
});
