import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';

export const createRoom = asyncHandler(async (req, res) => {
  const { name, description, topic, isPublic } = req.body;
  const userId = req.user.id;

  if (!name || name.trim() === '') {
    throw new ApiError(400, 'Room name is required');
  }

  const room = await prisma.collabRoom.create({
    data: {
      name,
      description,
      topic,
      isPublic: isPublic !== undefined ? isPublic : true,
      createdBy: userId,
      members: {
        create: {
          userId,
          role: 'admin',
          isOnline: true,
          lastSeenAt: new Date(),
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
      },
    },
  });

  return res.status(201).json(ApiResponse.success(room, 'Collaborative chat room created successfully'));
});

export const listRooms = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Retrieve public rooms, and private rooms where the user is a member
  const rooms = await prisma.collabRoom.findMany({
    where: {
      OR: [
        { isPublic: true },
        {
          members: {
            some: { userId },
          },
        },
      ],
    },
    include: {
      members: {
        select: { userId: true },
      },
      _count: {
        select: { messages: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.json(ApiResponse.success(rooms));
});

export const getRoomMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;

  // Verify membership or public
  const room = await prisma.collabRoom.findUnique({
    where: { id: roomId },
    include: { members: true },
  });

  if (!room) {
    throw new ApiError(404, 'Room not found');
  }

  if (!room.isPublic && !room.members.some((m) => m.userId === userId)) {
    throw new ApiError(403, 'Access denied to this private room');
  }

  const messages = await prisma.roomMessage.findMany({
    where: { roomId },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return res.json(ApiResponse.success(messages));
});

export const getRoomMembers = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;

  // Verify room exists
  const room = await prisma.collabRoom.findUnique({
    where: { id: roomId },
    include: { members: true },
  });

  if (!room) {
    throw new ApiError(404, 'Room not found');
  }

  if (!room.isPublic && !room.members.some((m) => m.userId === userId)) {
    throw new ApiError(403, 'Access denied to this private room');
  }

  const members = await prisma.roomMember.findMany({
    where: { roomId },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
    },
  });

  return res.json(ApiResponse.success(members));
});
