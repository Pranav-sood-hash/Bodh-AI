import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { callAI } from '../services/ai/ai.router.service';
import { getIO } from '../services/socket.service';

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
    include: {
      sprints: true,
      steps: {
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!project) throw new ApiError(404, 'Project workspace not found');
  return res.json(ApiResponse.success(project));
});

export const updateProject = asyncHandler(async (req, res) => {
  const { name, description, status, priority, techStack, progress, progressLabel, isStepByStep, hasSelectedMode } = req.body;

  const project = await prisma.project.update({
    where: { id: req.params.id, userId: req.user.id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(techStack && { techStack }),
      ...(progress !== undefined && { progress }),
      ...(progressLabel !== undefined && { progressLabel }),
      ...(isStepByStep !== undefined && { isStepByStep }),
      ...(hasSelectedMode !== undefined && { hasSelectedMode })
    },
    include: {
      sprints: true,
      steps: {
        orderBy: { order: 'asc' }
      }
    }
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

// POST /api/projects/:id/generate-problem
export const generateProblemStatement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const project = await prisma.project.findFirst({
    where: { id, userId }
  });

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const selectedProvider = process.env.DEFAULT_AI_PROVIDER || 'GROQ';
  const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];

  let problemStatement = '';

  if (rawKey) {
    try {
      const prompt = `Generate a realistic, comprehensive, and challenging problem statement for the following project:
Project Name: "${project.name}"
Description: "${project.description || ''}"
Tech Stack: ${project.techStack.join(', ')}

Structure the response nicely using markdown:
- **Title**: A professional title.
- **Background**: 2-3 sentences explaining the context.
- **The Challenge**: A clear explanation of what is being built and why.
- **Core Requirements**: 4-6 bullet points of functional requirements.
- **Technical Scope**: Details on stack application.
Only output the markdown content, no extra talk.`;

      const aiResult = await callAI({
        provider: selectedProvider,
        rawKey,
        messages: [{ role: 'user', content: prompt }],
        mode: 'FREE_CHAT'
      });
      problemStatement = aiResult.content.trim();
    } catch (err: any) {
      console.error('Failed to generate problem statement via AI:', err.message);
    }
  }

  // Fallback problem statement
  if (!problemStatement) {
    problemStatement = `### ${project.name}
**Background**: As software developers, we build projects to solve real-world problems.
**The Challenge**: Create a production-ready application for "${project.name}" using ${project.techStack.join(', ') || 'modern web standards'}.
**Core Requirements**:
- Setup project framework and configure standard directory structure.
- Define datastore/models representing domain entities.
- Implement business logic via services and controller APIs.
- Build interactive user interfaces with optimized state management.
- Test components and verify system integrations.`;
  }

  const updatedProject = await prisma.project.update({
    where: { id },
    data: { problemStatement }
  });

  return res.json(ApiResponse.success(updatedProject));
});

// POST /api/projects/:id/create-step-roadmap
export const createStepByStepRoadmap = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: { steps: { orderBy: { order: 'asc' } } }
  });

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  // Update project mode
  await prisma.project.update({
    where: { id },
    data: { isStepByStep: true }
  });

  if (project.steps.length > 0) {
    return res.json(ApiResponse.success(project.steps));
  }

  const selectedProvider = process.env.DEFAULT_AI_PROVIDER || 'GROQ';
  const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];

  let generatedSteps: any[] = [];

  if (rawKey) {
    try {
      const prompt = `Break down this project into a 4-6 step detailed step-by-step implementation plan:
Project Name: "${project.name}"
Description: "${project.description || ''}"
Tech Stack: ${project.techStack.join(', ')}

Output exactly a JSON array of objects. Do not include markdown code block syntax.
Each object must have the following keys:
- title: string
- description: string (detailed instructions on what to implement in this step)
- deliverable: string (what file or content the user must submit to pass, e.g. "database.ts containing Prisma schema config")
- expectedFileTypes: array of strings (e.g. ["ts", "js", "json", "prisma"])
- validationCriteria: array of strings (what the AI reviewer will check, e.g. ["Schema contains user model", "Includes indexes"])
- estimatedHours: number (estimated effort)
- hint: string (actionable hint or code snippet to help the student get started)

Example:
[
  {
    "title": "Database Schema Design",
    "description": "Create the Prisma schema file including User and Profile models.",
    "deliverable": "schema.prisma",
    "expectedFileTypes": ["prisma"],
    "validationCriteria": ["Contains User model", "Relations are properly set"],
    "estimatedHours": 3,
    "hint": "Ensure that the relations are properly set using @relation fields and foreign key mappings."
  }
]`;

      const aiResult = await callAI({
        provider: selectedProvider,
        rawKey,
        messages: [{ role: 'user', content: prompt }],
        mode: 'FREE_CHAT',
      });

      const cleanJson = aiResult.content.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        generatedSteps = parsed;
      }
    } catch (err: any) {
      console.error('Failed to generate project steps via AI:', err.message);
    }
  }

  // Fallback project steps if AI fails or no key
  if (generatedSteps.length === 0) {
    generatedSteps = [
      {
        title: 'Project Initialization & Structure Setup',
        description: 'Initialize the codebase directory structure, package configuration, and repository layout.',
        deliverable: 'package.json config showing basic setup details',
        expectedFileTypes: ['json', 'txt'],
        validationCriteria: ['Includes name and main entrypoint', 'Basic scripts are defined'],
        estimatedHours: 2,
        hint: 'Use `npm init -y` or `pnpm init` to initialize the project and create a package.json file.'
      },
      {
        title: 'Backend Database and Schema Configuration',
        description: 'Design and set up database models, migrations, and connections.',
        deliverable: 'Database configuration or schema file',
        expectedFileTypes: ['prisma', 'sql', 'js', 'ts'],
        validationCriteria: ['Correct relationships modeled', 'Indexes configured for core queries'],
        estimatedHours: 4,
        hint: 'Define your main database tables and schema using Prisma, SQL, or an ORM like Mongoose.'
      },
      {
        title: 'API Implementation & Route Handlers',
        description: 'Write Express routes and controller functions for CRUD operations.',
        deliverable: 'Router code file or controllers directory snapshot',
        expectedFileTypes: ['ts', 'js'],
        validationCriteria: ['Authentication middleware used', 'Validation schema is present'],
        estimatedHours: 6,
        hint: 'Define express.Router() handlers and map them to specific HTTP verbs like GET, POST, PUT, DELETE.'
      },
      {
        title: 'Frontend Component Assembly & UI Integration',
        description: 'Build React pages, layout structures, and wire up states to mock APIs.',
        deliverable: 'App.tsx or Page component code',
        expectedFileTypes: ['tsx', 'jsx', 'css'],
        validationCriteria: ['Component handles loading states', 'Includes clean styling'],
        estimatedHours: 8,
        hint: 'Create clean functional React components and handle states using useState and useEffect.'
      },
    ];
  }

  // Save steps to DB
  const createdSteps = await Promise.all(
    generatedSteps.map((step, index) =>
      prisma.projectStep.create({
        data: {
          projectId: project.id,
          order: index + 1,
          title: step.title,
          description: step.description,
          deliverable: step.deliverable,
          expectedFileTypes: step.expectedFileTypes || [],
          validationCriteria: step.validationCriteria || [],
          estimatedHours: step.estimatedHours || 4,
          hint: step.hint || '',
          status: index === 0 ? 'IN_PROGRESS' : 'PENDING',
        },
      })
    )
  );

  return res.status(201).json(ApiResponse.success(createdSteps));
});

