import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import {
  User,
  DSAProblem,
  AptitudeQuestion,
  MCQQuestion,
  VideoRecommendation,
  TestResult,
  StudentProgress,
  Role,
  UserStreak,
  UserStreakRecord,
  DailyActivityRecord,
  TopicItem,
  AnnouncementItem,
  CompanyPrepSet,
  LearningResourceItem,
  InterviewTemplateItem,
} from '../types';
import {
  initialUsers,
  initialDSAProblems,
  initialAptitudeQuestions,
  initialMCQQuestions,
  initialVideos,
  initialTestResults,
} from '../data/initialData';
import {
  formatDateKey,
  generateInitialStreakHistory,
  calculateStreakStats,
} from '../utils/streakUtils';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  dsaProblems: DSAProblem[];
  aptitudeQuestions: AptitudeQuestion[];
  mcqQuestions: MCQQuestion[];
  videos: VideoRecommendation[];
  testResults: TestResult[];
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeVideo: VideoRecommendation | null;
  openVideoModal: (video: VideoRecommendation) => void;
  closeVideoModal: () => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (email?: string, name?: string) => Promise<void> | void;
  register: (name: string, email: string, password: string, department?: string, batch?: string) => Promise<{ success: boolean; error?: string }>;
  resetUserPassword: (email: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: Role) => void;
  toggleDSAProblemSolved: (problemId: string) => void;
  toggleAptitudeQuestionSolved: (questionId: string) => void;
  submitTestResult: (resultData: Omit<TestResult, 'id' | 'date'>) => TestResult;
  studentStats: StudentProgress;
  userStreak: UserStreakRecord;
  streakData: UserStreak;
  simulateStreak: (action: 'next_day' | 'miss_day' | 'reset' | 'set', value?: number) => Promise<void>;
  recordActivity: (description?: string) => void;
  checkInToday: () => void;
  // Admin Operations
  addDSAProblem: (p: Omit<DSAProblem, 'id'>) => void;
  updateDSAProblem: (id: string, p: Partial<DSAProblem>) => void;
  deleteDSAProblem: (id: string) => void;
  addAptitudeQuestion: (q: Omit<AptitudeQuestion, 'id'>) => void;
  updateAptitudeQuestion: (id: string, q: Partial<AptitudeQuestion>) => void;
  deleteAptitudeQuestion: (id: string) => void;
  addMCQQuestion: (m: Omit<MCQQuestion, 'id'>) => void;
  updateMCQQuestion: (id: string, m: Partial<MCQQuestion>) => void;
  deleteMCQQuestion: (id: string) => void;
  addVideo: (v: Omit<VideoRecommendation, 'id'>) => void;
  updateVideo: (id: string, v: Partial<VideoRecommendation>) => void;
  deleteVideo: (id: string) => void;
  resetAllData: () => void;
  // Extended Modules
  topics: TopicItem[];
  addTopic: (t: Omit<TopicItem, 'id'>) => Promise<void>;
  updateTopic: (id: string, t: Partial<TopicItem>) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;
  toggleTopic: (id: string) => Promise<void>;
  announcements: AnnouncementItem[];
  addAnnouncement: (a: Omit<AnnouncementItem, 'id' | 'createdAt'>) => Promise<void>;
  updateAnnouncement: (id: string, a: Partial<AnnouncementItem>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  companyPrep: CompanyPrepSet[];
  addCompanyPrep: (c: Omit<CompanyPrepSet, 'id'>) => Promise<void>;
  updateCompanyPrep: (id: string, c: Partial<CompanyPrepSet>) => Promise<void>;
  deleteCompanyPrep: (id: string) => Promise<void>;
  learningResources: LearningResourceItem[];
  addLearningResource: (r: Omit<LearningResourceItem, 'id'>) => Promise<void>;
  updateLearningResource: (id: string, r: Partial<LearningResourceItem>) => Promise<void>;
  deleteLearningResource: (id: string) => Promise<void>;
  interviewTemplates: InterviewTemplateItem[];
  addInterviewTemplate: (t: Omit<InterviewTemplateItem, 'id'>) => Promise<void>;
  updateInterviewTemplate: (id: string, t: Partial<InterviewTemplateItem>) => Promise<void>;
  deleteInterviewTemplate: (id: string) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;
  updateUserRole: (id: string, role: Role) => Promise<void>;
  deleteUserAccount: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial data from localStorage if available
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('skillpilot_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return initialUsers;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('skillpilot_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const email = String(parsed.email || '').toLowerCase();
        if (email === 'nivithays2005@gmail.com' || email === 'nivithas2005@gmail.com' || email === 'admin@skillpilot.com') {
          parsed.role = 'admin';
        }
        return parsed;
      } catch {}
    }
    return initialUsers[0];
  });

  const [topics, setTopics] = useState<TopicItem[]>(() => {
    const saved = localStorage.getItem('skillpilot_topics');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      { id: 'top-1', name: 'Quantitative Aptitude', category: 'Aptitude', order: 1, enabled: true, description: 'Arithmetic, percentages, profit & loss, algebra' },
      { id: 'top-2', name: 'Logical Reasoning', category: 'Aptitude', order: 2, enabled: true, description: 'Coding-decoding, blood relations, syllogisms, series' },
      { id: 'top-3', name: 'Verbal Ability', category: 'Aptitude', order: 3, enabled: true, description: 'Reading comprehension, grammar, vocabulary, sentence correction' },
      { id: 'top-4', name: 'Arrays & Two Pointers', category: 'DSA', order: 4, enabled: true, description: 'Sliding window, sub-array sums, cyclic sorting' },
      { id: 'top-5', name: 'Linked Lists & Pointers', category: 'DSA', order: 5, enabled: true, description: 'Fast & slow pointers, reversal, cycle detection' },
      { id: 'top-6', name: 'SQL Joins & Grouping', category: 'SQL', order: 6, enabled: true, description: 'INNER, LEFT, RIGHT, FULL OUTER joins, HAVING, aggregations' },
      { id: 'top-7', name: 'Operating Systems', category: 'Core CS', order: 7, enabled: true, description: 'Process synchronization, paging, deadlocks, scheduling' },
      { id: 'top-8', name: 'Computer Networks', category: 'Core CS', order: 8, enabled: true, description: 'OSI model, TCP/IP, DNS, HTTP/HTTPS, routing' },
    ];
  });

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() => {
    const saved = localStorage.getItem('skillpilot_announcements');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'ann-1',
        title: 'HCL & TCS Grand Placement Drive Preparation Kit Added',
        content: 'Company-specific mock practice sheets with negative marking analysis are now live for all enrolled students.',
        category: 'Company',
        priority: 'high',
        createdAt: '2026-09-28T10:00:00.000Z',
        active: true,
      },
      {
        id: 'ann-2',
        title: 'New Aptitude Mock Assessment Available',
        content: 'Full-length 30-minute quantitative and logical mock assessment uploaded with instant detailed video solutions.',
        category: 'Test',
        priority: 'medium',
        createdAt: '2026-09-27T14:30:00.000Z',
        active: true,
      },
      {
        id: 'ann-3',
        title: 'New DSA Top-50 Interview Patterns Released',
        content: 'Practice Two Pointers, Fast & Slow Pointers, and Dynamic Programming with curated LeetCode mappings.',
        category: 'DSA',
        priority: 'medium',
        createdAt: '2026-09-25T08:00:00.000Z',
        active: true,
      },
    ];
  });

  const [companyPrep, setCompanyPrep] = useState<CompanyPrepSet[]>(() => {
    const saved = localStorage.getItem('skillpilot_company_prep');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'comp-1',
        companyName: 'TCS',
        roleTitle: 'Ninja / Digital / Prime SDE',
        difficulty: 'Medium',
        patternOverview: 'Numerical Ability (20 Qs), Reasoning (20 Qs), Verbal (25 Qs), Advanced Coding (2 Problems).',
        totalQuestions: 67,
        topicsCovered: ['Quantitative Aptitude', 'Verbal Ability', 'Arrays', 'Strings'],
        active: true,
      },
      {
        id: 'comp-2',
        companyName: 'HCL',
        roleTitle: 'Graduate Engineer Trainee (GET)',
        difficulty: 'Medium',
        patternOverview: 'Aptitude Assessment, Basic Technical MCQ (OOPs/C/Java), Pseudocode, and 1 Coding task.',
        totalQuestions: 48,
        topicsCovered: ['Logical Reasoning', 'Quantitative Aptitude', 'SQL', 'C/Java'],
        active: true,
      },
      {
        id: 'comp-3',
        companyName: 'Infosys',
        roleTitle: 'Systems Engineer & Specialist Programmer',
        difficulty: 'Hard',
        patternOverview: 'Mathematical Thinking, Critical Thinking, Verbal, and InfyTQ coding challenge.',
        totalQuestions: 54,
        topicsCovered: ['Logical Reasoning', 'DSA', 'Dynamic Programming', 'SQL'],
        active: true,
      },
      {
        id: 'comp-4',
        companyName: 'Cognizant',
        roleTitle: 'GenC, GenC Elevate & GenC Next',
        difficulty: 'Medium',
        patternOverview: 'Analytical ability, English comprehension, Coding logic & SQL queries.',
        totalQuestions: 42,
        topicsCovered: ['Quantitative Aptitude', 'Verbal Ability', 'SQL Joins', 'OOPs'],
        active: true,
      },
      {
        id: 'comp-5',
        companyName: 'Accenture',
        roleTitle: 'Associate Software Engineer (ASE / FSE)',
        difficulty: 'Medium',
        patternOverview: 'Cognitive & Technical Assessment, Coding (2 questions), English Communication Test.',
        totalQuestions: 50,
        topicsCovered: ['Cognitive Ability', 'Pseudocode', 'Cloud Fundamentals', 'Coding'],
        active: true,
      },
      {
        id: 'comp-6',
        companyName: 'Capgemini',
        roleTitle: 'Analyst & Software Engineer Trainee',
        difficulty: 'Medium',
        patternOverview: 'Game-Based Aptitude, Technical Test, Spoken English, and DSA coding task.',
        totalQuestions: 38,
        topicsCovered: ['Inductive Logic', 'Deductive Logic', 'DSA', 'SQL'],
        active: true,
      },
      {
        id: 'comp-7',
        companyName: 'Wipro',
        roleTitle: 'Project Engineer (Elite NLTH)',
        difficulty: 'Medium',
        patternOverview: 'Logical & Quantitative Aptitude, Written Communication, and 2 Coding Challenges.',
        totalQuestions: 40,
        topicsCovered: ['Quantitative Aptitude', 'Verbal Ability', 'Arrays', 'Strings'],
        active: true,
      },
    ];
  });

  const [learningResources, setLearningResources] = useState<LearningResourceItem[]>(() => {
    const saved = localStorage.getItem('skillpilot_resources');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'res-1',
        title: 'Complete Quantitative Aptitude Masterclass',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=sj8423y6m8M',
        topic: 'Quantitative Aptitude',
        subject: 'Aptitude',
        authorOrChannel: 'CareerRide',
        durationOrPages: '42 mins',
      },
      {
        id: 'res-2',
        title: 'Mastering SQL Joins & Subqueries in 30 Minutes',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=0rnGEblY9QU',
        topic: 'SQL Joins & Grouping',
        subject: 'SQL',
        authorOrChannel: 'Kudvenkat',
        durationOrPages: '28 mins',
      },
      {
        id: 'res-3',
        title: 'Campus Placement SDE Hand-Written Cheat Sheet',
        type: 'pdf',
        url: 'https://skillpilot.campus/notes/dsa_handbook.pdf',
        topic: 'Arrays & Two Pointers',
        subject: 'DSA',
        authorOrChannel: 'SkillPilot Faculty Team',
        durationOrPages: '24 pages',
      },
      {
        id: 'res-4',
        title: 'Top 50 Operating System Interview Questions Article',
        type: 'article',
        url: 'https://www.geeksforgeeks.org/operating-systems/',
        topic: 'Operating Systems',
        subject: 'Core CS',
        authorOrChannel: 'GeeksforGeeks',
        durationOrPages: '15 mins read',
      },
    ];
  });

  const [interviewTemplates, setInterviewTemplates] = useState<InterviewTemplateItem[]>(() => {
    const saved = localStorage.getItem('skillpilot_interview_templates');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'int-1',
        category: 'Technical SDE',
        questionTitle: 'Can you explain how hash map collision resolution works (Chaining vs Open Addressing) and analyze their worst-case time complexities?',
        samplePoints: [
          'Separate chaining with linked lists or balanced red-black trees (Java HashMap)',
          'Open addressing strategies (Linear probing, Quadratic, Double hashing)',
          'Load factor threshold and rehashing mechanics',
          'Average case O(1) vs worst case O(n)',
        ],
        difficulty: 'Medium',
        companyTags: ['TCS', 'Infosys', 'Cognizant', 'Accenture'],
      },
      {
        id: 'int-2',
        category: 'Technical SDE',
        questionTitle: 'Explain the difference between clustered and non-clustered indexes in relational databases, and when an index might degrade performance.',
        samplePoints: [
          'Clustered index physically sorts rows on disk (one per table)',
          'Non-clustered index uses a separate B+ tree structure pointing to data pointers',
          'Write overhead on INSERT/UPDATE/DELETE due to index tree rebalancing',
          'High index selectivity consideration',
        ],
        difficulty: 'Medium',
        companyTags: ['HCL', 'Capgemini', 'Wipro', 'Cognizant'],
      },
      {
        id: 'int-3',
        category: 'HR Behavioral',
        questionTitle: 'Describe a challenging engineering roadblock you encountered during your college projects and how you resolved team conflicts.',
        samplePoints: [
          'STAR methodology (Situation, Task, Action, Result)',
          'Clear technical ownership and collaborative consensus',
          'Metrics-backed positive outcome and learning',
        ],
        difficulty: 'Easy',
        companyTags: ['TCS', 'HCL', 'Infosys', 'Accenture', 'Capgemini'],
      },
      {
        id: 'int-4',
        category: 'System Design',
        questionTitle: 'How would you design a scalable URL shortener system like Bitly? Outline the database schema, hashing algorithm, and caching layer.',
        samplePoints: [
          'Base62 encoding of auto-incrementing ID or MD5 hash slice',
          'Read-heavy ratio (100:1) with Redis caching for hot links',
          'Relational vs NoSQL key-value store comparison',
          'Handling race conditions and collision avoidance',
        ],
        difficulty: 'Hard',
        companyTags: ['Amazon', 'Infosys Prime', 'Cognizant Next'],
      },
      {
        id: 'int-5',
        category: 'Resume-based',
        questionTitle: 'Walk me through the architecture of your primary resume project. What trade-offs did you make with your chosen tech stack?',
        samplePoints: [
          'High-level architecture breakdown (Frontend, Backend, Database)',
          'Why specific frameworks or libraries were chosen over alternatives',
          'Biggest technical hurdle conquered during implementation',
          'How security or performance was validated',
        ],
        difficulty: 'Medium',
        companyTags: ['HCL', 'TCS', 'Infosys', 'Accenture'],
      },
    ];
  });

  const [dsaProblems, setDsaProblems] = useState<DSAProblem[]>(() => {
    const saved = localStorage.getItem('skillpilot_dsa_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 80) return parsed;
      } catch {}
    }
    return initialDSAProblems;
  });

  const [aptitudeQuestions, setAptitudeQuestions] = useState<AptitudeQuestion[]>(() => {
    const saved = localStorage.getItem('skillpilot_aptitude_v5');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 250 && parsed[0]?.category) {
          return parsed;
        }
      } catch {}
    }
    return initialAptitudeQuestions;
  });

  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>(() => {
    const saved = localStorage.getItem('skillpilot_mcq');
    return saved ? JSON.parse(saved) : initialMCQQuestions;
  });

  const [videos, setVideos] = useState<VideoRecommendation[]>(() => {
    const saved = localStorage.getItem('skillpilot_videos');
    return saved ? JSON.parse(saved) : initialVideos;
  });

  const [testResults, setTestResults] = useState<TestResult[]>(() => {
    const saved = localStorage.getItem('skillpilot_results');
    return saved ? JSON.parse(saved) : initialTestResults;
  });

  const [streakHistoryMap, setStreakHistoryMap] = useState<Record<string, Record<string, DailyActivityRecord>>>(() => {
    const saved = localStorage.getItem('skillpilot_user_streaks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) return parsed;
      } catch {}
    }
    return {
      'user-nivitha': generateInitialStreakHistory('user-nivitha'),
    };
  });

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeVideo, setActiveVideo] = useState<VideoRecommendation | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [userStreak, setUserStreak] = useState<UserStreakRecord>(() => {
    const userId = currentUser?.id || 'user-nivitha';
    const saved = localStorage.getItem(`skillpilot_db_streak_${userId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.currentStreak === 'number') {
          return parsed;
        }
      } catch {}
    }
    const today = new Date().toISOString().split('T')[0];
    return {
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastVisitDate: today,
    };
  });

  // Track visit in database whenever currentUser logs in or app mounts on a new day
  useEffect(() => {
    if (!currentUser) return;
    const userId = currentUser.id;

    // Use user's local date YYYY-MM-DD
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const clientDate = `${year}-${month}-${day}`;

    fetch('/api/streak/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, clientDate }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.streak) {
          setUserStreak(data.streak);
          localStorage.setItem(`skillpilot_db_streak_${userId}`, JSON.stringify(data.streak));
        }
      })
      .catch((err) => {
        console.warn('Daily streak database sync warning:', err);
      });
  }, [currentUser?.id]);

  // Sync state to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('skillpilot_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('skillpilot_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('skillpilot_dsa_v2', JSON.stringify(dsaProblems));
  }, [dsaProblems]);

  useEffect(() => {
    localStorage.setItem('skillpilot_aptitude_v5', JSON.stringify(aptitudeQuestions));
  }, [aptitudeQuestions]);

  useEffect(() => {
    localStorage.setItem('skillpilot_mcq', JSON.stringify(mcqQuestions));
  }, [mcqQuestions]);

  useEffect(() => {
    localStorage.setItem('skillpilot_videos', JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem('skillpilot_results', JSON.stringify(testResults));
  }, [testResults]);

  useEffect(() => {
    localStorage.setItem('skillpilot_user_streaks', JSON.stringify(streakHistoryMap));
  }, [streakHistoryMap]);

  useEffect(() => {
    localStorage.setItem('skillpilot_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('skillpilot_topics', JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem('skillpilot_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('skillpilot_company_prep', JSON.stringify(companyPrep));
  }, [companyPrep]);

  useEffect(() => {
    localStorage.setItem('skillpilot_resources', JSON.stringify(learningResources));
  }, [learningResources]);

  useEffect(() => {
    localStorage.setItem('skillpilot_interview_templates', JSON.stringify(interviewTemplates));
  }, [interviewTemplates]);

  useEffect(() => {
    const syncWithBackend = async () => {
      try {
        const [usersRes, topicsRes, annRes, compRes, resRes, tplRes] = await Promise.allSettled([
          fetch('/api/admin/users').then((r) => r.json()),
          fetch('/api/admin/topics').then((r) => r.json()),
          fetch('/api/admin/announcements').then((r) => r.json()),
          fetch('/api/admin/company-prep').then((r) => r.json()),
          fetch('/api/admin/resources').then((r) => r.json()),
          fetch('/api/admin/interview-templates').then((r) => r.json()),
        ]);

        if (usersRes.status === 'fulfilled' && usersRes.value?.users) {
          setUsers((prev) => {
            const serverUsers: User[] = usersRes.value.users.map((u: any) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role.toLowerCase() as Role,
              status: u.status || 'active',
              department: u.department || 'Engineering',
              batch: u.batch || '2026',
            }));
            return serverUsers.length > 0 ? serverUsers : prev;
          });
        }
        if (topicsRes.status === 'fulfilled' && topicsRes.value?.topics) {
          setTopics(topicsRes.value.topics);
        }
        if (annRes.status === 'fulfilled' && annRes.value?.announcements) {
          setAnnouncements(annRes.value.announcements);
        }
        if (compRes.status === 'fulfilled' && compRes.value?.companies) {
          setCompanyPrep(compRes.value.companies);
        }
        if (resRes.status === 'fulfilled' && resRes.value?.resources) {
          setLearningResources(resRes.value.resources);
        }
        if (tplRes.status === 'fulfilled' && tplRes.value?.templates) {
          setInterviewTemplates(tplRes.value.templates);
        }
      } catch (err) {
        console.warn('Backend sync:', err);
      }
    };

    syncWithBackend();
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToasts((prev) => {
      // Prevent duplicate identical messages showing at the same time
      if (prev.some((t) => t.message === message)) {
        return prev;
      }
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id));
      }, 3000);
      return [...prev, { id, type, message }];
    });
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openVideoModal = (video: VideoRecommendation) => {
    setActiveVideo(video);
  };

  const closeVideoModal = () => {
    setActiveVideo(null);
  };

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        const role = String(data.user.role).toLowerCase() as Role;
        const loggedUser: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role,
        };
        setCurrentUser(loggedUser);
        const destination = role === 'admin' ? 'admin' : 'dashboard';
        setCurrentTab(destination);
        showToast(`Welcome back, ${loggedUser.name}!`);
        return { success: true };
      } else {
        const errorMsg = data.error || 'Invalid email or password.';
        showToast(errorMsg, 'error');
        return { success: false, error: errorMsg };
      }
    } catch {
      // Offline fallback
      const foundUser = users.find((u) => u.email.toLowerCase() === trimmedEmail);
      if (!foundUser) {
        showToast('User not found in database.', 'error');
        return { success: false, error: 'User not found in database.' };
      }
      if (password && foundUser.password && foundUser.password !== password) {
        showToast('Incorrect password.', 'error');
        return { success: false, error: 'Incorrect password.' };
      }
      setCurrentUser(foundUser);
      const destination = foundUser.role === 'admin' ? 'admin' : 'dashboard';
      setCurrentTab(destination);
      showToast(`Welcome back, ${foundUser.name}!`);
      return { success: true };
    }
  };

  const loginWithGoogle = async (googleEmail?: string, googleName?: string) => {
    const targetEmail = (googleEmail || 'nivithas2005@gmail.com').trim().toLowerCase();
    const targetName = googleName || (targetEmail.includes('@') ? targetEmail.split('@')[0] : 'User');

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, name: targetName }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        const role = String(data.user.role).toLowerCase() as Role;
        const loggedUser: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role,
        };
        setCurrentUser(loggedUser);
        const destination = role === 'admin' ? 'admin' : 'dashboard';
        setCurrentTab(destination);
        showToast(`Signed in with Google as ${loggedUser.name}`);
        return;
      }
    } catch (err) {
      console.warn('Google sign-in fallback:', err);
    }

    const fallback = users.find((u) => u.email.toLowerCase() === targetEmail) || users[0];
    setCurrentUser(fallback);
    setCurrentTab(fallback.role === 'admin' ? 'admin' : 'dashboard');
    showToast(`Signed in with Google as ${fallback.name}`);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    department?: string,
    batch?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, department, batch }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        if (data.token) {
          localStorage.setItem('skillpilot_auth_token', data.token);
        }
        const role = String(data.user.role).toLowerCase() as Role;
        const newUser: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role,
          status: 'active',
          department: data.user.department,
          batch: data.user.batch,
        };
        setUsers((prev) => [...prev, newUser]);
        setCurrentUser(newUser);
        const destination = role === 'admin' ? 'admin' : 'dashboard';
        setCurrentTab(destination);
        showToast(`Welcome to SkillPilot, ${newUser.name}! Your account has been created.`);
        return { success: true };
      } else {
        const errorMsg = data.error || 'Registration failed.';
        showToast(errorMsg, 'error');
        return { success: false, error: errorMsg };
      }
    } catch {
      showToast('Registration failed. Please check your connection.', 'error');
      return { success: false, error: 'Registration failed. Please check your connection.' };
    }
  };

  const resetUserPassword = async (email: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Password reset successfully! Please log in with your new password.');
        return { success: true };
      } else {
        showToast(data.error || 'Failed to reset password.', 'error');
        return { success: false, error: data.error || 'Failed to reset password.' };
      }
    } catch {
      showToast('Password reset failed. Please check your connection.', 'error');
      return { success: false, error: 'Password reset failed.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('skillpilot_auth_token');
    setCurrentUser(null);
    setCurrentTab('login');
    showToast('Logged out successfully', 'info');
  };

  const switchRole = (role: Role) => {
    if (role === 'admin') {
      const adminUser = users.find((u) => u.role === 'admin') || initialUsers[1];
      setCurrentUser(adminUser);
      setCurrentTab('admin');
      showToast('Switched to Administrator View');
    } else {
      const studentUser = users.find((u) => u.role === 'student') || initialUsers[0];
      setCurrentUser(studentUser);
      setCurrentTab('dashboard');
      showToast(`Switched to Student View (${studentUser.name})`);
    }
  };

  const recordActivity = (description: string = 'Placement Practice Activity') => {
    const userId = currentUser?.id || 'user-nivitha';
    const todayKey = formatDateKey();

    setStreakHistoryMap((prev) => {
      const userHistory = { ...(prev[userId] || generateInitialStreakHistory(userId)) };
      const currentToday = userHistory[todayKey] || {
        date: todayKey,
        count: 0,
        activities: [],
      };

      userHistory[todayKey] = {
        date: todayKey,
        count: currentToday.count + 1,
        activities: [description, ...currentToday.activities.filter((a) => a !== description)],
      };

      return {
        ...prev,
        [userId]: userHistory,
      };
    });
  };

  const checkInToday = () => {
    recordActivity('Daily Placement Check-in 🔥');
    showToast('Daily Streak logged! Keep the flame burning 🔥', 'success');
  };

  const simulateStreak = async (action: 'next_day' | 'miss_day' | 'reset' | 'set', value?: number) => {
    const userId = currentUser?.id || 'user-nivitha';
    try {
      const res = await fetch('/api/streak/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, value }),
      });
      const data = await res.json();
      if (data.success && data.streak) {
        setUserStreak(data.streak);
        localStorage.setItem(`skillpilot_db_streak_${userId}`, JSON.stringify(data.streak));
        showToast(`Streak updated to Day ${data.streak.currentStreak} 🔥`);
      }
    } catch (err) {
      console.error('Failed to simulate streak action:', err);
    }
  };

  const streakData: UserStreak = useMemo(() => {
    const userId = currentUser?.id || 'user-nivitha';
    const userHistory = streakHistoryMap[userId] || generateInitialStreakHistory(userId);
    const stats = calculateStreakStats(userHistory);
    return {
      current_streak: userStreak.currentStreak,
      longest_streak: userStreak.longestStreak,
      total_active_days: stats.totalActiveDays,
      last_active_date: userStreak.lastVisitDate,
      freeze_count: 1,
      is_active_today: true,
      history: userHistory,
    };
  }, [currentUser, streakHistoryMap, userStreak]);

  const toggleDSAProblemSolved = (problemId: string) => {
    if (!currentUser) return;
    const userId = currentUser.id;
    const targetProblem = dsaProblems.find((item) => item.id === problemId);
    if (!targetProblem) return;

    const isCurrentlySolved = targetProblem.solvedByUsers?.includes(userId) || false;

    setDsaProblems((prev) =>
      prev.map((item) => {
        if (item.id === problemId) {
          const solvedList = item.solvedByUsers || [];
          const currentlySolved = solvedList.includes(userId);
          const newSolvedList = currentlySolved
            ? solvedList.filter((id) => id !== userId)
            : [...solvedList, userId];
          return { ...item, solvedByUsers: newSolvedList };
        }
        return item;
      })
    );

    if (!isCurrentlySolved) {
      showToast(`Marked "${targetProblem.problem_name}" as Solved! 🎯`);
      recordActivity(`Solved DSA: ${targetProblem.problem_name}`);
    }
  };

  const toggleAptitudeQuestionSolved = (questionId: string) => {
    if (!currentUser) return;
    const userId = currentUser.id;

    const targetItem = aptitudeQuestions.find((item) => item.id === questionId);
    if (!targetItem) return;

    const isCurrentlySolved = targetItem.solvedByUsers?.includes(userId) || false;

    setAptitudeQuestions((prev) =>
      prev.map((item) => {
        if (item.id === questionId) {
          const solvedList = item.solvedByUsers || [];
          const currentlySolved = solvedList.includes(userId);
          const newSolvedList = currentlySolved
            ? solvedList.filter((id) => id !== userId)
            : [...solvedList, userId];
          return { ...item, solvedByUsers: newSolvedList };
        }
        return item;
      })
    );

    if (!isCurrentlySolved) {
      showToast('Aptitude question marked as solved!');
      recordActivity(`Solved Aptitude: ${targetItem.topic}`);
    } else {
      showToast('Question unmarked as solved', 'info');
    }
  };

  const submitTestResult = (resultData: Omit<TestResult, 'id' | 'date'>): TestResult => {
    const newResult: TestResult = {
      ...resultData,
      id: `res-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };

    setTestResults((prev) => [newResult, ...prev]);
    recordActivity(`Completed ${resultData.subject} Diagnostic Test (${resultData.score}/${resultData.total_questions})`);
    showToast(`Test Completed! Score: ${newResult.percentage}%`, newResult.percentage >= 70 ? 'success' : 'info');
    return newResult;
  };

  // Student progress calculations (reactive to current user)
  const studentStats: StudentProgress = useMemo(() => {
    if (!currentUser) {
      return {
        dsa_solved_count: 45,
        aptitude_solved_count: 150,
        tests_attempted: 20,
        average_score: 78,
        quant_score: 80,
        logical_score: 65,
        verbal_score: 75,
        topic_performance: {
          Java: 85,
          SQL: 70,
          DSA: 65,
          Networking: 55,
          Aptitude: 80,
          OS: 60,
        },
        weak_topics: ['Probability', 'Time & Work', 'Coding-Decoding', 'Sentence Correction'],
        weak_topics_by_category: {
          quantitative: ['Probability', 'Time & Work'],
          logical: ['Coding-Decoding'],
          verbal: ['Sentence Correction'],
        },
      };
    }

    const userId = currentUser.id;

    // Actual user solved DSA problems
    const solvedDsaReal = dsaProblems.filter((p) => p.solvedByUsers?.includes(userId)).length;
    // For realistic demo data matching user prompt "DSA Problems Solved: 50" if Nivitha
    const dsa_solved_count = userId === 'user-nivitha' ? Math.max(50, solvedDsaReal + 40) : solvedDsaReal;

    // Actual user solved Aptitude questions
    const solvedAptReal = aptitudeQuestions.filter((q) => q.solvedByUsers?.includes(userId)).length;
    const aptitude_solved_count = userId === 'user-nivitha' ? Math.max(120, solvedAptReal + 110) : solvedAptReal;

    // User tests
    const userTests = testResults.filter((r) => r.student_id === userId);
    const tests_attempted = userId === 'user-nivitha' ? Math.max(20, userTests.length + 15) : userTests.length;

    // Average score calculation
    let avg = 78;
    if (userTests.length > 0) {
      const sum = userTests.reduce((acc, curr) => acc + curr.percentage, 0);
      avg = Math.round(sum / userTests.length);
    }
    const average_score = userId === 'user-nivitha' && userTests.length <= 5 ? 78 : (userTests.length > 0 ? avg : 75);

    // Subject/Topic performance mapping
    const subjectMap: Record<string, { total: number; correct: number }> = {
      Java: { total: 20, correct: 17 }, // 85%
      SQL: { total: 20, correct: 14 }, // 70%
      DSA: { total: 20, correct: 13 }, // 65%
      Networking: { total: 20, correct: 11 }, // 55%
      Aptitude: { total: 20, correct: 16 }, // 80%
      OS: { total: 20, correct: 12 }, // 60%
    };

    // Incorporate answers from user's tests
    userTests.forEach((t) => {
      if (!subjectMap[t.subject]) {
        subjectMap[t.subject] = { total: 0, correct: 0 };
      }
      subjectMap[t.subject].total += t.total_questions;
      subjectMap[t.subject].correct += t.score;
    });

    const topic_performance: Record<string, number> = {};
    Object.keys(subjectMap).forEach((subj) => {
      const item = subjectMap[subj];
      topic_performance[subj] = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 70;
    });

    // Compute Weak Topics (< 70% accuracy)
    const weakTopicSet = new Set<string>();
    // Default weak topics from prompt: Collections, Binary Trees, SQL Joins
    if (userId === 'user-nivitha') {
      weakTopicSet.add('Collections');
      weakTopicSet.add('Binary Trees');
      weakTopicSet.add('SQL Joins');
    }

    // Add weak topics identified from tests
    userTests.forEach((t) => {
      t.identified_weak_topics?.forEach((wt) => weakTopicSet.add(wt));
      // Also inspect individual wrong answers
      t.answers?.forEach((ans) => {
        if (!ans.is_correct && ans.topic) {
          weakTopicSet.add(ans.topic);
        }
      });
    });

    // Weak topics categorized by 3 pillars
    const quantWeak = new Set<string>(['Probability', 'Time & Work']);
    const logicalWeak = new Set<string>(['Coding-Decoding']);
    const verbalWeak = new Set<string>(['Sentence Correction']);

    // Check wrong answers from test sessions to categorize dynamically
    userTests.forEach((t) => {
      t.answers?.forEach((ans) => {
        if (!ans.is_correct && ans.topic) {
          weakTopicSet.add(ans.topic);
          const aptMatch = aptitudeQuestions.find((q) => q.topic.toLowerCase() === ans.topic.toLowerCase());
          if (aptMatch) {
            if (aptMatch.category === 'Quantitative Aptitude') quantWeak.add(ans.topic);
            else if (aptMatch.category === 'Logical Reasoning') logicalWeak.add(ans.topic);
            else if (aptMatch.category === 'Verbal Ability') verbalWeak.add(ans.topic);
          }
        }
      });
    });

    const weak_topics = Array.from(
      new Set([
        ...Array.from(quantWeak),
        ...Array.from(logicalWeak),
        ...Array.from(verbalWeak),
        ...Array.from(weakTopicSet),
      ])
    );

    return {
      dsa_solved_count: userId === 'user-nivitha' ? Math.max(45, solvedDsaReal + 35) : solvedDsaReal,
      aptitude_solved_count: userId === 'user-nivitha' ? Math.max(150, solvedAptReal + 130) : solvedAptReal,
      tests_attempted: userId === 'user-nivitha' ? Math.max(20, userTests.length + 15) : userTests.length,
      average_score,
      quant_score: 80,
      logical_score: 65,
      verbal_score: 75,
      topic_performance,
      weak_topics,
      weak_topics_by_category: {
        quantitative: Array.from(quantWeak),
        logical: Array.from(logicalWeak),
        verbal: Array.from(verbalWeak),
      },
    };
  }, [currentUser, dsaProblems, aptitudeQuestions, testResults]);

  // Admin CRUD methods
  const addDSAProblem = (p: Omit<DSAProblem, 'id'>) => {
    const newProblem: DSAProblem = {
      ...p,
      id: `dsa-${Date.now()}`,
      solvedByUsers: [],
    };
    setDsaProblems((prev) => [newProblem, ...prev]);
    showToast(`Added problem "${p.problem_name}" to DSA Sheet`);
  };

  const updateDSAProblem = (id: string, p: Partial<DSAProblem>) => {
    setDsaProblems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...p } : item))
    );
    showToast('Updated DSA Problem details');
  };

  const deleteDSAProblem = (id: string) => {
    setDsaProblems((prev) => prev.filter((item) => item.id !== id));
    showToast('Deleted DSA Problem from sheet', 'info');
  };

  const addAptitudeQuestion = (q: Omit<AptitudeQuestion, 'id'>) => {
    const newQ: AptitudeQuestion = {
      ...q,
      id: `apt-${Date.now()}`,
      solvedByUsers: [],
    };
    setAptitudeQuestions((prev) => [newQ, ...prev]);
    showToast(`Added Aptitude question to "${q.topic}"`);
  };

  const updateAptitudeQuestion = (id: string, q: Partial<AptitudeQuestion>) => {
    setAptitudeQuestions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...q } : item))
    );
    showToast('Updated Aptitude question');
  };

  const deleteAptitudeQuestion = (id: string) => {
    setAptitudeQuestions((prev) => prev.filter((item) => item.id !== id));
    showToast('Deleted Aptitude question', 'info');
  };

  const addMCQQuestion = (m: Omit<MCQQuestion, 'id'>) => {
    const newM: MCQQuestion = {
      ...m,
      id: `mcq-${Date.now()}`,
    };
    setMcqQuestions((prev) => [newM, ...prev]);
    showToast(`Added MCQ question for ${m.subject}`);
  };

  const updateMCQQuestion = (id: string, m: Partial<MCQQuestion>) => {
    setMcqQuestions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...m } : item))
    );
    showToast('Updated MCQ question');
  };

  const deleteMCQQuestion = (id: string) => {
    setMcqQuestions((prev) => prev.filter((item) => item.id !== id));
    showToast('Deleted MCQ question', 'info');
  };

  const addVideo = (v: Omit<VideoRecommendation, 'id'>) => {
    const newV: VideoRecommendation = {
      ...v,
      id: `vid-${Date.now()}`,
    };
    setVideos((prev) => [newV, ...prev]);
    showToast(`Added recommended video for "${v.topic}"`);
  };

  const updateVideo = (id: string, v: Partial<VideoRecommendation>) => {
    setVideos((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...v } : item))
    );
    showToast('Updated video recommendation');
  };

  const deleteVideo = (id: string) => {
    setVideos((prev) => prev.filter((item) => item.id !== id));
    showToast('Deleted video recommendation', 'info');
  };

  // Topics CRUD
  const addTopic = async (t: Omit<TopicItem, 'id'>) => {
    const newTopic: TopicItem = { ...t, id: `top-${Date.now()}` };
    setTopics((prev) => [...prev, newTopic]);
    try {
      await fetch('/api/admin/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(t),
      });
    } catch {}
    showToast(`Added new topic: "${t.name}"`);
  };

  const updateTopic = async (id: string, t: Partial<TopicItem>) => {
    setTopics((prev) => prev.map((item) => (item.id === id ? { ...item, ...t } : item)));
    try {
      await fetch(`/api/admin/topics/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(t),
      });
    } catch {}
    showToast('Updated topic settings');
  };

  const deleteTopic = async (id: string) => {
    setTopics((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`/api/admin/topics/${id}`, { method: 'DELETE' });
    } catch {}
    showToast('Deleted topic', 'info');
  };

  const toggleTopic = async (id: string) => {
    setTopics((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
    try {
      await fetch(`/api/admin/topics/${id}/toggle`, { method: 'POST' });
    } catch {}
    showToast('Toggled topic status');
  };

  // Announcements CRUD
  const addAnnouncement = async (a: Omit<AnnouncementItem, 'id' | 'createdAt'>) => {
    const newAnn: AnnouncementItem = {
      ...a,
      id: `ann-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    try {
      await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(a),
      });
    } catch {}
    showToast(`Published announcement: "${a.title}"`);
  };

  const updateAnnouncement = async (id: string, a: Partial<AnnouncementItem>) => {
    setAnnouncements((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...a } : item))
    );
    try {
      await fetch(`/api/admin/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(a),
      });
    } catch {}
    showToast('Updated announcement');
  };

  const deleteAnnouncement = async (id: string) => {
    setAnnouncements((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
    } catch {}
    showToast('Deleted announcement', 'info');
  };

  // Company Prep CRUD
  const addCompanyPrep = async (c: Omit<CompanyPrepSet, 'id'>) => {
    const newComp: CompanyPrepSet = { ...c, id: `comp-${Date.now()}` };
    setCompanyPrep((prev) => [...prev, newComp]);
    try {
      await fetch('/api/admin/company-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c),
      });
    } catch {}
    showToast(`Added preparation kit for ${c.companyName}`);
  };

  const updateCompanyPrep = async (id: string, c: Partial<CompanyPrepSet>) => {
    setCompanyPrep((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...c } : item))
    );
    try {
      await fetch(`/api/admin/company-prep/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c),
      });
    } catch {}
    showToast('Updated company preparation module');
  };

  const deleteCompanyPrep = async (id: string) => {
    setCompanyPrep((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`/api/admin/company-prep/${id}`, { method: 'DELETE' });
    } catch {}
    showToast('Deleted company preparation kit', 'info');
  };

  // Learning Resources CRUD
  const addLearningResource = async (r: Omit<LearningResourceItem, 'id'>) => {
    const newRes: LearningResourceItem = { ...r, id: `res-${Date.now()}` };
    setLearningResources((prev) => [...prev, newRes]);
    try {
      await fetch('/api/admin/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(r),
      });
    } catch {}
    showToast(`Added learning resource: "${r.title}"`);
  };

  const updateLearningResource = async (id: string, r: Partial<LearningResourceItem>) => {
    setLearningResources((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...r } : item))
    );
    try {
      await fetch(`/api/admin/resources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(r),
      });
    } catch {}
    showToast('Updated learning resource');
  };

  const deleteLearningResource = async (id: string) => {
    setLearningResources((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`/api/admin/resources/${id}`, { method: 'DELETE' });
    } catch {}
    showToast('Deleted learning resource', 'info');
  };

  // Interview Templates CRUD
  const addInterviewTemplate = async (t: Omit<InterviewTemplateItem, 'id'>) => {
    const newTpl: InterviewTemplateItem = { ...t, id: `int-${Date.now()}` };
    setInterviewTemplates((prev) => [...prev, newTpl]);
    try {
      await fetch('/api/admin/interview-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(t),
      });
    } catch {}
    showToast(`Added interview template (${t.category})`);
  };

  const updateInterviewTemplate = async (id: string, t: Partial<InterviewTemplateItem>) => {
    setInterviewTemplates((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...t } : item))
    );
    try {
      await fetch(`/api/admin/interview-templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(t),
      });
    } catch {}
    showToast('Updated interview template');
  };

  const deleteInterviewTemplate = async (id: string) => {
    setInterviewTemplates((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`/api/admin/interview-templates/${id}`, { method: 'DELETE' });
    } catch {}
    showToast('Deleted interview template', 'info');
  };

  // User Management
  const toggleUserStatus = async (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'disabled' ? 'active' : 'disabled' } : u))
    );
    try {
      await fetch(`/api/admin/users/${id}/toggle-status`, { method: 'POST' });
    } catch {}
    showToast('Updated student access status');
  };

  const updateUserRole = async (id: string, role: Role) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    try {
      await fetch(`/api/admin/users/${id}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: role.toUpperCase() }),
      });
    } catch {}
    showToast(`Changed user role to ${role}`);
  };

  const deleteUserAccount = async (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    try {
      await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    } catch {}
    showToast('Removed user account', 'info');
  };

  const resetAllData = () => {
    localStorage.clear();
    setDsaProblems(initialDSAProblems);
    setAptitudeQuestions(initialAptitudeQuestions);
    setMcqQuestions(initialMCQQuestions);
    setVideos(initialVideos);
    setTestResults(initialTestResults);
    setUsers(initialUsers);
    setCurrentUser(initialUsers[0]);
    showToast('Reset all platform demo data to initial state', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        dsaProblems,
        aptitudeQuestions,
        mcqQuestions,
        videos,
        testResults,
        currentTab,
        setCurrentTab,
        activeVideo,
        openVideoModal,
        closeVideoModal,
        toasts,
        showToast,
        removeToast,
        login,
        loginWithGoogle,
        register,
        resetUserPassword,
        logout,
        switchRole,
        toggleDSAProblemSolved,
        toggleAptitudeQuestionSolved,
        submitTestResult,
        studentStats,
        userStreak,
        streakData,
        simulateStreak,
        recordActivity,
        checkInToday,
        addDSAProblem,
        updateDSAProblem,
        deleteDSAProblem,
        addAptitudeQuestion,
        updateAptitudeQuestion,
        deleteAptitudeQuestion,
        addMCQQuestion,
        updateMCQQuestion,
        deleteMCQQuestion,
        addVideo,
        updateVideo,
        deleteVideo,
        resetAllData,
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
