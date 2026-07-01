import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { callAI } from '../services/ai/ai.router.service';

export const getRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await prisma.roadmap.findFirst({
    where: { userId: req.user.id, isActive: true },
    include: {
      milestones: {
        orderBy: { order: 'asc' }
      }
    }
  });

  return res.json(ApiResponse.success(roadmap));
});

export const suggestFocusAreas = asyncHandler(async (req, res) => {
  const { topic } = req.query;
  if (!topic || typeof topic !== 'string') {
    return res.json(ApiResponse.success([]));
  }

  const selectedProvider = process.env.DEFAULT_AI_PROVIDER || 'GROQ';
  const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];

  let focusAreas: string[] = [];
  if (rawKey) {
    try {
      const prompt = `Provide a list of 4-6 key focus areas or subtopics to learn for the topic: "${topic}".
Output exactly a JSON array of strings. For example: ["Hooks & State Management", "Routing", "Next.js"].
Do not include markdown code block syntax. Only return JSON.`;

      const aiResult = await callAI({
        provider: selectedProvider,
        rawKey,
        messages: [{ role: 'user', content: prompt }],
        mode: 'ROADMAP_BUILDER'
      });
      const cleanJson = aiResult.content.replace(/```json/g, '').replace(/```/g, '').trim();
      focusAreas = JSON.parse(cleanJson);
    } catch (err) {
      console.error('Failed to suggest focus areas via AI:', err);
    }
  }

  // Fallback focus areas
  if (!Array.isArray(focusAreas) || focusAreas.length === 0) {
    const t = topic.toLowerCase();
    if (t.includes('react')) {
      focusAreas = ['Hooks & State Management', 'Routing & Navigation', 'Performance Optimization', 'Testing React Apps', 'Next.js & SSR'];
    } else if (t.includes('machine') || t.includes('ml') || t.includes('learning')) {
      focusAreas = ['Math & Statistics', 'Supervised Learning', 'Neural Networks & Deep Learning', 'Model Evaluation & Tuning', 'Deployment & MLOps'];
    } else if (t.includes('cyber') || t.includes('security')) {
      focusAreas = ['Network Security', 'Cryptography', 'Penetration Testing', 'Incident Response', 'Compliance & Risk'];
    } else {
      focusAreas = ['Foundational Concepts', 'Core Implementations', 'Advanced Techniques', 'Project Deployment', 'Testing & Maintenance'];
    }
  }

  return res.json(ApiResponse.success(focusAreas));
});

