import { useState } from 'react';
import { Send, BookOpen, Lightbulb, List } from 'lucide-react';

interface StudyResponse {
  explanation: string;
  example: string;
  summary: string;
}

export default function StudyMode() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<StudyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      // Use localStorage API key if available, otherwise server will use environment variable
      const apiKey = localStorage.getItem('groqApiKey');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: question }],
          system_prompt: `You are Bodh AI, an expert educational assistant. When a student asks a question, respond ONLY with a valid JSON object (no markdown, no extra text) in this exact format:
{
  "explanation": "A detailed explanation of the concept in simple terms",
  "example": "A practical real-world example that illustrates the concept",
  "summary": "Key takeaways and what to remember"
}`,
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1024,
          stream: false,
          ...(apiKey && { apiKey }),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData.error?.message || errorData.error || 'Failed to get response';
        throw new Error(errorMessage);
      }

      const data = await res.json();
      const text = data.message.trim();

      // Parse JSON from response
      let parsed: StudyResponse;
      try {
        parsed = JSON.parse(text);
      } catch {
        // If not JSON, use the text as explanation
        parsed = {
          explanation: text,
          example: 'Please ask a follow-up question for a specific example.',
          summary: 'Review the explanation above for key takeaways.',
        };
      }

      setResponse(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <form onSubmit={handleAsk} className="space-y-3">
        <div className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your doubt... (e.g., 'What is photosynthesis?')"
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 smooth-transition resize-none h-32"
          />
        </div>
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg smooth-transition neon-glow"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Generating Response...' : 'Get Explanation'}
        </button>
      </form>

      {/* Response Section */}
      {response && (
        <div className="space-y-4">
          {/* Explanation */}
          <div className="glass-dark rounded-lg p-6 space-y-3 border-l-2 border-purple-500">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-slate-100">Detailed Explanation</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{response.explanation}</p>
          </div>

          {/* Example */}
          <div className="glass-dark rounded-lg p-6 space-y-3 border-l-2 border-cyan-500">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-cyan-400" />
              <h3 className="font-semibold text-slate-100">Practical Example</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{response.example}</p>
          </div>

          {/* Summary */}
          <div className="glass-dark rounded-lg p-6 space-y-3 border-l-2 border-pink-500">
            <div className="flex items-center gap-2">
              <List className="w-5 h-5 text-pink-400" />
              <h3 className="font-semibold text-slate-100">Key Takeaways</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{response.summary}</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigator.clipboard.writeText(
                `Q: ${question}\n\nExplanation: ${response.explanation}\n\nExample: ${response.example}\n\nSummary: ${response.summary}`
              )}
              className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800/70 smooth-transition text-sm font-medium"
            >
              Save Notes
            </button>
            <button
              onClick={() => { setQuestion(''); setResponse(null); }}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600/40 to-pink-600/40 border border-purple-500/50 text-purple-300 hover:from-purple-600/50 hover:to-pink-600/50 smooth-transition text-sm font-medium"
            >
              Ask Another
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!response && !loading && (
        <div className="glass-dark rounded-lg p-12 text-center space-y-3 border-dashed border-2 border-slate-700/50">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto opacity-50" />
          <p className="text-slate-400">Ask any question you're struggling with</p>
          <p className="text-sm text-slate-500">Get detailed explanations, examples, and key points</p>
        </div>
      )}
    </div>
  );
}
