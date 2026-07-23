import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { logger } from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userFirstName?: string;
  userLastName?: string;
}

let io: SocketIOServer | null = null;

// Track online users globally
// roomId -> Set of userIds
const activeRoomUsers = new Map<string, Set<string>>();

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:8080',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  } as any);

  // Authentication Middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token as string, process.env.JWT_ACCESS_SECRET!) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, firstName: true, lastName: true },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      socket.userFirstName = user.firstName;
      socket.userLastName = user.lastName;
      next();
    } catch (err) {
      logger.error('Socket authentication failed:', err);
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    logger.info(`User connected to socket: ${userId} (${socket.userFirstName})`);

    // Handle joining room
    socket.on('join-room', async ({ roomId }: { roomId: string }, callback) => {
      try {
        // Verify room exists
        const room = await prisma.collabRoom.findUnique({
          where: { id: roomId },
          include: { members: true },
        });

        if (!room) {
          if (callback) callback({ error: 'Room not found' });
          return;
        }

        // If private room, check membership. If not a member, add as member.
        let isMember = room.members.some((m) => m.userId === userId);
        if (!isMember) {
          await prisma.roomMember.create({
            data: {
              roomId,
              userId,
              role: 'member',
              isOnline: true,
              lastSeenAt: new Date(),
            },
          });
        } else {
          // Update status to online
          await prisma.roomMember.update({
            where: { roomId_userId: { roomId, userId } },
            data: { isOnline: true, lastSeenAt: new Date() },
          });
        }

        socket.join(roomId);

        // Track user in active users Map
        if (!activeRoomUsers.has(roomId)) {
          activeRoomUsers.set(roomId, new Set());
        }
        activeRoomUsers.get(roomId)!.add(userId);

        // Fetch refreshed members
        const updatedMembers = await prisma.roomMember.findMany({
          where: { roomId },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
          },
        });

        // Broadcast to room that user joined/updated
        io!.to(roomId).emit('room-members-updated', {
          roomId,
          members: updatedMembers,
        });

        logger.info(`User ${userId} joined room ${roomId}`);
        if (callback) callback({ success: true, members: updatedMembers });
      } catch (err: any) {
        logger.error(`Error in join-room: ${err.message}`);
        if (callback) callback({ error: err.message });
      }
    });

    // Handle sending room message
    socket.on('send-room-message', async ({ roomId, content }: { roomId: string; content: string }, callback) => {
      try {
        if (!content || content.trim() === '') {
          if (callback) callback({ error: 'Message content required' });
          return;
        }

        // Save message to database
        const roomMessage = await prisma.roomMessage.create({
          data: {
            roomId,
            userId,
            content,
            type: 'TEXT',
          },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
          },
        });

        // Broadcast message to everyone in room
        io!.to(roomId).emit('room-message', roomMessage);

        logger.info(`Message sent in room ${roomId} by ${userId}`);
        if (callback) callback({ success: true, message: roomMessage });
      } catch (err: any) {
        logger.error(`Error in send-room-message: ${err.message}`);
        if (callback) callback({ error: err.message });
      }
    });

    // Handle typing indicator
    socket.on('typing', ({ roomId, isTyping }: { roomId: string; isTyping: boolean }) => {
      socket.to(roomId).emit('user-typing', {
        userId,
        userName: `${socket.userFirstName} ${socket.userLastName}`,
        isTyping,
      });
    });

    // Handle leaving room explicitly
    socket.on('leave-room', async ({ roomId }: { roomId: string }, callback) => {
      try {
        socket.leave(roomId);

        // Update online status in database
        await prisma.roomMember.update({
          where: { roomId_userId: { roomId, userId } },
          data: { isOnline: false, lastSeenAt: new Date() },
        });

        if (activeRoomUsers.has(roomId)) {
          activeRoomUsers.get(roomId)!.delete(userId);
        }

        // Broadcast refreshed members list
        const updatedMembers = await prisma.roomMember.findMany({
          where: { roomId },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
          },
        });

        io!.to(roomId).emit('room-members-updated', {
          roomId,
          members: updatedMembers,
        });

        logger.info(`User ${userId} left room ${roomId}`);
        if (callback) callback({ success: true });
      } catch (err: any) {
        logger.error(`Error in leave-room: ${err.message}`);
        if (callback) callback({ error: err.message });
      }
    });

    socket.on('disconnecting', async () => {
      // Handle automatic room updates on sudden disconnect
      for (const roomId of socket.rooms) {
        if (roomId === socket.id) continue;
        try {
          await prisma.roomMember.update({
            where: { roomId_userId: { roomId, userId } },
            data: { isOnline: false, lastSeenAt: new Date() },
          });

          if (activeRoomUsers.has(roomId)) {
            activeRoomUsers.get(roomId)!.delete(userId);
          }

          const updatedMembers = await prisma.roomMember.findMany({
            where: { roomId },
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, avatar: true },
              },
            },
          });

          io!.to(roomId).emit('room-members-updated', {
            roomId,
            members: updatedMembers,
          });
        } catch (err: any) {
          logger.error(`Error in disconnecting room cleanup: ${err.message}`);
        }
      }
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${userId}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
