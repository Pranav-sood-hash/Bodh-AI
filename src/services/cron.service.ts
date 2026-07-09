import cron from 'node-cron';
import prisma from '../config/db';
import { callAI } from './ai/ai.router.service';
import { transporter } from '../config/nodemailer';
import { logger } from '../utils/logger';

const baseTemplate = (content: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>BodhAI Weekly Progress Report</title>
</head>
<body style="margin:0;padding:0; background-color:#F8FAFC; font-family:'Helvetica Neue', Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; border:1px solid #E2E8F0; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="background: linear-gradient(135deg, #1E3A5F 0%,#2563EB 100%); padding:32px 40px; text-align:center;">
              <table width="100%">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background:rgba(255,255,255,0.15); border-radius:12px; padding:10px 20px;">
                      <span style="color:#fff; font-size:22px; font-weight:700; letter-spacing:-0.5px;">BodhAI Weekly</span>
                    </div>
                    <p style="color: rgba(255,255,255,0.7); font-size:13px; margin:8px 0 0;">AI Learning Report & Performance Insights</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid #E2E8F0; padding:24px 40px; text-align:center; background:#F8FAFC;">
              <p style="color:#94A3B8; font-size:12px; line-height:1.6; margin:0;">
                © 2024 BodhAI Cognitive Systems<br/>
                You are receiving this because you signed up for weekly progress reports.<br/>
                <a href="${process.env.CLIENT_URL || 'http://localhost:8080'}/settings" style="color:#2563EB; text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const runWeeklyReportGenerator = async () => {
  logger.info('[CRON] Starting weekly progress report generation...');

  const users = await prisma.user.findMany({
    include: {
      roadmaps: {
        where: { isActive: true },
        include: {
          milestones: true,
        },
      },
      quizAttempts: {
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // last 7 days
          },
        },
      },
      projects: {
        include: {
          steps: {
            where: {
              validatedAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
              status: 'COMPLETED',
            },
          },
        },
      },
    },
  });

  const selectedProvider = process.env.DEFAULT_AI_PROVIDER || 'GROQ';
  const rawKey = process.env[`${selectedProvider.toUpperCase()}_API_KEY`];

  for (const user of users) {
    try {
      const activeRoadmap = user.roadmaps[0];
      const roadmapTitle = activeRoadmap ? activeRoadmap.title : 'General Learning Path';
      
      // Calculate milestones completed in the last 7 days
      const weeklyCompletedMilestones = activeRoadmap
        ? activeRoadmap.milestones.filter(
            (m) =>
              m.status === 'COMPLETED' &&
              m.completedAt &&
              m.completedAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          )
        : [];

      const completedCount = weeklyCompletedMilestones.length;
      const passedQuizzes = user.quizAttempts.filter((q) => q.passed).length;
      
      let completedStepsCount = 0;
      user.projects.forEach((proj) => {
        completedStepsCount += proj.steps.length;
      });

      // Retrieve messages count
      const messagesCount = await prisma.message.count({
        where: {
          userId: user.id,
          role: 'USER',
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      });

      logger.info(
        `[CRON] Generating report for user=${user.email} (Milestones=${completedCount}, Quizzes=${passedQuizzes}, Steps=${completedStepsCount}, Chats=${messagesCount})`
      );

      let aiReportHtml = '';
      if (rawKey) {
        const prompt = `Generate a beautiful, encouraging weekly learning progress report for the student: ${user.firstName || 'Learner'}.
Goal/Roadmap: "${roadmapTitle}"

Activity this past week:
- Roadmaps Milestones Completed: ${completedCount}
- Passed Quizzes: ${passedQuizzes}
- Project Implementation Steps Completed: ${completedStepsCount}
- Mentorship Chat Messages Sent: ${messagesCount}

Generate a personalized weekly progress report. Include:
1. A summary of achievements.
2. Constructive, actionable learning feedback.
3. 3 specific focus areas/tips for next week.

The output must be formatted as raw HTML suitable for insertion inside an email body. Do not include markdown code block tags (\`\`\`html or \`\`\`). Use clean headings (<h2>, <h3>), paragraphs (<p>), list items (<li>), and inline styles with modern, appealing colors (e.g. primary deep blues #1E3A5F, success greens #10B981) to make it look premium.`;

        const aiResult = await callAI({
          provider: selectedProvider,
          rawKey,
          messages: [{ role: 'user', content: prompt }],
          mode: 'FREE_CHAT',
        });
        aiReportHtml = aiResult.content.replace(/```html/g, '').replace(/```/g, '').trim();
      } else {
        // Fallback static HTML report
        aiReportHtml = `
          <h2 style="color: #1E3A5F; margin: 0 0 12px;">Weekly Progress Report</h2>
          <p style="color: #64748B; font-size: 15px; line-height: 1.6;">
            Hi ${user.firstName || 'Learner'}, here is your learning progress overview for this week on <strong>${roadmapTitle}</strong>:
          </p>
          <ul style="color: #475569; font-size: 14px; line-height: 1.8;">
            <li>🏁 <strong>Completed Milestones:</strong> ${completedCount}</li>
            <li>🧪 <strong>Quizzes Passed:</strong> ${passedQuizzes}</li>
            <li>🛠️ <strong>Project Steps Completed:</strong> ${completedStepsCount}</li>
            <li>💬 <strong>Mentorship Interactions:</strong> ${messagesCount} messages</li>
          </ul>
          <h3 style="color: #2563EB; margin: 20px 0 10px;">Tips for Next Week:</h3>
          <ol style="color: #475569; font-size: 14px; line-height: 1.8;">
            <li>Keep utilizing the BodhAI chat to clarify complex code blocks.</li>
            <li>Try to take a quiz at the end of each milestone to test your understanding.</li>
            <li>Build on your project steps to validate your knowledge.</li>
          </ol>
        `;
      }

      await transporter.sendMail({
        from: ` "BodhAI Weekly" <${process.env.GMAIL_USER}> `,
        to: user.email,
        subject: `📈 Your BodhAI Weekly Progress Report — ${new Date().toLocaleDateString()}`,
        html: baseTemplate(aiReportHtml),
      });

      logger.info(`[CRON] Weekly report email sent successfully to ${user.email}`);
    } catch (err: any) {
      logger.error(`[CRON] Failed to generate weekly report for ${user.email}: ${err.message}`);
    }
  }
};

// Start the cron scheduler (Runs every Sunday at midnight: 0 0 * * 0)
export const initCronJobs = () => {
  logger.info('⏰ Initializing background cron jobs...');
  cron.schedule('0 0 * * 0', async () => {
    try {
      await runWeeklyReportGenerator();
    } catch (err: any) {
      logger.error(`[CRON ERROR] Weekly report job failed: ${err.message}`);
    }
  });
};
