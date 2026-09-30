export type Role = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  avatar?: string;
  joinedDate?: string;
  status?: 'active' | 'disabled';
  department?: string;
  batch?: string;
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface DSAProblem {
  id: string;
  topic: string;
  problem_name: string;
  leetcode_link: string;
  difficulty: Difficulty;
  solvedByUsers?: string[]; // IDs of users who solved it
  track?: string;
  pattern?: string;
  companies?: string[];
  sheet?: string;
}

export type AptitudeCategory = 'Quantitative Aptitude' | 'Logical Reasoning' | 'Data Interpretation' | 'Verbal Ability';

export interface AptitudeOptionSet {
  A: string;
  B: string;
  C: string;
  D: string;
}

export interface AptitudeQuestion {
  id: string;
  category: AptitudeCategory;
  subcategory: string; // e.g., Numbers, Arithmetic, Time Based, Advanced, Series, Puzzles, Logic, Visual, English, DI Graphs
  topic: string; // e.g., Percentage, LCM & HCF, Probability, Coding-Decoding, Bar Graph, Pie Chart, etc.
  question: string;
  options: AptitudeOptionSet;
  correct_option: 'A' | 'B' | 'C' | 'D';
  answer: string;
  explanation: string;
  difficulty?: Difficulty;
  solvedByUsers?: string[];
  video_title?: string;
  video_url?: string;
  pattern?: string;
  companies?: string[];
  lastAttemptedDate?: string;
}

export interface CompanyPatternInfo {
  company: string;
  tagline: string;
  focusPatterns: string[];
  hiringTier: string;
  examStructure: string;
  prepTip: string;
  benchmarkScore: number;
}

export interface PatternTrackingStats {
  patternName: string;
  topic: string;
  category: string;
  totalQuestions: number;
  solvedQuestions: number;
  accuracyPercentage: number;
  timeSpentMinutes: number;
  lastAttemptedDate: string;
}

export type MCQSubject = 'Java' | 'SQL' | 'DSA' | 'OS' | 'Networking' | 'Aptitude';

export interface MCQQuestion {
  id: string;
  subject: MCQSubject;
  topic: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  video_link: string;
  difficulty?: Difficulty;
  companies?: string[];
}

export interface VideoRecommendation {
  id: string;
  topic: string;
  title: string;
  youtube_url: string;
  subject: string;
  duration: string;
  channel: string;
}

export interface UserTestAnswer {
  question_id: string;
  selected_answer: 'A' | 'B' | 'C' | 'D';
  is_correct: boolean;
  topic: string;
}

export interface TestResult {
  id: string;
  student_id: string;
  student_name: string;
  subject: string;
  score: number;
  total_questions: number;
  percentage: number;
  date: string;
  answers: UserTestAnswer[];
  identified_weak_topics: string[];
}

export interface StudentProgress {
  dsa_solved_count: number;
  aptitude_solved_count: number;
  tests_attempted: number;
  average_score: number;
  quant_score: number;
  logical_score: number;
  verbal_score: number;
  topic_performance: Record<string, number>;
  weak_topics: string[];
  weak_topics_by_category: {
    quantitative: string[];
    logical: string[];
    verbal: string[];
  };
}

export interface DailyActivityRecord {
  date: string; // YYYY-MM-DD
  count: number;
  activities: string[];
}

export interface UserStreakRecord {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastVisitDate: string; // YYYY-MM-DD
}

export interface UserStreak {
  current_streak: number;
  longest_streak: number;
  total_active_days: number;
  last_active_date: string;
  freeze_count: number;
  is_active_today: boolean;
  history: Record<string, DailyActivityRecord>;
}

export interface MockInterviewQuestion {
  id: string;
  topic: string;
  question: string;
  context: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  keyExpectations: string[];
  samplePoints?: string[];
  category?: string;
  questionNumber?: number;
}

export interface MockInterviewEvaluation {
  score: number;
  verdict: 'Excellent' | 'Good' | 'Needs Improvement' | 'Unsatisfactory';
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
  followUpQuestion?: string;
  interviewTip?: string;
}

export interface MockInterviewResultItem {
  question: MockInterviewQuestion;
  userAnswer: string;
  evaluation: MockInterviewEvaluation;
  timeSpentSeconds: number;
}

export interface ExtractedResumeProject {
  title: string;
  description: string;
  tech: string[];
}

export interface ExtractedResumeInternship {
  company: string;
  role: string;
  description: string;
}

export interface ExtractedResume {
  name: string;
  education: string;
  skills: string[];
  projects: ExtractedResumeProject[];
  internships: ExtractedResumeInternship[];
  certifications: string[];
  achievements: string[];
  technologies: string[];
  rawText?: string;
}

export interface InterviewRubricFeedback {
  score_out_of_10: number; // Score out of 10
  technical_score: number; // /10
  communication_score: number; // /10
  confidence_score: number; // /10
  problem_solving_score: number; // /10
  total_score: number; // /40
  strengths: string[];
  improvements: string[];
  ideal_answer: string;
}

export interface InterviewStepResponse {
  question: string;
  feedback: InterviewRubricFeedback;
  next_question: string;
  next_category?: string;
  is_last_question?: boolean;
}

export interface FinalInterviewReport {
  overall_score: number;
  technical_score: number;
  communication_score: number;
  confidence_score: number;
  problem_solving_score: number;
  interview_readiness_percentage: number;
  readiness_level: 'Beginner' | 'Intermediate' | 'Placement Ready' | 'Industry Ready';
  strengths: string[];
  weaknesses: string[];
  topics_to_improve: string[];
  recommended_resources: {
    title: string;
    type: 'Video' | 'Documentation' | 'Practice Sheet' | 'Guide';
    url?: string;
    description: string;
  }[];
}

export interface InterviewHistoryItem {
  id: string;
  userId: string;
  candidateName: string;
  date: string;
  companyTarget: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  overallScore: number;
  readinessPercentage: number;
  questionsCount: number;
  extractedResume: ExtractedResume;
  report: FinalInterviewReport;
  turns: {
    questionNumber: number;
    category: string;
    question: string;
    studentAnswer: string;
    scoreOutOf10: number;
    strengths: string[];
    improvements: string[];
    betterSampleAnswer: string;
  }[];
}

export interface TopicItem {
  id: string;
  name: string;
  category: 'Aptitude' | 'DSA' | 'SQL' | 'Core CS';
  order: number;
  enabled: boolean;
  questionCount?: number;
  description?: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category: 'Test' | 'DSA' | 'Company' | 'General';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  active: boolean;
}

export interface LearningResourceItem {
  id: string;
  title: string;
  type: 'video' | 'article' | 'pdf';
  url: string;
  topic: string;
  subject: string;
  authorOrChannel?: string;
  durationOrPages?: string;
}

export interface CompanyPrepSet {
  id: string;
  companyName: string;
  roleTitle: string;
  difficulty: Difficulty;
  patternOverview: string;
  totalQuestions: number;
  topicsCovered: string[];
  active: boolean;
}

export interface InterviewTemplateItem {
  id: string;
  category: 'Technical SDE' | 'HR Behavioral' | 'System Design' | 'Core CS' | 'Resume-based';
  questionTitle: string;
  samplePoints: string[];
  difficulty: Difficulty;
  companyTags: string[];
}