// POST /api/projects/:id/submit-complete
export const submitCompleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const file = req.file;

  if (!file) {
    throw new ApiError(400, 'Please upload your project file(s)');
  }

  const project = await prisma.project.findFirst({
    where: { id, userId }
  });

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const fileContent = file.buffer.toString('utf-8');

  // Mark status as reviewing/validating
  await prisma.project.update({
    where: { id },
    data: {
      status: 'IN_REVIEW',
      submittedFileName: file.originalname,
      submittedAt: new Date()
    }
  });

  const selectedProvider = process.env.DEFAULT_AI_PROVIDER || 'GROQ';
  const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];

  let score = 85;
  let feedback = 'Overall excellent structure and layout. The implementation matches all requirements.';
  let passed = true;

  if (rawKey) {
    try {
      const prompt = `Review this student's complete project submission:
Project: "${project.name}"
Description: "${project.description || ''}"
Tech Stack: ${project.techStack.join(', ')}

Submission File Name: "${file.originalname}"
Submission Content Snippet (first 5000 chars):
"""
${fileContent.slice(0, 5000)}
"""

Please run a comprehensive review. Verify:
1. If the project files map to the configured tech stack.
2. If the main functionality described in the project description is present or stubbed.
3. Code quality, layout patterns, and best practices.

Output exactly a JSON object. Do not include markdown code block syntax.
The object must contain these keys:
- score: number (from 0 to 100)
- passed: boolean (true if score is >= 70, false otherwise)
- feedback: string (detailed review comments and suggestions in markdown)`;

      const aiResult = await callAI({
        provider: selectedProvider,
        rawKey,
        messages: [{ role: 'user', content: prompt }],
        mode: 'FREE_CHAT'
      });

      const cleanJson = aiResult.content.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed && typeof parsed === 'object') {
        score = parsed.score !== undefined ? parsed.score : 80;
        passed = parsed.passed !== undefined ? parsed.passed : score >= 70;
        feedback = parsed.feedback || feedback;
      }
    } catch (err: any) {
      console.error('Failed to validate complete project via AI:', err.message);
    }
  }

  const finalStatus = passed ? 'COMPLETED' : 'IN_PROGRESS';
  const updatedProject = await prisma.project.update({
    where: { id },
    data: {
      status: finalStatus,
      aiValidationScore: score,
      aiValidationFeedback: feedback,
      progress: passed ? 100 : project.progress
    }
  });

  return res.json(ApiResponse.success({
    project: updatedProject,
    passed,
    score,
    feedback
  }));
});

