import React from 'react';
import { PROVIDER_INFO } from './DebateSetupModal';

interface DebateProgressProps {
  status: 'idle' | 'round1' | 'round2' | 'round3' | 'synthesis' | 'complete' | 'error';
  statusMessage: string;
  currentRound: number;
  rounds: Array<{
    round: number;
    responses: Array<{
      provider: string;
      content: string;
      role: string;
    }>;
  }>;
  progress: number;
  totalRounds: number;
  providers: string[];
}

export default function DebateProgress({
  status,
  statusMessage,
  currentRound,
  rounds,
  progress,
  totalRounds,
  providers
}: DebateProgressProps) {
  return (
    <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 my-4 space-y-5 shadow-sm">
      {/* Overall progress */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-slate-900 text-sm md:text-base">
            {statusMessage}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Round timeline */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalRounds }, (_, i) => i + 1).map(round => {
          const roundDone = rounds.some(r => r.round === round);
          const isActive = currentRound === round && !roundDone;

          return (
            <div key={round} className="flex items-center gap-2 flex-1">
              <div
                className={`flex-1 h-1 rounded-full transition-all duration-500 ${
                  roundDone ? 'bg-green-500' : isActive ? 'bg-blue-400 animate-pulse' : 'bg-slate-200'
                }`}
              />
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                  roundDone
                    ? 'bg-green-500 text-white'
                    : isActive
                    ? 'bg-blue-500 text-white animate-pulse'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {roundDone ? '✓' : round}
              </div>
            </div>
          );
        })}
        <div
          className={`flex-1 h-1 rounded-full ${
            status === 'complete' ? 'bg-green-500' : status === 'synthesis' ? 'bg-blue-400 animate-pulse' : 'bg-slate-200'
          }`}
        />
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            status === 'complete'
              ? 'bg-green-500 text-white'
              : status === 'synthesis'
              ? 'bg-blue-500 text-white animate-pulse'
              : 'bg-slate-200 text-slate-500'
          }`}
        >
          ✅
        </div>
      </div>

      {/* Live round responses */}
      {rounds.length > 0 && (
        <div className="space-y-3">
          {rounds.map(round => (
            <div key={round.round} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-4 py-2 flex items-center gap-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Round {round.round} Complete
                </span>
                <span className="text-green-600 text-xs ml-auto font-medium">
                  ✓ {round.responses.length} responses
                </span>
              </div>
              <div className="divide-y divide-slate-100 bg-white">
                {round.responses.map(r => {
                  const normProvider = r.provider.toUpperCase();
                  const info = PROVIDER_INFO[normProvider];
                  return (
                    <div key={r.provider} className="px-4 py-3 flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                          info?.color || 'bg-slate-500'
                        }`}
                      >
                        {info?.icon || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-700">
                          {info?.name || r.provider}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {r.content.replace(/\[\w+ failed in Round \d+:.*\]/g, 'Connection issues. Retrying...').slice(0, 120)}...
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {status === 'synthesis' && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <div>
            <div className="text-sm font-bold text-blue-900">Synthesizing final answer...</div>
            <div className="text-xs text-blue-600">
              Reading all {rounds.length} rounds and extracting the best insights
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
