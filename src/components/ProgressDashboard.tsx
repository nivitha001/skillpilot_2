import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  Award,
  BookOpen,
  Calculator,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const ProgressDashboard: React.FC = () => {
  const { studentStats, testResults, currentUser, setCurrentTab, videos, openVideoModal } = useApp();

  const userTestResults = useMemo(() => {
    const userId = currentUser?.id || 'user-nivitha';
    return testResults.filter((r) => r.student_id === userId);
  }, [testResults, currentUser]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Learning Analytics & Placement Readiness</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Student Progress & Mastery</h1>
          <p className="text-slate-500 text-sm mt-1">
            Comprehensive breakdown of practice completions, diagnostic test history, and
            weak-topic tracking.
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('mcq')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Take New Assessment</span>
        </button>
      </div>

      {/* Core KPIs matching prompt */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* KPI 1: DSA Problems Solved */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500">DSA Problems Solved</span>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {studentStats.dsa_solved_count}
            </span>
          </div>
          <span className="text-[11px] text-indigo-600 font-semibold">12 Structured Tracks</span>
        </div>

        {/* KPI 2: Aptitude Questions Solved */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500">Aptitude Questions Solved</span>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {studentStats.aptitude_solved_count}
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Quant, Logic & Verbal</span>
        </div>

        {/* KPI 3: Quant Score */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500">Quant Score</span>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono tabular-nums">
              {studentStats.quant_score}%
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Target: &ge; 85%</span>
        </div>

        {/* KPI 4: Logical Score */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500">Logical Score</span>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono tabular-nums">
              {studentStats.logical_score}%
            </span>
          </div>
          <span className="text-[11px] text-amber-700 font-semibold">Review Required</span>
        </div>

        {/* KPI 5: Verbal Score */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500">Verbal Score</span>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-600 font-mono tabular-nums">
              {studentStats.verbal_score}%
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Placement Eligible</span>
        </div>

        {/* KPI 6: Tests Taken */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500">Tests Taken</span>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 font-mono tabular-nums">
              {studentStats.tests_attempted}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Avg Score: {studentStats.average_score}%</span>
        </div>
      </div>

      {/* Topic Wise Performance & Weak Topic Analysis Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Topic-Wise Benchmark Bar Graph (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Topic Wise Performance</h2>
            <p className="text-xs text-slate-500">
              Benchmark accuracy across major placement assessment modules
            </p>
          </div>

          <div className="space-y-4">
            {Object.entries(studentStats.topic_performance).map(([subj, pct]) => {
              const isStrong = pct >= 80;
              const isAvg = pct >= 70 && pct < 80;
              const isWeak = pct < 70;

              return (
                <div key={subj} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{subj}</span>
                      {isWeak && (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                          Weak Topic
                        </span>
                      )}
                    </div>
                    <span className="font-mono tabular-nums font-bold text-slate-700">{pct}%</span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isStrong ? 'bg-emerald-500' : isAvg ? 'bg-indigo-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Accuracy Threshold: 70% for standard placement rounds</span>
            <span className="font-mono text-slate-400">Target: 85%+</span>
          </div>
        </div>

        {/* Categorized Weak Topic Analysis & Video Suggestions (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-amber-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Weak Topic Analysis</h2>
                <p className="text-xs text-slate-500">Categorized by placement assessment sections</p>
              </div>
            </div>

            <button
              onClick={() => setCurrentTab('aptitude')}
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Practice Sheet →
            </button>
          </div>

          {/* Categorized Groups */}
          <div className="space-y-3.5">
            {/* 1. Quantitative Aptitude Weak */}
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>📊</span> Quantitative Aptitude
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2.5 bg-white rounded-lg border border-red-200 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <span className="text-red-500 font-bold">❌</span> Probability
                  </span>
                  <button
                    onClick={() => {
                      const v = videos.find((item) => item.topic.toLowerCase().includes('probability'));
                      if (v) openVideoModal(v);
                      else setCurrentTab('videos');
                    }}
                    className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-semibold"
                  >
                    Shortcuts
                  </button>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-red-200 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <span className="text-red-500 font-bold">❌</span> Time & Work
                  </span>
                  <button
                    onClick={() => {
                      const v = videos.find((item) => item.topic.toLowerCase().includes('time & work'));
                      if (v) openVideoModal(v);
                      else setCurrentTab('videos');
                    }}
                    className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-semibold"
                  >
                    Tutorial
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Logical Reasoning Weak */}
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>🧠</span> Logical Reasoning
              </span>
              <div className="p-2.5 bg-white rounded-lg border border-red-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <span className="text-red-500 font-bold">❌</span> Coding-Decoding
                </span>
                <button
                  onClick={() => {
                    const v = videos.find((item) => item.topic.toLowerCase().includes('coding-decoding'));
                    if (v) openVideoModal(v);
                    else setCurrentTab('videos');
                  }}
                  className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-semibold"
                >
                  Tricks
                </button>
              </div>
            </div>

            {/* 3. Verbal Ability Weak */}
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>📖</span> Verbal Ability
              </span>
              <div className="p-2.5 bg-white rounded-lg border border-red-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <span className="text-red-500 font-bold">❌</span> Sentence Correction
                </span>
                <button
                  onClick={() => {
                    const v = videos.find((item) => item.topic.toLowerCase().includes('sentence correction'));
                    if (v) openVideoModal(v);
                    else setCurrentTab('videos');
                  }}
                  className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-semibold"
                >
                  Rules
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setCurrentTab('videos')}
              className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <span>View All Video Suggestions & YouTube Tutorials</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Test History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Assessment History</h2>
            <p className="text-xs text-slate-500">Record of diagnostic tests taken by student</p>
          </div>
          <span className="text-xs font-mono font-medium text-slate-500 bg-white px-2.5 py-1 rounded border border-slate-200">
            {userTestResults.length} Logged Sessions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/30">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4 text-center">Percentage</th>
                <th className="py-3 px-4">Identified Weak Topic</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {userTestResults.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No test attempts recorded yet.
                  </td>
                </tr>
              ) : (
                userTestResults.map((r) => {
                  const isPassed = r.percentage >= 70;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-xs font-mono text-slate-500">{r.date}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{r.subject}</td>
                      <td className="py-3 px-4 text-center font-mono text-xs text-slate-600">
                        {r.score} / {r.total_questions}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        <span
                          className={
                            isPassed
                              ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200'
                              : 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200'
                          }
                        >
                          {r.percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {r.identified_weak_topics && r.identified_weak_topics.length > 0 ? (
                          <span className="text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            {r.identified_weak_topics.join(', ')}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">None (Strong)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`text-xs font-semibold ${
                            isPassed ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {isPassed ? 'Qualified' : 'Needs Practice'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
