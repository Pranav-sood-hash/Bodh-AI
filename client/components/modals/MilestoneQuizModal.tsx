import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Award, ArrowRight, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Loader } from '@/components/ui/loader';

interface Question {
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface MilestoneQuizModalProps {
  milestoneId: string;
  milestoneTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function MilestoneQuizModal({
  milestoneId,
  milestoneTitle,
  isOpen,
  onClose,
  onSuccess
}: MilestoneQuizModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    results: Array<{
      questionText: string;
      selectedOption: string;
      correctOption: string;
      isCorrect: boolean;
      explanation: string;
    }>;
  } | null>(null);

  useEffect(() => {
    if (isOpen && milestoneId) {
      fetchQuiz();
    }
  }, [isOpen, milestoneId]);

  const fetchQuiz = async () => {
    setLoading(true);
    setResult(null);
    setAnswers([]);
    setCurrentIdx(0);
    try {
      const { data } = await api.get(`/quiz/${milestoneId}`);
      if (data?.data?.questions) {
        setQuestions(data.data.questions);
        setAnswers(new Array(data.data.questions.length).fill(-1));
      } else {
        toast.error('Could not load quiz questions.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIdx: number) => {
    const updated = [...answers];
    updated[currentIdx] = optionIdx;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = async () => {
    if (answers.includes(-1)) {
      toast.error('Please answer all questions before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post(`/quiz/${milestoneId}/submit`, {
        answers,
        questions
      });
      if (data?.data) {
        setResult(data.data);
        if (data.data.passed) {
          toast.success(`Congratulations! You passed with ${data.data.score}%!`);
          if (onSuccess) onSuccess();
        } else {
          toast.error(`You scored ${data.data.score}%. You need at least 70% to pass.`);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to submit quiz answers.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentQuestion = questions[currentIdx];
  const allAnswered = answers.every((a) => a !== -1);
  const progressPct = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-white border border-slate-100 rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="border-b border-slate-100 pb-4 mb-4">
          <DialogTitle className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            Milestone Evaluation Quiz
          </DialogTitle>
          <DialogDescription className="text-sm font-semibold text-slate-500">
            Testing knowledge for: <span className="text-indigo-600 font-bold">{milestoneTitle}</span>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader size="md" className="mx-auto" />
            <p className="text-sm font-semibold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
              AI is preparing evaluation questions...
            </p>
          </div>
        ) : result ? (
          /* RESULT SCREEN */
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 ${
              result.passed ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'
            }`}>
              {result.passed ? (
                <>
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
                  <h3 className="text-2xl font-extrabold text-emerald-900">Evaluation Passed!</h3>
                  <p className="text-sm font-semibold text-emerald-700 max-w-md">
                    Excellent work! You scored {result.score}%. The milestone is marked completed, and the next learning block has been unlocked.
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 text-rose-500" />
                  <h3 className="text-2xl font-extrabold text-rose-900">Keep Practicing</h3>
                  <p className="text-sm font-semibold text-rose-700 max-w-md">
                    You scored {result.score}%. A score of 70% or higher is required to certify this milestone. Try again to lock in your learnings.
                  </p>
                  <Button
                    onClick={fetchQuiz}
                    className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold py-2 px-4 shadow-md"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry Quiz
                  </Button>
                </>
              )}
            </div>

            {/* DETAILED RESULTS & EXPLANATIONS */}
            <div className="space-y-4 border-t border-slate-100 pt-6">
              <h4 className="text-md font-extrabold text-slate-900">Review Questions</h4>
              <div className="space-y-4">
                {result.results.map((resItem, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                    <div className="flex gap-3">
                      <span className="font-extrabold text-xs text-slate-400 mt-0.5">{idx + 1}.</span>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800">{resItem.questionText}</p>
                        <div className="flex flex-col gap-1.5 pt-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-500">Your Answer:</span>
                            <span className={`font-bold ${resItem.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {resItem.selectedOption}
                            </span>
                            {!resItem.isCorrect && <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                            {resItem.isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                          </div>
                          {!resItem.isCorrect && (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-500">Correct Answer:</span>
                              <span className="font-bold text-emerald-600">{resItem.correctOption}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Explanation */}
                    <div className="p-3 bg-white border border-slate-100 rounded-lg text-xs leading-relaxed text-slate-600 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-indigo-900">Explanation: </span>
                        {resItem.explanation}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={onClose} className="rounded-xl font-bold bg-slate-900 text-white">
                Close
              </Button>
            </div>
          </div>
        ) : (
          /* ACTIVE QUESTIONS SCREEN */
          questions.length > 0 && currentQuestion && (
            <div className="space-y-6">
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Question {currentIdx + 1} of {questions.length}</span>
                  <span>{Math.round(progressPct)}% Complete</span>
                </div>
                <Progress value={progressPct} className="h-2 bg-slate-100 rounded-full" />
              </div>

              {/* Question Text */}
              <div className="p-5 bg-indigo-50/20 border border-indigo-100/50 rounded-2xl">
                <h3 className="text-md font-extrabold text-slate-900 leading-relaxed">
                  {currentQuestion.questionText}
                </h3>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = answers[currentIdx] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`p-4 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-1 ring-indigo-600'
                          : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-bold ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="flex-1">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                <Button
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                  variant="outline"
                  className="flex items-center gap-2 rounded-xl font-bold border-slate-200 text-slate-700 disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>

                {currentIdx < questions.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    disabled={answers[currentIdx] === -1}
                    className="flex items-center gap-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!allAnswered || submitting}
                    className="flex items-center gap-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader size="sm" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Quiz
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
