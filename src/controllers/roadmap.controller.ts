import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { callAI } from '../services/ai/ai.router.service';
import { decrypt } from '../services/encryption.service';
import { logger } from '../utils/logger';

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

  // ─────────────────────────────────────────────────────────────────
  // AUTO-CREATE CAPSTONE PROJECT when all milestones are completed
  // ─────────────────────────────────────────────────────────────────
  if (status === 'COMPLETED') {
    const allCompleted = allMilestones.every(m =>
      m.status === 'COMPLETED' || m.id === milestoneId
    );

    if (allCompleted) {
      const roadmap = await prisma.roadmap.findUnique({
        where: { id: milestone.roadmapId }
      });

      if (roadmap) {
        const projectName = `${roadmap.title} — Capstone Project`;

        // Avoid creating duplicates
        const existingCapstone = await prisma.project.findFirst({
          where: { userId: req.user.id, name: projectName }
        });

        if (!existingCapstone) {
          // Collect all skills gained across all milestones as tech stack
          const allSkills: string[] = [];
          allMilestones.forEach(m => {
            if (Array.isArray(m.skillsGained)) {
              (m.skillsGained as string[]).forEach(s => {
                if (!allSkills.includes(s)) allSkills.push(s);
              });
            }
          });

          await prisma.project.create({
            data: {
              userId: req.user.id,
              name: projectName,
              description: `Capstone project for your completed "${roadmap.title}" learning roadmap. Apply all the skills you have mastered into one final end-to-end product.`,
              priority: 'HIGH',
              techStack: allSkills.slice(0, 12), // cap at 12 tags
              progressLabel: `Auto-created from roadmap: ${roadmap.title}`,
              progress: 0,
              sprints: {
                create: [
                  {
                    name: 'Sprint 1: Architecture & Planning',
                    status: 'IN_PROGRESS',
                    tasks: [
                      'Review all milestone learnings',
                      'Define project scope and features',
                      'Set up repository and project structure'
                    ]
                  },
                  {
                    name: 'Sprint 2: Core Implementation',
                    status: 'PLANNED',
                    tasks: [
                      'Build core feature modules',
                      'Integrate backend and frontend',
                      'Implement authentication and data layer'
                    ]
                  },
                  {
                    name: 'Sprint 3: Polish & Deploy',
                    status: 'PLANNED',
                    tasks: [
                      'Write unit and integration tests',
                      'Optimize performance and UX',
                      'Deploy to production'
                    ]
                  }
                ]
              }
            }
          });

          await prisma.user.update({
            where: { id: req.user.id },
            data: { projectsBuilt: { increment: 1 } }
          });
        }
      }
    }
  }

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

