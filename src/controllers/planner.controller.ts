import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';

export const getStudySessions = asyncHandler(async (req, res) => {
  const { start, end } = req.query;
  const userId = req.user.id;

  const sessions = await prisma.studySession.findMany({
    where: {
      userId,
      ...(start && end && {
        date: {
          gte: new Date(start as string),
          lte: new Date(end as string)
        }
      })
    },
    orderBy: { startTime: 'asc' }
  });

  return res.json(ApiResponse.success(sessions));
});

export const createStudySession = asyncHandler(async (req, res) => {
  const { title, type, startTime, endTime, duration, date, notes, tags } = req.body;
  const userId = req.user.id;

  const session = await prisma.studySession.create({
    data: {
      userId,
      title,
      type,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration: duration || 60,
      date: new Date(date),
      notes,
      tags: tags || [],
      status: 'SCHEDULED'
    }
  });

  return res.status(201).json(ApiResponse.success(session, 'Study session scheduled'));
});

export const updateStudySession = asyncHandler(async (req, res) => {
  const { title, type, startTime, endTime, duration, date, notes, tags, status } = req.body;

  const session = await prisma.studySession.update({
    where: { id: req.params.id, userId: req.user.id },
    data: {
      ...(title && { title }),
      ...(type && { type }),
      ...(startTime && { startTime: new Date(startTime) }),
      ...(endTime && { endTime: new Date(endTime) }),
      ...(duration !== undefined && { duration }),
      ...(date && { date: new Date(date) }),
      ...(notes !== undefined && { notes }),
      ...(tags && { tags }),
      ...(status && { status })
    }
  });

  return res.json(ApiResponse.success(session, 'Study session updated'));
});

export const deleteStudySession = asyncHandler(async (req, res) => {
  await prisma.studySession.deleteMany({
    where: { id: req.params.id, userId: req.user.id }
  });
  return res.json(ApiResponse.success(null, 'Study session cancelled/deleted'));
});

export const completeStudySession = asyncHandler(async (req, res) => {
  const session = await prisma.studySession.findFirst({
    where: { id: req.params.id, userId: req.user.id }
  });

  if (!session) throw new ApiError(404, 'Session not found');

  const updated = await prisma.studySession.update({
    where: { id: session.id },
    data: { status: 'COMPLETED' }
  });

  // Increment user stats hours studied
  const hours = session.duration / 60;
  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      hoursStudied: { increment: hours }
    }
  });

  // Log activity
  const progress = await prisma.progress.findUnique({ where: { userId: req.user.id } });
  if (progress) {
    const today = new Date();
    today.setHours(0,0,0,0);
    await prisma.activityLog.upsert({
      where: { progressId_date: { progressId: progress.id, date: today } },
      update: {
        hoursStudied: { increment: hours },
        activityCount: { increment: 1 }
      },
      create: {
        progressId: progress.id,
        date: today,
        hoursStudied: hours,
        activityCount: 1
      }
    });
  }

  return res.json(ApiResponse.success(updated, 'Study session marked as completed'));
});

export const getPlannerStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const totalSessions = await prisma.studySession.count({ where: { userId } });
  const completedSessions = await prisma.studySession.count({ where: { userId, status: 'COMPLETED' } });

  const agg = await prisma.studySession.aggregate({
    where: { userId, status: 'COMPLETED' },
    _sum: { duration: true }
  });

  return res.json(ApiResponse.success({
    totalScheduled: totalSessions,
    completed: completedSessions,
    totalMinutesStudied: agg._sum.duration || 0
  }));
});
