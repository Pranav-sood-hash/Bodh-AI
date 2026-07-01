import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';

export const getChats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;

  const [chats, total] = await Promise.all([
    prisma.chat.findMany({
      where: { userId },
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, title: true, mode: true, isPinned: true, folderId: true,
        messageCount: true, lastMessage: true, lastMessageAt: true,
        aiProvider: true, createdAt: true, updatedAt: true,
      },
    }),
    prisma.chat.count({ where: { userId } }),
  ]);

  return res.json(ApiResponse.success({ chats, total, page, pages: Math.ceil(total / limit) }));
});

export const createChat = asyncHandler(async (req, res) => {
  const { title, mode, aiProvider, folderId } = req.body;

  const chat = await prisma.chat.create({
    data: {
      userId: req.user.id,
      title: title || 'New Chat',
      mode: mode || 'FREE_CHAT',
      aiProvider: aiProvider || 'auto',
      folderId,
    },
  });

  await prisma.user.update({ where: { id: req.user.id }, data: { totalChats: { increment: 1 } } });

  return res.status(201).json(ApiResponse.success(chat, 'Chat created'));
});

export const getChat = asyncHandler(async (req, res) => {
  const chat = await prisma.chat.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        take: 100,
        select: {
          id: true, role: true, content: true, provider: true, model: true,
          totalTokens: true, createdAt: true,
          compareResponses: true,
        },
      },
    },
  });

  if (!chat) throw new ApiError(404, 'Chat not found');
  return res.json(ApiResponse.success(chat));
});

export const updateChat = asyncHandler(async (req, res) => {
  const { title, mode, aiProvider, folderId } = req.body;

  const chat = await prisma.chat.updateMany({
    where: { id: req.params.id, userId: req.user.id },
    data: {
      ...(title && { title }),
      ...(mode && { mode }),
      ...(aiProvider && { aiProvider }),
      ...(folderId !== undefined && { folderId }),
    },
  });

  return res.json(ApiResponse.success(chat, 'Chat updated'));
});

export const deleteChat = asyncHandler(async (req, res) => {
  await prisma.chat.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
  return res.json(ApiResponse.success(null, 'Chat deleted'));
});

export const togglePin = asyncHandler(async (req, res) => {
  const chat = await prisma.chat.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!chat) throw new ApiError(404, 'Chat not found');

  const updated = await prisma.chat.update({
    where: { id: chat.id },
    data: { isPinned: !chat.isPinned },
  });

  return res.json(ApiResponse.success(updated, updated.isPinned ? 'Chat pinned' : 'Chat unpinned'));
});

export const getPinnedChats = asyncHandler(async (req, res) => {
  const chats = await prisma.chat.findMany({
    where: { userId: req.user.id, isPinned: true },
    orderBy: { updatedAt: 'desc' },
  });
  return res.json(ApiResponse.success(chats));
});

export const searchChats = asyncHandler(async (req, res) => {
  const q = req.query.q as string;
  if (!q) throw new ApiError(400, 'Search query is required');

  const chats = await prisma.chat.findMany({
    where: {
      userId: req.user.id,
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { messages: { some: { content: { contains: q, mode: 'insensitive' } } } },
      ],
    },
    orderBy: { updatedAt: 'desc' },
    take: 20,
    select: { id: true, title: true, lastMessage: true, updatedAt: true },
  });

  return res.json(ApiResponse.success(chats));
});