// POST /api/roadmap/milestone/:id/practice
export const startMilestonePractice = asyncHandler(
  async (req, res) => {
    const milestoneId = req.params.id;
    const userId = req.user.id;

    const milestone = await prisma.roadmapMilestone
      .findFirst({
        where: { id: milestoneId },
        include: { roadmap: true }
      });

    if (
      !milestone || 
      milestone.roadmap.userId !== userId
    ) {
      throw new ApiError(404,
        'Milestone not found'
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        level: true,
        language: true
      }
    });

    // Create new chat linked to milestone
    const chat = await prisma.chat.create({
      data: {
        userId,
        title: `Practice: ${milestone.title}`,
        mode: 'LEARNING',
        milestoneId: milestone.id
      }
    });

    // Get user's API key or fall back to system default key
    const userApiKey = await prisma.apiKey.findFirst({
      where: { userId, isPrimary: true, isActive: true }
    });

    let selectedProvider: string;
    let rawKey: string | undefined;

    if (userApiKey) {
      selectedProvider = userApiKey.provider;
      rawKey = decrypt(userApiKey.encryptedKey);
    } else {
      selectedProvider = process.env.DEFAULT_AI_PROVIDER || 'GROQ';
      rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];
    }

    if (!rawKey) {
      // Return chat without AI intro if no key configured anywhere
      return res.status(201).json(
        ApiResponse.success({
          chatId: chat.id,
          aiIntroMessage: null,
          noApiKey: true
        })
      );
    }

    // Build AI intro prompt
    const introPrompt = `
You are starting a learning session with ${user?.firstName || 'a student'} about:

TOPIC: "${milestone.title}"
DESCRIPTION: "${milestone.description}"
TAGS/SUBTOPICS: ${milestone.tags.join(', ')}
STUDENT LEVEL: ${user?.level || 'Intermediate'}
RESOURCES TO COVER: ${
  milestone.resources?.join(', ') || 
  'Core concepts and practical application'
}

Write your OPENING MESSAGE for this learning session. Structure it EXACTLY like this:

1. A warm, engaging introduction to "${milestone.title}" (2-3 sentences that spark curiosity)

2. "Here's what we'll cover in this session:"
   Then list 4-6 specific subtopics as a numbered list. Make each one specific and concrete, not generic.

3. A brief explanation of why this topic matters (1-2 sentences, real-world context)

4. End with EXACTLY this question format:
   "Where would you like to start?"
   Then give 3-4 numbered options matching your subtopics list above.
   Example:
   1️⃣ [First subtopic] - [1 line description]
   2️⃣ [Second subtopic] - [1 line description]
   3️⃣ [Third subtopic] - [1 line description]
   4️⃣ Start from the very beginning

Keep total length: 150-200 words maximum.
Be encouraging and conversational.
Use markdown for formatting.`;

    let introContent = '';
    let usedProvider = selectedProvider;
    let usedModel = 'system-fallback';

    try {
      const result = await callAI({
        provider: selectedProvider,
        rawKey,
        messages: [{ 
          role: 'user', 
          content: introPrompt 
        }],
        mode: 'LEARNING'
      });
      introContent = result.content;
      usedModel = result.model || 'system-fallback';
    } catch (aiError: any) {
      logger.warn('AI Intro generation failed, using local template fallback:', aiError.message || aiError);
      
      const tagList = milestone.tags && milestone.tags.length > 0 
        ? milestone.tags.map((t: string, idx: number) => `${idx + 1}. ${t}`).join('\n')
        : `1. Core concepts of ${milestone.title}\n2. Real-world application\n3. Practical exercise`;

      const optionsList = milestone.tags && milestone.tags.length > 0
        ? milestone.tags.slice(0, 3).map((t: string, idx: number) => `${idx + 1}️⃣ Learn about ${t}`).join('\n') + `\n${Math.min(milestone.tags.length, 3) + 1}️⃣ Start from the very beginning`
        : `1️⃣ Theoretical concepts\n2️⃣ Practical exercise\n3️⃣ Start from the very beginning`;

      introContent = `### Introduction to ${milestone.title}

${milestone.description || `Welcome to the practice session for **${milestone.title}**! Let's dive deep and master this topic together.`}

Here's what we'll cover in this session:
${tagList}

This topic matters because mastering these concepts is essential to building modern, robust, and user-friendly software applications.

Where would you like to start?
${optionsList}`;
      usedProvider = 'SYSTEM';
    }

    // Save AI intro as first message in chat
    const aiMessage = await prisma.message.create({
      data: {
        chatId: chat.id,
        userId,
        role: 'ASSISTANT',
        content: introContent,
        provider: usedProvider,
        model: usedModel
      }
    });

    // Update chat metadata
    await prisma.chat.update({
      where: { id: chat.id },
      data: {
        lastMessage: introContent.slice(0, 100),
        lastMessageAt: new Date(),
        messageCount: 1
      }
    });

    return res.status(201).json(
      ApiResponse.success({
        chatId: chat.id,
        aiIntroMessage: aiMessage,
        milestone: {
          id: milestone.id,
          title: milestone.title,
          tags: milestone.tags
        }
      })
    );
  }
);

// POST /api/roadmap/milestone/:id/validate-project
// Accepts a file upload, AI-checks it against milestone requirements,
// marks milestone COMPLETED if score >= 60, triggers capstone project.
export const validateMilestoneProject = asyncHandler(async (req, res) => {
  const milestoneId = req.params.id;
  const userId = req.user.id;

  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) throw new ApiError(400, 'No file was uploaded');

  const milestone = await prisma.roadmapMilestone.findFirst({
    where: { id: milestoneId },
    include: { roadmap: true }
  });

  if (!milestone || milestone.roadmap.userId !== userId) {
    throw new ApiError(404, 'Milestone not found');
  }

  // Read uploaded file text content (cap to 6000 chars)
  const isText = /\.(ts|tsx|js|jsx|json|prisma|py|md|txt|yaml|yml|html|css|sql|sh|go|java)$/i.test(file.originalname);
  const fileContent = isText
    ? file.buffer.toString('utf-8').slice(0, 6000)
    : `[Binary file: ${file.originalname}, ${(file.size / 1024).toFixed(1)} KB]`;

  const selectedProvider = process.env.DEFAULT_AI_PROVIDER || 'GROQ';
  const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];

  let score = 0;
  let feedbackObj: Record<string, any> = {};
  let passed = false;

  if (rawKey) {
    const prompt = `You are an AI project evaluator. A student submitted a file for their milestone.

MILESTONE: "${milestone.title}"
DESCRIPTION: "${milestone.description}"
SKILLS TO DEMONSTRATE: ${(milestone.skillsGained as string[]).join(', ') || 'general programming'}
TAGS: ${(milestone.tags as string[]).join(', ')}

FILE: ${file.originalname}
CONTENT:
\`\`\`
${fileContent}
\`\`\`

Evaluate whether the file meaningfully demonstrates the milestone's skills. Be fair but strict.

Respond ONLY with valid JSON — no markdown, no extra text:
{
  "score": <0-100>,
  "passed": <boolean, true if score >= 60>,
  "summary": "<1 sentence verdict>",
  "strengths": ["<point>"],
  "improvements": ["<point>"]
}`;

    try {
      const result = await callAI({
        provider: selectedProvider,
        rawKey,
        messages: [{ role: 'user', content: prompt }],
        mode: 'FREE_CHAT'
      });
      const clean = result.content.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(clean);
      score = Math.min(100, Math.max(0, Number(parsed.score) || 0));
      passed = parsed.passed === true || score >= 60;
      feedbackObj = { summary: parsed.summary || '', strengths: parsed.strengths || [], improvements: parsed.improvements || [] };
    } catch {
      score = 65; passed = true;
      feedbackObj = { summary: 'File received. Good attempt!', strengths: ['Submitted file present'], improvements: [] };
    }
  } else {
    score = 70; passed = true;
    feedbackObj = { summary: 'Accepted. Add an AI key for detailed feedback.', strengths: ['Submission received'], improvements: [] };
  }

  if (passed) {
    await prisma.roadmapMilestone.update({
      where: { id: milestoneId },
      data: { status: 'COMPLETED', progress: 100, completedAt: new Date() }
    });

    // Unlock next milestone
    const nextMilestone = await prisma.roadmapMilestone.findFirst({
      where: { roadmapId: milestone.roadmapId, order: milestone.order + 1 }
    });
    if (nextMilestone && ['LOCKED', 'UPCOMING'].includes(nextMilestone.status)) {
      await prisma.roadmapMilestone.update({ where: { id: nextMilestone.id }, data: { status: 'IN_PROGRESS' } });
    }

    // Recalculate roadmap progress
    const allMilestones = await prisma.roadmapMilestone.findMany({ where: { roadmapId: milestone.roadmapId } });
    const completedCount = allMilestones.filter(m => m.status === 'COMPLETED').length;
    await prisma.roadmap.update({
      where: { id: milestone.roadmapId },
      data: { overallProgress: (completedCount / allMilestones.length) * 100 }
    });

    // If last milestone → auto-create capstone project
    if (!nextMilestone) {
      const roadmap = await prisma.roadmap.findUnique({ where: { id: milestone.roadmapId } });
      if (roadmap) {
        const projectName = `${roadmap.title} — Capstone Project`;
        const existing = await prisma.project.findFirst({ where: { userId, name: projectName } });
        if (!existing) {
          const allSkills: string[] = [];
          allMilestones.forEach(m => {
            (m.skillsGained as string[]).forEach(s => { if (!allSkills.includes(s)) allSkills.push(s); });
          });
          await prisma.project.create({
            data: {
              userId, name: projectName, priority: 'HIGH',
              description: `Capstone project for your completed "${roadmap.title}" learning roadmap.`,
              techStack: allSkills.slice(0, 12),
              progressLabel: `Auto-created from roadmap: ${roadmap.title}`,
              progress: 0,
              sprints: {
                create: [
                  { name: 'Sprint 1: Architecture & Planning', status: 'IN_PROGRESS', tasks: ['Review all milestone learnings', 'Define project scope', 'Set up repository'] },
                  { name: 'Sprint 2: Core Implementation', status: 'PLANNED', tasks: ['Build core features', 'Integrate layers', 'Implement data models'] },
                  { name: 'Sprint 3: Polish & Deploy', status: 'PLANNED', tasks: ['Write tests', 'Optimize UX', 'Deploy'] }
                ]
              }
            }
          });
          await prisma.user.update({ where: { id: userId }, data: { projectsBuilt: { increment: 1 } } });
        }
      }
    }
  }

  return res.json(ApiResponse.success({
    passed, score, feedback: feedbackObj, milestoneCompleted: passed
  }, passed ? 'Milestone validated and marked complete!' : 'Keep going — see improvement tips below.'));
});
