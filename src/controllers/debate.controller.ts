import prisma from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { runDebate } from '../services/ai/debate.service';

// POST /api/debate/start
export const startDebate = asyncHandler(async (req, res) => {
  const {
    chatId,
    question,
    providers,
    rounds = 3,
    mode = 'FREE_CHAT'
  } = req.body;
  const userId = req.user.id;

  // Validations
  if (!question?.trim()) {
    throw new ApiError(400, 'Question is required');
  }
  if (!providers || providers.length < 2) {
    throw new ApiError(400, 'Select at least 2 AI providers');
  }
  if (providers.length > 4) {
    throw new ApiError(400, 'Maximum 4 providers per debate');
  }
  if (rounds < 1 || rounds > 3) {
    throw new ApiError(400, 'Rounds must be 1, 2, or 3');
  }

  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId }
  });
  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      firstName: true,
      level: true,
      goal: true,
      topics: true,
      language: true
    }
  });

  // Create debate session record
  const debateSession = await prisma.debateSession.create({
    data: {
      userId,
      chatId,
      question,
      mode,
      providers,
      totalRounds: rounds,
      status: 'IN_PROGRESS'
    }
  });

  // Save user message first
  const userMessage = await prisma.message.create({
    data: {
      chatId,
      userId,
      role: 'USER',
      content: question
    }
  });

  try {
    // Run full debate
    const result = await runDebate({
      userId,
      question,
      providers,
      mode,
      totalRounds: rounds,
      userContext: {
        name: user?.firstName,
        level: user?.level,
        goal: user?.goal,
        topics: user?.topics,
        language: user?.language
      },
      onRoundComplete: async (round, responses) => {
        // Save each round as it completes
        const roundData = JSON.stringify(responses);
        await prisma.debateSession.update({
          where: { id: debateSession.id },
          data: {
            [`round${round}Data`]: roundData
          }
        });
      }
    });

    // Save synthesis to debate session
    await prisma.debateSession.update({
      where: { id: debateSession.id },
      data: {
        status: 'COMPLETED',
        consensusData: JSON.stringify(result.synthesis),
        confidenceScore: result.synthesis.confidenceScore,
        winner: result.synthesis.winner,
        completedAt: new Date()
      }
    });

    // Save debate result as message
    const debateMessage = await prisma.message.create({
      data: {
        chatId,
        userId,
        role: 'ASSISTANT',
        content: result.synthesis.consensus,
        messageType: 'DEBATE',
        debateData: JSON.stringify({
          sessionId: debateSession.id,
          rounds: result.rounds,
          synthesis: result.synthesis,
          providers: result.providers,
          totalRounds: result.totalRounds,
          question
        })
      }
    });

    await prisma.chat.update({
      where: { id: chatId },
      data: {
        lastMessage: `[Debate] ${result.synthesis.consensus.slice(0, 100)}`,
        lastMessageAt: new Date(),
        messageCount: { increment: 2 }
      }
    });

    return res.status(200).json(
      ApiResponse.success({
        userMessage,
        debateMessage,
        debate: {
          sessionId: debateSession.id,
          rounds: result.rounds,
          synthesis: result.synthesis,
          providers: result.providers,
          totalRounds: result.totalRounds
        }
      })
    );

  } catch (err: any) {
    await prisma.debateSession.update({
      where: { id: debateSession.id },
      data: { status: 'FAILED' }
    });
    throw err;
  }
});

// GET /api/debate/:sessionId
export const getDebateSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;

  const session = await prisma.debateSession.findFirst({
    where: { id: sessionId, userId }
  });

  if (!session) {
    throw new ApiError(404, 'Debate session not found');
  }

  return res.status(200).json(
    ApiResponse.success({
      ...session,
      round1: session.round1Data ? JSON.parse(session.round1Data) : null,
      round2: session.round2Data ? JSON.parse(session.round2Data) : null,
      round3: session.round3Data ? JSON.parse(session.round3Data) : null,
      consensus: session.consensusData ? JSON.parse(session.consensusData) : null
    })
  );
});

