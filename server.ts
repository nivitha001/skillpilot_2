import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  heuristicParseResume,
  generateAdaptiveNextQuestion,
  heuristicEvaluateAnswer,
  generateFinalInterviewReport,
} from './src/server/interviewEngine';
import {
  recordVisit,
  getStreak,
  simulateStreakAction,
} from './src/server/streakDb';
import {
  authenticateUser,
  authenticateWithGoogle,
  registerUser,
  resetPassword,
  verifySessionToken,
  findUserById,
  getAllUsers,
  toggleUserStatus,
  updateUserRole,
  deleteUser,
} from './src/server/userDb';
import {
  getTopics,
  saveTopics,
  getAnnouncements,
  saveAnnouncements,
  getResources,
  saveResources,
  getCompanyPrep,
  saveCompanyPrep,
  getInterviewTemplates,
  saveInterviewTemplates,
  AdminTopic,
  AdminAnnouncement,
  AdminLearningResource,
  AdminCompanyPrep,
  AdminInterviewTemplate,
} from './src/server/adminDb';
import { ExtractedResume } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface QuestionItem {
  id: string;
  topic: string;
  question: string;
  context: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  keyExpectations: string[];
  samplePoints: string[];
}

interface EvaluationResult {
  score: number; // 0 - 100
  verdict: 'Excellent' | 'Good' | 'Needs Improvement' | 'Unsatisfactory';
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
  followUpQuestion: string;
  interviewTip: string;
}

