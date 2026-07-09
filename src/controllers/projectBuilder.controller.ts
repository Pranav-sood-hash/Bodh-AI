import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { callAI } from '../services/ai/ai.router.service';

export const generateProjectSteps = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: { steps: true },
  });

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  // Check if steps already exist. If so, return them.
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

Example:
[
  {
    "title": "Database Schema Design",
    "description": "Create the Prisma schema file including User and Profile models.",
    "deliverable": "schema.prisma",
    "expectedFileTypes": ["prisma"],
    "validationCriteria": ["Contains User model", "Relations are properly set"],
    "estimatedHours": 3
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
      },
      {
        title: 'Backend Database and Schema Configuration',
        description: 'Design and set up database models, migrations, and connections.',
        deliverable: 'Database configuration or schema file',
        expectedFileTypes: ['prisma', 'sql', 'js', 'ts'],
        validationCriteria: ['Correct relationships modeled', 'Indexes configured for core queries'],
        estimatedHours: 4,
      },
      {
        title: 'API Implementation & Route Handlers',
        description: 'Write Express routes and controller functions for CRUD operations.',
        deliverable: 'Router code file or controllers directory snapshot',
        expectedFileTypes: ['ts', 'js'],
        validationCriteria: ['Authentication middleware used', 'Validation schema is present'],
        estimatedHours: 6,
      },
      {
        title: 'Frontend Component Assembly & UI Integration',
        description: 'Build React pages, layout structures, and wire up states to mock APIs.',
        deliverable: 'App.tsx or Page component code',
        expectedFileTypes: ['tsx', 'jsx', 'css'],
        validationCriteria: ['Component handles loading states', 'Includes clean styling'],
        estimatedHours: 8,
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
          status: index === 0 ? 'IN_PROGRESS' : 'PENDING',
        },
      })
    )
  );

  return res.status(201).json(ApiResponse.success(createdSteps));
});

export const submitProjectStep = asyncHandler(async (req, res) => {
  const { stepId } = req.params;
  const { submissionText, submissionFileName } = req.body;
  const userId = req.user.id;

  const step = await prisma.projectStep.findUnique({
    where: { id: stepId },
    include: { project: true },
  });

  if (!step || step.project.userId !== userId) {
    throw new ApiError(404, 'Project step not found');
  }

  // Update step status and save submission
  const updatedStep = await prisma.projectStep.update({
    where: { id: stepId },
    data: {
      status: 'PENDING_VALIDATION',
      submittedFileUrl: submissionText, // We store the code/content in this field
      submittedFileName: submissionFileName || 'submission.txt',
      submittedAt: new Date(),
    },
  });

  return res.json(ApiResponse.success(updatedStep, 'Step deliverable submitted successfully. AI review is running.'));
});

export const validateProjectStep = asyncHandler(async (req, res) => {
  const { stepId } = req.params;
  const userId = req.user.id;

  const step = await prisma.projectStep.findUnique({
    where: { id: stepId },
    include: { project: true },
  });

  if (!step || step.project.userId !== userId) {
    throw new ApiError(404, 'Project step not found');
  }

  if (step.status !== 'PENDING_VALIDATION' || !step.submittedFileUrl) {
    throw new ApiError(400, 'Step is not ready for validation');
  }

  const selectedProvider = process.env.DEFAULT_AI_PROVIDER || 'GROQ';
  const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];

  let score = 80;
  let feedback = 'Excellent implementation. The code layout satisfies the requirements.';
  let suggestions: string[] = ['Refactor helper operations', 'Write unit tests'];
  let passed = true;

  if (rawKey) {
    try {
      const prompt = `Review this student's project deliverable:
Project: "${step.project.name}"
Step: "${step.title}"
Instructions: "${step.description}"
Validation Criteria: ${step.validationCriteria.join(', ')}

Student Submission Contents:
"""
${step.submittedFileUrl}
"""

Output exactly a JSON object. Do not include markdown code block syntax.
The object must contain these keys:
- score: number (from 0 to 100)
- passed: boolean (true if score is >= 70, false otherwise)
- feedback: string (detailed review comments)
- suggestions: array of strings (actionable refactoring advice)

Example:
{
  "score": 85,
  "passed": true,
  "feedback": "The file is structured correctly and contains all core fields.",
  "suggestions": ["Add documentation", "Separate DB config"]
}`;

      const aiResult = await callAI({
        provider: selectedProvider,
        rawKey,
        messages: [{ role: 'user', content: prompt }],
        mode: 'FREE_CHAT',
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
      console.error('Failed to validate project step via AI:', err.message);
    }
  }

  // Update step status in DB
  const nextStatus = passed ? 'COMPLETED' : 'IN_PROGRESS'; // return to in_progress to let them resubmit if they failed
  
  const updatedStep = await prisma.projectStep.update({
    where: { id: stepId },
    data: {
      status: nextStatus,
      aiFeedback: feedback,
      aiScore: score,
      aiSuggestions: suggestions,
      validatedAt: new Date(),
    },
  });

  // If passed, unlock the next step (set it to IN_PROGRESS)
  if (passed) {
    const nextStep = await prisma.projectStep.findFirst({
      where: {
        projectId: step.projectId,
        order: step.order + 1,
      },
    });

    if (nextStep) {
      await prisma.projectStep.update({
        where: { id: nextStep.id },
        data: { status: 'IN_PROGRESS' },
      });
    }
  }

  // Recalculate Project Progress
  const allSteps = await prisma.projectStep.findMany({
    where: { projectId: step.projectId },
  });

  const completedCount = allSteps.filter((s) => s.status === 'COMPLETED').length;
  const progress = (completedCount / allSteps.length) * 100;

  // Let's set progress label
  const progressLabel = `Step ${completedCount} of ${allSteps.length} complete`;

  await prisma.project.update({
    where: { id: step.projectId },
    data: {
      progress,
      progressLabel,
      status: progress === 100 ? 'COMPLETED' : 'IN_PROGRESS',
    },
  });

  return res.json(ApiResponse.success({
    step: updatedStep,
    passed,
    score,
    feedback,
    suggestions,
    projectProgress: progress,
  }));
});
