import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PROVIDER_INFO } from './DebateSetupModal';

interface DebateResultProps {
  synthesis: {
    consensus: string;
    executiveSummary: string;
    contributions: Record<string, string>;
    agreements: string[];
    debates: Array<{
      topic: string;
      positions: Record<string, string>;
      resolution?: string;
    }>;
    keyInsights: string[];
    whatWasImproved: string;
    confidenceScore: number;
    winner: string | null;
    winnerReason?: string;
    warningFlags: string[];
  };
  rounds: Array<{
    round: number;
    responses: Array<{
      provider: string;
      content: string;
      role: string;
    }>;
  }>;
  providers: string[];
}

export default function DebateResult({
  synthesis,
  rounds,
  providers
}: DebateResultProps) {
  const [activeTab, setActiveTab] = useState<'answer' | 'debate' | 'rounds'>('answer');

  const confidenceColor =
    synthesis.confidenceScore >= 85
      ? 'text-green-600 bg-green-50 border-green-200'
      : synthesis.confidenceScore >= 65
      ? 'text-blue-600 bg-blue-50 border-blue-200'
      : 'text-orange-600 bg-orange-50 border-orange-200';

  const formatMarkdown = (text: string) => {
    return (
      <div className="prose prose-sm prose-slate max-w-none text-xs [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[11px] [&_code]:font-mono [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs [&_h4]:text-xs [&_strong]:text-slate-800">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Result Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚔️</span>
          <span className="font-bold text-slate-900">AI Debate Result</span>
          <span className="text-xs text-slate-505">
            {providers.length} AIs · {rounds.length} rounds
          </span>
        </div>
        <div className={`border rounded-full px-3 py-1 text-xs font-semibold ${confidenceColor}`}>
          {synthesis.confidenceScore}% Confidence
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {[
          { id: 'answer', label: '✅ Final Answer' },
          { id: 'debate', label: '📊 Debate Analysis' },
          { id: 'rounds', label: '⚔️ All Rounds' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Final Answer */}
      {activeTab === 'answer' && (
        <div className="space-y-4">
          {/* TL;DR */}
          {synthesis.executiveSummary && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-white shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider opacity-75 mb-1">
                Quick Summary
              </div>
              <p className="text-xs leading-relaxed font-medium">
                {synthesis.executiveSummary}
              </p>
            </div>
          )}

          {/* Full Consensus */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Consensus Answer
              </span>
            </div>
            {formatMarkdown(synthesis.consensus)}
          </div>

          {/* Who contributed what */}
          {synthesis.contributions && Object.keys(synthesis.contributions).length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                What Each AI Contributed
              </div>
              <div className="space-y-3">
                {Object.entries(synthesis.contributions).map(([provider, contribution]) => {
                  const normProvider = provider.toUpperCase();
                  const info = PROVIDER_INFO[normProvider];
                  return (
                    <div key={provider} className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                          info?.color || 'bg-slate-500'
                        }`}
                      >
                        {info?.icon || '?'}
                      </div>
                      <div className="text-xs leading-normal">
                        <span className="font-semibold text-slate-700">
                          {info?.name || provider}:
                        </span>
                        <span className="text-slate-650 ml-1.5">{contribution}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Winner */}
          {synthesis.winner && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
              <span className="text-2xl select-none">🏆</span>
              <div>
                <div className="font-bold text-yellow-900 text-xs">
                  Best Performer: {PROVIDER_INFO[synthesis.winner.toUpperCase()]?.name || synthesis.winner}
                </div>
                <p className="text-xs text-yellow-700 mt-0.5 leading-relaxed font-medium">
                  {synthesis.winnerReason}
                </p>
              </div>
            </div>
          )}

          {/* Warning flags */}
          {synthesis.warningFlags && synthesis.warningFlags.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 shadow-sm">
              <div className="text-xs font-bold text-orange-700 mb-2 uppercase tracking-wide">
                ⚠️ Important Caveats
              </div>
              <ul className="space-y-1.5">
                {synthesis.warningFlags.map((flag, i) => (
                  <li key={i} className="text-xs text-orange-750 flex items-start gap-2 font-medium">
                    <span className="flex-shrink-0 text-orange-500">•</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tab: Debate Analysis */}
      {activeTab === 'debate' && (
        <div className="space-y-4">
          {/* Agreements */}
          {synthesis.agreements && synthesis.agreements.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">🤝</span>
                <span className="font-bold text-green-900 text-xs uppercase tracking-wide">
                  All AIs Agreed On
                </span>
              </div>
              <ul className="space-y-2">
                {synthesis.agreements.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-green-800 leading-normal font-medium">
                    <span className="text-green-500 flex-shrink-0">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Debates */}
          {synthesis.debates && synthesis.debates.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm">⚔️</span>
                <span className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Points of Debate
                </span>
              </div>
              <div className="space-y-4">
                {synthesis.debates.map((debate, i) => (
                  <div key={i} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-700">{debate.topic}</span>
                    </div>
                    <div className="p-4 space-y-3 bg-white">
                      {debate.positions &&
                        Object.entries(debate.positions).map(([prov, pos]) => {
                          const normProvider = prov.toUpperCase();
                          const info = PROVIDER_INFO[normProvider];
                          return (
                            <div key={prov} className="flex items-start gap-2">
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${
                                  info?.color || 'bg-slate-500'
                               }`}
                              >
                                {info?.icon || '?'}
                              </div>
                              <p className="text-xs text-slate-650 leading-relaxed">
                                <span className="font-semibold text-slate-700 mr-1">
                                  {info?.name || prov}:
                                </span>
                                {pos}
                              </p>
                            </div>
                          );
                        })}
                      {debate.resolution && (
                        <div className="border-t border-slate-100 pt-2.5 mt-2.5">
                          <span className="text-xs font-bold text-slate-500">Resolution:</span>
                          <p className="text-xs text-slate-700 mt-1 leading-relaxed font-medium">
                            {debate.resolution}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Insights */}
          {synthesis.keyInsights && synthesis.keyInsights.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">💡</span>
                <span className="font-bold text-blue-900 text-xs uppercase tracking-wide">
                  Key Insights From Debate
                </span>
              </div>
              <ul className="space-y-2">
                {synthesis.keyInsights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-blue-800 leading-normal font-medium">
                    <span className="text-blue-500 font-bold flex-shrink-0">{i + 1}.</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* What improved */}
          {synthesis.whatWasImproved && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 shadow-sm">
              <div className="text-xs font-bold text-purple-700 mb-1 uppercase tracking-wide">
                📈 What The Debate Improved
              </div>
              <p className="text-xs text-purple-800 leading-relaxed font-medium">
                {synthesis.whatWasImproved}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab: All Rounds */}
      {activeTab === 'rounds' && (
        <div className="space-y-6">
          {rounds.map(round => (
            <div key={round.round} className="space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                Round {round.round} —{' '}
                {round.round === 1
                  ? 'Initial Positions'
                  : round.round === 2
                  ? 'Critiques & Revisions'
                  : 'Final Positions'}
              </div>
              <div className="grid grid-cols-1 gap-3">
                {round.responses.map(response => {
                  const normProvider = response.provider.toUpperCase();
                  const info = PROVIDER_INFO[normProvider];
                  return (
                    <div key={response.provider} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <div
                        className={`px-4 py-2.5 flex items-center gap-2 border-b border-slate-200 ${
                          info?.lightColor || 'bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${
                            info?.color || 'bg-slate-500'
                          }`}
                        >
                          {info?.icon || '?'}
                        </div>
                        <span
                          className={`font-semibold text-xs ${
                            info?.textColor || 'text-slate-700'
                          }`}
                        >
                          {info?.name || response.provider}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-auto bg-white px-2 py-0.5 rounded border border-slate-200 leading-none">
                          {response.role}
                        </span>
                      </div>
                      <div className="p-4 bg-white">
                        {formatMarkdown(response.content)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
