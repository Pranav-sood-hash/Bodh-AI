import prisma from '../../config/db';
import { decrypt } from '../encryption.service';
import { callAI } from './ai.router.service';
import {
  buildRound1Prompt,
  buildRound2Prompt,
  buildRound3Prompt,
  buildSynthesisPrompt
} from './debate.prompts';

interface DebateRoundResponse {
  provider: string;
  model: string;
  content: string;
  round: number;
  role: 'initial' | 'critique' | 'final';
  tokensUsed: number;
}

interface DebateSynthesis {
  consensus: string;
  executiveSummary: string;
  contributions: Record<string, string>;
  agreements: string[];
  debates: Array<{
    topic: string;
    positions: Record<string, string>;
    resolution: string;
  }>;
  keyInsights: string[];
  whatWasImproved: string;
  confidenceScore: number;
  winner: string | null;
  winnerReason: string;
  warningFlags: string[];
}

export const processAIMessage = async (params: {
  userId: string;
  messages: Array<{ role: string; content: string }>;
  mode: string;
  providerOverride: string;
  rawKey?: string;
  userContext?: any;
}) => {
  const { providerOverride, messages, mode, rawKey } = params;
  
  let keyToUse = rawKey;
  if (!keyToUse) {
    const dbKey = await prisma.apiKey.findFirst({
      where: {
        userId: params.userId,
        provider: providerOverride as any,
        isActive: true
      }
    });
    if (dbKey) {
      keyToUse = decrypt(dbKey.encryptedKey);
    } else {
      keyToUse = process.env[`${providerOverride.toUpperCase()}_API_KEY`];
    }
  }

  if (!keyToUse) {
    throw new Error(`API key for provider ${providerOverride} not found.`);
  }

  return await callAI({
    provider: providerOverride,
    rawKey: keyToUse,
    messages,
    mode
  });
};

