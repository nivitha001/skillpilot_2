import fs from 'fs';
import path from 'path';

export interface AdminTopic {
  id: string;
  name: string;
  category: 'Aptitude' | 'DSA' | 'SQL' | 'Core CS';
  order: number;
  enabled: boolean;
  description?: string;
}

export interface AdminAnnouncement {
  id: string;
  title: string;
  content: string;
  category: 'Test' | 'DSA' | 'Company' | 'General';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  active: boolean;
}

export interface AdminLearningResource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'pdf';
  url: string;
  topic: string;
  subject: string;
  authorOrChannel?: string;
  durationOrPages?: string;
}

export interface AdminCompanyPrep {
  id: string;
  companyName: string;
  roleTitle: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  patternOverview: string;
  totalQuestions: number;
  topicsCovered: string[];
  active: boolean;
}

export interface AdminInterviewTemplate {
  id: string;
  category: 'Technical SDE' | 'HR Behavioral' | 'System Design' | 'Core CS' | 'Resume-based';
  questionTitle: string;
  samplePoints: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  companyTags: string[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const TOPICS_FILE = path.join(DATA_DIR, 'topics.json');
const ANNOUNCEMENTS_FILE = path.join(DATA_DIR, 'announcements.json');
const RESOURCES_FILE = path.join(DATA_DIR, 'resources.json');
const COMPANY_PREP_FILE = path.join(DATA_DIR, 'company_prep.json');
const INTERVIEW_TEMPLATES_FILE = path.join(DATA_DIR, 'interview_templates.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ----------------- TOPICS -----------------
const initialTopics: AdminTopic[] = [
  { id: 'top-1', name: 'Quantitative Aptitude', category: 'Aptitude', order: 1, enabled: true, description: 'Arithmetic, percentages, profit & loss, algebra' },
  { id: 'top-2', name: 'Logical Reasoning', category: 'Aptitude', order: 2, enabled: true, description: 'Coding-decoding, blood relations, syllogisms, series' },
  { id: 'top-3', name: 'Verbal Ability', category: 'Aptitude', order: 3, enabled: true, description: 'Reading comprehension, grammar, vocabulary, sentence correction' },
  { id: 'top-4', name: 'Arrays & Two Pointers', category: 'DSA', order: 4, enabled: true, description: 'Sliding window, sub-array sums, cyclic sorting' },
  { id: 'top-5', name: 'Linked Lists & Pointers', category: 'DSA', order: 5, enabled: true, description: 'Fast & slow pointers, reversal, cycle detection' },
  { id: 'top-6', name: 'SQL Joins & Grouping', category: 'SQL', order: 6, enabled: true, description: 'INNER, LEFT, RIGHT, FULL OUTER joins, HAVING, aggregations' },
  { id: 'top-7', name: 'Operating Systems', category: 'Core CS', order: 7, enabled: true, description: 'Process synchronization, paging, deadlocks, scheduling' },
  { id: 'top-8', name: 'Computer Networks', category: 'Core CS', order: 8, enabled: true, description: 'OSI model, TCP/IP, DNS, HTTP/HTTPS, routing' },
];

export function getTopics(): AdminTopic[] {
  ensureDataDir();
  if (!fs.existsSync(TOPICS_FILE)) {
    fs.writeFileSync(TOPICS_FILE, JSON.stringify(initialTopics, null, 2), 'utf8');
    return initialTopics;
  }
  try {
    return JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf8'));
  } catch {
    return initialTopics;
  }
}

export function saveTopics(topics: AdminTopic[]): void {
  ensureDataDir();
  fs.writeFileSync(TOPICS_FILE, JSON.stringify(topics, null, 2), 'utf8');
}

// ----------------- ANNOUNCEMENTS -----------------
const initialAnnouncements: AdminAnnouncement[] = [
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

export function getAnnouncements(): AdminAnnouncement[] {
  ensureDataDir();
  if (!fs.existsSync(ANNOUNCEMENTS_FILE)) {
    fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(initialAnnouncements, null, 2), 'utf8');
    return initialAnnouncements;
  }
  try {
    return JSON.parse(fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf8'));
  } catch {
    return initialAnnouncements;
  }
}

export function saveAnnouncements(announcements: AdminAnnouncement[]): void {
  ensureDataDir();
  fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(announcements, null, 2), 'utf8');
}

// ----------------- LEARNING RESOURCES -----------------
const initialResources: AdminLearningResource[] = [
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

export function getResources(): AdminLearningResource[] {
  ensureDataDir();
  if (!fs.existsSync(RESOURCES_FILE)) {
    fs.writeFileSync(RESOURCES_FILE, JSON.stringify(initialResources, null, 2), 'utf8');
    return initialResources;
  }
  try {
    return JSON.parse(fs.readFileSync(RESOURCES_FILE, 'utf8'));
  } catch {
    return initialResources;
  }
}

export function saveResources(resources: AdminLearningResource[]): void {
  ensureDataDir();
  fs.writeFileSync(RESOURCES_FILE, JSON.stringify(resources, null, 2), 'utf8');
}

// ----------------- COMPANY PREPARATION -----------------
const initialCompanyPrep: AdminCompanyPrep[] = [
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

export function getCompanyPrep(): AdminCompanyPrep[] {
  ensureDataDir();
  if (!fs.existsSync(COMPANY_PREP_FILE)) {
    fs.writeFileSync(COMPANY_PREP_FILE, JSON.stringify(initialCompanyPrep, null, 2), 'utf8');
    return initialCompanyPrep;
  }
  try {
    return JSON.parse(fs.readFileSync(COMPANY_PREP_FILE, 'utf8'));
  } catch {
    return initialCompanyPrep;
  }
}

export function saveCompanyPrep(data: AdminCompanyPrep[]): void {
  ensureDataDir();
  fs.writeFileSync(COMPANY_PREP_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ----------------- INTERVIEW TEMPLATES -----------------
const initialInterviewTemplates: AdminInterviewTemplate[] = [
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

export function getInterviewTemplates(): AdminInterviewTemplate[] {
  ensureDataDir();
  if (!fs.existsSync(INTERVIEW_TEMPLATES_FILE)) {
    fs.writeFileSync(INTERVIEW_TEMPLATES_FILE, JSON.stringify(initialInterviewTemplates, null, 2), 'utf8');
    return initialInterviewTemplates;
  }
  try {
    return JSON.parse(fs.readFileSync(INTERVIEW_TEMPLATES_FILE, 'utf8'));
  } catch {
    return initialInterviewTemplates;
  }
}

export function saveInterviewTemplates(templates: AdminInterviewTemplate[]): void {
  ensureDataDir();
  fs.writeFileSync(INTERVIEW_TEMPLATES_FILE, JSON.stringify(templates, null, 2), 'utf8');
}