export const generateRoadmap = asyncHandler(async (req, res) => {
  const { goal, title, level, estimatedWeeks, focusAreas } = req.body;
  const userId = req.user.id;

  const selectedProvider = process.env.DEFAULT_AI_PROVIDER || 'GROQ';
  const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];

  // Attempt to call AI with retry logic
  let generatedMilestones: any[] = [];
  const targetTopic = title || goal || 'AI/ML';

  if (rawKey) {
    const prompt = `Design a step-by-step learning path / roadmap for the goal: "${targetTopic}". 
Level: ${level || 'intermediate'}.
Estimated duration: ${estimatedWeeks || 8} weeks.
Focused sub-areas to include: ${focusAreas && focusAreas.length > 0 ? focusAreas.join(', ') : 'general curriculum'}.

Output exactly a JSON array of milestones. Each milestone object must have:
- title: string
- description: string
- estimatedHours: number
- order: number (starting at 1)
- tags: array of strings
- currentModule: string (brief description of module 1 content)
- resources: array of strings (e.g. ['MDN Web Docs', 'React Documentation'])
- skillsGained: array of strings (e.g. ['State management', 'Component lifecycles'])

Only return JSON. Do not include markdown code block syntax.`;

    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts && generatedMilestones.length === 0) {
      attempts++;
      try {
        const aiResult = await callAI({
          provider: selectedProvider,
          rawKey,
          messages: [{ role: 'user', content: prompt }],
          mode: 'ROADMAP_BUILDER'
        });

        const cleanJson = aiResult.content.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          generatedMilestones = parsed;
        }
      } catch (err: any) {
        console.error(`AI generate attempt ${attempts} failed:`, err.message);
      }
    }
  }

  // Production fallback milestones if no API key or AI call failed
  if (generatedMilestones.length === 0) {
    generatedMilestones = [
      {
        title: 'Foundations of ' + targetTopic,
        description: 'Learn the fundamental mathematical and algorithmic structures necessary for this domain.',
        estimatedHours: 12,
        order: 1,
        tags: ['Foundations', 'Core Concepts'],
        currentModule: 'Introduction to Core Terminology and Basics',
        resources: ['W3Schools Guide', 'Official Setup Documentation'],
        skillsGained: ['Environment setup', 'Basic configuration']
      },
      {
        title: 'Core Implementation & Practices',
        description: 'Dive deep into practical development workflows, tooling, and framework setups.',
        estimatedHours: 18,
        order: 2,
        tags: ['Practical', 'Workflows'],
        currentModule: 'Building your first application module',
        resources: ['MDN Guides', 'GitHub Best Practices'],
        skillsGained: ['Module design', 'Source control integration']
      },
      {
        title: 'Advanced Domain Architecture',
        description: 'Build production-grade applications deploying best patterns and performance profiles.',
        estimatedHours: 24,
        order: 3,
        tags: ['Architecture', 'Optimization'],
        currentModule: 'Configuring CI/CD pipelines and deployment parameters',
        resources: ['Google Developers Path', 'Production Best Practices Guide'],
        skillsGained: ['CI/CD workflow setup', 'Deployment engineering']
      }
    ];
  }

  // Deactivate existing roadmaps
  await prisma.roadmap.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false }
  });

  const roadmap = await prisma.roadmap.create({
    data: {
      userId,
      title: targetTopic,
      description: `Structured roadmap generated for ${goal || targetTopic}.`,
      goal: goal || targetTopic,
      estimatedWeeks: estimatedWeeks || 8,
      isAIGenerated: !!rawKey,
      isActive: true,
      milestones: {
        create: generatedMilestones.map((m: any, idx: number) => ({
          title: m.title,
          description: m.description,
          status: idx === 0 ? 'IN_PROGRESS' : 'LOCKED',
          estimatedHours: m.estimatedHours || 10,
          tags: m.tags || [],
          resources: m.resources || [],
          skillsGained: m.skillsGained || [],
          order: m.order || (idx + 1),
          currentModule: m.currentModule || ''
        }))
      }
    },
    include: {
      milestones: {
        orderBy: { order: 'asc' }
      }
    }
  });

  return res.status(201).json(ApiResponse.success(roadmap, 'Roadmap generated successfully'));
});

export const updateMilestone = asyncHandler(async (req, res) => {
  const { status, progress, actualHours, completedAt } = req.body;
  const milestoneId = req.params.id;

  const milestone = await prisma.roadmapMilestone.findFirst({
    where: { id: milestoneId },
    include: { roadmap: true }
  });

  if (!milestone || milestone.roadmap.userId !== req.user.id) {
    throw new ApiError(404, 'Milestone not found');
  }

  const updatedMilestone = await prisma.roadmapMilestone.update({
    where: { id: milestoneId },
    data: {
      ...(status && { status }),
      ...(progress !== undefined && { progress: parseFloat(progress) }),
      ...(actualHours !== undefined && { actualHours: parseFloat(actualHours) }),
      ...(completedAt !== undefined && { completedAt: completedAt ? new Date(completedAt) : null }),
      ...(status === 'COMPLETED' && { progress: 100, completedAt: new Date() })
    }
  });

  // Auto-unlock logic: If this milestone was marked as COMPLETED, unlock the next one (set status to IN_PROGRESS)
  if (status === 'COMPLETED') {
    const nextMilestone = await prisma.roadmapMilestone.findFirst({
      where: {
        roadmapId: milestone.roadmapId,
        order: milestone.order + 1
      }
    });

    if (nextMilestone && (nextMilestone.status === 'LOCKED' || nextMilestone.status === 'UPCOMING')) {
      await prisma.roadmapMilestone.update({
        where: { id: nextMilestone.id },
        data: { status: 'IN_PROGRESS' }
      });
    }
  }

  // Calculate new roadmap overall progress
  const allMilestones = await prisma.roadmapMilestone.findMany({
    where: { roadmapId: milestone.roadmapId }
  });

  const completedCount = allMilestones.filter(m => m.status === 'COMPLETED').length;
  const overallProgress = (completedCount / allMilestones.length) * 100;

  await prisma.roadmap.update({
    where: { id: milestone.roadmapId },
    data: { overallProgress }
  });

  return res.json(ApiResponse.success(updatedMilestone, 'Milestone updated successfully'));
});

