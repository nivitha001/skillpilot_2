import React from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Calculator,
  HelpCircle,
  BarChart3,
  Video,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award,
  PlayCircle,
  CheckCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Brain,
  Bell,
} from 'lucide-react';
import heroBanner from '../assets/images/skillpilot_hero_banner_1790262166292.jpg';

export const StudentDashboard: React.FC = () => {
  const { currentUser, studentStats, setCurrentTab, videos, openVideoModal, announcements } = useApp();

  const studentName = currentUser?.name || 'Nivitha';

  // Find videos specifically matching user's weak topics
  const weakTopicVideos = videos.filter((v) =>
    studentStats.weak_topics.some(
      (wt) => wt.toLowerCase() === v.topic.toLowerCase() || v.title.toLowerCase().includes(wt.toLowerCase())
    )
  );

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-slate-800">
        <div className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none">
          <img
            src={heroBanner}
            alt="SkillPilot Learning Canvas"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <span>Placement Preparation & Analytics Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Welcome {studentName} 👋
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Your personalized placement readiness cockpit. Review your DSA progress, practice
              structured aptitude, take diagnostic tests, and conquer identified weak topics with
              curated tutorials.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentTab('interview')}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>AI Mock Interview</span>
            </button>
            <button
              onClick={() => setCurrentTab('mcq')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Diagnostic Test</span>
            </button>
            <button
              onClick={() => setCurrentTab('dsa')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-medium rounded-xl transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Continue DSA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Campus Placement Announcements from Admin */}
      {announcements && announcements.filter((a) => a.active).length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Bell className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-bold text-slate-900">Placement & Curriculum Updates</h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              From Central Administration
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {announcements
              .filter((a) => a.active)
              .slice(0, 2)
              .map((ann) => (
                <div
                  key={ann.id}
                  className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        ann.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {ann.category}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-800">{ann.title}</h3>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* DSA Problems Solved */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">DSA Problems Solved</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {studentStats.dsa_solved_count}
            </span>
            <span className="text-xs text-slate-400">problems</span>
          </div>
          <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Arrays, Strings, Linked Lists
          </p>
        </div>

        {/* Aptitude Solved */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Aptitude Questions Solved</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Calculator className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {studentStats.aptitude_solved_count}
            </span>
            <span className="text-xs text-slate-400">questions</span>
          </div>
          <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Percentage, Profit & Loss
          </p>
        </div>

        {/* Tests Attempted */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Tests Attempted</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {studentStats.tests_attempted}
            </span>
            <span className="text-xs text-slate-400">assessments</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Topic-wise & Mixed Mocks</p>
        </div>

        {/* Average Score */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Average Score</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {studentStats.average_score}%
            </span>
            <span className="text-xs text-slate-400">accuracy</span>
          </div>
          <p className="text-xs text-purple-600 mt-2 font-medium">Placement Eligible (&ge; 70%)</p>
        </div>
      </div>

      {/* Grid: Weak Topic Analysis & Topic Wise Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Weak Topic Analysis & Video Callouts */}
        <div className="lg:col-span-7 space-y-6">
          {/* Weak Topic Analysis Card */}
          <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-xs">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Weak Topic Analysis</h2>
                  <p className="text-xs text-slate-500">
                    Automatically detected from low scores (&lt; 70%) in recent tests
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCurrentTab('videos')}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 shrink-0"
              >
                <span>View all videos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Weak Topics List */}
            <div className="space-y-3">
              {studentStats.weak_topics.map((topic, idx) => (
                <div
                  key={topic}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 text-xs font-bold flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{topic}</p>
                      <p className="text-xs text-slate-600">
                        Accuracy below target threshold. Recommended review.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => {
                        const matchedVid = videos.find(
                          (v) =>
                            v.topic.toLowerCase() === topic.toLowerCase() ||
                            v.title.toLowerCase().includes(topic.toLowerCase())
                        );
                        if (matchedVid) openVideoModal(matchedVid);
                        else setCurrentTab('videos');
                      }}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Learn Topic</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Video Recommendations Banner tied to weak topics */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Recommended Videos for Your Weak Areas
                </span>
                <span className="text-xs text-slate-500">Admin curated tutorials</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {weakTopicVideos.slice(0, 2).map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => openVideoModal(vid)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group bg-slate-50/60"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <PlayCircle className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {vid.title}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                          <span>{vid.topic}</span>
                          <span aria-hidden="true">·</span>
                          <span>{vid.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Topic Wise Performance */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Topic Wise Performance</h2>
                <p className="text-xs text-slate-500">Continuous accuracy benchmark</p>
              </div>
              <button
                onClick={() => setCurrentTab('progress')}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>Full Analytics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {Object.entries(studentStats.topic_performance).map(([topic, pct]) => {
                const isWeak = pct < 70;
                return (
                  <div key={topic} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{topic}</span>
                        {isWeak && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                            Needs Practice
                          </span>
                        )}
                      </div>
                      <span className="font-mono tabular-nums font-bold text-slate-700">
                        {pct}%
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct >= 80
                            ? 'bg-emerald-500'
                            : pct >= 70
                            ? 'bg-indigo-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> &ge; 80% Strong
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500" /> 70-79% Average
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> &lt; 70% Weak
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Feature Bento */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Practice Pathways</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* AI Mock Interview */}
          <div
            onClick={() => setCurrentTab('interview')}
            className="group bg-gradient-to-b from-indigo-50/50 to-white p-5 rounded-2xl border border-indigo-200 hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-bold tracking-wider uppercase">
              AI Powered
            </div>
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                AI Mock Interview
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Gemini-powered technical rounds with real-time scoring, missing insights & model answers.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold">
              <span>Start Interview</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* DSA Sheet */}
          <div
            onClick={() => setCurrentTab('dsa')}
            className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                DSA Practice Sheet
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Comprehensive 12-track placement roadmap: Arrays, Binary Search, Trees, DP & Graphs.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold">
              <span>Explore Sheet</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Aptitude Sheet */}
          <div
            onClick={() => setCurrentTab('aptitude')}
            className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Aptitude Sheet
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Quantitative Aptitude, Logical Reasoning & Verbal Ability with step-by-step math derivations and video tutorials.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-semibold">
              <span>Explore 3 Pillars</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* MCQ Tests */}
          <div
            onClick={() => setCurrentTab('mcq')}
            className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Topic-wise MCQ Tests
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Java, SQL, DSA, OS, Networking tests with instant 🟢 Correct / 🔴 Wrong feedback
                and explanations.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold">
              <span>Start Assessment</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* YouTube Video Tutorials */}
          <div
            onClick={() => setCurrentTab('videos')}
            className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                Recommended Videos
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Hand-picked video lessons addressing weak topics like Collections, JVM, and SQL
                Joins.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-600 font-semibold">
              <span>Browse Videos</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