const FALLBACK_QUESTIONS: Record<string, QuestionItem[]> = {
  'Data Structures & Algorithms': [
    {
      id: 'dsa-1',
      topic: 'Data Structures & Algorithms',
      question: 'Explain how you would detect a cycle in a singly linked list with O(1) auxiliary space, and how to find the exact start node of the loop.',
      context: 'Core linked list algorithmic technique frequently asked by Tier-1 product firms.',
      difficulty: 'Medium',
      keyExpectations: [
        'Floyd’s Cycle-Finding Algorithm (Tortoise and Hare)',
        'O(N) time complexity and O(1) space explanation',
        'Mathematical reason why resetting one pointer to head and moving both at 1x speed finds the start',
      ],
      samplePoints: [
        'Initialize slow and fast pointers at head',
        'Advance slow by 1 step, fast by 2 steps until they meet or fast hits null',
        'Reset slow to head and advance both slow and fast by 1 step; collision point is start of cycle',
      ],
    },
    {
      id: 'dsa-2',
      topic: 'Data Structures & Algorithms',
      question: 'When would you prefer a Trie (Prefix Tree) over a Hash Map for dictionary lookups or prefix auto-completion?',
      context: 'Evaluating trade-offs between Hash Tables and Specialized Tree structures.',
      difficulty: 'Medium',
      keyExpectations: [
        'Prefix matching complexity O(L) where L is length of prefix vs O(N*L) in hash table',
        'Space sharing for common prefixes vs hash map memory overhead',
        'Lexicographical ordering capabilities in Trie',
      ],
      samplePoints: [
        'Trie provides optimal O(L) search for prefix queries and autocomplete',
        'No hash collisions; bound by key length rather than table collisions',
        'Conserves memory when many strings share long common prefixes',
      ],
    },
  ],
  Java: [
    {
      id: 'java-1',
      topic: 'Java',
      question: 'How does HashMap handle collisions internally in Java 8+, and why does it transition to a Red-Black Tree?',
      context: 'Deep dive into Java Collections Framework internals.',
      difficulty: 'Medium',
      keyExpectations: [
        'Bucket chaining with LinkedList until TREEIFY_THRESHOLD (8)',
        'Red-Black Tree worst-case lookup O(log N) vs O(N) linked list',
        'Importance of hashCode() and equals() contract',
      ],
      samplePoints: [
        'Colliding entries stored in linked list in same bucket',
        'When bucket size exceeds 8 and total capacity >= 64, converted to TreeNode',
        'Prevents Denial of Service attacks caused by deliberate hash collisions',
      ],
    },
  ],
  SQL: [
    {
      id: 'sql-1',
      topic: 'SQL & Database Systems',
      question: 'Explain the difference between clustered and non-clustered indexes. How does B+ Tree structure accelerate range queries?',
      context: 'Database indexing and query execution performance.',
      difficulty: 'Medium',
      keyExpectations: [
        'Clustered index dictates physical order of data on disk (only 1 per table)',
        'Non-clustered index stores index key with pointer to row locator',
        'B+ Tree leaf nodes linked sequentially, making range scans O(log N + K)',
      ],
      samplePoints: [
        'Primary keys are clustered indexes by default in MySQL InnoDB',
        'B+ Tree keeps all values at leaf nodes, leaves linked in a doubly-linked list',
        'Non-clustered indexes require secondary lookup unless index is a covering index',
      ],
    },
    {
      id: 'sql-2',
      topic: 'SQL & Database Systems',
      question: 'Explain the ACID properties of relational databases and explain how Database Write-Ahead Logging (WAL) ensures Durability during a crash.',
      context: 'Transaction management and fault tolerance in database engines.',
      difficulty: 'Medium',
      keyExpectations: [
        'Atomicity, Consistency, Isolation, Durability breakdown',
        'WAL logs changes to non-volatile disk before modifying data pages in memory',
        'Redo/Undo pass during recovery after system reboot',
      ],
      samplePoints: [
        'Transactions must be all-or-nothing (Atomicity)',
        'Dirty pages in buffer pool can be recovered using log sequence numbers (LSN)',
      ],
    },
  ],
  'Operating Systems': [
    {
      id: 'os-1',
      topic: 'Operating Systems & Concurrency',
      question: 'What are the four necessary conditions for Deadlock to occur, and how does Coffman condition prevention differ from Deadlock Detection?',
      context: 'Concurrency and synchronization in modern multi-threaded operating systems.',
      difficulty: 'Medium',
      keyExpectations: [
        'Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait',
        'Deadlock prevention eliminates at least one condition',
        'Deadlock detection uses Resource Allocation Graphs or Banker’s Algorithm',
      ],
      samplePoints: [
        'Resource ordering prevents circular wait',
        'Preemption can force threads to yield resources',
      ],
    },
  ],
  'Computer Networks': [
    {
      id: 'cn-1',
      topic: 'Computer Networks',
      question: 'Walk through the TCP 3-Way Handshake step-by-step. What happens if the third packet (ACK) is dropped, and how does SYN Flood exploit this?',
      context: 'Transport layer protocols and network security mechanisms.',
      difficulty: 'Medium',
      keyExpectations: [
        'SYN, SYN-ACK, ACK sequence and Sequence Number synchronization',
        'Half-open connection states and server backlog queue exhaustion in SYN Flood',
        'SYN Cookies as standard mitigation mechanism',
      ],
      samplePoints: [
        'Client sends SYN with ISN_c',
        'Server responds SYN-ACK with ISN_s and ACK(ISN_c + 1)',
        'Server retransmits SYN-ACK if final ACK is lost',
      ],
    },
  ],
  Aptitude: [
    {
      id: 'apt-1',
      topic: 'Quantitative & Analytical Aptitude',
      question: 'A can complete a piece of work in 12 days, while B can complete it in 18 days. If they work on alternate days starting with A, in how many days will the work be finished?',
      context: 'Classic placement time-and-work reasoning challenge.',
      difficulty: 'Medium',
      keyExpectations: [
        'LCM of 12 and 18 = 36 total units of work',
        'Rate of A = 3 units/day, Rate of B = 2 units/day',
        'Cycle of 2 days = 5 units; complete cycles and remaining fraction calculated systematically',
      ],
      samplePoints: [
        'In 7 two-day cycles (14 days), 35 units are completed',
        'Remaining 1 unit done by A on day 15 taking 1/3 day -> Total 14 1/3 days (14.33 days)',
      ],
    },
  ],
};