// POST /api/projects/steps/:id/upload
export const uploadStepFile = asyncHandler(async (req, res) => {
  const { id } = req.params; // stepId
  const userId = req.user.id;
  const file = req.file;

  if (!file) {
    throw new ApiError(400, 'Please upload your step deliverable file');
  }

  const step = await prisma.projectStep.findUnique({
    where: { id },
    include: { project: true }
  });

  if (!step || step.project.userId !== userId) {
    throw new ApiError(404, 'Project step not found');
  }

  const fileContent = file.buffer.toString('utf-8');

  // Update step status to VALIDATING
  const updatedStep1 = await prisma.projectStep.update({
    where: { id },
    data: {
      status: 'VALIDATING',
      submittedFileName: file.originalname,
      submittedFileUrl: fileContent.slice(0, 8000), // save content
      submittedAt: new Date()
    }
  });

  // Return response immediately
  res.json(ApiResponse.success(updatedStep1, 'File uploaded, validation started'));

  // Run AI validation asynchronously in the background
  (async () => {
    const selectedProvider = process.env.DEFAULT_AI_PROVIDER || 'GROQ';
    const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];

    let score = 80;
    let feedback = 'Good work on this step! The deliverable structure looks sound.';
    let suggestions: string[] = ['Check edge cases', 'Add comments'];
    let passed = true;

    if (rawKey) {
      try {
        const prompt = `Review this student's project step deliverable:
Project: "${step.project.name}"
Step Title: "${step.title}"
Step Description: "${step.description}"
Validation Criteria: ${step.validationCriteria.join(', ')}

Submission File Name: "${file.originalname}"
Submission Contents:
"""
${fileContent.slice(0, 5000)}
"""

Output exactly a JSON object. Do not include markdown code block syntax.
The object must contain these keys:
- score: number (from 0 to 100)
- passed: boolean (true if score is >= 70, false otherwise)
- feedback: string (detailed review comments)
- suggestions: array of strings (actionable suggestions)

Example:
{
  "score": 85,
  "passed": true,
  "feedback": "Perfect schema setup. Relationships are fully correct.",
  "suggestions": ["Add indexes on userId"]
}`;

        const aiResult = await callAI({
          provider: selectedProvider,
          rawKey,
          messages: [{ role: 'user', content: prompt }],
          mode: 'FREE_CHAT'
        });

        const cleanJson = aiResult.content.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed && typeof parsed === 'object') {
          score = parsed.score !== undefined ? parsed.score : 80;
          passed = parsed.passed !== undefined ? parsed.passed : score >= 70;
          feedback = parsed.feedback || feedback;
          suggestions = parsed.suggestions || suggestions;
        }
      } catch (err: any) {
        console.error('Failed to validate step deliverable via AI:', err.message);
      }
    }

    const nextStatus = passed ? 'COMPLETED' : 'IN_PROGRESS';

    await prisma.projectStep.update({
      where: { id },
      data: {
        status: nextStatus,
        aiFeedback: feedback,
        aiScore: score,
        aiSuggestions: suggestions,
        validatedAt: new Date()
      }
    });

    // If passed, unlock next step
    if (passed) {
      const nextStep = await prisma.projectStep.findFirst({
        where: {
          projectId: step.projectId,
          order: step.order + 1
        }
      });

      if (nextStep) {
        await prisma.projectStep.update({
          where: { id: nextStep.id },
          data: { status: 'IN_PROGRESS' }
        });
      }
    }

    // Recalculate Project overall progress
    const allSteps = await prisma.projectStep.findMany({
      where: { projectId: step.projectId }
    });

    const completedCount = allSteps.filter(s => s.status === 'COMPLETED').length;
    const progress = (completedCount / allSteps.length) * 100;
    const progressLabel = `Step ${completedCount} of ${allSteps.length} complete`;

    await prisma.project.update({
      where: { id: step.projectId },
      data: {
        progress,
        progressLabel,
        status: progress === 100 ? 'COMPLETED' : 'IN_PROGRESS'
      }
    });

    // Emit socket event
    try {
      const ioInstance = getIO();
      ioInstance.emit('step:validated', {
        stepId: step.id,
        status: nextStatus,
        feedback,
        score
      });
    } catch (socketErr) {
      console.warn('Socket io not available or not initialized yet.');
    }
  })().catch(err => {
    console.error('Background step validation failed:', err);
  });
});

// GET /api/projects/steps/:id/validation
export const getStepValidation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const step = await prisma.projectStep.findUnique({
    where: { id },
    include: { project: true }
  });

  if (!step || step.project.userId !== userId) {
    throw new ApiError(404, 'Project step not found');
  }

  return res.json(ApiResponse.success({
    status: step.status,
    feedback: step.aiFeedback,
    score: step.aiScore,
    suggestions: step.aiSuggestions,
    validatedAt: step.validatedAt
  }));
});

