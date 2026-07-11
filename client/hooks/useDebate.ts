import { useState, useCallback } from 'react';

export interface DebateRound {
  round: number;
  responses: Array<{
    provider: string;
    content: string;
    role: string;
  }>;
}

export interface DebateSynthesis {
  consensus: string;
  executiveSummary: string;
  contributions: Record<string, string>;
  agreements: string[];
  debates: any[];
  keyInsights: string[];
  confidenceScore: number;
  winner: string | null;
  winnerReason?: string;
  warningFlags: string[];
}

export const useDebate = () => {
  const [status, setStatus] = useState<
    'idle' | 'round1' | 'round2' | 'round3' | 'synthesis' | 'complete' | 'error'
  >('idle');
  const [currentRound, setCurrentRound] = useState(0);
  const [rounds, setRounds] = useState<DebateRound[]>([]);
  const [synthesis, setSynthesis] = useState<DebateSynthesis | null>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const statusMessages = {
    idle: '',
    round1: '🧠 Round 1: AIs giving initial answers...',
    round2: '⚔️ Round 2: AIs critiquing each other...',
    round3: '🎯 Round 3: AIs giving final positions...',
    synthesis: '🔬 Synthesizing the best answer...',
    complete: '✅ Debate complete!',
    error: '❌ Debate failed'
  };

  const startDebate = useCallback(async ({
    chatId,
    question,
    providers,
    totalRounds = 2,
    mode = 'FREE_CHAT'
  }: {
    chatId: string;
    question: string;
    providers: string[];
    totalRounds?: number;
    mode?: string;
  }) => {
    setStatus('round1');
    setCurrentRound(0);
    setRounds([]);
    setSynthesis(null);
    setError('');
    setProgress(0);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || '/api'}/debate/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({
            chatId,
            question,
            providers,
            rounds: totalRounds,
            mode
          })
        }
      );

      if (!response.ok) {
        let errMsg = 'Debate failed';
        try {
          const err = await response.json();
          errMsg = err.error || err.message || errMsg;
        } catch (_) {}
        setError(errMsg);
        setStatus('error');
        return;
      }

      if (!response.body) {
        setError('No response body received from server.');
        setStatus('error');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // Retain the last unfinished line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(trimmed.slice(6));

            switch (data.type) {
              case 'DEBATE_STARTED':
                setStatus('round1');
                setProgress(10);
                break;

              case 'ROUND_COMPLETE':
                setRounds(prev => {
                  // Prevent duplicate entries for the same round
                  const filtered = prev.filter(r => r.round !== data.round);
                  return [
                    ...filtered,
                    {
                      round: data.round,
                      responses: data.responses
                    }
                  ];
                });
                setCurrentRound(data.round);
                setProgress((data.round / totalRounds) * 70 + 10);
                if (data.round === 1) {
                  setStatus(totalRounds >= 2 ? 'round2' : 'synthesis');
                } else if (data.round === 2) {
                  setStatus(totalRounds >= 3 ? 'round3' : 'synthesis');
                } else if (data.round === 3) {
                  setStatus('synthesis');
                }
                break;

              case 'SYNTHESIS_COMPLETE':
                setSynthesis(data.synthesis);
                setProgress(100);
                setStatus('complete');
                break;

              case 'ERROR':
                setError(data.error || 'Debate failed');
                setStatus('error');
                break;
            }
          } catch (_) {
            // Skip malformed chunks
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Network error starting debate');
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setCurrentRound(0);
    setRounds([]);
    setSynthesis(null);
    setError('');
    setProgress(0);
  }, []);

  return {
    status,
    statusMessage: statusMessages[status],
    currentRound,
    rounds,
    synthesis,
    error,
    progress,
    isDebating: status !== 'idle' && status !== 'complete' && status !== 'error',
    startDebate,
    reset
  };
};