export const runDebate = async ({
  userId,
  question,
  providers,
  mode,
  totalRounds,
  userContext,
  onRoundComplete
}: {
  userId: string;
  question: string;
  providers: string[];
  mode: string;
  totalRounds: number;
  userContext?: object;
  onRoundComplete?: (
    round: number,
    responses: DebateRoundResponse[]
  ) => void | Promise<void>;
}) => {
  // Fetch and validate all API keys
  const apiKeys = await prisma.apiKey.findMany({
    where: {
      userId,
      isActive: true,
      provider: { in: providers as any[] }
    }
  });

  const availableProviders = apiKeys.map(
    k => k.provider
  );

  if (availableProviders.length < 2) {
    throw new Error(
      `Only ${availableProviders.length} provider(s) found. Need at least 2. Add more API keys in Settings → AI Configuration.`
    );
  }

  const allRoundResponses: DebateRoundResponse[][] = [];

  // ─── ROUND 1: INITIAL POSITIONS ──────
  const round1 = await runRound(
    1, 'initial',
    apiKeys.map(key => ({
      provider: key.provider,
      rawKey: decrypt(key.encryptedKey)
    })),
    (provider, rawKey) => 
      processAIMessage({
        userId,
        messages: [{
          role: 'user',
          content: buildRound1Prompt(
            question,
            provider,
            mode,
            availableProviders.length
          )
        }],
        mode,
        providerOverride: provider,
        rawKey,
        userContext
      })
  );

  allRoundResponses.push(round1);
  if (onRoundComplete) {
    await onRoundComplete(1, round1);
  }

  // ─── ROUND 2: CRITIQUE & REVISE ──────
  let round2: DebateRoundResponse[] = [];

  if (totalRounds >= 2) {
    round2 = await runRound(
      2, 'critique',
      apiKeys.map(key => ({
        provider: key.provider,
        rawKey: decrypt(key.encryptedKey)
      })),
      (provider, rawKey) => {
        const myAnswer = round1.find(
          r => r.provider === provider
        );
        const othersAnswers = round1
          .filter(r => r.provider !== provider)
          .map(r => ({
            provider: r.provider,
            content: r.content
          }));

        return processAIMessage({
          userId,
          messages: [{
            role: 'user',
            content: buildRound2Prompt(
              question,
              provider,
              myAnswer?.content || '',
              othersAnswers
            )
          }],
          mode: 'FREE_CHAT',
          providerOverride: provider,
          rawKey
        });
      }
    );

    allRoundResponses.push(round2);
    if (onRoundComplete) {
      await onRoundComplete(2, round2);
    }
  }

  // ─── ROUND 3: FINAL POSITIONS ────────
  let round3: DebateRoundResponse[] = [];

  if (totalRounds >= 3) {
    round3 = await runRound(
      3, 'final',
      apiKeys.map(key => ({
        provider: key.provider,
        rawKey: decrypt(key.encryptedKey)
      })),
      (provider, rawKey) => {
        const myRound1 = round1.find(
          r => r.provider === provider
        );
        const myRound2 = round2.find(
          r => r.provider === provider
        );
        const othersRound2 = round2.filter(
          r => r.provider !== provider
        ).map(r => ({
          provider: r.provider,
          content: r.content
        }));

        return processAIMessage({
          userId,
          messages: [{
            role: 'user',
            content: buildRound3Prompt(
              question,
              provider,
              myRound1?.content || '',
              myRound2?.content || '',
              othersRound2
            )
          }],
          mode: 'FREE_CHAT',
          providerOverride: provider,
          rawKey
        });
      }
    );

    allRoundResponses.push(round3);
    if (onRoundComplete) {
      await onRoundComplete(3, round3);
    }
  }

  // ─── SYNTHESIS ────────────────────────
  const lastRound = round3.length > 0
    ? round3 : round2.length > 0
    ? round2 : round1;

  const allFlat = allRoundResponses.flat();

  // Use the primary provider for synthesis
  const primaryKey = apiKeys.find(
    k => k.isPrimary
  ) || apiKeys[0];

  const synthesisResult = await processAIMessage({
    userId,
    messages: [{
      role: 'user',
      content: buildSynthesisPrompt(
        question,
        allFlat,
        availableProviders
      )
    }],
    mode: 'FREE_CHAT',
    providerOverride: primaryKey.provider,
    rawKey: decrypt(primaryKey.encryptedKey)
  });

  // Parse synthesis JSON
  let synthesis: DebateSynthesis;
  try {
    const match = synthesisResult.content.match(/\{[\s\S]*\}/);
    synthesis = JSON.parse(match![0]);
  } catch {
    synthesis = {
      consensus: lastRound[0]?.content || 'Synthesis failed. See individual answers.',
      executiveSummary: 'See full answer above.',
      contributions: {},
      agreements: [],
      debates: [],
      keyInsights: [],
      whatWasImproved: '',
      confidenceScore: 70,
      winner: null,
      winnerReason: '',
      warningFlags: [
        'Synthesis parsing failed. Showing best available answer.'
      ]
    };
  }

  // Update usage stats for all keys
  await Promise.all(
    apiKeys.map(key =>
      prisma.apiKey.update({
        where: { id: key.id },
        data: {
          totalRequests: {
            increment: totalRounds + 1
          },
          lastUsedAt: new Date()
        }
      })
    )
  );

  return {
    rounds: allRoundResponses,
    synthesis,
    providers: availableProviders,
    totalRounds: allRoundResponses.length
  };
};

// Run all participants in one round
const runRound = async (
  roundNumber: number,
  role: 'initial' | 'critique' | 'final',
  participants: Array<{
    provider: string;
    rawKey: string;
  }>,
  callAI: (
    provider: string,
    rawKey: string
  ) => Promise<any>
): Promise<DebateRoundResponse[]> => {

  const results = await Promise.allSettled(
    participants.map(async (p) => {
      try {
        const result = await callAI(
          p.provider, p.rawKey
        );
        return {
          provider: p.provider,
          model: result.model || p.provider,
          content: result.content,
          round: roundNumber,
          role,
          tokensUsed: result.tokens?.total || 0
        };
      } catch (err: any) {
        // Return error response instead of crashing
        return {
          provider: p.provider,
          model: p.provider,
          content: `[${p.provider} failed in Round ${roundNumber}: ${err.message}]`,
          round: roundNumber,
          role,
          tokensUsed: 0
        };
      }
    })
  );

  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => (r as PromiseFulfilledResult<DebateRoundResponse>).value);
};
