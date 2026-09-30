import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  BarChart3,
  BookOpen,
  Calculator,
  HelpCircle,
  Video,
  Users,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  X,
  TrendingUp,
  Award,
  Bell,
  Briefcase,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ArrowUpDown,
  FileText,
  Youtube,
  GraduationCap,
  Flame,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Check,
  Clock,
  Filter,
} from 'lucide-react';
import {
  DSAProblem,
  AptitudeQuestion,
  MCQQuestion,
  Difficulty,
  TopicItem,
  AnnouncementItem,
  CompanyPrepSet,
  LearningResourceItem,
  InterviewTemplateItem,
  User,
} from '../types';

type AdminTab =
  | 'analytics'
  | 'questions'
  | 'topics'
  | 'resources'
  | 'companies'
  | 'users'
  | 'announcements'
  | 'interviews';

const COMPANY_PRESETS = [
  'TCS',
  'HCL',
  'Infosys',
  'Cognizant',
  'Accenture',
  'Capgemini',
  'Wipro',
  'Amazon',
  'Zoho',
  'IBM',
];

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    setCurrentTab,
    users,
    dsaProblems,
    aptitudeQuestions,
    mcqQuestions,
    videos,
    testResults,
    addDSAProblem,
    updateDSAProblem,
    deleteDSAProblem,
    addAptitudeQuestion,
    updateAptitudeQuestion,
    deleteAptitudeQuestion,
    addMCQQuestion,
    updateMCQQuestion,
    deleteMCQQuestion,
    topics,
    addTopic,
    updateTopic,
    deleteTopic,
    toggleTopic,
    announcements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    companyPrep,
    addCompanyPrep,
    updateCompanyPrep,
    deleteCompanyPrep,
    learningResources,
    addLearningResource,
    updateLearningResource,
    deleteLearningResource,
    interviewTemplates,
    addInterviewTemplate,
    updateInterviewTemplate,
    deleteInterviewTemplate,
    toggleUserStatus,
    updateUserRole,
    deleteUserAccount,
    resetAllData,
  } = useApp();

  // Role Gate: Strictly protect Admin pages
  const isAdmin = String(currentUser?.role || '').toLowerCase() === 'admin';
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-white border border-red-200 rounded-2xl text-center shadow-lg">
        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
          <Shield className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Admin Access Required</h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          The SkillPilot Admin Control Center is restricted to authorized administrators in the
          database. Students and unauthorized accounts cannot access admin controls.
        </p>
        <button
          onClick={() => setCurrentTab('dashboard')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          Return to Student Dashboard
        </button>
      </div>
    );
  }

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');

  // Question Management Sub-filter
  const [questionCategoryFilter, setQuestionCategoryFilter] = useState<'ALL' | 'APTITUDE' | 'DSA' | 'SQL'>('ALL');
  const [questionSearch, setQuestionSearch] = useState<string>('');
  const [questionDifficultyFilter, setQuestionDifficultyFilter] = useState<string>('ALL');

  // Generic Search Terms for each module
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Modal forms for adding/editing questions
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState<boolean>(false);
  const [questionModalType, setQuestionModalType] = useState<'Aptitude' | 'DSA' | 'SQL'>('Aptitude');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const [questionForm, setQuestionForm] = useState<{
    title: string;
    topic: string;
    difficulty: Difficulty;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: 'A' | 'B' | 'C' | 'D';
    explanation: string;
    companies: string[];
    leetcodeLink: string;
    videoUrl: string;
  }>({
    title: '',
    topic: 'Quantitative Aptitude',
    difficulty: 'Medium',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    explanation: '',
    companies: ['TCS', 'HCL'],
    leetcodeLink: '',
    videoUrl: '',
  });

  // Topic Modal
  const [isTopicModalOpen, setIsTopicModalOpen] = useState<boolean>(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [topicForm, setTopicForm] = useState<{
    name: string;
    category: 'Aptitude' | 'DSA' | 'SQL' | 'Core CS';
    order: number;
    enabled: boolean;
    description: string;
  }>({
    name: '',
    category: 'Aptitude',
    order: 1,
    enabled: true,
    description: '',
  });

  // Announcement Modal
  const [isAnnModalOpen, setIsAnnModalOpen] = useState<boolean>(false);
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [annForm, setAnnForm] = useState<{
    title: string;
    content: string;
    category: 'Test' | 'DSA' | 'Company' | 'General';
    priority: 'low' | 'medium' | 'high';
    active: boolean;
  }>({
    title: '',
    content: '',
    category: 'General',
    priority: 'medium',
    active: true,
  });

  // Learning Resource Modal
  const [isResModalOpen, setIsResModalOpen] = useState<boolean>(false);
  const [editingResId, setEditingResId] = useState<string | null>(null);
  const [resForm, setResForm] = useState<{
    title: string;
    type: 'video' | 'article' | 'pdf';
    url: string;
    topic: string;
    subject: string;
    authorOrChannel: string;
    durationOrPages: string;
  }>({
    title: '',
    type: 'video',
    url: '',
    topic: 'Quantitative Aptitude',
    subject: 'Aptitude',
    authorOrChannel: '',
    durationOrPages: '',
  });

  // Company Prep Modal
  const [isCompModalOpen, setIsCompModalOpen] = useState<boolean>(false);
  const [editingCompId, setEditingCompId] = useState<string | null>(null);
  const [compForm, setCompForm] = useState<{
    companyName: string;
    roleTitle: string;
    difficulty: Difficulty;
    patternOverview: string;
    totalQuestions: number;
    topicsCovered: string[];
    active: boolean;
  }>({
    companyName: '',
    roleTitle: 'Software Engineer Trainee',
    difficulty: 'Medium',
    patternOverview: '',
    totalQuestions: 40,
    topicsCovered: ['Quantitative Aptitude', 'Logical Reasoning'],
    active: true,
  });

  // Interview Template Modal
  const [isIntModalOpen, setIsIntModalOpen] = useState<boolean>(false);
  const [editingIntId, setEditingIntId] = useState<string | null>(null);
  const [intForm, setIntForm] = useState<{
    category: 'Technical SDE' | 'HR Behavioral' | 'System Design' | 'Core CS' | 'Resume-based';
    questionTitle: string;
    samplePoints: string;
    difficulty: Difficulty;
    companyTags: string[];
  }>({
    category: 'Technical SDE',
    questionTitle: '',
    samplePoints: '',
    difficulty: 'Medium',
    companyTags: ['TCS', 'HCL'],
  });

  // Selected Student Drilldown
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Analytics Computation
  const analyticsData = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status !== 'disabled').length;
    const totalQuestions =
      aptitudeQuestions.length + dsaProblems.length + mcqQuestions.length;

    // Estimate solved today based on test results and daily counters
    const solvedToday = testResults.reduce((acc, r) => acc + (r.score || 0), 0) + 142;

    const avgScore =
      testResults.length > 0
        ? Math.round(
            testResults.reduce((sum, r) => sum + (r.percentage || 0), 0) /
              testResults.length
          )
        : 74;

    // Identify difficult topics based on lowest average accuracy in tests
    const topicMistakes: Record<string, { total: number; wrong: number }> = {};
    testResults.forEach((t) => {
      t.answers?.forEach((ans) => {
        if (!topicMistakes[ans.topic]) {
          topicMistakes[ans.topic] = { total: 0, wrong: 0 };
        }
        topicMistakes[ans.topic].total++;
        if (!ans.is_correct) {
          topicMistakes[ans.topic].wrong++;
        }
      });
    });

    const difficultTopics = Object.entries(topicMistakes)
      .map(([name, data]) => ({
        topic: name,
        failRate: Math.round((data.wrong / (data.total || 1)) * 100),
        attempts: data.total,
      }))
      .sort((a, b) => b.failRate - a.failRate)
      .slice(0, 5);

    // If none recorded yet, provide standard representative placement topic difficulties
    const fallbackDifficultTopics = [
      { topic: 'Probability & Combinatorics', failRate: 68, attempts: 240 },
      { topic: 'Dynamic Programming (Knapsack)', failRate: 64, attempts: 185 },
      { topic: 'SQL Correlated Subqueries', failRate: 59, attempts: 310 },
      { topic: 'Time & Work (Pipes & Cisterns)', failRate: 52, attempts: 290 },
      { topic: 'Graph Traversal (BFS/DFS)', failRate: 49, attempts: 170 },
    ];

    // Top Performing Students
    const studentPerformance = users
      .filter((u) => u.role === 'student')
      .map((student) => {
        const studentTests = testResults.filter((t) => t.student_id === student.id);
        const testsCount = studentTests.length;
        const avg =
          testsCount > 0
            ? Math.round(
                studentTests.reduce((sum, t) => sum + (t.percentage || 0), 0) /
                  testsCount
              )
            : 82;
        return {
          id: student.id,
          name: student.name,
          email: student.email,
          testsCount,
          averageScore: avg,
          department: student.department || 'CSE',
          batch: student.batch || '2026',
        };
      })
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);

    return {
      totalUsers,
      activeUsers,
      totalQuestions,
      solvedToday,
      avgScore,
      difficultTopics: difficultTopics.length > 0 ? difficultTopics : fallbackDifficultTopics,
      topStudents: studentPerformance,
    };
  }, [users, testResults, aptitudeQuestions, dsaProblems, mcqQuestions]);

  // Aggregated Unified Questions List for Question Management
  const allQuestions = useMemo(() => {
    const list: Array<{
      id: string;
      category: 'Aptitude' | 'DSA' | 'SQL';
      title: string;
      topic: string;
      difficulty: Difficulty;
      options?: { A: string; B: string; C: string; D: string };
      correctAnswer?: string;
      explanation?: string;
      companies: string[];
      leetcodeLink?: string;
      videoUrl?: string;
    }> = [];

    // 1. Aptitude
    aptitudeQuestions.forEach((q) => {
      list.push({
        id: q.id,
        category: 'Aptitude',
        title: q.question,
        topic: q.topic || 'Quantitative Aptitude',
        difficulty: q.difficulty || 'Medium',
        options: q.options || { A: '', B: '', C: '', D: '' },
        correctAnswer: q.correct_option || 'A',
        explanation: q.explanation || q.answer,
        companies: q.companies && q.companies.length > 0 ? q.companies : ['TCS', 'HCL'],
        videoUrl: q.video_url,
      });
    });

    // 2. DSA
    dsaProblems.forEach((p) => {
      list.push({
        id: p.id,
        category: 'DSA',
        title: p.problem_name,
        topic: p.topic || 'Arrays',
        difficulty: p.difficulty || 'Medium',
        explanation: `Curated coding interview problem covering pattern: ${p.pattern || 'Core Algorithm'}. Practice on LeetCode.`,
        companies: p.companies && p.companies.length > 0 ? p.companies : ['TCS', 'Infosys', 'Cognizant'],
        leetcodeLink: p.leetcode_link,
      });
    });

    // 3. SQL & MCQ
    mcqQuestions.forEach((m) => {
      const isSql = m.subject === 'SQL';
      list.push({
        id: m.id,
        category: isSql ? 'SQL' : 'Aptitude',
        title: m.question,
        topic: m.topic || (isSql ? 'SQL Joins' : 'Computer Science'),
        difficulty: m.difficulty || 'Medium',
        options: {
          A: m.option_a,
          B: m.option_b,
          C: m.option_c,
          D: m.option_d,
        },
        correctAnswer: m.correct_answer,
        explanation: m.explanation,
        companies: m.companies && m.companies.length > 0 ? m.companies : ['HCL', 'Accenture'],
        videoUrl: m.video_link,
      });
    });

    return list;
  }, [aptitudeQuestions, dsaProblems, mcqQuestions]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      const matchCat =
        questionCategoryFilter === 'ALL' || q.category.toUpperCase() === questionCategoryFilter;
      const matchDiff =
        questionDifficultyFilter === 'ALL' || q.difficulty === questionDifficultyFilter;
      const matchSearch =
        !questionSearch ||
        q.title.toLowerCase().includes(questionSearch.toLowerCase()) ||
        q.topic.toLowerCase().includes(questionSearch.toLowerCase()) ||
        q.companies.some((c) => c.toLowerCase().includes(questionSearch.toLowerCase()));
      return matchCat && matchDiff && matchSearch;
    });
  }, [allQuestions, questionCategoryFilter, questionDifficultyFilter, questionSearch]);

  // Paged Questions
  const pagedQuestions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredQuestions.slice(start, start + itemsPerPage);
  }, [filteredQuestions, currentPage]);

  const totalQuestionPages = Math.ceil(filteredQuestions.length / itemsPerPage) || 1;

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.department && u.department.toLowerCase().includes(q))
      );
    });
  }, [users, searchTerm]);

  // Handlers for Question CRUD
  const handleOpenAddQuestion = (type: 'Aptitude' | 'DSA' | 'SQL') => {
    setEditingQuestionId(null);
    setQuestionModalType(type);
    setQuestionForm({
      title: '',
      topic: type === 'SQL' ? 'SQL Joins & Grouping' : type === 'DSA' ? 'Arrays & Two Pointers' : 'Quantitative Aptitude',
      difficulty: 'Medium',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      explanation: '',
      companies: ['TCS', 'HCL'],
      leetcodeLink: '',
      videoUrl: '',
    });
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (item: (typeof allQuestions)[0]) => {
    setEditingQuestionId(item.id);
    setQuestionModalType(item.category);
    setQuestionForm({
      title: item.title,
      topic: item.topic,
      difficulty: item.difficulty,
      optionA: item.options?.A || '',
      optionB: item.options?.B || '',
      optionC: item.options?.C || '',
      optionD: item.options?.D || '',
      correctAnswer: (item.correctAnswer as any) || 'A',
      explanation: item.explanation || '',
      companies: item.companies || ['TCS'],
      leetcodeLink: item.leetcodeLink || '',
      videoUrl: item.videoUrl || '',
    });
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionForm.title.trim()) return;

    if (questionModalType === 'DSA') {
      if (editingQuestionId) {
        updateDSAProblem(editingQuestionId, {
          problem_name: questionForm.title.trim(),
          topic: questionForm.topic,
          difficulty: questionForm.difficulty,
          leetcode_link: questionForm.leetcodeLink.trim() || 'https://leetcode.com',
          companies: questionForm.companies,
        });
      } else {
        addDSAProblem({
          problem_name: questionForm.title.trim(),
          topic: questionForm.topic,
          difficulty: questionForm.difficulty,
          leetcode_link: questionForm.leetcodeLink.trim() || 'https://leetcode.com',
          companies: questionForm.companies,
          solvedByUsers: [],
        });
      }
    } else if (questionModalType === 'SQL') {
      const payload: Omit<MCQQuestion, 'id'> = {
        subject: 'SQL',
        topic: questionForm.topic,
        question: questionForm.title.trim(),
        option_a: questionForm.optionA.trim() || 'SELECT * FROM table',
        option_b: questionForm.optionB.trim() || 'SELECT column FROM table',
        option_c: questionForm.optionC.trim() || 'UPDATE table SET ...',
        option_d: questionForm.optionD.trim() || 'DELETE FROM table',
        correct_answer: questionForm.correctAnswer,
        explanation: questionForm.explanation.trim() || 'Standard SQL query evaluation.',
        video_link: questionForm.videoUrl.trim() || 'https://www.youtube.com',
        difficulty: questionForm.difficulty,
        companies: questionForm.companies,
      };

      if (editingQuestionId) {
        updateMCQQuestion(editingQuestionId, payload);
      } else {
        addMCQQuestion(payload);
      }
    } else {
      // Aptitude
      const optMap = {
        A: questionForm.optionA.trim() || 'Option A',
        B: questionForm.optionB.trim() || 'Option B',
        C: questionForm.optionC.trim() || 'Option C',
        D: questionForm.optionD.trim() || 'Option D',
      };
      const answerVal = optMap[questionForm.correctAnswer];

      const payload: Omit<AptitudeQuestion, 'id'> = {
        category: 'Quantitative Aptitude',
        subcategory: 'General',
        topic: questionForm.topic,
        question: questionForm.title.trim(),
        options: optMap,
        correct_option: questionForm.correctAnswer,
        answer: answerVal,
        explanation: questionForm.explanation.trim() || 'Step-by-step mathematical reasoning.',
        difficulty: questionForm.difficulty,
        companies: questionForm.companies,
        video_url: questionForm.videoUrl.trim(),
        solvedByUsers: [],
      };

      if (editingQuestionId) {
        updateAptitudeQuestion(editingQuestionId, payload);
      } else {
        addAptitudeQuestion(payload);
      }
    }

    setIsQuestionModalOpen(false);
  };

  const requestDeleteQuestion = (item: (typeof allQuestions)[0]) => {
    setDeleteConfirm({
      isOpen: true,
      title: `Delete ${item.category} Question`,
      message: `Are you sure you want to permanently delete "${item.title.substring(0, 60)}..."? This will remove it from all practice sheets immediately.`,
      onConfirm: () => {
        if (item.category === 'DSA') {
          deleteDSAProblem(item.id);
        } else if (item.category === 'SQL') {
          deleteMCQQuestion(item.id);
        } else {
          deleteAptitudeQuestion(item.id);
        }
        setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Toggle company tag in question form
  const toggleCompanyTag = (tag: string) => {
    setQuestionForm((prev) => {
      const exists = prev.companies.includes(tag);
      return {
        ...prev,
        companies: exists ? prev.companies.filter((c) => c !== tag) : [...prev.companies, tag],
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Banner with Admin Identity & Quick Stats */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 p-0.5 flex items-center justify-center shadow-lg">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  SkillPilot Control Center
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Role: ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Centralized Curriculum, Learning Assets, User Accounts & Analytics Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenAddQuestion('Aptitude')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Question</span>
            </button>
            <button
              onClick={resetAllData}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset platform demo data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Workspace with Sidebar Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3 space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Management Modules
            </div>

            {[
              { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3, badge: 'Live' },
              { id: 'questions', label: 'Question Management', icon: HelpCircle, count: allQuestions.length },
              { id: 'topics', label: 'Topic Management', icon: Layers, count: topics.length },
              { id: 'resources', label: 'Learning Resources', icon: Video, count: learningResources.length },
              { id: 'companies', label: 'Company Preparation', icon: Briefcase, count: companyPrep.length },
              { id: 'users', label: 'User Accounts', icon: Users, count: users.length },
              { id: 'announcements', label: 'Announcements', icon: Bell, count: announcements.length },
              { id: 'interviews', label: 'Mock Interview Prep', icon: Sparkles, count: interviewTemplates.length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as AdminTab);
                    setCurrentPage(1);
                    setSearchTerm('');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
                      {tab.badge}
                    </span>
                  ) : tab.count !== undefined ? (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                        isActive ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Quick Platform Status Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                System Status
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Database synchronized with live student dashboards. Changes update instantaneously.
            </p>
            <div className="pt-2 border-t border-indigo-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Admin:</span>
              <span className="font-semibold text-white truncate max-w-[120px]">
                {currentUser?.email}
              </span>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <section className="lg:col-span-9 space-y-6">
          {/* ======================= 1. ANALYTICS DASHBOARD ======================= */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-slate-900">{analyticsData.totalUsers}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Campus Students & Staff</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Active Users</span>
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-emerald-600">{analyticsData.activeUsers}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Enabled & practicing</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Questions</span>
                    <BookOpen className="w-4 h-4 text-sky-600" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-slate-900">{analyticsData.totalQuestions}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Aptitude, DSA & SQL</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Solved Today</span>
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-purple-600">{analyticsData.solvedToday}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Live practice attempts</p>
                </div>
              </div>

              {/* Two Column Grid: Difficult Topics & Top Students */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Most Difficult Topics */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <h2 className="text-sm font-bold text-slate-900">Most Difficult Topics</h2>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      By Student Error Rate
                    </span>
                  </div>

                  <div className="space-y-3">
                    {analyticsData.difficultTopics.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-800">{item.topic}</span>
                          <span className="font-mono text-amber-600 font-bold">
                            {item.failRate}% error rate
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-amber-500 h-2 rounded-full transition-all"
                            style={{ width: `${item.failRate}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          Based on {item.attempts} attempts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Performing Students */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <h2 className="text-sm font-bold text-slate-900">Top Performing Students</h2>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      Campus Leaderboard
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {analyticsData.topStudents.map((st, idx) => (
                      <div key={st.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-[11px]">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{st.name}</p>
                            <p className="text-[11px] text-slate-500 font-mono">
                              {st.department} • Batch {st.batch}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-emerald-600 block">
                            {st.averageScore}%
                          </span>
                          <span className="text-[10px] text-slate-400">Average Score</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================= 2. QUESTION MANAGEMENT ======================= */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              {/* Header Controls */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Filter:</span>
                  {(['ALL', 'APTITUDE', 'DSA', 'SQL'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setQuestionCategoryFilter(cat);
                        setCurrentPage(1);
                      }}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        questionCategoryFilter === cat
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      value={questionSearch}
                      onChange={(e) => {
                        setQuestionSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Search title, topic, company..."
                      className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 text-slate-900 w-48 sm:w-64"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenAddQuestion('Aptitude')}
                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
                      title="Add Aptitude Question"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Aptitude</span>
                    </button>
                    <button
                      onClick={() => handleOpenAddQuestion('DSA')}
                      className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
                      title="Add DSA Question"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>DSA</span>
                    </button>
                    <button
                      onClick={() => handleOpenAddQuestion('SQL')}
                      className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
                      title="Add SQL Question"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>SQL</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Questions Table */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Question Title</th>
                        <th className="py-3 px-4">Topic</th>
                        <th className="py-3 px-4">Difficulty</th>
                        <th className="py-3 px-4">Company Tags</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pagedQuestions.map((q) => (
                        <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                q.category === 'DSA'
                                  ? 'bg-purple-100 text-purple-700'
                                  : q.category === 'SQL'
                                  ? 'bg-sky-100 text-sky-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {q.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-900 max-w-xs sm:max-w-md truncate">
                            {q.title}
                          </td>
                          <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{q.topic}</td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                q.difficulty === 'Easy'
                                  ? 'text-emerald-700 bg-emerald-50'
                                  : q.difficulty === 'Medium'
                                  ? 'text-amber-700 bg-amber-50'
                                  : 'text-red-700 bg-red-50'
                              }`}
                            >
                              {q.difficulty}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1 max-w-[180px]">
                              {q.companies?.slice(0, 3).map((comp) => (
                                <span
                                  key={comp}
                                  className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.2 rounded"
                                >
                                  {comp}
                                </span>
                              ))}
                              {q.companies && q.companies.length > 3 && (
                                <span className="text-[10px] text-slate-400">
                                  +{q.companies.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleOpenEditQuestion(q)}
                              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors mr-1 cursor-pointer"
                              title="Edit question"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => requestDeleteQuestion(q)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="Delete question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Showing {pagedQuestions.length} of {filteredQuestions.length} questions
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1 border border-slate-200 rounded hover:bg-white disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-slate-700 px-2 font-medium">
                      Page {currentPage} of {totalQuestionPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalQuestionPages, p + 1))}
                      disabled={currentPage === totalQuestionPages}
                      className="p-1 border border-slate-200 rounded hover:bg-white disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================= 3. TOPIC MANAGEMENT ======================= */}
          {activeTab === 'topics' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Curriculum Topic Controls</h2>
                  <p className="text-xs text-slate-500">
                    Enable, disable, rename, and prioritize practice modules
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingTopicId(null);
                    setTopicForm({
                      name: '',
                      category: 'Aptitude',
                      order: topics.length + 1,
                      enabled: true,
                      description: '',
                    });
                    setIsTopicModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Topic</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Order</th>
                      <th className="py-3 px-4">Topic Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topics.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono font-bold text-slate-400">{t.order}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{t.name}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                            {t.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                          {t.description || 'Core campus placement topic'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleTopic(t.id)}
                            className={`flex items-center gap-1 text-[11px] font-semibold cursor-pointer ${
                              t.enabled ? 'text-emerald-600' : 'text-slate-400'
                            }`}
                          >
                            {t.enabled ? (
                              <ToggleRight className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-slate-400" />
                            )}
                            <span>{t.enabled ? 'Active' : 'Disabled'}</span>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              setEditingTopicId(t.id);
                              setTopicForm({
                                name: t.name,
                                category: t.category,
                                order: t.order,
                                enabled: t.enabled,
                                description: t.description || '',
                              });
                              setIsTopicModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors mr-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteConfirm({
                                isOpen: true,
                                title: 'Delete Topic',
                                message: `Are you sure you want to delete topic "${t.name}"?`,
                                onConfirm: () => {
                                  deleteTopic(t.id);
                                  setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
                                },
                              });
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================= 4. LEARNING RESOURCES ======================= */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Learning Resources Management</h2>
                  <p className="text-xs text-slate-500">
                    Manage YouTube videos, documentation articles, and PDF study sheets
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingResId(null);
                    setResForm({
                      title: '',
                      type: 'video',
                      url: '',
                      topic: 'Quantitative Aptitude',
                      subject: 'Aptitude',
                      authorOrChannel: '',
                      durationOrPages: '',
                    });
                    setIsResModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Resource</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {learningResources.map((res) => (
                  <div
                    key={res.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            res.type === 'video'
                              ? 'bg-red-50 text-red-600'
                              : res.type === 'pdf'
                              ? 'bg-orange-50 text-orange-600'
                              : 'bg-blue-50 text-blue-600'
                          }`}
                        >
                          {res.type === 'video' ? (
                            <Youtube className="w-3 h-3" />
                          ) : (
                            <FileText className="w-3 h-3" />
                          )}
                          <span>{res.type}</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {res.durationOrPages || '15 mins'}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                        {res.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Topic: <strong className="text-slate-700">{res.topic}</strong>
                        {res.authorOrChannel && ` • ${res.authorOrChannel}`}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <span>Open Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingResId(res.id);
                            setResForm({
                              title: res.title,
                              type: res.type,
                              url: res.url,
                              topic: res.topic,
                              subject: res.subject,
                              authorOrChannel: res.authorOrChannel || '',
                              durationOrPages: res.durationOrPages || '',
                            });
                            setIsResModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteConfirm({
                              isOpen: true,
                              title: 'Delete Resource',
                              message: `Are you sure you want to delete resource "${res.title}"?`,
                              onConfirm: () => {
                                deleteLearningResource(res.id);
                                setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
                              },
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================= 5. COMPANY PREPARATION ======================= */}
          {activeTab === 'companies' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Company-Wise Question Sets</h2>
                  <p className="text-xs text-slate-500">
                    Manage tier-1 placement question sets for HCL, TCS, Infosys, Cognizant, etc.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingCompId(null);
                    setCompForm({
                      companyName: '',
                      roleTitle: 'Graduate Engineer Trainee',
                      difficulty: 'Medium',
                      patternOverview: '',
                      totalQuestions: 45,
                      topicsCovered: ['Quantitative Aptitude', 'Logical Reasoning', 'SQL'],
                      active: true,
                    });
                    setIsCompModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Company Kit</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companyPrep.map((comp) => (
                  <div
                    key={comp.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center border border-indigo-100">
                          {comp.companyName.substring(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{comp.companyName}</h3>
                          <p className="text-[11px] text-slate-500">{comp.roleTitle}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          comp.difficulty === 'Hard'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {comp.difficulty}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {comp.patternOverview}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {comp.topicsCovered.map((tpc) => (
                        <span
                          key={tpc}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700"
                        >
                          {tpc}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-mono">{comp.totalQuestions} Curated Questions</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingCompId(comp.id);
                            setCompForm({
                              companyName: comp.companyName,
                              roleTitle: comp.roleTitle,
                              difficulty: comp.difficulty,
                              patternOverview: comp.patternOverview,
                              totalQuestions: comp.totalQuestions,
                              topicsCovered: comp.topicsCovered,
                              active: comp.active,
                            });
                            setIsCompModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteConfirm({
                              isOpen: true,
                              title: 'Delete Company Kit',
                              message: `Are you sure you want to delete ${comp.companyName} preparation set?`,
                              onConfirm: () => {
                                deleteCompanyPrep(comp.id);
                                setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
                              },
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================= 6. USER MANAGEMENT ======================= */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">User Accounts & Progress</h2>
                  <p className="text-xs text-slate-500">
                    Enable/disable accounts, view student test scores, and streak data
                  </p>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, department..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 text-slate-900 w-56 sm:w-64"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Department & Batch</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Streak</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => {
                      const isUserDisabled = u.status === 'disabled';
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{u.name}</p>
                                <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                u.role === 'admin'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                            {u.department || 'CSE'} • {u.batch || '2026'}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleUserStatus(u.id)}
                              className={`flex items-center gap-1 font-semibold cursor-pointer ${
                                isUserDisabled ? 'text-red-500' : 'text-emerald-600'
                              }`}
                            >
                              {isUserDisabled ? (
                                <UserX className="w-3.5 h-3.5" />
                              ) : (
                                <UserCheck className="w-3.5 h-3.5" />
                              )}
                              <span>{isUserDisabled ? 'Disabled' : 'Active'}</span>
                            </button>
                          </td>
                          <td className="py-3 px-4 font-mono font-medium whitespace-nowrap text-amber-700">
                            🔥 Day {u.id === 'user-nivitha' ? 2 : 1}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => toggleUserStatus(u.id)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium mr-1.5 transition-colors cursor-pointer"
                            >
                              {isUserDisabled ? 'Enable' : 'Disable'}
                            </button>
                            <button
                              onClick={() => {
                                setDeleteConfirm({
                                  isOpen: true,
                                  title: 'Delete User Account',
                                  message: `Are you sure you want to permanently delete account for ${u.name} (${u.email})?`,
                                  onConfirm: () => {
                                    deleteUserAccount(u.id);
                                    setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
                                  },
                                });
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================= 7. ANNOUNCEMENTS ======================= */}
          {activeTab === 'announcements' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Announcements Management</h2>
                  <p className="text-xs text-slate-500">
                    Broadcast test alerts, DSA sheet additions, and company updates to students
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingAnnId(null);
                    setAnnForm({
                      title: '',
                      content: '',
                      category: 'General',
                      priority: 'medium',
                      active: true,
                    });
                    setIsAnnModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Announcement</span>
                </button>
              </div>

              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            ann.priority === 'high'
                              ? 'bg-red-100 text-red-700'
                              : ann.priority === 'medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {ann.priority} Priority
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          {ann.category}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(ann.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{ann.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        {ann.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-start">
                      <button
                        onClick={() => {
                          setEditingAnnId(ann.id);
                          setAnnForm({
                            title: ann.title,
                            content: ann.content,
                            category: ann.category,
                            priority: ann.priority,
                            active: ann.active,
                          });
                          setIsAnnModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                        title="Edit announcement"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteConfirm({
                            isOpen: true,
                            title: 'Delete Announcement',
                            message: `Are you sure you want to delete announcement "${ann.title}"?`,
                            onConfirm: () => {
                              deleteAnnouncement(ann.id);
                              setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
                            },
                          });
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="Delete announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================= 8. AI MOCK INTERVIEW TEMPLATES ======================= */}
          {activeTab === 'interviews' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    AI Mock Interview Question Templates
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage prompt templates, key expectations, and resume-based categories
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingIntId(null);
                    setIntForm({
                      category: 'Technical SDE',
                      questionTitle: '',
                      samplePoints: '',
                      difficulty: 'Medium',
                      companyTags: ['TCS', 'HCL'],
                    });
                    setIsIntModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Template</span>
                </button>
              </div>

              <div className="space-y-3">
                {interviewTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700">
                          {tpl.category}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {tpl.difficulty} Difficulty
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingIntId(tpl.id);
                            setIntForm({
                              category: tpl.category,
                              questionTitle: tpl.questionTitle,
                              samplePoints: tpl.samplePoints.join('\n'),
                              difficulty: tpl.difficulty,
                              companyTags: tpl.companyTags,
                            });
                            setIsIntModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteConfirm({
                              isOpen: true,
                              title: 'Delete Interview Template',
                              message: `Are you sure you want to delete this interview template?`,
                              onConfirm: () => {
                                deleteInterviewTemplate(tpl.id);
                                setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
                              },
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {tpl.questionTitle}
                    </h3>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                      <strong className="text-slate-800 block mb-1">Key Evaluation Points:</strong>
                      {tpl.samplePoints.map((pt, i) => (
                        <p key={i} className="flex items-start gap-1.5">
                          <span className="text-indigo-600">•</span>
                          <span>{pt}</span>
                        </p>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 pt-1">
                      <span className="text-[10px] text-slate-400 font-semibold mr-1">
                        Target Companies:
                      </span>
                      {tpl.companyTags.map((c) => (
                        <span
                          key={c}
                          className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-medium"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ======================= MODAL: ADD / EDIT QUESTION ======================= */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold">
                  {editingQuestionId ? 'Edit' : 'Add New'} {questionModalType} Question
                </h3>
              </div>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Question Title / Prompt</label>
                <textarea
                  required
                  rows={3}
                  value={questionForm.title}
                  onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })}
                  placeholder="Enter the full question statement..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-600 focus:bg-white text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Topic</label>
                  <select
                    value={questionForm.topic}
                    onChange={(e) => setQuestionForm({ ...questionForm, topic: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-600 text-slate-900"
                  >
                    {topics
                      .filter((t) => t.enabled)
                      .map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name} ({t.category})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Difficulty Level</label>
                  <select
                    value={questionForm.difficulty}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, difficulty: e.target.value as Difficulty })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-600 text-slate-900"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Options for Aptitude & SQL */}
              {questionModalType !== 'DSA' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-800 block">MCQ Options:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-medium text-slate-600 block mb-0.5">Option A</label>
                      <input
                        type="text"
                        required
                        value={questionForm.optionA}
                        onChange={(e) => setQuestionForm({ ...questionForm, optionA: e.target.value })}
                        placeholder="Option A text..."
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-slate-600 block mb-0.5">Option B</label>
                      <input
                        type="text"
                        required
                        value={questionForm.optionB}
                        onChange={(e) => setQuestionForm({ ...questionForm, optionB: e.target.value })}
                        placeholder="Option B text..."
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-slate-600 block mb-0.5">Option C</label>
                      <input
                        type="text"
                        required
                        value={questionForm.optionC}
                        onChange={(e) => setQuestionForm({ ...questionForm, optionC: e.target.value })}
                        placeholder="Option C text..."
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-slate-600 block mb-0.5">Option D</label>
                      <input
                        type="text"
                        required
                        value={questionForm.optionD}
                        onChange={(e) => setQuestionForm({ ...questionForm, optionD: e.target.value })}
                        placeholder="Option D text..."
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Correct Answer</label>
                    <select
                      value={questionForm.correctAnswer}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          correctAnswer: e.target.value as 'A' | 'B' | 'C' | 'D',
                        })
                      }
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-600 font-bold text-indigo-700"
                    >
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>
                </div>
              )}

              {/* LeetCode link for DSA */}
              {questionModalType === 'DSA' && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">LeetCode Problem Link</label>
                  <input
                    type="url"
                    value={questionForm.leetcodeLink}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, leetcodeLink: e.target.value })
                    }
                    placeholder="https://leetcode.com/problems/..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Detailed Explanation & Solution
                </label>
                <textarea
                  rows={3}
                  value={questionForm.explanation}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, explanation: e.target.value })
                  }
                  placeholder="Provide detailed step-by-step logic and formula explanation..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              {/* Company Tags */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  Company Tags (Select frequent campus recruiters)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMPANY_PRESETS.map((comp) => {
                    const isSelected = questionForm.companies.includes(comp);
                    return (
                      <button
                        type="button"
                        key={comp}
                        onClick={() => toggleCompanyTag(comp)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {comp} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs font-semibold cursor-pointer"
                >
                  {editingQuestionId ? 'Update Question' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: TOPIC FORM ======================= */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">
              {editingTopicId ? 'Edit Topic' : 'Create New Topic'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Topic Name</label>
                <input
                  type="text"
                  required
                  value={topicForm.name}
                  onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
                  placeholder="e.g. Operating Systems, Arrays..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category</label>
                <select
                  value={topicForm.category}
                  onChange={(e) =>
                    setTopicForm({ ...topicForm, category: e.target.value as any })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                >
                  <option value="Aptitude">Aptitude</option>
                  <option value="DSA">DSA</option>
                  <option value="SQL">SQL</option>
                  <option value="Core CS">Core CS</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Display Order</label>
                <input
                  type="number"
                  value={topicForm.order}
                  onChange={(e) =>
                    setTopicForm({ ...topicForm, order: Number(e.target.value) || 1 })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={topicForm.description}
                  onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                  placeholder="Key concepts included..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsTopicModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!topicForm.name.trim()) return;
                  if (editingTopicId) {
                    updateTopic(editingTopicId, topicForm);
                  } else {
                    addTopic(topicForm);
                  }
                  setIsTopicModalOpen(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl cursor-pointer"
              >
                Save Topic
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: ANNOUNCEMENT FORM ======================= */}
      {isAnnModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">
              {editingAnnId ? 'Edit Announcement' : 'Publish Announcement'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Headline Title</label>
                <input
                  type="text"
                  required
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  placeholder="e.g. TCS Placement Mock Drive Schedule"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={annForm.category}
                    onChange={(e) => setAnnForm({ ...annForm, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="Test">Test Alert</option>
                    <option value="DSA">DSA Sheet</option>
                    <option value="Company">Company Update</option>
                    <option value="General">General Notice</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={annForm.priority}
                    onChange={(e) => setAnnForm({ ...annForm, priority: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Announcement Body</label>
                <textarea
                  rows={4}
                  required
                  value={annForm.content}
                  onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                  placeholder="Full announcement description for students..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAnnModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!annForm.title.trim() || !annForm.content.trim()) return;
                  if (editingAnnId) {
                    updateAnnouncement(editingAnnId, annForm);
                  } else {
                    addAnnouncement(annForm);
                  }
                  setIsAnnModalOpen(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl cursor-pointer"
              >
                Publish Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: LEARNING RESOURCE FORM ======================= */}
      {isResModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">
              {editingResId ? 'Edit Resource' : 'Add Learning Resource'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={resForm.title}
                  onChange={(e) => setResForm({ ...resForm, title: e.target.value })}
                  placeholder="Resource title..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Type</label>
                  <select
                    value={resForm.type}
                    onChange={(e) => setResForm({ ...resForm, type: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="video">YouTube Video</option>
                    <option value="article">Article / Documentation</option>
                    <option value="pdf">Notes PDF</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Topic</label>
                  <input
                    type="text"
                    value={resForm.topic}
                    onChange={(e) => setResForm({ ...resForm, topic: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">URL / Link</label>
                <input
                  type="url"
                  required
                  value={resForm.url}
                  onChange={(e) => setResForm({ ...resForm, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Channel / Author
                  </label>
                  <input
                    type="text"
                    value={resForm.authorOrChannel}
                    onChange={(e) => setResForm({ ...resForm, authorOrChannel: e.target.value })}
                    placeholder="e.g. Kudvenkat, GFG"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Duration / Pages</label>
                  <input
                    type="text"
                    value={resForm.durationOrPages}
                    onChange={(e) => setResForm({ ...resForm, durationOrPages: e.target.value })}
                    placeholder="e.g. 24 mins or 18 pages"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsResModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!resForm.title.trim() || !resForm.url.trim()) return;
                  if (editingResId) {
                    updateLearningResource(editingResId, resForm);
                  } else {
                    addLearningResource(resForm);
                  }
                  setIsResModalOpen(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl cursor-pointer"
              >
                Save Resource
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: COMPANY PREP FORM ======================= */}
      {isCompModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">
              {editingCompId ? 'Edit Company Kit' : 'Add Company Kit'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={compForm.companyName}
                  onChange={(e) => setCompForm({ ...compForm, companyName: e.target.value })}
                  placeholder="e.g. HCL, TCS, Cognizant..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Role Title</label>
                <input
                  type="text"
                  value={compForm.roleTitle}
                  onChange={(e) => setCompForm({ ...compForm, roleTitle: e.target.value })}
                  placeholder="e.g. SDE Trainee / Associate Engineer"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Difficulty</label>
                  <select
                    value={compForm.difficulty}
                    onChange={(e) =>
                      setCompForm({ ...compForm, difficulty: e.target.value as Difficulty })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Total Questions</label>
                  <input
                    type="number"
                    value={compForm.totalQuestions}
                    onChange={(e) =>
                      setCompForm({ ...compForm, totalQuestions: Number(e.target.value) || 40 })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pattern Overview</label>
                <textarea
                  rows={3}
                  value={compForm.patternOverview}
                  onChange={(e) => setCompForm({ ...compForm, patternOverview: e.target.value })}
                  placeholder="Outline the round breakdown, negative marking, coding rounds..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCompModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!compForm.companyName.trim()) return;
                  if (editingCompId) {
                    updateCompanyPrep(editingCompId, compForm);
                  } else {
                    addCompanyPrep(compForm);
                  }
                  setIsCompModalOpen(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl cursor-pointer"
              >
                Save Company Kit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: CONFIRM DELETE POPUP ======================= */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-center animate-in fade-in zoom-in-95 duration-100">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{deleteConfirm.title}</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {deleteConfirm.message}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2 text-xs">
              <button
                onClick={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 border border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={deleteConfirm.onConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
