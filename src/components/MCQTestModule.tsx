import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  PlayCircle,
  ArrowRight,
  RotateCcw,
  Clock,
  Sparkles,
  AlertTriangle,
  Award,
  Video,
  ExternalLink,
} from 'lucide-react';
import { MCQQuestion, MCQSubject, UserTestAnswer } from '../types';
import confetti from 'canvas-confetti';

export const MCQTestModule: React.FC = () => {
  const {
    mcqQuestions,
    videos,
    currentUser,
    submitTestResult,
    openVideoModal,
    setCurrentTab,
  } = useApp();

  const subjects: (MCQSubject | 'All')[] = [
    'All',
    'Java',
    'SQL',
    'DSA',
    'OS',
    'Networking',
    'Aptitude',
  ];

  // Test states
  const [selectedSubject, setSelectedSubject] = useState<MCQSubject | 'All'>('Java');
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [testQuestions, setTestQuestions] = useState<MCQQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState<boolean>(false);
  const [recordedAnswers, setRecordedAnswers] = useState<UserTestAnswer[]>([]);
  const [isTestFinished, setIsTestFinished] = useState<boolean>(false);
  const [testTimeSeconds, setTestTimeSeconds] = useState<number>(0);

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTestRunning && !isTestFinished) {
      timer = setInterval(() => {
        setTestTimeSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTestRunning, isTestFinished]);

  const startTest = (subj: MCQSubject | 'All') => {
    let pool = mcqQuestions;
    if (subj !== 'All') {
      pool = mcqQuestions.filter((q) => q.subject === subj);
    }
    if (pool.length === 0) {
      pool = mcqQuestions;
    }

    // Shuffle and pick up to 6 questions
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(6, shuffled.length));

    setTestQuestions(selected);
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasSubmittedAnswer(false);
    setRecordedAnswers([]);
    setIsTestFinished(false);
    setTestTimeSeconds(0);
    setIsTestRunning(true);
  };

  const handleSelectOption = (option: 'A' | 'B' | 'C' | 'D') => {
    if (hasSubmittedAnswer) return;
    setSelectedOption(option);
  };

  const currentQ = testQuestions[currentIndex];

  const handleVerifyAnswer = () => {
    if (!selectedOption || !currentQ) return;
    const isCorrect = selectedOption === currentQ.correct_answer;

    setHasSubmittedAnswer(true);

    const answerRecord: UserTestAnswer = {
      question_id: currentQ.id,
      selected_answer: selectedOption,
      is_correct: isCorrect,
      topic: currentQ.topic,
    };

    setRecordedAnswers((prev) => [...prev, answerRecord]);

    if (isCorrect) {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.7 },
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < testQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasSubmittedAnswer(false);
    } else {
      // Test complete
      finishTest();
    }
  };

  const finishTest = () => {
    setIsTestFinished(true);
    setIsTestRunning(false);

    // Calculate score
    const correctCount = recordedAnswers.filter((a) => a.is_correct).length;
    const totalCount = testQuestions.length;
    const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    // Detect weak topics
    const wrongAnswers = recordedAnswers.filter((a) => !a.is_correct);
    const weakTopics = Array.from(new Set(wrongAnswers.map((a) => a.topic)));

    // Save test result
    submitTestResult({
      student_id: currentUser?.id || 'user-nivitha',
      student_name: currentUser?.name || 'Nivitha',
      subject: selectedSubject === 'All' ? 'Full Placement Mock' : selectedSubject,
      score: correctCount,
      total_questions: totalCount,
      percentage,
      answers: recordedAnswers,
      identified_weak_topics: weakTopics,
    });
  };

  // Find videos matching any wrong answers
  const recommendedVideosForTest = useMemo(() => {
    if (!isTestFinished) return [];
    const wrongTopics = recordedAnswers
      .filter((a) => !a.is_correct)
      .map((a) => a.topic.toLowerCase());

    return videos.filter((v) =>
      wrongTopics.some(
        (wt) => v.topic.toLowerCase() === wt || v.title.toLowerCase().includes(wt)
      )
    );
  }, [isTestFinished, recordedAnswers, videos]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. SUBJECT SELECTION & TEST LAUNCHER (When not running and not finished) */}
      {!isTestRunning && !isTestFinished && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-2">
              <HelpCircle className="w-4 h-4" />
              <span>Assessment & Weak Topic Diagnostics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Placement MCQ Assessments
            </h1>
            <p className="text-slate-500 text-sm mt-1 max-w-2xl leading-relaxed">
              Take topic-wise MCQ tests with instant explanations. If you answer incorrectly,
              SkillPilot immediately reveals the explanation, flags your weak topic, and maps
              curated YouTube tutorials to accelerate your learning.
            </p>

            {/* Subject Selector Cards */}
            <div className="mt-8 space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Assessment Subject:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {subjects.map((subj) => {
                  const count =
                    subj === 'All'
                      ? mcqQuestions.length
                      : mcqQuestions.filter((q) => q.subject === subj).length;
                  const isSelected = selectedSubject === subj;

                  return (
                    <button
                      key={subj}
                      onClick={() => setSelectedSubject(subj)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-900">{subj}</span>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-mono">
                        {count} questions available
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Launch CTA */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Timed assessment with instant feedback mode</span>
              </div>
              <button
                onClick={() => startTest(selectedSubject)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Start Assessment Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACTIVE TEST INTERFACE */}
      {isTestRunning && currentQ && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8">
          {/* Top Bar: Progress and Timer */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                {currentQ.subject} · {currentQ.topic}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Question {currentIndex + 1} of {testQuestions.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatTime(testTimeSeconds)}</span>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {currentQ.question}
            </h2>
          </div>

          {/* Options A, B, C, D */}
          <div className="space-y-2.5">
            {[
              { key: 'A', text: currentQ.option_a },
              { key: 'B', text: currentQ.option_b },
              { key: 'C', text: currentQ.option_c },
              { key: 'D', text: currentQ.option_d },
            ].map((opt) => {
              const optKey = opt.key as 'A' | 'B' | 'C' | 'D';
              const isSelected = selectedOption === optKey;
              const isCorrectAnswer = currentQ.correct_answer === optKey;

              let style =
                'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/70 text-slate-800';

              if (isSelected && !hasSubmittedAnswer) {
                style = 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 text-slate-900';
              }

              if (hasSubmittedAnswer) {
                if (isCorrectAnswer) {
                  style = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium';
                } else if (isSelected && !isCorrectAnswer) {
                  style = 'border-red-500 bg-red-50 text-red-950';
                } else {
                  style = 'border-slate-200 opacity-60 text-slate-500';
                }
              }

              return (
                <button
                  key={opt.key}
                  disabled={hasSubmittedAnswer}
                  onClick={() => handleSelectOption(optKey)}
                  className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${style}`}
                >
                  <span
                    className={`w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                      hasSubmittedAnswer && isCorrectAnswer
                        ? 'bg-emerald-600 text-white'
                        : hasSubmittedAnswer && isSelected && !isCorrectAnswer
                        ? 'bg-red-600 text-white'
                        : isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {opt.key}
                  </span>
                  <span className="text-sm pt-0.5">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Action Button: Verify or Next */}
          <div className="pt-2">
            {!hasSubmittedAnswer ? (
              <button
                disabled={!selectedOption}
                onClick={handleVerifyAnswer}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  selectedOption
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Verify Answer</span>
              </button>
            ) : (
              <div className="space-y-4">
                {/* Instant Feedback Callout matching prompt format exactly */}
                {selectedOption === currentQ.correct_answer ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-800 text-base">
                      <span className="text-lg">🟢</span>
                      <span>Correct</span>
                    </div>
                    <div className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                      <strong className="block text-emerald-950 mb-0.5">Explanation:</strong>
                      {currentQ.explanation}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-950 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-red-800 text-base">
                      <span className="text-lg">🔴</span>
                      <span>Wrong</span>
                    </div>
                    <div className="text-xs sm:text-sm text-red-900">
                      <span className="font-semibold text-red-950">Correct Answer: </span>
                      {currentQ.correct_answer}.{' '}
                      {currentQ[
                        `option_${currentQ.correct_answer.toLowerCase()}` as keyof MCQQuestion
                      ]}
                    </div>
                    <div className="text-xs sm:text-sm text-red-900 leading-relaxed pt-1">
                      <strong className="block text-red-950 mb-0.5">Explanation:</strong>
                      {currentQ.explanation}
                    </div>

                    {/* Instant Video Recommendation in Wrong Answer Callout */}
                    {currentQ.video_link && (
                      <div className="mt-3 pt-3 border-t border-red-200/80 flex items-center justify-between gap-2">
                        <div className="text-xs text-red-900">
                          <span className="font-bold">Recommended Video: </span>
                          <span>{currentQ.topic} Concept Tutorial</span>
                        </div>
                        <a
                          href={currentQ.video_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shrink-0"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Watch Video</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleNextQuestion}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>
                    {currentIndex + 1 < testQuestions.length
                      ? 'Next Question'
                      : 'Complete Assessment & View Analysis'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. TEST FINISHED SCREEN WITH WEAK TOPIC ANALYSIS & VIDEO RECOMMENDATIONS */}
      {isTestFinished && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Award className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Assessment Complete!</h2>
              <p className="text-sm text-slate-500">
                Subject: {selectedSubject === 'All' ? 'Mixed Placement Mock' : selectedSubject} ·
                Duration: {formatTime(testTimeSeconds)}
              </p>
            </div>

            {/* Scorecard */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
              <div>
                <span className="text-xs text-slate-500">Correct Answers</span>
                <p className="text-xl font-bold text-emerald-600 font-mono">
                  {recordedAnswers.filter((a) => a.is_correct).length} / {testQuestions.length}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Percentage Score</span>
                <p className="text-xl font-bold text-slate-900 font-mono">
                  {testQuestions.length > 0
                    ? Math.round(
                        (recordedAnswers.filter((a) => a.is_correct).length /
                          testQuestions.length) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Weak Topics Detected</span>
                <p className="text-xl font-bold text-amber-600 font-mono">
                  {
                    Array.from(
                      new Set(
                        recordedAnswers.filter((a) => !a.is_correct).map((a) => a.topic)
                      )
                    ).length
                  }
                </p>
              </div>
            </div>

            {/* Weak Topics Analysis Section */}
            {recordedAnswers.filter((a) => !a.is_correct).length > 0 ? (
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Identified Weak Topics to Strengthen:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from(
                    new Set(
                      recordedAnswers.filter((a) => !a.is_correct).map((a) => a.topic)
                    )
                  ).map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold border border-amber-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-amber-800">
                  These topics have been added to your dashboard's Weak Topic Watchlist for focused
                  revision.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Perfect score! Outstanding mastery of these interview concepts.</span>
              </div>
            )}

            {/* Recommended Videos for Missed Questions */}
            {recommendedVideosForTest.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-indigo-600" />
                    <span>Recommended Videos to Bridge Weak Topics</span>
                  </h3>
                  <span className="text-xs text-slate-500">Admin Curated</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendedVideosForTest.map((vid) => (
                    <div
                      key={vid.id}
                      onClick={() => openVideoModal(vid)}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold uppercase text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {vid.topic}
                        </span>
                        <p className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {vid.title}
                        </p>
                        <span className="text-[11px] text-slate-500">{vid.duration}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0 group-hover:scale-105 transition-transform">
                        <PlayCircle className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Retake or Return */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => startTest(selectedSubject)}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Test</span>
              </button>

              <button
                onClick={() => setCurrentTab('dashboard')}
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Back to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