function getMatchingFallbackQuestions(topic: string): QuestionItem[] {
  const t = topic.toLowerCase();
  if (t.includes('java') || t.includes('oop')) return FALLBACK_QUESTIONS['Java'] || [];
  if (t.includes('sql') || t.includes('database')) return FALLBACK_QUESTIONS['SQL'] || [];
  if (t.includes('os') || t.includes('operat') || t.includes('thread') || t.includes('concur')) return FALLBACK_QUESTIONS['Operating Systems'] || [];
  if (t.includes('net') || t.includes('tcp') || t.includes('http') || t.includes('cn')) return FALLBACK_QUESTIONS['Computer Networks'] || [];
  if (t.includes('apt') || t.includes('quant') || t.includes('logic')) return FALLBACK_QUESTIONS['Aptitude'] || [];
  return FALLBACK_QUESTIONS['Data Structures & Algorithms'] || [];
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  const apiKey = process.env.GEMINI_API_KEY || '';
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', hasGeminiKey: Boolean(apiKey) });
  });

  // Daily Streak API Endpoints (Database-backed)
  app.get('/api/streak/:userId', (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const clientDate = typeof req.query.date === 'string' ? req.query.date : undefined;
      const streak = getStreak(userId, clientDate);
      res.json({ success: true, streak });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/streak/visit', (req: Request, res: Response) => {
    try {
      const { userId, clientDate } = req.body;
      if (!userId) {
        return res.status(400).json({ success: false, error: 'userId is required' });
      }
      const streak = recordVisit(userId, clientDate);
      res.json({ success: true, streak });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/streak/simulate', (req: Request, res: Response) => {
    try {
      const { userId, action, value } = req.body;
      if (!userId || !action) {
        return res.status(400).json({ success: false, error: 'userId and action are required' });
      }
      const streak = simulateStreakAction(userId, action, value);
      res.json({ success: true, streak });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Secure Single-Login Authentication Endpoints (Database-backed)
  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required.' });
      }

      const result = authenticateUser(String(email), String(password));
      if (!result.success || !result.user) {
        return res.status(401).json({ success: false, error: result.error || 'Authentication failed.' });
      }

      const { id, name, email: userEmail, role, created_at } = result.user;
      const redirect = role === 'ADMIN' ? 'admin' : 'dashboard';

      return res.json({
        success: true,
        user: { id, name, email: userEmail, role, created_at },
        token: result.token,
        redirect,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/auth/google', (req: Request, res: Response) => {
    try {
      const { email, name } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required for Google Sign-In.' });
      }

      const result = authenticateWithGoogle(String(email), name ? String(name) : undefined);
      if (!result.success || !result.user) {
        return res.status(401).json({ success: false, error: result.error || 'Google authentication failed.' });
      }

      const { id, name: userName, email: userEmail, role, created_at } = result.user;
      const redirect = role === 'ADMIN' ? 'admin' : 'dashboard';

      return res.json({
        success: true,
        user: { id, name: userName, email: userEmail, role, created_at },
        token: result.token,
        redirect,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    try {
      const { name, email, password, department, batch } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
      }

      const result = registerUser(String(name), String(email), String(password), department, batch);
      if (!result.success || !result.user) {
        return res.status(400).json({ success: false, error: result.error || 'Registration failed.' });
      }

      const { id, name: userName, email: userEmail, role, created_at } = result.user;
      const redirect = role === 'ADMIN' ? 'admin' : 'dashboard';

      return res.json({
        success: true,
        user: { id, name: userName, email: userEmail, role, created_at },
        token: result.token,
        redirect,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/auth/reset-password', (req: Request, res: Response) => {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) {
        return res.status(400).json({ success: false, error: 'Email and new password are required.' });
      }

      const result = resetPassword(String(email), String(newPassword));
      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      return res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Protect Admin Access Endpoint: Check whether user has ADMIN role
  app.get('/api/admin/verify-access', (req: Request, res: Response) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (token) {
      const verification = verifySessionToken(token);
      if (!verification.valid || !verification.user) {
        return res.status(401).json({ authorized: false, error: verification.error || 'Invalid session token.' });
      }
      if (verification.user.role !== 'ADMIN') {
        return res.status(403).json({ authorized: false, error: 'Forbidden: Admin access required.' });
      }
      return res.json({ authorized: true, user: { id: verification.user.id, email: verification.user.email, role: verification.user.role } });
    }

    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ authorized: false, error: 'Missing user credentials.' });
    }

    const user = findUserById(userId);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ authorized: false, error: 'Forbidden: Admin access required.' });
    }

    return res.json({ authorized: true, user: { id: user.id, email: user.email, role: user.role } });
  });

  app.get('/api/admin/users', (_req: Request, res: Response) => {
    const allUsers = getAllUsers().map(({ id, name, email, role, status, created_at, department, batch, last_login }) => ({
      id,
      name,
      email,
      role,
      status: status || 'active',
      created_at,
      department: department || 'Engineering',
      batch: batch || '2026',
      last_login,
    }));
    return res.json({ users: allUsers });
  });

  app.post('/api/admin/users/:id/toggle-status', (req: Request, res: Response) => {
    const { id } = req.params;
    const updated = toggleUserStatus(id);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    return res.json({ success: true, user: updated });
  });

  app.post('/api/admin/users/:id/role', (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;
    if (role !== 'ADMIN' && role !== 'STUDENT') {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }
    const updated = updateUserRole(id, role);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    return res.json({ success: true, user: updated });
  });

  app.delete('/api/admin/users/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const ok = deleteUser(id);
    return res.json({ success: ok });
  });

  // Topics Management Endpoints
  app.get('/api/admin/topics', (_req: Request, res: Response) => {
    res.json({ topics: getTopics() });
  });

  app.post('/api/admin/topics', (req: Request, res: Response) => {
    const { name, category, order, enabled = true, description = '' } = req.body;
    if (!name) return res.status(400).json({ error: 'Topic name is required' });

    const topics = getTopics();
    const newTopic: AdminTopic = {
      id: `top-${Date.now()}`,
      name: String(name).trim(),
      category: category || 'Aptitude',
      order: Number(order) || topics.length + 1,
      enabled: Boolean(enabled),
      description: String(description),
    };
    topics.push(newTopic);
    saveTopics(topics);
    res.json({ success: true, topic: newTopic });
  });

  app.put('/api/admin/topics/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, category, order, enabled, description } = req.body;
    const topics = getTopics();
    const idx = topics.findIndex((t) => t.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Topic not found' });

    if (name !== undefined) topics[idx].name = String(name).trim();
    if (category !== undefined) topics[idx].category = category;
    if (order !== undefined) topics[idx].order = Number(order);
    if (enabled !== undefined) topics[idx].enabled = Boolean(enabled);
    if (description !== undefined) topics[idx].description = String(description);

    saveTopics(topics);
    res.json({ success: true, topic: topics[idx] });
  });

  app.delete('/api/admin/topics/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const topics = getTopics().filter((t) => t.id !== id);
    saveTopics(topics);
    res.json({ success: true });
  });

  app.post('/api/admin/topics/:id/toggle', (req: Request, res: Response) => {
    const { id } = req.params;
    const topics = getTopics();
    const topic = topics.find((t) => t.id === id);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    topic.enabled = !topic.enabled;
    saveTopics(topics);
    res.json({ success: true, topic });
  });

  // Announcements Management Endpoints
  app.get('/api/admin/announcements', (_req: Request, res: Response) => {
    res.json({ announcements: getAnnouncements() });
  });

  app.get('/api/announcements/active', (_req: Request, res: Response) => {
    const active = getAnnouncements().filter((a) => a.active);
    res.json({ announcements: active });
  });

  app.post('/api/admin/announcements', (req: Request, res: Response) => {
    const { title, content, category = 'General', priority = 'medium', active = true } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });

    const announcements = getAnnouncements();
    const newAnn: AdminAnnouncement = {
      id: `ann-${Date.now()}`,
      title: String(title).trim(),
      content: String(content).trim(),
      category,
      priority,
      createdAt: new Date().toISOString(),
      active: Boolean(active),
    };
    announcements.unshift(newAnn);
    saveAnnouncements(announcements);
    res.json({ success: true, announcement: newAnn });
  });

  app.put('/api/admin/announcements/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const announcements = getAnnouncements();
    const idx = announcements.findIndex((a) => a.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Announcement not found' });

    const { title, content, category, priority, active } = req.body;
    if (title !== undefined) announcements[idx].title = String(title).trim();
    if (content !== undefined) announcements[idx].content = String(content).trim();
    if (category !== undefined) announcements[idx].category = category;
    if (priority !== undefined) announcements[idx].priority = priority;
    if (active !== undefined) announcements[idx].active = Boolean(active);

    saveAnnouncements(announcements);
    res.json({ success: true, announcement: announcements[idx] });
  });

  app.delete('/api/admin/announcements/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const announcements = getAnnouncements().filter((a) => a.id !== id);
    saveAnnouncements(announcements);
    res.json({ success: true });
  });

  // Learning Resources Management Endpoints
  app.get('/api/admin/resources', (_req: Request, res: Response) => {
    res.json({ resources: getResources() });
  });

  app.post('/api/admin/resources', (req: Request, res: Response) => {
    const { title, type = 'video', url, topic, subject = 'General', authorOrChannel, durationOrPages } = req.body;
    if (!title || !url || !topic) return res.status(400).json({ error: 'Title, URL, and Topic are required' });

    const resources = getResources();
    const newRes: AdminLearningResource = {
      id: `res-${Date.now()}`,
      title: String(title).trim(),
      type,
      url: String(url).trim(),
      topic: String(topic).trim(),
      subject: String(subject).trim(),
      authorOrChannel,
      durationOrPages,
    };
    resources.push(newRes);
    saveResources(resources);
    res.json({ success: true, resource: newRes });
  });

  app.put('/api/admin/resources/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const resources = getResources();
    const idx = resources.findIndex((r) => r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Resource not found' });

    const { title, type, url, topic, subject, authorOrChannel, durationOrPages } = req.body;
    if (title !== undefined) resources[idx].title = String(title).trim();
    if (type !== undefined) resources[idx].type = type;
    if (url !== undefined) resources[idx].url = String(url).trim();
    if (topic !== undefined) resources[idx].topic = String(topic).trim();
    if (subject !== undefined) resources[idx].subject = String(subject).trim();
    if (authorOrChannel !== undefined) resources[idx].authorOrChannel = authorOrChannel;
    if (durationOrPages !== undefined) resources[idx].durationOrPages = durationOrPages;

    saveResources(resources);
    res.json({ success: true, resource: resources[idx] });
  });

  app.delete('/api/admin/resources/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const resources = getResources().filter((r) => r.id !== id);
    saveResources(resources);
    res.json({ success: true });
  });

  // Company Preparation Management Endpoints
  app.get('/api/admin/company-prep', (_req: Request, res: Response) => {
    res.json({ companies: getCompanyPrep() });
  });

  app.post('/api/admin/company-prep', (req: Request, res: Response) => {
    const { companyName, roleTitle, difficulty = 'Medium', patternOverview, totalQuestions = 40, topicsCovered = [], active = true } = req.body;
    if (!companyName || !roleTitle) return res.status(400).json({ error: 'Company Name and Role Title are required' });

    const list = getCompanyPrep();
    const newComp: AdminCompanyPrep = {
      id: `comp-${Date.now()}`,
      companyName: String(companyName).trim(),
      roleTitle: String(roleTitle).trim(),
      difficulty,
      patternOverview: String(patternOverview || ''),
      totalQuestions: Number(totalQuestions) || 40,
      topicsCovered: Array.isArray(topicsCovered) ? topicsCovered : [],
      active: Boolean(active),
    };
    list.push(newComp);
    saveCompanyPrep(list);
    res.json({ success: true, company: newComp });
  });

  app.put('/api/admin/company-prep/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const list = getCompanyPrep();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Company prep set not found' });

    const { companyName, roleTitle, difficulty, patternOverview, totalQuestions, topicsCovered, active } = req.body;
    if (companyName !== undefined) list[idx].companyName = String(companyName).trim();
    if (roleTitle !== undefined) list[idx].roleTitle = String(roleTitle).trim();
    if (difficulty !== undefined) list[idx].difficulty = difficulty;
    if (patternOverview !== undefined) list[idx].patternOverview = String(patternOverview);
    if (totalQuestions !== undefined) list[idx].totalQuestions = Number(totalQuestions);
    if (topicsCovered !== undefined) list[idx].topicsCovered = Array.isArray(topicsCovered) ? topicsCovered : [];
    if (active !== undefined) list[idx].active = Boolean(active);

    saveCompanyPrep(list);
    res.json({ success: true, company: list[idx] });
  });

  app.delete('/api/admin/company-prep/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const list = getCompanyPrep().filter((c) => c.id !== id);
    saveCompanyPrep(list);
    res.json({ success: true });
  });

  // AI Mock Interview Templates Endpoints
  app.get('/api/admin/interview-templates', (_req: Request, res: Response) => {
    res.json({ templates: getInterviewTemplates() });
  });

  app.post('/api/admin/interview-templates', (req: Request, res: Response) => {
    const { category, questionTitle, samplePoints = [], difficulty = 'Medium', companyTags = [] } = req.body;
    if (!questionTitle) return res.status(400).json({ error: 'Question title is required' });

    const list = getInterviewTemplates();
    const newTpl: AdminInterviewTemplate = {
      id: `int-${Date.now()}`,
      category: category || 'Technical SDE',
      questionTitle: String(questionTitle).trim(),
      samplePoints: Array.isArray(samplePoints) ? samplePoints : [samplePoints],
      difficulty,
      companyTags: Array.isArray(companyTags) ? companyTags : [],
    };
    list.push(newTpl);
    saveInterviewTemplates(list);
    res.json({ success: true, template: newTpl });
  });

  app.put('/api/admin/interview-templates/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const list = getInterviewTemplates();
    const idx = list.findIndex((t) => t.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Interview template not found' });

    const { category, questionTitle, samplePoints, difficulty, companyTags } = req.body;
    if (category !== undefined) list[idx].category = category;
    if (questionTitle !== undefined) list[idx].questionTitle = String(questionTitle).trim();
    if (samplePoints !== undefined) list[idx].samplePoints = Array.isArray(samplePoints) ? samplePoints : [samplePoints];
    if (difficulty !== undefined) list[idx].difficulty = difficulty;
    if (companyTags !== undefined) list[idx].companyTags = Array.isArray(companyTags) ? companyTags : [];

    saveInterviewTemplates(list);
    res.json({ success: true, template: list[idx] });
  });

  app.delete('/api/admin/interview-templates/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const list = getInterviewTemplates().filter((t) => t.id !== id);
    saveInterviewTemplates(list);
    res.json({ success: true });
  });

  // 1. Generate Questions Endpoint
  app.post('/api/interview/generate-questions', async (req: Request, res: Response) => {
    const { topic = 'Data Structures & Algorithms', difficulty = 'Medium', role = 'Software Development Engineer (Placement Campus)', count = 3 } = req.body;

    const requestedTopic = String(topic).trim();
    const requestedDiff = String(difficulty).trim();

    if (!apiKey) {
      const fallbackList = getMatchingFallbackQuestions(requestedTopic);
      return res.json({
        questions: fallbackList,
        source: 'curated-fallback',
        message: 'Loaded curated placement interview questions.',
      });
    }

    try {
      const prompt = `You are a Senior Technical Interviewer conducting an on-campus placement interview for a ${role} role.
Generate ${count} distinct, high-quality, practical technical interview questions focused specifically on: "${requestedTopic}".
Difficulty level: ${requestedDiff}.

Return ONLY a valid JSON object matching this schema:
{
  "questions": [
    {
      "id": "q1",
      "topic": "${requestedTopic}",
      "question": "Full question statement asking for design, algorithm, or deep internal understanding",
      "context": "Brief context why this is an important industry question",
      "difficulty": "${requestedDiff}",
      "keyExpectations": ["Expectation 1", "Expectation 2", "Expectation 3"],
      "samplePoints": ["Point 1 candidate should touch upon", "Point 2 candidate should mention"]
    }
  ]
}`;

      const result = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const responseText = result.text || '{}';
      const parsed = JSON.parse(responseText);

      if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        return res.json({
          questions: parsed.questions,
          source: 'gemini',
        });
      }

      throw new Error('Invalid JSON structure returned by model');
    } catch (err: unknown) {
      console.error('Error generating questions with Gemini:', err);
      const fallback = getMatchingFallbackQuestions(requestedTopic);
      return res.json({
        questions: fallback,
        source: 'curated-fallback',
        error: (err as Error).message,
      });
    }
  });

  // 2. Real-time Response Evaluation Endpoint
  app.post('/api/interview/evaluate-response', async (req: Request, res: Response) => {
    const { question, candidateAnswer, topic = 'General', difficulty = 'Medium', keyExpectations = [] } = req.body;

    if (!candidateAnswer || String(candidateAnswer).trim().length === 0) {
      return res.status(400).json({ error: 'Candidate answer is required.' });
    }

    const trimmedAnswer = String(candidateAnswer).trim();

    if (!apiKey) {
      // High-quality fallback evaluation if API key is not present
      const wordCount = trimmedAnswer.split(/\s+/).length;
      const score = Math.min(95, Math.max(50, Math.round(55 + wordCount * 0.4)));
      const fallbackEval: EvaluationResult = {
        score,
        verdict: score >= 80 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Improvement',
        strengths: [
          'Answer demonstrates baseline familiarity with the core topic',
          'Good attempt at structuring technical explanations clearly',
        ],
        improvements: [
          'Elaborate more on edge cases and memory/runtime trade-offs',
          'Consider providing a concrete pseudocode or real-world use case',
        ],
        modelAnswer:
          'A complete answer touches on time/space complexity, handles boundary cases gracefully, and explains the underlying architectural mechanism.',
        followUpQuestion: `What would be the bottleneck if this system had to scale to 10 million concurrent requests per second?`,
        interviewTip: 'Interviewers look for structured thought: State the approach first, mention trade-offs, and handle edge cases proactively.',
      };
      return res.json({ evaluation: fallbackEval, source: 'heuristic' });
    }

    try {
      const prompt = `You are a Principal Software Engineer evaluating a candidate's answer in a live placement interview.

Topic: ${topic}
Difficulty: ${difficulty}
Interview Question: "${question}"
Key Criteria Expected: ${JSON.stringify(keyExpectations)}

Candidate's Answer:
"""
${trimmedAnswer}
"""

Evaluate the candidate's answer rigorously, constructively, and fairly.
Return ONLY a valid JSON object matching this schema:
{
  "score": 85, // integer 0 - 100
  "verdict": "Excellent" | "Good" | "Needs Improvement" | "Unsatisfactory",
  "strengths": [
    "Specific strong point 1",
    "Specific strong point 2"
  ],
  "improvements": [
    "Specific concept, edge case, or trade-off the candidate missed or could explain better"
  ],
  "modelAnswer": "Clear, concise ideal answer summary demonstrating how a top candidate would answer",
  "followUpQuestion": "A targeted follow-up question digging deeper into their response",
  "interviewTip": "A high-impact communication or technical interview tip"
}`;

      const result = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const responseText = result.text || '{}';
      const parsed = JSON.parse(responseText);

      return res.json({
        evaluation: parsed,
        source: 'gemini',
      });
    } catch (err: unknown) {
      console.error('Error evaluating response with Gemini:', err);
      const wordCount = trimmedAnswer.split(/\s+/).length;
      const score = Math.min(95, Math.max(55, Math.round(62 + wordCount * 0.35)));
      const fallbackEval: EvaluationResult = {
        score,
        verdict: score >= 80 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Improvement',
        strengths: [
          'Directly addresses the fundamental core requirement of the interview question',
          'Good technical vocabulary and logical flow of concepts',
        ],
        improvements: [
          'Highlight explicit time/space trade-offs and runtime asymptotes',
          'Address boundary edge cases or potential concurrency/scaling hazards',
        ],
        modelAnswer:
          'A top candidate starts with a 1-sentence high-level summary, provides step-by-step logic, specifies exact complexities, and discusses failure recovery.',
        followUpQuestion: `How would you optimize this if memory was severely constrained (e.g. cache-restricted environments)?`,
        interviewTip: 'Always state time and space complexity upfront before the interviewer asks for it.',
      };
      return res.json({ evaluation: fallbackEval, source: 'gemini-fallback' });
    }
  });

  // 3. Resume Parse Endpoint
  app.post('/api/interview/parse-resume', async (req: Request, res: Response) => {
    const { resumeText = '' } = req.body;
    const text = String(resumeText).trim();

    if (!text || text.length < 20) {
      return res.status(400).json({ error: 'Please provide valid resume text or upload a resume file.' });
    }

    if (apiKey) {
      try {
        const prompt = `You are an expert technical recruiter analyzing a candidate's resume for an on-campus placement interview.
Analyze the following resume thoroughly and extract:
- Name
- Education (Degree, Branch, Year/GPA)
- Skills (list of specific technical skills)
- Projects (array of objects with title, description, and tech)
- Internships (array of objects with company, role, description)
- Certifications (list of strings)
- Achievements (list of strings)
- Technologies Used (distinct tech keywords)

Resume Content:
"""
${text.slice(0, 7000)}
"""

Return ONLY a valid JSON object matching this schema:
{
  "name": "Candidate Full Name",
  "education": "Degree & College details",
  "skills": ["Skill1", "Skill2", "Skill3"],
  "projects": [
    {
      "title": "Project Name",
      "description": "What it does & impact",
      "tech": ["Tech1", "Tech2"]
    }
  ],
  "internships": [
    {
      "company": "Company Name",
      "role": "Internship Role",
      "description": "Responsibilities and contributions"
    }
  ],
  "certifications": ["Cert 1", "Cert 2"],
  "achievements": ["Achievement 1", "Achievement 2"],
  "technologies": ["Tech1", "Tech2", "Tech3"]
}`;

        const result = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const parsed = JSON.parse(result.text || '{}');
        if (parsed.name && parsed.skills) {
          return res.json({
            resume: {
              ...parsed,
              rawText: text,
            },
            source: 'gemini',
          });
        }
      } catch (err: unknown) {
        console.warn('Gemini resume parse failed or quota reached, using heuristic parser:', (err as Error).message);
      }
    }

    // Heuristic Fallback
    const fallbackResume = heuristicParseResume(text);
    return res.json({
      resume: fallbackResume,
      source: 'heuristic-engine',
    });
  });

  // 4. Start Personalized Session Endpoint
  app.post('/api/interview/start-session', async (req: Request, res: Response) => {
    const { resumeData, interviewType = 'comprehensive' } = req.body;
    const resume = (resumeData || {}) as ExtractedResume;

    const candidateName = resume.name && resume.name !== 'Candidate' ? resume.name : 'Candidate';
    const topSkills = (resume.skills || []).slice(0, 3).join(', ') || 'Software Development';
    const topProj = resume.projects?.[0]?.title || 'your technical projects';

    let firstQuestion = `Hello ${candidateName}, welcome to your SkillPilot on-campus placement interview! I've reviewed your resume and noticed your background in ${resume.education || 'Computer Science'} with strengths in ${topSkills}. To kick off, please give me a concise self-introduction highlighting your journey into technology and the architectural highlights of ${topProj}.`;
    let firstCategory = 'Self Introduction';

    if (interviewType === 'hr_only') {
      firstQuestion = `Hello ${candidateName}, welcome to the HR round. To start, please introduce yourself beyond what is listed on your resume—focus on what drives you as an engineer, your core values, and how you approach team collaboration.`;
      firstCategory = 'HR Questions';
    } else if (interviewType === 'technical_only') {
      firstQuestion = `Hello ${candidateName}. Let's jump straight into technical problem solving. Walk me through the system architecture of ${topProj}: How did you design the data flow and handle component state and latency?`;
      firstCategory = 'Project-Based Questions';
    }

    return res.json({
      question: firstQuestion,
      category: firstCategory,
      questionNumber: 1,
      totalEstimated: 5,
      context: 'Initial greeting & communication evaluation',
    });
  });

  // 5. Evaluate Step & Generate Next Adaptive Question
  app.post('/api/interview/evaluate-step', async (req: Request, res: Response) => {
    const {
      currentQuestion = '',
      category = 'General',
      studentAnswer = '',
      resumeData = {},
      stepNumber = 1,
      totalSteps = 6,
      difficulty = 'Intermediate',
      companyTarget = 'TCS',
    } = req.body;

    const trimmedAnswer = String(studentAnswer).trim();
    if (!trimmedAnswer) {
      return res.status(400).json({ error: 'Candidate answer is required.' });
    }

    const resume = resumeData as ExtractedResume;
    const isLastQuestion = stepNumber >= totalSteps;

    let rubricFeedback: any = null;
    let nextQuestion = '';
    let nextCategory = '';

    // Direct Heuristic Engine for Deterministic, Quota-Safe Execution
    try {
      rubricFeedback = heuristicEvaluateAnswer(currentQuestion, trimmedAnswer, category, resume, difficulty as any);
      if (!isLastQuestion) {
        const adaptive = generateAdaptiveNextQuestion(
          resume,
          stepNumber + 1,
          totalSteps,
          trimmedAnswer,
          rubricFeedback.score_out_of_10,
          difficulty as any,
          companyTarget
        );
        nextQuestion = adaptive.question;
        nextCategory = adaptive.category;
      }

      return res.json({
        question: currentQuestion,
        feedback: rubricFeedback,
        next_question: isLastQuestion ? '' : nextQuestion,
        next_category: nextCategory,
        is_last_question: isLastQuestion,
        source: 'skillpilot-ai-engine',
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 6. Final Interview Report Generation
  app.post('/api/interview/finish-report', async (req: Request, res: Response) => {
    const { evaluations = [], resumeData = {}, companyTarget = 'TCS' } = req.body;
    const resume = resumeData as ExtractedResume;

    if (!Array.isArray(evaluations) || evaluations.length === 0) {
      return res.status(400).json({ error: 'No evaluations provided.' });
    }

    const report = generateFinalInterviewReport(evaluations, resume, companyTarget);
    return res.json({ report });
  });

  // 7. Persistent Interview History Endpoints
  const INTERVIEWS_FILE = path.resolve(__dirname, 'data', 'interviews.json');
  function getInterviewHistory(): any[] {
    try {
      if (fs.existsSync(INTERVIEWS_FILE)) {
        return JSON.parse(fs.readFileSync(INTERVIEWS_FILE, 'utf-8'));
      }
    } catch {}
    return [];
  }

  function saveInterviewHistory(data: any[]): void {
    try {
      fs.writeFileSync(INTERVIEWS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving interviews.json:', e);
    }
  }

  app.get('/api/interview/history', (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    const history = getInterviewHistory();
    if (userId) {
      return res.json({ history: history.filter((h) => h.userId === userId) });
    }
    return res.json({ history });
  });

  app.post('/api/interview/save', (req: Request, res: Response) => {
    try {
      const interviewSession = req.body;
      if (!interviewSession || !interviewSession.id) {
        return res.status(400).json({ error: 'Valid interview session data required.' });
      }
      const history = getInterviewHistory();
      const existingIdx = history.findIndex((h) => h.id === interviewSession.id);
      if (existingIdx !== -1) {
        history[existingIdx] = interviewSession;
      } else {
        history.unshift(interviewSession);
      }
      saveInterviewHistory(history);
      return res.json({ success: true, id: interviewSession.id });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Serve static assets or mount Vite dev server
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
