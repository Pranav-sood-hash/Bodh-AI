import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';

export const getProgress = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  let progress = await prisma.progress.findUnique({
    where: { userId },
    include: {
      activityLogs: { orderBy: { date: 'asc' } },
      topicMastery: true,
      milestones: { orderBy: { earnedAt: 'desc' } }
    }
  });

  if (!progress) {
    progress = await prisma.progress.create({
      data: { userId },
      include: {
        activityLogs: true,
        topicMastery: true,
        milestones: true
      }
    });
  }

  return res.json(ApiResponse.success(progress));
});

export const getActivityHeatmap = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const year = parseInt(req.query.year as string) || new Date().getFullYear();

  const progress = await prisma.progress.findUnique({ where: { userId } });
  if (!progress) return res.json(ApiResponse.success([]));

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  const logs = await prisma.activityLog.findMany({
    where: {
      progressId: progress.id,
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      date: true,
      activityCount: true,
      hoursStudied: true
    }
  });

  return res.json(ApiResponse.success(logs));
});

export const getProgressStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const progress = await prisma.progress.findUnique({
    where: { userId },
    include: {
      topicMastery: true,
      milestones: true
    }
  });

  if (!progress) return res.json(ApiResponse.success({ topicMastery: [], milestones: [] }));

  return res.json(ApiResponse.success({
    topicMastery: progress.topicMastery,
    milestones: progress.milestones
  }));
});

export const logActivity = asyncHandler(async (req, res) => {
  const { hoursStudied, activityCount, date } = req.body;
  const userId = req.user.id;

  let progress = await prisma.progress.findUnique({ where: { userId } });
  if (!progress) {
    progress = await prisma.progress.create({ data: { userId } });
  }

  const logDate = date ? new Date(date) : new Date();
  logDate.setHours(0,0,0,0);

  const updatedLog = await prisma.activityLog.upsert({
    where: {
      progressId_date: {
        progressId: progress.id,
        date: logDate
      }
    },
    update: {
      activityCount: { increment: activityCount || 1 },
      hoursStudied: { increment: hoursStudied || 0 }
    },
    create: {
      progressId: progress.id,
      date: logDate,
      activityCount: activityCount || 1,
      hoursStudied: hoursStudied || 0
    }
  });

  // Also update parent User totals
  if (hoursStudied) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        hoursStudied: { increment: hoursStudied }
      }
    });
  }

  return res.json(ApiResponse.success(updatedLog, 'Study activity logged successfully'));
});

export const addMilestone = asyncHandler(async (req, res) => {
  const { title, type, metadata } = req.body;
  const userId = req.user.id;

  let progress = await prisma.progress.findUnique({ where: { userId } });
  if (!progress) {
    progress = await prisma.progress.create({ data: { userId } });
  }

  const milestone = await prisma.milestone.create({
    data: {
      progressId: progress.id,
      userId,
      title,
      type,
      metadata
    }
  });

  return res.status(201).json(ApiResponse.success(milestone, 'Milestone achievement saved'));
});
