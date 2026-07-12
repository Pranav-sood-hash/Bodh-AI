import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { callAI } from '../services/ai/ai.router.service';
import { logQuizCompletion } from '../utils/progress';

export const getMilestoneQuiz = asyncHandler(async (req, res) => {
  const { milestoneId } = req.params;

  const milestone = await prisma.roadmapMilestone.findUnique({
    where: { id: milestoneId },
  });

  if (!milestone) {
    throw new ApiError(404, 'Milestone not found');
  }

  const selectedProvider = process.env.DEFAULT_AI_PROVIDER || 'GROQ';
  const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];

  let questions: any[] = [];

  if (rawKey) {
    try {
      const prompt = `Generate exactly 10 multiple-choice quiz questions to test a student's knowledge on this topic:
Milestone: "${milestone.title}"
Description: "${milestone.description || ''}"
Skills: ${milestone.skillsGained.join(', ')}

Output exactly a JSON array of objects. Do not include markdown code block syntax or any other text.
Each object must have the following keys:
- questionText: string (the test question)
- options: array of 4 strings (the options)
- correctIndex: number (the 0-based index of the correct option: 0, 1, 2, or 3)
- explanation: string (why the answer is correct)

Example:
[
  {
    "questionText": "What does CSS stand for?",
    "options": ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"],
    "correctIndex": 1,
    "explanation": "CSS stands for Cascading Style Sheets."
  }
]`;

      const aiResult = await callAI({
        provider: selectedProvider,
        rawKey,
        messages: [{ role: 'user', content: prompt }],
        mode: 'FREE_CHAT', // Use standard/free chat mode
      });

      const cleanJson = aiResult.content.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        questions = parsed.slice(0, 10);
      }
    } catch (err: any) {
      console.error('Failed to generate AI quiz, falling back to mock:', err.message);
    }
  }

  // Fallback questions if AI generation fails or no key
  if (questions.length === 0) {
    for (let i = 1; i <= 10; i++) {
      questions.push({
        questionText: `Test Question ${i} for milestone: "${milestone.title}"`,
        options: [
          `Option A: Core concept validation ${i}`,
          `Option B: Practical application study ${i}`,
          `Option C: Advanced architecture topic ${i}`,
          `Option D: None of the above`,
        ],
        correctIndex: (i % 4),
        explanation: `This is a fallback explanation for question ${i} regarding ${milestone.title}.`,
      });
    }
  }

  return res.json(ApiResponse.success({ milestoneId, questions }));
});

export const submitQuizAnswers = asyncHandler(async (req, res) => {
  const { milestoneId } = req.params;
  const { answers, questions } = req.body; // answers: array of selected indices (0-3), questions: array of questions
  const userId = req.user.id;

  if (!Array.isArray(answers) || !Array.isArray(questions) || answers.length !== questions.length) {
    throw new ApiError(400, 'Invalid quiz submission format');
  }

  const milestone = await prisma.roadmapMilestone.findFirst({
    where: { id: milestoneId },
    include: { roadmap: true },
  });

  if (!milestone || milestone.roadmap.userId !== userId) {
    throw new ApiError(404, 'Milestone not found');
  }

  let correctCount = 0;
  const results = questions.map((q: any, index: number) => {
    const selected = answers[index];
    const isCorrect = selected === q.correctIndex;
    if (isCorrect) correctCount++;
    return {
      questionText: q.questionText,
      selectedOption: q.options[selected] || 'Unanswered',
      correctOption: q.options[q.correctIndex],
      isCorrect,
      explanation: q.explanation,
    };
  });

  const score = (correctCount / questions.length) * 100;
  const passed = score >= 70; // Pass mark: 70%

  // Save Quiz Attempt
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      milestoneId,
      score,
      passed,
      answers: JSON.stringify(answers),
      results: JSON.stringify(results),
    },
  });

  // If passed, mark milestone as COMPLETED and unlock the next milestone
  if (passed) {
    await prisma.roadmapMilestone.update({
      where: { id: milestoneId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        completedAt: new Date(),
      },
    });

    // Log the milestone completion to the progress tracker
    await logQuizCompletion(userId, milestone.title, milestone.skillsGained, score);

    // Unlock next milestone
    const nextMilestone = await prisma.roadmapMilestone.findFirst({
      where: {
        roadmapId: milestone.roadmapId,
        order: milestone.order + 1,
      },
    });

    if (nextMilestone && (nextMilestone.status === 'LOCKED' || nextMilestone.status === 'UPCOMING')) {
      await prisma.roadmapMilestone.update({
        where: { id: nextMilestone.id },
        data: { status: 'IN_PROGRESS' },
      });
    }

    // Recalculate roadmap overall progress
    const allMilestones = await prisma.roadmapMilestone.findMany({
      where: { roadmapId: milestone.roadmapId },
    });

    const completedCount = allMilestones.filter((m) => m.status === 'COMPLETED').length;
    const overallProgress = (completedCount / allMilestones.length) * 100;

    await prisma.roadmap.update({
      where: { id: milestone.roadmapId },
      data: { overallProgress },
    });
  }

  return res.json(ApiResponse.success({
    attemptId: attempt.id,
    score,
    passed,
    results,
  }));
});
