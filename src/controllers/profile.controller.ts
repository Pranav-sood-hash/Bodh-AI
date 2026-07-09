import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';

export const getPublicProfile = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  if (!slug || slug.trim() === '') {
    throw new ApiError(400, 'Profile slug is required');
  }

  const user = await prisma.user.findFirst({
    where: { profileSlug: slug, isProfilePublic: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatar: true,
      bio: true,
      location: true,
      title: true,
      portfolioLinks: true,
      createdAt: true,
      // Include statistics
      totalChats: true,
      projectsBuilt: true,
      hoursStudied: true,
      dayStreak: true,
      // Relations
      roadmaps: {
        where: { isActive: true },
        include: {
          milestones: {
            orderBy: { order: 'asc' },
          },
        },
      },
      projects: {
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          coverImage: true,
          progress: true,
          techStack: true,
        },
      },
      milestones: {
        orderBy: { earnedAt: 'desc' },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, 'Public profile not found or profile is set to private');
  }

  return res.json(ApiResponse.success(user));
});

export const getProfileSettings = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      profileSlug: true,
      isProfilePublic: true,
      portfolioLinks: true,
    },
  });

  return res.json(ApiResponse.success(user));
});

export const updateProfileSettings = asyncHandler(async (req, res) => {
  const { profileSlug, isProfilePublic, portfolioLinks } = req.body;
  const userId = req.user.id;

  // If slug is provided, validate uniqueness
  if (profileSlug && profileSlug.trim() !== '') {
    const slugLower = profileSlug.trim().toLowerCase();
    
    // Check regex format (alphanumeric, dashes, underscores)
    if (!/^[a-z0-9-_]+$/.test(slugLower)) {
      throw new ApiError(400, 'Profile slug can only contain letters, numbers, dashes, and underscores');
    }

    const existing = await prisma.user.findFirst({
      where: {
        profileSlug: slugLower,
        NOT: { id: userId },
      },
    });

    if (existing) {
      throw new ApiError(400, 'This profile slug is already taken. Please choose another one.');
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(profileSlug !== undefined && { profileSlug: profileSlug.trim().toLowerCase() }),
      ...(isProfilePublic !== undefined && { isProfilePublic }),
      ...(portfolioLinks !== undefined && { portfolioLinks }),
    },
    select: {
      profileSlug: true,
      isProfilePublic: true,
      portfolioLinks: true,
    },
  });

  return res.json(ApiResponse.success(updatedUser, 'Profile sharing settings updated successfully'));
});
