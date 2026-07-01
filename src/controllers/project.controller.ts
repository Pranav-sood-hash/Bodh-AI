import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';

export const getProjects = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { sprints: true }
    }),
    prisma.project.count({ where: { userId } })
  ]);

  return res.json(ApiResponse.success({
    projects,
    total,
    page,
    pages: Math.ceil(total / limit)
  }));
});

export const createProject = asyncHandler(async (req, res) => {
  const { name, description, priority, techStack, coverImage } = req.body;
  const userId = req.user.id;

  const project = await prisma.project.create({
    data: {
      userId,
      name,
      description,
      priority: priority || 'MEDIUM',
      techStack: techStack || [],
      coverImage: coverImage || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop',
      progress: 0,
      progressLabel: 'Planning Stage',
      sprints: {
        create: [
          { name: 'Sprint 1: Architecture & Design', status: 'IN_PROGRESS', tasks: ['Define tech stack details', 'Draw layout diagrams', 'Set up GitHub Repo'] },
          { name: 'Sprint 2: Core Components', status: 'PLANNED', tasks: ['Implement baseline routing', 'Setup database schemas', 'Create primary views'] }
        ]
      }
    },
    include: {
      sprints: true
    }
  });

  await prisma.user.update({
    where: { id: userId },
    data: { projectsBuilt: { increment: 1 } }
  });

  return res.status(201).json(ApiResponse.success(project, 'Project workspace created'));
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await prisma.project.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { sprints: true }
  });

  if (!project) throw new ApiError(404, 'Project workspace not found');
  return res.json(ApiResponse.success(project));
});

export const updateProject = asyncHandler(async (req, res) => {
  const { name, description, status, priority, techStack, progress, progressLabel } = req.body;

  const project = await prisma.project.update({
    where: { id: req.params.id, userId: req.user.id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(techStack && { techStack }),
      ...(progress !== undefined && { progress }),
      ...(progressLabel !== undefined && { progressLabel })
    },
    include: { sprints: true }
  });

  return res.json(ApiResponse.success(project, 'Project updated'));
});

export const deleteProject = asyncHandler(async (req, res) => {
  await prisma.project.deleteMany({
    where: { id: req.params.id, userId: req.user.id }
  });
  return res.json(ApiResponse.success(null, 'Project deleted'));
});

export const getProjectStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [totalCount, completedCount, inProgressCount] = await Promise.all([
    prisma.project.count({ where: { userId } }),
    prisma.project.count({ where: { userId, status: 'COMPLETED' } }),
    prisma.project.count({ where: { userId, status: 'IN_PROGRESS' } })
  ]);

  return res.json(ApiResponse.success({
    total: totalCount,
    completed: completedCount,
    inProgress: inProgressCount
  }));
});
