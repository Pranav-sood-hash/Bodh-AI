import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      theme: true,
      language: true,
      aiResponseLang: true,
      timezone: true,
      dateFormat: true,
      codeCommentsLang: true,
      rtlSupport: true,
      voiceEnabled: true,
      selectedVoice: true,
      voiceSpeed: true,
      autoPlayVoice: true,
      micSensitivity: true,
      notifLearning: true,
      notifRoadmap: true,
      notifProject: true,
      notifAchievement: true,
      notifAiUsage: true,
      notifWeekly: true,
      emailDigest: true
    }
  });

  return res.json(ApiResponse.success(settings));
});

export const updateVoiceSettings = asyncHandler(async (req, res) => {
  const { voiceEnabled, selectedVoice, voiceSpeed, autoPlayVoice, micSensitivity } = req.body;

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(voiceEnabled !== undefined && { voiceEnabled }),
      ...(selectedVoice !== undefined && { selectedVoice }),
      ...(voiceSpeed !== undefined && { voiceSpeed }),
      ...(autoPlayVoice !== undefined && { autoPlayVoice }),
      ...(micSensitivity !== undefined && { micSensitivity })
    },
    select: {
      voiceEnabled: true,
      selectedVoice: true,
      voiceSpeed: true,
      autoPlayVoice: true,
      micSensitivity: true
    }
  });

  return res.json(ApiResponse.success(updated, 'Voice and audio settings updated'));
});

export const updateLanguageSettings = asyncHandler(async (req, res) => {
  const { language, aiResponseLang, codeCommentsLang, rtlSupport, timezone, dateFormat } = req.body;

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(language !== undefined && { language }),
      ...(aiResponseLang !== undefined && { aiResponseLang }),
      ...(codeCommentsLang !== undefined && { codeCommentsLang }),
      ...(rtlSupport !== undefined && { rtlSupport }),
      ...(timezone !== undefined && { timezone }),
      ...(dateFormat !== undefined && { dateFormat })
    },
    select: {
      language: true,
      aiResponseLang: true,
      codeCommentsLang: true,
      rtlSupport: true,
      timezone: true,
      dateFormat: true
    }
  });

  return res.json(ApiResponse.success(updated, 'Language and region settings updated'));
});

export const updateNotificationSettings = asyncHandler(async (req, res) => {
  const { notifLearning, notifRoadmap, notifProject, notifAchievement, notifAiUsage, notifWeekly, emailDigest } = req.body;

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(notifLearning !== undefined && { notifLearning }),
      ...(notifRoadmap !== undefined && { notifRoadmap }),
      ...(notifProject !== undefined && { notifProject }),
      ...(notifAchievement !== undefined && { notifAchievement }),
      ...(notifAiUsage !== undefined && { notifAiUsage }),
      ...(notifWeekly !== undefined && { notifWeekly }),
      ...(emailDigest !== undefined && { emailDigest })
    },
    select: {
      notifLearning: true,
      notifRoadmap: true,
      notifProject: true,
      notifAchievement: true,
      notifAiUsage: true,
      notifWeekly: true,
      emailDigest: true
    }
  });

  return res.json(ApiResponse.success(updated, 'Notification preferences updated'));
});

export const updateAppearanceSettings = asyncHandler(async (req, res) => {
  const { theme } = req.body;

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: { theme },
    select: { theme: true }
  });

  return res.json(ApiResponse.success(updated, 'Theme preference updated'));
});