// SSE STREAMING VERSION
// POST /api/debate/stream
export const streamDebate = asyncHandler(async (req, res) => {
  const {
    chatId,
    question,
    providers,
    rounds = 3,
    mode = 'FREE_CHAT'
  } = req.body;
  const userId = req.user.id;

  // Validations
  if (!question?.trim()) {
    throw new ApiError(400, 'Question is required');
  }
  if (!providers || providers.length < 2) {
    throw new ApiError(400, 'Select at least 2 AI providers');
  }
  if (providers.length > 4) {
    throw new ApiError(400, 'Maximum 4 providers per debate');
  }
  if (rounds < 1 || rounds > 3) {
    throw new ApiError(400, 'Rounds must be 1, 2, or 3');
  }

  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId }
  });
  if (!chat) {
    throw new ApiError(404, 'Chat not found');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      firstName: true,
      level: true,
      goal: true,
      topics: true,
      language: true
    }
  });

  // Create debate session record
  const debateSession = await prisma.debateSession.create({
    data: {
      userId,
      chatId,
      question,
      mode,
      providers,
      totalRounds: rounds,
      status: 'IN_PROGRESS'
    }
  });

  // Save user message first
  await prisma.message.create({
    data: {
      chatId,
      userId,
      role: 'USER',
      content: question
    }
  });

  // Setup SSE stream headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const send = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    send({
      type: 'DEBATE_STARTED',
      message: 'Debate is starting...',
      providers,
      totalRounds: rounds
    });

    const result = await runDebate({
      userId,
      question,
      providers,
      mode,
      totalRounds: rounds,
      userContext: {
        name: user?.firstName,
        level: user?.level,
        goal: user?.goal,
        topics: user?.topics,
        language: user?.language
      },
      onRoundComplete: async (round, responses) => {
        // Save each round to the database
        const roundData = JSON.stringify(responses);
        await prisma.debateSession.update({
          where: { id: debateSession.id },
          data: {
            [`round${round}Data`]: roundData
          }
        });

        send({
          type: 'ROUND_COMPLETE',
          round,
          responses: responses.map(r => ({
            provider: r.provider,
            content: r.content,
            role: r.role
          })),
          message: `Round ${round} complete. ${rounds - round} round(s) remaining...`
        });
      }
    });

    // Save synthesis to debate session
    await prisma.debateSession.update({
      where: { id: debateSession.id },
      data: {
        status: 'COMPLETED',
        consensusData: JSON.stringify(result.synthesis),
        confidenceScore: result.synthesis.confidenceScore,
        winner: result.synthesis.winner,
        completedAt: new Date()
      }
    });

    // Save debate result as message
    await prisma.message.create({
      data: {
        chatId,
        userId,
        role: 'ASSISTANT',
        content: result.synthesis.consensus,
        messageType: 'DEBATE',
        debateData: JSON.stringify({
          sessionId: debateSession.id,
          rounds: result.rounds,
          synthesis: result.synthesis,
          providers: result.providers,
          totalRounds: result.totalRounds,
          question
        })
      }
    });

    await prisma.chat.update({
      where: { id: chatId },
      data: {
        lastMessage: `[Debate] ${result.synthesis.consensus.slice(0, 100)}`,
        lastMessageAt: new Date(),
        messageCount: { increment: 2 }
      }
    });

    send({
      type: 'SYNTHESIS_COMPLETE',
      synthesis: result.synthesis,
      rounds: result.rounds,
      providers: result.providers
    });

    send({ type: 'DEBATE_DONE', done: true });
    res.end();

  } catch (err: any) {
    await prisma.debateSession.update({
      where: { id: debateSession.id },
      data: { status: 'FAILED' }
    });
    send({
      type: 'ERROR',
      error: err.message || 'Debate failed'
    });
    res.end();
  }
});
