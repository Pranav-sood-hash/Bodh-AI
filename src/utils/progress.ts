import prisma from '../config/db';

/**
 * Ensures the progress record exists for a user and returns it.
 */
export const getOrCreateProgress = async (userId: string) => {
  let progress = await prisma.progress.findUnique({ where: { userId } });
  if (!progress) {
    progress = await prisma.progress.create({ data: { userId } });
  }
  return progress;
};

/**
 * Logs general study activity (e.g. sending messages, reading docs, etc.)
 */
export const logStudyActivity = async (userId: string, hours = 0.1, count = 1) => {
  const progress = await getOrCreateProgress(userId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.activityLog.upsert({
    where: { progressId_date: { progressId: progress.id, date: today } },
    update: {
      activityCount: { increment: count },
      hoursStudied: { increment: hours },
    },
    create: {
      progressId: progress.id,
      date: today,
      activityCount: count,
      hoursStudied: hours,
    },
  });

  if (hours > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        hoursStudied: { increment: hours },
        lastActiveDate: new Date(),
      },
    });
  }
};

/**
 * Logs a quiz completion milestone and updates topic mastery
 */
export const logQuizCompletion = async (
  userId: string,
  milestoneTitle: string,
  skillsGained: string[],
  score: number
) => {
  const progress = await getOrCreateProgress(userId);

  // 1. Add Milestone achievement
  await prisma.milestone.create({
    data: {
      progressId: progress.id,
      userId,
      title: `${milestoneTitle} Quiz`,
      type: 'BADGE',
      metadata: `Scored ${score.toFixed(0)}% on the evaluation quiz.`,
    },
  });

  // 2. Update Topic Mastery for skills gained
  for (const skill of skillsGained) {
    await prisma.topicMastery.upsert({
      where: {
        progressId_topic: {
          progressId: progress.id,
          topic: skill,
        },
      },
      update: {
        mastery: { set: score },
        lastStudied: new Date(),
      },
      create: {
        progressId: progress.id,
        topic: skill,
        mastery: score,
        lastStudied: new Date(),
      },
    });
  }

  // 3. Log activity (0.5 hours studied for the quiz attempt)
  await logStudyActivity(userId, 0.5, 3);
};

/**
 * Logs a project step validation milestone and updates topic mastery
 */
export const logProjectStepValidation = async (
  userId: string,
  projectName: string,
  stepTitle: string,
  techStack: string[],
  score: number
) => {
  const progress = await getOrCreateProgress(userId);

  // 1. Add Milestone achievement
  await prisma.milestone.create({
    data: {
      progressId: progress.id,
      userId,
      title: `${projectName} - ${stepTitle}`,
      type: 'PROJECT',
      metadata: `Validated step deliverables with an AI score of ${score.toFixed(0)}%.`,
    },
  });

  // 2. Update Topic Mastery for tech stack topics (mastery = score)
  for (const tech of techStack) {
    await prisma.topicMastery.upsert({
      where: {
        progressId_topic: {
          progressId: progress.id,
          topic: tech,
        },
      },
      update: {
        mastery: { set: score },
        lastStudied: new Date(),
      },
      create: {
        progressId: progress.id,
        topic: tech,
        mastery: score,
        lastStudied: new Date(),
      },
    });
  }

  // 3. Log activity (1.0 hour studied/worked for the project step)
  await logStudyActivity(userId, 1.0, 5);
};