export const reoptimizeRoadmap = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const roadmap = await prisma.roadmap.findFirst({
    where: { userId, isActive: true },
    include: { milestones: { orderBy: { order: 'asc' } } }
  });

  if (!roadmap) throw new ApiError(404, 'No active roadmap found to reoptimize');

  const selectedProvider = process.env.DEFAULT_AI_PROVIDER || 'GROQ';
  const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];

  if (rawKey) {
    try {
      const completedMilestones = roadmap.milestones.filter(m => m.status === 'COMPLETED');
      const incompleteMilestones = roadmap.milestones.filter(m => m.status !== 'COMPLETED');
      
      const prompt = `The student is learning: "${roadmap.title}".
They have completed: ${completedMilestones.map(m => m.title).join(', ') || 'no milestones yet'}.
The remaining milestones are: ${incompleteMilestones.map(m => m.title).join(', ')}.

Re-optimize the remaining milestones to adjust for current progress. Keep the same number of milestones (${incompleteMilestones.length}).
Return exactly a JSON array of the remaining milestones with updated titles, descriptions, and estimatedHours.
Example: [{"title": "React Hooks Deep Dive", "description": "Learn custom hooks...", "estimatedHours": 10}]
Only return JSON. Do not include markdown code block syntax.`;

      const aiResult = await callAI({
        provider: selectedProvider,
        rawKey,
        messages: [{ role: 'user', content: prompt }],
        mode: 'ROADMAP_BUILDER'
      });

      const cleanJson = aiResult.content.replace(/```json/g, '').replace(/```/g, '').trim();
      const updated = JSON.parse(cleanJson);
      if (Array.isArray(updated) && updated.length > 0) {
        for (let i = 0; i < Math.min(incompleteMilestones.length, updated.length); i++) {
          const original = incompleteMilestones[i];
          const updateData = updated[i];
          await prisma.roadmapMilestone.update({
            where: { id: original.id },
            data: {
              title: updateData.title || original.title,
              description: updateData.description || original.description,
              estimatedHours: updateData.estimatedHours || original.estimatedHours,
              tags: updateData.tags || original.tags,
              resources: updateData.resources || original.resources,
              skillsGained: updateData.skillsGained || original.skillsGained
            }
          });
        }
      }
    } catch (err) {
      console.error('Reoptimization AI call failed, falling back:', err);
    }
  }

  // Local fallback: update next locked milestone to UPCOMING / IN_PROGRESS
  const lockedMilestones = roadmap.milestones.filter(m => m.status === 'LOCKED');
  if (lockedMilestones.length > 0) {
    await prisma.roadmapMilestone.update({
      where: { id: lockedMilestones[0].id },
      data: { status: 'IN_PROGRESS' }
    });
  }

  const reoptimized = await prisma.roadmap.findFirst({
    where: { id: roadmap.id },
    include: { milestones: { orderBy: { order: 'asc' } } }
  });

  return res.json(ApiResponse.success(reoptimized, 'Roadmap reoptimized based on your progress'));
});
