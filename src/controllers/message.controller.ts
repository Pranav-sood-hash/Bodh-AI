import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { callAI, calculateCost } from '../services/ai/ai.router.service';
import { decrypt } from '../services/encryption.service';
import { logStudyActivity } from '../utils/progress';

export const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, content, provider, model, mode } = req.body;
  const userId = req.user.id;

  const chat = await prisma.chat.findFirst({ where: { id: chatId, userId } });
  if (!chat) throw new ApiError(404, 'Chat not found');

  // Save user message
  const userMsg = await prisma.message.create({
    data: { chatId, userId, role: 'USER', content },
  });

  // Get conversation history (last 20)
  const history = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: 'asc' },
    take: 20,
    select: { role: true, content: true },
  });

  const selectedProvider = (!provider || provider === 'auto') ? (process.env.DEFAULT_AI_PROVIDER || 'GROQ') : provider;
  const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];

  if (!rawKey) {
    throw new ApiError(500, `API key for provider ${selectedProvider} is not configured on the server.`);
  }

  const messages = history.map(m => ({
    role: m.role === 'USER' ? 'user' : 'assistant',
    content: m.content,
  }));

  const aiResult = await callAI({
    provider: selectedProvider,
    rawKey,
    model,
    messages,
    mode: mode || chat.mode,
  });

  // Save assistant message
  const assistantMsg = await prisma.message.create({
    data: {
      chatId, userId, role: 'ASSISTANT',
      content: aiResult.content,
      provider: selectedProvider,
      model: aiResult.model,
      promptTokens: aiResult.tokens.prompt,
      completionTokens: aiResult.tokens.completion,
      totalTokens: aiResult.tokens.total,
    },
  });

  let updatedTitle = chat.title;
  if (chat.title === 'New Chat' || chat.title === 'Untitled Chat') {
    try {
      const titlePrompt = `Based on the following first message in a conversation, generate a short, concise, and clean 3-5 word chat title that captures the core topic. Do not include quotes or surrounding punctuation.
Message: "${content}"`;
      const titleResult = await callAI({
        provider: selectedProvider,
        rawKey,
        messages: [{ role: 'user', content: titlePrompt }],
        mode: 'FREE_CHAT',
      });
      const generatedTitle = titleResult.content.replace(/["']/g, '').trim();
      if (generatedTitle && generatedTitle.length > 2) {
        updatedTitle = generatedTitle;
      }
    } catch (err: any) {
      console.error('Failed to generate AI chat title, falling back:', err.message);
      updatedTitle = content.slice(0, 40) + '...';
    }
  }

  // Update chat metadata
  await prisma.chat.update({
    where: { id: chatId },
    data: {
      messageCount: { increment: 2 },
      lastMessage: aiResult.content.slice(0, 100),
      lastMessageAt: new Date(),
      title: updatedTitle,
    },
  });

  // Update user stats
  await prisma.user.update({
    where: { id: userId },
    data: { totalMessages: { increment: 2 }, lastActiveDate: new Date() },
  });

  await logStudyActivity(userId, 0.1, 2);

  return res.status(200).json(ApiResponse.success({
    userMessage: userMsg,
    assistantMessage: assistantMsg,
    usage: aiResult.tokens,
  }));
});

export const streamMessage = asyncHandler(async (req, res) => {
  // SSE streaming — simplified version
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const { chatId, content, provider, model, mode } = req.body;
  const userId = req.user.id;

  try {
    const selectedProvider = (!provider || provider === 'auto') ? (process.env.DEFAULT_AI_PROVIDER || 'GROQ') : provider;
    const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];

    if (!rawKey) {
      res.write(`data: ${JSON.stringify({ error: `API key for provider ${selectedProvider} is not configured on the server.` })}\n\n`);
      return res.end();
    }

    const history = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      take: 20,
      select: { role: true, content: true },
    });

    const messages = history.map(m => ({
      role: m.role === 'USER' ? 'user' : 'assistant',
      content: m.content,
    }));

    // Non-streaming fallback for now (full AI call)
    const aiResult = await callAI({ provider: selectedProvider, rawKey, model, messages, mode: mode || 'FREE_CHAT' });

    // Send full response as SSE chunks
    const chunks = aiResult.content.match(/.{1,50}/g) || [aiResult.content];
    for (const chunk of chunks) {
      res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`);
    }

    // Save messages
    await prisma.message.create({ data: { chatId, userId, role: 'USER', content } });
    await prisma.message.create({
      data: {
        chatId, userId, role: 'ASSISTANT', content: aiResult.content,
        provider: selectedProvider, model: aiResult.model,
      },
    });

    // Update user stats
    await prisma.user.update({
      where: { id: userId },
      data: { totalMessages: { increment: 2 }, lastActiveDate: new Date() },
    });

    await logStudyActivity(userId, 0.1, 2);

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

export const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;

  const chat = await prisma.chat.findFirst({ where: { id: chatId, userId: req.user.id } });
  if (!chat) throw new ApiError(404, 'Chat not found');

  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: 'asc' },
    skip: (page - 1) * limit,
    take: limit,
    include: { compareResponses: true },
  });

  return res.json(ApiResponse.success(messages));
});

export const deleteMessage = asyncHandler(async (req, res) => {
  await prisma.message.delete({ where: { id: req.params.id } });
  return res.json(ApiResponse.success(null, 'Message deleted'));
});
