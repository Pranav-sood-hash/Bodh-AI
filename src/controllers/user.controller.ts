import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { uploadToCloudinary } from '../services/upload.service';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, firstName: true, lastName: true, email: true, avatar: true,
      bio: true, location: true, title: true, goal: true, level: true,
      topics: true, onboardingDone: true, createdAt: true,
    },
  });
  if (!user) throw new ApiError(404, 'User not found');
  return res.json(ApiResponse.success(user));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, bio, location, title, goal, level, topics } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(bio !== undefined && { bio }),
      ...(location !== undefined && { location }),
      ...(title !== undefined && { title }),
      ...(goal && { goal }),
      ...(level && { level }),
      ...(topics && { topics }),
    },
    select: {
      id: true, firstName: true, lastName: true, email: true, avatar: true,
      bio: true, location: true, title: true, goal: true, level: true, topics: true,
    },
  });

  return res.json(ApiResponse.success(user, 'Profile updated'));
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const { url } = await uploadToCloudinary(req.file.buffer, 'bodhai/avatars');

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { avatar: url },
    select: { id: true, avatar: true },
  });

  return res.json(ApiResponse.success(user, 'Avatar updated'));
});

export const getStats = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      topicsLearned: true, dayStreak: true, longestStreak: true,
      projectsBuilt: true, hoursStudied: true, totalChats: true, totalMessages: true,
    },
  });
  return res.json(ApiResponse.success(user));
});

export const updatePreferences = asyncHandler(async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: req.body,
    select: {
      theme: true, language: true, aiResponseLang: true, timezone: true,
      dateFormat: true, codeCommentsLang: true, rtlSupport: true,
      voiceEnabled: true, selectedVoice: true, voiceSpeed: true,
      autoPlayVoice: true, micSensitivity: true,
      notifLearning: true, notifRoadmap: true, notifProject: true,
      notifAchievement: true, notifAiUsage: true, notifWeekly: true, emailDigest: true,
    },
  });
  return res.json(ApiResponse.success(user, 'Preferences updated'));
});

export const saveOnboarding = asyncHandler(async (req, res) => {
  const { goal, level, topics } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { goal, level, topics, onboardingDone: true },
    select: { id: true, goal: true, level: true, topics: true, onboardingDone: true },
  });

  return res.json(ApiResponse.success(user, 'Onboarding completed'));
});

export const getSessions = asyncHandler(async (req, res) => {
  const sessions = await prisma.userSession.findMany({
    where: { userId: req.user.id, isActive: true },
    orderBy: { lastActiveAt: 'desc' },
  });
  return res.json(ApiResponse.success(sessions));
});

export const revokeSession = asyncHandler(async (req, res) => {
  await prisma.userSession.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });
  return res.json(ApiResponse.success(null, 'Session revoked'));
});

export const revokeAllSessions = asyncHandler(async (req, res) => {
  await prisma.userSession.updateMany({
    where: { userId: req.user.id },
    data: { isActive: false },
  });
  return res.json(ApiResponse.success(null, 'All sessions revoked'));
});

export const deleteAccount = asyncHandler(async (req, res) => {
  await prisma.user.delete({ where: { id: req.user.id } });
  return res.json(ApiResponse.success(null, 'Account deleted'));
});
