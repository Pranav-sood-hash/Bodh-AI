import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';

export const getFolders = asyncHandler(async (req, res) => {
  const folders = await prisma.folder.findMany({
    where: { userId: req.user.id },
    include: { chats: true },
    orderBy: { createdAt: 'desc' }
  });
  return res.json(ApiResponse.success(folders));
});

export const createFolder = asyncHandler(async (req, res) => {
  const { name, color } = req.body;
  const folder = await prisma.folder.create({
    data: {
      userId: req.user.id,
      name,
      color: color || '#2563EB'
    }
  });
  return res.status(201).json(ApiResponse.success(folder, 'Folder created'));
});

export const updateFolder = asyncHandler(async (req, res) => {
  const { name, color } = req.body;
  const folder = await prisma.folder.update({
    where: { id: req.params.id, userId: req.user.id },
    data: {
      ...(name && { name }),
      ...(color && { color })
    }
  });
  return res.json(ApiResponse.success(folder, 'Folder updated'));
});

export const deleteFolder = asyncHandler(async (req, res) => {
  // Unlink chats in this folder first
  await prisma.chat.updateMany({
    where: { folderId: req.params.id, userId: req.user.id },
    data: { folderId: null }
  });

  await prisma.folder.delete({
    where: { id: req.params.id, userId: req.user.id }
  });

  return res.json(ApiResponse.success(null, 'Folder deleted'));
});

export const addChatToFolder = asyncHandler(async (req, res) => {
  const { chatId } = req.body;
  const folderId = req.params.id;

  const updatedChat = await prisma.chat.update({
    where: { id: chatId, userId: req.user.id },
    data: { folderId }
  });

  return res.json(ApiResponse.success(updatedChat, 'Chat added to folder'));
});
