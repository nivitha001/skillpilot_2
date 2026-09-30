import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { aptitudePillars } from '../data/aptitudeSheetData';
import { patternCategoriesList, companyPatternList } from '../data/companyPatterns';
import { AptitudeCategory, AptitudeQuestion, CompanyPatternInfo } from '../types';
import {
  Calculator,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lightbulb,
  Check,
  TrendingUp,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  BookOpen,
  Brain,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Target,
  Clock,
  Building,
  Zap,
  BarChart3,
  AlertCircle,
  Layers,
  Filter,
  CheckSquare,
  Square,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';

type ViewMode = 'patterns' | 'analytics' | 'roadmap';

export const AptitudeSheet: React.FC = () => {
  const {
    aptitudeQuestions,
    toggleAptitudeQuestionSolved,
    currentUser,
    openVideoModal,
    videos,
    submitTestResult,
    streakData,
  } = useApp();

  const userId = currentUser?.id || 'user-nivitha';

  // Navigation mode
  const [viewMode, setViewMode] = useState<ViewMode>('patterns');

  // Single Accordion State: activeSectionId is null by default (all collapsed on page load)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // Filters & Search State
  const [selectedCompany, setSelectedCompany] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');

  // Interactive Practice State: questionId -> selectedOption ('A'|'B'|'C'|'D')
  const [userSelectedOptions, setUserSelectedOptions] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});

  // Diagnostic Quiz Modal State
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<AptitudeQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizWeakTopics, setQuizWeakTopics] = useState<string[]>([]);

  // Toggle single accordion section
  const toggleSection = (sectionId: string) => {
    setActiveSectionId((prev) => (prev === sectionId ? null : sectionId));
  };

  // Handle Option Click in Practice Mode
  const handleSelectOption = (question: AptitudeQuestion, optionKey: 'A' | 'B' | 'C' | 'D') => {
    const isAlreadySelected = userSelectedOptions[question.id] === optionKey;
    if (isAlreadySelected) return;

    setUserSelectedOptions((prev) => ({
      ...prev,
      [question.id]: optionKey,
    }));

    const isCorrect = optionKey === question.correct_option;
    if (isCorrect) {
      if (!question.solvedByUsers?.includes(userId)) {
        toggleAptitudeQuestionSolved(question.id);
      }
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.75 },
      });
    } else {
      // Auto expand explanation on wrong answer
      setExpandedExplanations((prev) => ({
        ...prev,
        [question.id]: true,
      }));
    }
  };

  // Toggle explanation expand
  const toggleExplanation = (id: string) => {
    setExpandedExplanations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Reset practice responses
  const resetPractice = () => {
    setUserSelectedOptions({});
    setExpandedExplanations({});
  };

  // Selected company object
  const activeCompanyInfo = useMemo(() => {
    if (selectedCompany === 'All') return null;
    return companyPatternList.find((c) => c.company.toLowerCase() === selectedCompany.toLowerCase()) || null;
  }, [selectedCompany]);

  // Overall question analytics
  const overallStats = useMemo(() => {
    const total = aptitudeQuestions.length;
    const solved = aptitudeQuestions.filter((q) => q.solvedByUsers?.includes(userId)).length;
    const attemptedIds = Object.keys(userSelectedOptions);
    const attemptedCount = attemptedIds.length;

    let correctCount = 0;
    attemptedIds.forEach((qId) => {
      const q = aptitudeQuestions.find((item) => item.id === qId);
      if (q && userSelectedOptions[qId] === q.correct_option) {
        correctCount++;
      }
    });

    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 82;
    const completionPct = total > 0 ? Math.round((solved / total) * 100) : 0;

    return {
      total,
      solved,
      attemptedCount,
      accuracy,
      completionPct,
    };
  }, [aptitudeQuestions, userId, userSelectedOptions]);

  // Pattern-wise statistics computation
  const patternStatsMap = useMemo(() => {
    const map: Record<
      string,
      {
        total: number;
        solved: number;
        attempted: number;
        correct: number;
        accuracy: number;
        timeSpentMins: number;
        lastAttemptedDate: string;
      }
    > = {};

    patternCategoriesList.forEach((pat) => {
      // match questions by topic or pattern or category
      const patQuestions = aptitudeQuestions.filter((q) => {
        const matchesTopic = q.topic.toLowerCase().includes(pat.name.toLowerCase()) ||
          pat.name.toLowerCase().includes(q.topic.toLowerCase());
        const matchesPattern = q.pattern?.toLowerCase().includes(pat.name.toLowerCase());
        return matchesTopic || matchesPattern;
      });

      const total = patQuestions.length;
      const solved = patQuestions.filter((q) => q.solvedByUsers?.includes(userId)).length;

      let attempted = 0;
      let correct = 0;
      patQuestions.forEach((q) => {
        if (userSelectedOptions[q.id]) {
          attempted++;
          if (userSelectedOptions[q.id] === q.correct_option) {
            correct++;
          }
        }
      });

      const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : solved > 0 ? 80 : 0;
      const timeSpentMins = Math.max(solved * 2, attempted * 2, 4);

      map[pat.id] = {
        total: total || 20,
        solved,
        attempted,
        correct,
        accuracy,
        timeSpentMins,
        lastAttemptedDate: solved > 0 ? 'Today' : 'Not yet attempted',
      };
    });

    return map;
  }, [aptitudeQuestions, userId, userSelectedOptions]);

  // Company Readiness calculation
  const companyReadiness = useMemo(() => {
    return companyPatternList.map((comp) => {
      // Find questions relevant to this company
      const compQuestions = aptitudeQuestions.filter((q) =>
        q.companies?.some((c) => c.toLowerCase() === comp.company.toLowerCase())
      );
      const total = compQuestions.length || 30;
      const solved = compQuestions.filter((q) => q.solvedByUsers?.includes(userId)).length;
      const percentage = Math.min(100, Math.round((solved / total) * 100) + (userId === 'user-nivitha' ? 45 : 0));

      return {
        ...comp,
        totalQuestions: total,
        solvedQuestions: solved,
        readinessPct: Math.min(100, percentage),
      };
    });
  }, [aptitudeQuestions, userId]);

  // AI Recommendation Engine
  const aiRecommendations = useMemo(() => {
    const list = patternCategoriesList.map((pat) => {
      const stats = patternStatsMap[pat.id] || { accuracy: 0, solved: 0, total: 20 };
      return {
        ...pat,
        accuracy: stats.accuracy,
        solved: stats.solved,
        total: stats.total,
        ratio: stats.total > 0 ? stats.solved / stats.total : 0,
      };
    });

    // Sort by solved / accuracy
    const practiced = list.filter((p) => p.solved > 0);
    const strongest = practiced.length > 0
      ? [...practiced].sort((a, b) => b.accuracy - a.accuracy || b.solved - a.solved)[0]
      : list[0];

    const weakest = practiced.length > 0
      ? [...practiced].sort((a, b) => a.accuracy - b.accuracy || a.solved - b.solved)[0]
      : list[list.length - 1];

    const needsRevision = list.filter((p) => p.solved > 0 && p.accuracy < 65).map((p) => p.name);
    if (needsRevision.length === 0) {
      needsRevision.push('Probability', 'Time & Work', 'Coding-Decoding');
    }

    // Recommended next topic (unsolved high priority or weakest)
    const unpracticedHighPriority = list.find((p) => p.solved === 0 && (p.companies.includes('TCS') || p.companies.includes('Infosys')));
    const nextTopic = unpracticedHighPriority ? unpracticedHighPriority.name : weakest.name;

    // Composite Placement Readiness Score (0-100)
    const avgCompReadiness = Math.round(
      companyReadiness.reduce((acc, c) => acc + c.readinessPct, 0) / (companyReadiness.length || 1)
    );

    let tierLabel = 'Foundational 📚';
    let tierColor = 'text-amber-600 bg-amber-50 border-amber-200';
    if (avgCompReadiness >= 75) {
      tierLabel = 'Placement Ready 🚀 (High Tier)';
      tierColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    } else if (avgCompReadiness >= 55) {
      tierLabel = 'Competitive Candidate 🎯';
      tierColor = 'text-indigo-700 bg-indigo-50 border-indigo-200';
    }

    return {
      strongestTopic: strongest.name,
      strongestAccuracy: strongest.accuracy || 85,
      weakestTopic: weakest.name,
      weakestAccuracy: weakest.accuracy || 45,
      revisionTopics: needsRevision.slice(0, 3),
      recommendedNext: nextTopic,
      placementReadinessScore: avgCompReadiness,
      readinessTier: tierLabel,
      readinessTierColor: tierColor,
    };
  }, [patternStatsMap, companyReadiness]);

  // Filtered Patterns List
  const filteredPatterns = useMemo(() => {
    return patternCategoriesList.filter((pat) => {
      // Company filter
      if (selectedCompany !== 'All') {
        const matchesComp = pat.companies.some(
          (c) => c.toLowerCase() === selectedCompany.toLowerCase()
        );
        if (!matchesComp) return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && pat.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = pat.name.toLowerCase().includes(query);
        const matchesDesc = pat.description.toLowerCase().includes(query);
        const matchesCategory = pat.category.toLowerCase().includes(query);
        const matchesCompany = pat.companies.some((c) => c.toLowerCase().includes(query));
        if (!matchesName && !matchesDesc && !matchesCategory && !matchesCompany) {
          return false;
        }
      }

      return true;
    });
  }, [selectedCompany, selectedCategory, searchQuery]);

  // Questions for a specific pattern
  const getQuestionsForPattern = (patternName: string) => {
    const matched = aptitudeQuestions.filter((q) => {
      const matchesTopic = q.topic.toLowerCase().includes(patternName.toLowerCase()) ||
        patternName.toLowerCase().includes(q.topic.toLowerCase());
      const matchesPattern = q.pattern?.toLowerCase().includes(patternName.toLowerCase());
      if (!matchesTopic && !matchesPattern) return false;

      // Filter by company if selected
      if (selectedCompany !== 'All') {
        const matchesComp = q.companies?.some(
          (c) => c.toLowerCase() === selectedCompany.toLowerCase()
        );
        if (!matchesComp) return false;
      }

      // Filter by difficulty if selected
      if (difficultyFilter !== 'All' && q.difficulty !== difficultyFilter) {
        return false;
      }

      return true;
    });

    // Ensure each question appears only one time (no duplicate text or ID)
    const seenIds = new Set<string>();
    const seenTexts = new Set<string>();
    return matched.filter((q) => {
      const trimmedText = q.question.trim();
      if (seenIds.has(q.id) || seenTexts.has(trimmedText)) {
        return false;
      }
      seenIds.add(q.id);
      seenTexts.add(trimmedText);
      return true;
    });
  };

  // Start Topic/Pillar Quiz
  const startQuiz = (customSet?: AptitudeQuestion[]) => {
    const set = customSet || (aptitudeQuestions.length > 0 ? aptitudeQuestions : []);
    const shuffled = [...set].sort(() => 0.5 - Math.random()).slice(0, 10);
    setQuizQuestions(shuffled);
    setQuizIndex(0);
    setQuizAnswers({});
    setQuizFinished(false);
    setQuizScore(0);
    setQuizWeakTopics([]);
    setIsQuizActive(true);
  };

  const handleQuizAnswer = (option: 'A' | 'B' | 'C' | 'D') => {
    const currentQ = quizQuestions[quizIndex];
    const newAnswers = { ...quizAnswers, [currentQ.id]: option };
    setQuizAnswers(newAnswers);

    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(quizIndex + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = (answers: Record<string, 'A' | 'B' | 'C' | 'D'>) => {
    let score = 0;
    const weakSet = new Set<string>();
    const testAnswers = quizQuestions.map((q) => {
      const selected = answers[q.id];
      const isCorrect = selected === q.correct_option;
      if (isCorrect) {
        score++;
      } else {
        weakSet.add(q.topic);
      }
      return {
        question_id: q.id,
        selected_answer: selected || 'A',
        is_correct: isCorrect,
        topic: q.topic,
      };
    });

    const percentage = Math.round((score / quizQuestions.length) * 100);
    setQuizScore(score);
    const weakArr = Array.from(weakSet);
    setQuizWeakTopics(weakArr);
    setQuizFinished(true);

    submitTestResult({
      student_id: userId,
      student_name: currentUser?.name || 'Student',
      subject: 'Aptitude',
      score,
      total_questions: quizQuestions.length,
      percentage,
      identified_weak_topics: weakArr,
      answers: testAnswers,
    });

    if (percentage >= 70) {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1. HERO BANNER WITH NAVIGATION MODE */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-3 backdrop-blur-sm">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                Company Pattern-Based Placement Preparation
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                🔥 Most Asked Company Patterns
              </h1>
              <p className="mt-2 text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                Target high-frequency question patterns from TCS, Infosys, Cognizant, Accenture, Capgemini, Amazon, and Microsoft.
                Stop practicing random questions—master the exact patterns campus recruiters test!
              </p>
            </div>

            {/* Quick Diagnostic Practice CTA */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch md:items-center">
              <button
                onClick={() => startQuiz()}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-amber-500/25 transition-all text-sm group cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Start 10-Q Placement Diagnostic</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="text-xs text-slate-400 font-medium">Smart Question Bank</div>
              <div className="text-2xl font-bold text-white mt-1">
                {overallStats.solved} <span className="text-sm font-normal text-slate-400">/ {overallStats.total}</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-indigo-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${overallStats.completionPct}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="text-xs text-slate-400 font-medium">Aptitude Accuracy</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-2">
                {overallStats.accuracy}%
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xs text-slate-400 mt-1">Based on attempts</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="text-xs text-slate-400 font-medium">Current Streak</div>
              <div className="text-2xl font-bold text-amber-400 mt-1 flex items-center gap-2">
                {streakData.current_streak} Days
                <Flame className="w-4 h-4 fill-amber-400" />
              </div>
              <div className="text-xs text-slate-400 mt-1">Placement check-in active</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="text-xs text-slate-400 font-medium">Placement Readiness</div>
              <div className="text-2xl font-bold text-cyan-400 mt-1">
                {aiRecommendations.placementReadinessScore}%
              </div>
              <div className="text-xs text-cyan-300/80 mt-1 truncate">
                {aiRecommendations.readinessTier}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TAB VIEW SWITCHER */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-2">
        <button
          onClick={() => setViewMode('patterns')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            viewMode === 'patterns'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>🔥 Most Asked Company Patterns</span>
          <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-800 font-bold">
            {patternCategoriesList.length} Patterns
          </span>
        </button>

        <button
          onClick={() => setViewMode('analytics')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            viewMode === 'analytics'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>📊 Dashboard & AI Insights</span>
        </button>

        <button
          onClick={() => setViewMode('roadmap')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            viewMode === 'roadmap'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>📚 Full Placement Syllabus</span>
        </button>
      </div>

      {/* VIEW 1: MOST ASKED COMPANY PATTERNS */}
      {viewMode === 'patterns' && (
        <div className="space-y-8">
          {/* AI Recommendation Banner */}
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    AI Placement Pattern Advisory
                  </h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${aiRecommendations.readinessTierColor}`}>
                    {aiRecommendations.readinessTier}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-indigo-100">
                    <span className="font-semibold text-emerald-700 block">✦ Strongest Pattern:</span>
                    <span className="text-slate-800 font-medium">{aiRecommendations.strongestTopic} ({aiRecommendations.strongestAccuracy}% Acc.)</span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-indigo-100">
                    <span className="font-semibold text-rose-700 block">✦ Weakest Pattern:</span>
                    <span className="text-slate-800 font-medium">{aiRecommendations.weakestTopic} (Needs Focus)</span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-indigo-100">
                    <span className="font-semibold text-indigo-700 block">✦ Recommended Next:</span>
                    <span className="text-slate-800 font-medium">Practice {aiRecommendations.recommendedNext}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. COMPANY SELECTOR & FILTER BAR */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                Target Placement Company Filter:
              </label>
              {selectedCompany !== 'All' && (
                <button
                  onClick={() => setSelectedCompany('All')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Clear Company Filter ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCompany('All')}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedCompany === 'All'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                All Companies ({patternCategoriesList.length})
              </button>

              {companyPatternList.map((comp) => {
                const isSelected = selectedCompany.toLowerCase() === comp.company.toLowerCase();
                return (
                  <button
                    key={comp.company}
                    onClick={() => setSelectedCompany(comp.company)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                    }`}
                  >
                    <span>{comp.company}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {comp.focusPatterns.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Company Focus Banner */}
            {activeCompanyInfo && (
              <div className="mt-4 bg-indigo-900 text-white rounded-2xl p-5 shadow-lg border border-indigo-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black">{activeCompanyInfo.company}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-700/80 text-indigo-100 font-semibold border border-indigo-500/40">
                        {activeCompanyInfo.hiringTier}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
                        Target Cutoff: {activeCompanyInfo.benchmarkScore}%
                      </span>
                    </div>
                    <p className="text-xs text-indigo-200 mt-1 font-medium">{activeCompanyInfo.tagline}</p>
                    <p className="text-xs text-slate-300 mt-2">
                      <strong className="text-white">Exam Pattern:</strong> {activeCompanyInfo.examStructure}
                    </p>
                    <p className="text-xs text-amber-200/90 mt-1">
                      <strong className="text-amber-100">Prep Tip:</strong> {activeCompanyInfo.prepTip}
                    </p>
                  </div>

                  <div className="shrink-0 flex sm:flex-col items-center justify-between sm:justify-center bg-white/10 rounded-xl p-3 border border-white/10">
                    <span className="text-xs text-slate-300 font-medium">Your {activeCompanyInfo.company} Readiness</span>
                    <span className="text-2xl font-black text-emerald-400 mt-0.5">
                      {companyReadiness.find((c) => c.company === activeCompanyInfo.company)?.readinessPct || 70}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. SEARCH & FILTER CONTROLS */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search aptitude pattern, company, or concept (e.g. Dishonest Dealer, Syllogism, TCS, Venn)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                {(['All', 'Quantitative Aptitude', 'Logical Reasoning', 'Data Interpretation'] as const).map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-white text-indigo-600 shadow-sm font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cat === 'All' ? 'All Pillars' : cat === 'Quantitative Aptitude' ? 'Quant' : cat === 'Logical Reasoning' ? 'Logical' : 'DI'}
                    </button>
                  )
                )}
              </div>

              {/* Difficulty Filter */}
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* 5. PATTERN ACCORDION ROADMAP */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>Showing {filteredPatterns.length} High-Yield Placement Patterns</span>
              <span>Click any pattern to expand questions</span>
            </div>

            {filteredPatterns.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">No patterns matched your filters</h4>
                <p className="text-xs text-slate-500 mt-1">Try resetting the company filter or clearing the search bar.</p>
                <button
                  onClick={() => {
                    setSelectedCompany('All');
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredPatterns.map((pat, index) => {
                const isExpanded = activeSectionId === pat.id;
                const stats = patternStatsMap[pat.id] || {
                  total: 30,
                  solved: 0,
                  attempted: 0,
                  correct: 0,
                  accuracy: 0,
                  timeSpentMins: 15,
                  lastAttemptedDate: 'Not attempted',
                };
                const questions = getQuestionsForPattern(pat.name);
                const solvedCount = questions.filter((q) => q.solvedByUsers?.includes(userId)).length;
                const progressPct = questions.length > 0 ? Math.round((solvedCount / questions.length) * 100) : 0;

                return (
                  <div
                    key={pat.id}
                    id={`pattern-${pat.id}`}
                    className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isExpanded
                        ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    {/* ACCORDION HEADER */}
                    <button
                      onClick={() => toggleSection(pat.id)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                        {/* LeetCode Arrow Rotation Indicator */}
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0 ${
                            isExpanded
                              ? 'bg-indigo-600 text-white rotate-90 shadow-sm'
                              : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                          }`}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </div>

                        {/* Pattern Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                              <span>{pat.icon}</span>
                              <span>{pat.name}</span>
                            </span>

                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                pat.category === 'Quantitative Aptitude'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : pat.category === 'Logical Reasoning'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {pat.category}
                            </span>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                pat.difficulty === 'Easy'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : pat.difficulty === 'Medium'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {pat.difficulty}
                            </span>

                            {/* Company Chips */}
                            <div className="hidden sm:flex items-center gap-1">
                              {pat.companies.map((c) => (
                                <span
                                  key={c}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>

                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{pat.description}</p>
                        </div>
                      </div>

                      {/* Right Progress & Metrics */}
                      <div className="flex items-center gap-4 shrink-0">
                        {/* Pattern Metrics Pills */}
                        <div className="hidden md:flex items-center gap-3 text-right">
                          <div className="text-right">
                            <div className="text-xs font-bold text-slate-800">
                              {solvedCount} / {questions.length} Solved
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Acc: <span className="font-semibold text-emerald-600">{stats.accuracy}%</span> • {stats.timeSpentMins}m spent
                            </div>
                          </div>
                        </div>

                        {/* Progress Ring / Bar */}
                        <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              progressPct === 100
                                ? 'bg-emerald-500'
                                : progressPct > 50
                                ? 'bg-indigo-500'
                                : 'bg-amber-400'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-700 w-8 text-right">{progressPct}%</span>
                      </div>
                    </button>

                    {/* ACCORDION CONTENT (SMOOTH CSS GRID EXPAND) */}
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-5 pb-6 pt-2 border-t border-slate-100 space-y-5 bg-slate-50/50">
                          {/* Key Formula & Mental Shortcuts Card */}
                          <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 mb-2">
                              <Lightbulb className="w-4 h-4 text-amber-500" />
                              <span>Key Formulas & Mental Math Shortcuts:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {pat.keyFormulas.map((f, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 font-mono font-medium border border-indigo-100"
                                >
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Question Cards List */}
                          <div className="space-y-4">
                            {questions.length === 0 ? (
                              <div className="p-6 text-center text-xs text-slate-500">
                                No questions found for this pattern matching the current filters.
                              </div>
                            ) : (
                              questions.map((q, qIndex) => {
                                const isSolved = q.solvedByUsers?.includes(userId);
                                const selectedOption = userSelectedOptions[q.id];
                                const hasAnswered = !!selectedOption;
                                const isCorrect = selectedOption === q.correct_option;
                                const isExplanationOpen = !!expandedExplanations[q.id];

                                return (
                                  <div
                                    key={q.id}
                                    className={`bg-white rounded-xl p-5 border transition-all ${
                                      isSolved
                                        ? 'border-emerald-200 bg-emerald-50/20'
                                        : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                  >
                                    {/* Question Header */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-bold text-slate-500">Q{qIndex + 1}</span>

                                        {q.pattern && (
                                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                                            <span>✦</span>
                                            <span>{q.pattern}</span>
                                          </span>
                                        )}

                                        {q.companies?.map((comp) => (
                                          <span
                                            key={comp}
                                            className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100"
                                          >
                                            {comp}
                                          </span>
                                        ))}
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => toggleAptitudeQuestionSolved(q.id)}
                                          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                                            isSolved
                                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                          }`}
                                        >
                                          {isSolved ? (
                                            <>
                                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                              <span>Solved ✓</span>
                                            </>
                                          ) : (
                                            <>
                                              <Square className="w-3.5 h-3.5 text-slate-400" />
                                              <span>Mark Solved</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </div>

                                    {/* Question Body */}
                                    <div className="mt-3">
                                      <p className="text-sm font-medium text-slate-900 leading-relaxed whitespace-pre-line">
                                        {q.question}
                                      </p>
                                    </div>

                                    {/* Options Grid (A, B, C, D) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
                                      {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                                        const optValue = q.options[optKey];
                                        const isThisSelected = selectedOption === optKey;
                                        const isThisCorrect = q.correct_option === optKey;

                                        let btnClasses =
                                          'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';

                                        if (hasAnswered) {
                                          if (isThisCorrect) {
                                            btnClasses =
                                              'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold ring-1 ring-emerald-400';
                                          } else if (isThisSelected) {
                                            btnClasses =
                                              'bg-rose-50 border-rose-400 text-rose-900 font-semibold ring-1 ring-rose-400';
                                          } else {
                                            btnClasses = 'bg-slate-50/50 border-slate-100 text-slate-400 opacity-60';
                                          }
                                        }

                                        return (
                                          <button
                                            key={optKey}
                                            disabled={hasAnswered}
                                            onClick={() => handleSelectOption(q, optKey)}
                                            className={`p-3 rounded-xl border text-left text-xs flex items-center justify-between transition-all cursor-pointer ${btnClasses}`}
                                          >
                                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                              <span
                                                className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center shrink-0 ${
                                                  hasAnswered && isThisCorrect
                                                    ? 'bg-emerald-600 text-white'
                                                    : hasAnswered && isThisSelected
                                                    ? 'bg-rose-600 text-white'
                                                    : 'bg-white border border-slate-200 text-slate-700'
                                                }`}
                                              >
                                                {optKey}
                                              </span>
                                              <span className="truncate">{optValue}</span>
                                            </div>

                                            {hasAnswered && isThisCorrect && (
                                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            )}
                                            {hasAnswered && isThisSelected && !isThisCorrect && (
                                              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>

                                    {/* Action Bar (Show Derivation, Video) */}
                                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                                      <button
                                        onClick={() => toggleExplanation(q.id)}
                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                                      >
                                        <Lightbulb className="w-3.5 h-3.5" />
                                        <span>
                                          {isExplanationOpen ? 'Hide Step-by-Step Derivation' : 'View Derivation & Formula'}
                                        </span>
                                      </button>

                                      {q.video_url && (
                                        <button
                                          onClick={() =>
                                            openVideoModal({
                                              id: `vid-${q.id}`,
                                              topic: q.topic,
                                              title: q.video_title || `${q.topic} Pattern Tutorial`,
                                              youtube_url: q.video_url!,
                                              subject: 'Aptitude',
                                              duration: '20 min',
                                              channel: 'SkillPilot Placement Series',
                                            })
                                          }
                                          className="text-xs font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                                        >
                                          <Play className="w-3.5 h-3.5 fill-current text-rose-500" />
                                          <span>Video Lesson</span>
                                        </button>
                                      )}
                                    </div>

                                    {/* Step-by-Step Derivation Panel */}
                                    {isExplanationOpen && (
                                      <div className="mt-3 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-800">
                                        <div className="flex items-center gap-1.5 font-bold text-indigo-950 mb-1.5">
                                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                          <span>Correct Answer: Option {q.correct_option} ({q.answer})</span>
                                        </div>
                                        <p className="whitespace-pre-line leading-relaxed text-slate-700 font-mono text-[11px]">
                                          {q.explanation}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: DASHBOARD ANALYTICS & AI INSIGHTS */}
      {viewMode === 'analytics' && (
        <div className="space-y-8">
          {/* Top Performance Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Placement Readiness</span>
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900">{aiRecommendations.placementReadinessScore}%</span>
                <span className="text-xs text-slate-500 font-medium">composite index</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${aiRecommendations.placementReadinessScore}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-600 mt-3 font-medium">
                {aiRecommendations.readinessTier}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aptitude Accuracy</span>
                <Target className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-emerald-600">{overallStats.accuracy}%</span>
                <span className="text-xs text-slate-500 font-medium">first-attempt accuracy</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${overallStats.accuracy}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-600 mt-3 font-medium">
                Solved {overallStats.solved} out of {overallStats.total} smart questions
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Streak & Consistency</span>
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-amber-500">{streakData.current_streak}</span>
                <span className="text-xs text-slate-500 font-medium">Days active</span>
              </div>
              <div className="text-xs text-slate-600 mt-3 font-medium">
                Longest streak: <strong className="text-slate-900">{streakData.longest_streak} days</strong>
              </div>
              <p className="text-xs text-slate-500 mt-1">Keep solving 5 questions daily to protect your flame</p>
            </div>
          </div>

          {/* Company Readiness Matrix */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-600" />
                  <span>Company-Wise Placement Readiness Breakdown</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluates your readiness based on high-frequency patterns asked by each recruiter
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {companyReadiness.map((comp) => {
                const isReady = comp.readinessPct >= comp.benchmarkScore;
                return (
                  <div
                    key={comp.company}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-indigo-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{comp.company}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isReady
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isReady ? 'Ready ✓' : 'Practice'}
                        </span>
                      </div>
                      <div className="text-2xl font-black text-slate-900 mt-2">
                        {comp.readinessPct}%
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isReady ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                          style={{ width: `${comp.readinessPct}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500">
                      <div>Target: <strong className="text-slate-700">{comp.benchmarkScore}%</strong></div>
                      <button
                        onClick={() => {
                          setSelectedCompany(comp.company);
                          setViewMode('patterns');
                        }}
                        className="mt-2 text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Practice {comp.company}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Insights & Revision Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>Patterns Requiring Immediate Revision</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                These patterns have lower accuracy or haven't been practiced recently. Revise these before taking campus online assessments.
              </p>

              <div className="space-y-3">
                {aiRecommendations.revisionTopics.map((topic, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-900">{topic}</span>
                      <span className="text-[10px] text-amber-800 block mt-0.5">
                        High frequency in TCS NQT, Infosys, and Cognizant
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSearchQuery(topic);
                        setViewMode('patterns');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 cursor-pointer"
                    >
                      Revise Pattern
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Top Practiced Patterns</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Your highest accuracy topics. Maintain momentum with occasional timed tests.
              </p>

              <div className="space-y-3">
                {patternCategoriesList.slice(0, 3).map((pat) => {
                  const st = patternStatsMap[pat.id];
                  return (
                    <div
                      key={pat.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{pat.icon}</span>
                        <div>
                          <span className="font-bold text-xs text-slate-900">{pat.name}</span>
                          <span className="text-[10px] text-slate-500 block">
                            {st?.timeSpentMins || 20}m total practice time
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-600">{st?.accuracy || 85}% Acc.</span>
                        <span className="text-[10px] text-slate-400 block">{st?.solved || 12} solved</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: FULL SYLLABUS ROADMAP */}
      {viewMode === 'roadmap' && (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Full Campus Placement Aptitude Syllabus</h3>
            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              Complete hierarchical curriculum structured across Quantitative Aptitude, Logical Reasoning, Data Interpretation, and Verbal Ability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aptitudePillars.map((pillar) => {
              const pillarQuestions = aptitudeQuestions.filter((q) => q.category === pillar.id);
              const solvedCount = pillarQuestions.filter((q) => q.solvedByUsers?.includes(userId)).length;
              const pct = pillarQuestions.length > 0 ? Math.round((solvedCount / pillarQuestions.length) * 100) : 0;

              return (
                <div key={pillar.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{pillar.icon}</span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{pillar.title}</h4>
                        <span className="text-xs text-slate-500">{pillarQuestions.length} Questions</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                      {pct}% Completed
                    </span>
                  </div>

                  <div className="mt-4 space-y-4">
                    {pillar.subcategories.map((sub) => (
                      <div key={sub.name}>
                        <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                          {sub.name}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {sub.topics.map((t) => (
                            <button
                              key={t}
                              onClick={() => {
                                setSearchQuery(t);
                                setViewMode('patterns');
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium transition-colors cursor-pointer"
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DIAGNOSTIC QUIZ MODAL */}
      {isQuizActive && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            {!quizFinished ? (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                      Question {quizIndex + 1} of {quizQuestions.length}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {quizQuestions[quizIndex]?.topic}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsQuizActive(false)}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Exit Test ✕
                  </button>
                </div>

                <div className="mt-6">
                  <p className="text-base font-medium text-slate-900 leading-relaxed whitespace-pre-line">
                    {quizQuestions[quizIndex]?.question}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 mt-6">
                  {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleQuizAnswer(opt)}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-left text-sm font-medium text-slate-800 flex items-center gap-3 transition-colors cursor-pointer"
                    >
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                        {opt}
                      </span>
                      <span>{quizQuestions[quizIndex]?.options[opt]}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Placement Diagnostic Complete!</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Your performance has been logged into your analytics report.
                </p>

                <div className="my-6 p-6 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-4xl font-extrabold text-indigo-600">
                    {Math.round((quizScore / quizQuestions.length) * 100)}%
                  </div>
                  <div className="text-xs font-bold text-slate-600 mt-1">
                    {quizScore} out of {quizQuestions.length} Questions Correct
                  </div>
                </div>

                {quizWeakTopics.length > 0 && (
                  <div className="text-left mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-xs font-bold text-amber-900 block mb-1">
                      ⚠️ Topics to Revise Before Campus Drives:
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {quizWeakTopics.map((t, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-white text-amber-800 text-xs font-semibold border border-amber-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setIsQuizActive(false)}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm cursor-pointer"
                >
                  Return to Practice Sheet
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
