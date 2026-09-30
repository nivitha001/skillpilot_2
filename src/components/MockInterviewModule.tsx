import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  ExtractedResume,
  InterviewRubricFeedback,
  FinalInterviewReport,
  InterviewHistoryItem,
} from '../types';
import {
  heuristicParseResume,
  heuristicEvaluateAnswer,
  generateAdaptiveNextQuestion,
  generateFinalInterviewReport,
} from '../server/interviewEngine';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  TrendingUp,
  User,
  Briefcase,
  GraduationCap,
  Layers,
  ChevronRight,
  ShieldCheck,
  Send,
  Loader2,
  HelpCircle,
  ExternalLink,
  Code,
  Database,
  Building,
  Check,
  Copy,
  Printer,
  History,
  ThumbsUp,
  ThumbsDown,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const COMPANY_PRESETS = [
  { name: 'TCS', role: 'Ninja / Digital Trainee', round: 'Technical + HR Combined' },
  { name: 'HCL', role: 'Graduate Engineer Trainee', round: 'Core CS + Coding Evaluation' },
  { name: 'Cognizant', role: 'GenC / GenC Elevate', round: 'Full-Stack & Analytical Round' },
  { name: 'Infosys', role: 'Systems Engineer / Specialist', round: 'Technical Competency Round' },
  { name: 'Accenture', role: 'Associate Software Engineer', round: 'Technical & Cognitive Round' },
  { name: 'Capgemini', role: 'Analyst Trainee', round: 'Technical & Behavioral Round' },
];

const SAMPLE_RESUMES: { title: string; subtitle: string; icon: any; text: string }[] = [
  {
    title: 'Full-Stack Developer (React & Node.js)',
    subtitle: 'MERN stack, REST APIs, State Management, Git',
    icon: Code,
    text: `Nivitha S
Education: B.Tech in Computer Science and Engineering, 2022-2026 (CGPA: 8.8)
Skills: React, JavaScript, TypeScript, Node.js, Express, Redux Toolkit, Tailwind CSS, SQL, MongoDB, Git, Docker, REST APIs
Projects:
1. Campus Placement & Mock Assessment Portal: Built a full-stack assessment platform in React and Express with instant evaluation, state management, and real-time analytics.
2. E-Commerce Order Orchestration Platform: Implemented responsive storefront with JWT authentication, cart state synchronization, payment gateway integration, and MongoDB database schema design.
Internships:
- Web Development Intern at TechSphere Solutions (3 Months): Developed reusable React UI components, integrated backend REST APIs, and improved page load performance by 30%.
Certifications:
- Full-Stack Web Development Specialization
- HackerRank 5-Star in Problem Solving & JavaScript
Achievements:
- Ranked 2nd in Inter-College Smart India Hackathon
- Solved 200+ LeetCode DSA problems across Arrays, Trees, and Dynamic Programming`,
  },
  {
    title: 'Java Backend & Cloud Engineer',
    subtitle: 'Java 17, Spring Boot, MySQL, AWS, Microservices',
    icon: Database,
    text: `Arun Kumar
Education: B.E. in Information Technology, Tier-1 College (CGPA: 8.9)
Skills: Java, Spring Boot, Hibernate, MySQL, PostgreSQL, AWS (EC2, S3, RDS, IAM, VPC), Docker, Microservices, Kafka, JUnit
Projects:
1. Microservices-Based Banking & Ledger System: Built Spring Boot microservices with Eureka service discovery, distributed tracing, and transactional isolation for ledger reconciliation.
2. Scalable Cloud Storage & Document Ingestion API: Architected AWS S3 presigned URL upload pipeline with metadata indexing in PostgreSQL and Docker container deployment.
Internships:
- Backend Engineering Intern at FinTech Cloud Labs (6 Months): Designed RESTful APIs handling 5,000 requests/sec, tuned SQL query execution plans with composite indexes, and participated in sprint code reviews.
Certifications:
- AWS Certified Cloud Practitioner
- Oracle Certified Professional: Java SE 11 Developer
Achievements:
- Solved 350+ problems on LeetCode (Rating 1850)
- Best Final Year Capstone Project Award for Distributed Architecture`,
  },
  {
    title: 'Data & Python Engineer',
    subtitle: 'Python, SQL, PostgreSQL, AWS, Algorithms, Flask',
    icon: Layers,
    text: `Sneha Rao
Education: B.Tech in Computer Science, 2026 Batch (CGPA: 9.1)
Skills: Python, SQL, PostgreSQL, Pandas, NumPy, Flask, FastAPI, AWS EC2, S3, Docker, Git, Data Structures & Algorithms
Projects:
1. Automated Analytics Pipeline: Engineered an end-to-end data ingestion engine using Python and PostgreSQL with automated schema migration and dashboard reporting.
2. Real-Time Predictive Placement Diagnostic: Developed predictive placement readiness scoring model with Flask REST API and containerized Docker workflow.
Internships:
- Data Engineering Trainee at Insight Analytics (4 Months): Automated weekly database ETL workflows, optimized PostgreSQL joins, and reduced reporting turnaround time by 40%.
Certifications:
- Meta Database Engineer Professional Certificate
- Python for Data Science & Machine Learning
Achievements:
- Published research paper on Algorithmic Optimization in IEEE Student Conference
- Department Academic Gold Medalist for consecutive 3 semesters`,
  },
];

export const MockInterviewModule: React.FC = () => {
  const { currentUser, recordActivity, showToast, setCurrentTab } = useApp();

  // Screen modes: 'upload' | 'interview' | 'evaluation' | 'report' | 'history'
  const [screen, setScreen] = useState<'upload' | 'interview' | 'evaluation' | 'report' | 'history'>('upload');

  // Candidate Settings
  const [companyTarget, setCompanyTarget] = useState<string>('TCS');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [totalQuestions, setTotalQuestions] = useState<number>(6);

  // Resume state
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [extractedResume, setExtractedResume] = useState<ExtractedResume | null>(null);
  const [parsingResume, setParsingResume] = useState(false);

  // Interview state
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentCategory, setCurrentCategory] = useState('Resume-Based Questions');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [evaluating, setEvaluating] = useState(false);

  // Rubric Feedback for the current question
  const [lastFeedback, setLastFeedback] = useState<InterviewRubricFeedback | null>(null);
  const [nextQuestionReady, setNextQuestionReady] = useState('');
  const [nextCategoryReady, setNextCategoryReady] = useState('');
  const [isLastQuestion, setIsLastQuestion] = useState(false);

  // Session turns history
  const [sessionHistory, setSessionHistory] = useState<
    {
      question: string;
      category: string;
      answer: string;
      feedback: InterviewRubricFeedback;
      timeSpent: number;
    }[]
  >([]);

  // Final Report
  const [finalReport, setFinalReport] = useState<FinalInterviewReport | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Persistent Past Interviews History
  const [savedHistory, setSavedHistory] = useState<InterviewHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Audio / Speech State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRecognitionRef = useRef<any>(null);

  // Timer for active interview question
  useEffect(() => {
    let interval: any;
    if (screen === 'interview') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [screen]);

  // Clean speech synthesis & recognition on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Fetch past interview history on load or tab switch
  const fetchPastHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/interview/history?userId=${currentUser?.id || ''}`);
      const data = await res.json();
      if (data.history) {
        setSavedHistory(data.history);
      }
    } catch {
      // Local fallback
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchPastHistory();
  }, [currentUser?.id]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Text-To-Speech (Interviewer voice)
  const toggleSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) {
      showToast('Text-to-speech is not supported on this device', 'info');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Speech-To-Text (Microphone)
  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Microphone speech recognition not supported in this browser. You can type directly!', 'info');
      return;
    }

    if (isListening) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        showToast('Listening... Speak your answer clearly', 'info');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setStudentAnswer((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Handle File Upload (.txt, .pdf, .docx)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (text) {
        setResumeText(text);
        parseResume(text);
      }
    };

    reader.readAsText(file);
  };

  // Select Preset Sample Resume
  const selectSampleResume = (sample: (typeof SAMPLE_RESUMES)[0]) => {
    setFileName(`${sample.title}.txt`);
    setResumeText(sample.text);
    parseResume(sample.text);
  };

  // Resume Parser Trigger
  const parseResume = async (text: string) => {
    setParsingResume(true);
    try {
      const res = await fetch('/api/interview/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: text }),
      });

      const data = await res.json();
      if (data.resume) {
        setExtractedResume(data.resume);
        showToast(
          `Resume parsed! Extracted ${data.resume.skills?.length || 0} skills, ${
            data.resume.projects?.length || 0
          } projects. Ready to begin!`,
          'success'
        );
      } else {
        throw new Error();
      }
    } catch {
      const local = heuristicParseResume(text);
      setExtractedResume(local);
      showToast('Resume parsed with SkillPilot intelligence engine.', 'info');
    } finally {
      setParsingResume(false);
    }
  };

  // Start Live Mock Interview
  const startInterview = () => {
    if (!extractedResume) {
      showToast('Please upload or select a resume first', 'error');
      return;
    }

    const first = generateAdaptiveNextQuestion(
      extractedResume,
      1,
      totalQuestions,
      '',
      7,
      difficulty,
      companyTarget
    );

    setCurrentQuestion(first.question);
    setCurrentCategory(first.category);
    setQuestionNumber(1);
    setStudentAnswer('');
    setElapsedSeconds(0);
    setSessionHistory([]);
    setScreen('interview');
    recordActivity(`Started ${companyTarget} AI Mock Interview`);

    setTimeout(() => {
      toggleSpeech(first.question);
    }, 600);
  };

  // Submit Candidate Answer for 10-Point Rubric Evaluation
  const submitAnswer = async () => {
    if (!studentAnswer.trim() || studentAnswer.trim().length < 8) {
      showToast('Please provide a complete answer before submitting.', 'info');
      return;
    }

    if (isListening && speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    setEvaluating(true);
    try {
      const res = await fetch('/api/interview/evaluate-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentQuestion,
          category: currentCategory,
          studentAnswer,
          resumeData: extractedResume,
          stepNumber: questionNumber,
          totalSteps: totalQuestions,
          difficulty,
          companyTarget,
        }),
      });

      const data = await res.json();
      if (data.feedback) {
        setLastFeedback(data.feedback);
        setNextQuestionReady(data.next_question || '');
        setNextCategoryReady(data.next_category || '');
        setIsLastQuestion(Boolean(data.is_last_question));

        const newHistoryItem = {
          question: currentQuestion,
          category: currentCategory,
          answer: studentAnswer,
          feedback: data.feedback,
          timeSpent: elapsedSeconds,
        };
        const updatedHistory = [...sessionHistory, newHistoryItem];
        setSessionHistory(updatedHistory);

        // Switch to question evaluation screen
        setScreen('evaluation');

        // Confetti for strong answers (score >= 7/10)
        if (data.feedback.score_out_of_10 >= 7) {
          confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
        }
      }
    } catch {
      // Local fallback evaluation
      const localFeedback = heuristicEvaluateAnswer(
        currentQuestion,
        studentAnswer,
        currentCategory,
        extractedResume!,
        difficulty
      );
      setLastFeedback(localFeedback);
      const isLast = questionNumber >= totalQuestions;
      setIsLastQuestion(isLast);
      if (!isLast) {
        const next = generateAdaptiveNextQuestion(
          extractedResume!,
          questionNumber + 1,
          totalQuestions,
          studentAnswer,
          localFeedback.score_out_of_10,
          difficulty,
          companyTarget
        );
        setNextQuestionReady(next.question);
        setNextCategoryReady(next.category);
      }

      const updatedHistory = [
        ...sessionHistory,
        {
          question: currentQuestion,
          category: currentCategory,
          answer: studentAnswer,
          feedback: localFeedback,
          timeSpent: elapsedSeconds,
        },
      ];
      setSessionHistory(updatedHistory);
      setScreen('evaluation');
    } finally {
      setEvaluating(false);
    }
  };

  // Move to Next Question or Final Report
  const handleProceedNext = () => {
    if (isLastQuestion || questionNumber >= totalQuestions || !nextQuestionReady) {
      finishInterviewReport();
    } else {
      setCurrentQuestion(nextQuestionReady);
      setCurrentCategory(nextCategoryReady || 'Technical Questions');
      setQuestionNumber((prev) => prev + 1);
      setStudentAnswer('');
      setElapsedSeconds(0);
      setLastFeedback(null);
      setScreen('interview');

      setTimeout(() => {
        toggleSpeech(nextQuestionReady);
      }, 500);
    }
  };

  // Finish Interview & Compile Final Report with Database Persistence
  const finishInterviewReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await fetch('/api/interview/finish-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluations: sessionHistory,
          resumeData: extractedResume,
          companyTarget,
        }),
      });

      const data = await res.json();
      const compiledReport: FinalInterviewReport =
        data.report || generateFinalInterviewReport(sessionHistory, extractedResume!, companyTarget);

      setFinalReport(compiledReport);
      setScreen('report');
      recordActivity(`Completed ${companyTarget} Interview: Scored ${compiledReport.overall_score}/10`);

      // Save to database
      const interviewSessionRecord: InterviewHistoryItem = {
        id: `int-${Date.now()}`,
        userId: currentUser?.id || 'guest',
        candidateName: extractedResume?.name || currentUser?.name || 'Candidate',
        date: new Date().toISOString(),
        companyTarget,
        difficulty,
        overallScore: compiledReport.overall_score,
        readinessPercentage: compiledReport.interview_readiness_percentage,
        questionsCount: sessionHistory.length,
        extractedResume: extractedResume!,
        report: compiledReport,
        turns: sessionHistory.map((t, idx) => ({
          questionNumber: idx + 1,
          category: t.category,
          question: t.question,
          studentAnswer: t.answer,
          scoreOutOf10: t.feedback.score_out_of_10 || 7.5,
          strengths: t.feedback.strengths,
          improvements: t.feedback.improvements,
          betterSampleAnswer: t.feedback.ideal_answer,
        })),
      };

      await fetch('/api/interview/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interviewSessionRecord),
      });

      fetchPastHistory();

      if (compiledReport.interview_readiness_percentage >= 75) {
        confetti({ particleCount: 75, spread: 80, origin: { y: 0.5 } });
      }
    } catch {
      const fallbackReport = generateFinalInterviewReport(sessionHistory, extractedResume!, companyTarget);
      setFinalReport(fallbackReport);
      setScreen('report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleRestart = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setScreen('upload');
    setStudentAnswer('');
    setQuestionNumber(1);
    setSessionHistory([]);
    setLastFeedback(null);
    setFinalReport(null);
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      {/* ========================================================================= */}
      {/* SCREEN 1: RESUME UPLOAD & ANALYSIS SECTION                                */}
      {/* ========================================================================= */}
      {screen === 'upload' && (
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-slate-800 p-8 sm:p-10">
            <div className="max-w-3xl space-y-3">
              <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>AI Technical Interviewer · Campus Placement Simulation</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                AI Placement Mock Interview Cockpit
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Step 1: Upload your resume. Our AI analyzes your skills, projects, and internships to conduct
                a real 1-on-1 adaptive placement interview simulated for <strong>TCS, HCL, Infosys, Cognizant, Accenture, and Capgemini</strong>.
              </p>

              {/* Company Preset Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold mr-1">Target Panel:</span>
                {COMPANY_PRESETS.map((comp) => (
                  <button
                    key={comp.name}
                    onClick={() => setCompanyTarget(comp.name)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      companyTarget === comp.name
                        ? 'bg-sky-500 text-white shadow-md scale-105'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {comp.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick History Button in Top Right */}
            {savedHistory.length > 0 && (
              <button
                onClick={() => setScreen('history')}
                className="mt-4 sm:mt-0 sm:absolute sm:top-8 sm:right-8 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold text-white flex items-center gap-2 transition-all cursor-pointer"
              >
                <History className="w-4 h-4 text-sky-400" />
                <span>Past Interviews ({savedHistory.length})</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Upload Box & Sample Resumes */}
            <div className="lg:col-span-7 space-y-6">
              {/* File Upload Box */}
              <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-8 text-center hover:border-indigo-500 hover:bg-slate-50/50 transition-all group shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-xs">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Upload Student Resume (.txt, .pdf, .docx)
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Drag and drop your file or click to select from your device.
                </p>

                <div className="mt-5 flex items-center justify-center">
                  <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs cursor-pointer shadow-md hover:bg-indigo-700 transition-colors">
                    <FileText className="w-4 h-4" />
                    <span>Choose Resume File</span>
                    <input
                      type="file"
                      accept=".txt,.pdf,.docx,.doc"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {fileName && (
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Selected: {fileName}</span>
                  </div>
                )}
              </div>

              {/* Paste Text Fallback */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Or Paste Resume Text Directly</span>
                </label>
                <textarea
                  rows={4}
                  value={resumeText}
                  onChange={(e) => {
                    setResumeText(e.target.value);
                    if (e.target.value.length > 50) parseResume(e.target.value);
                  }}
                  placeholder="Paste your education, skills, projects, and internship sections here..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-hidden focus:border-indigo-600 text-slate-800"
                />
              </div>

              {/* Preset Sample Resumes */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Quick Test: Try Candidate Profiles</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SAMPLE_RESUMES.map((sample) => {
                    const Icon = sample.icon;
                    return (
                      <button
                        key={sample.title}
                        onClick={() => selectSampleResume(sample)}
                        className="text-left p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon className="w-4 h-4 text-indigo-600" />
                          <span className="font-bold text-xs text-slate-900 leading-tight">
                            {sample.title.split(' ')[0]} {sample.title.split(' ')[1]}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2">{sample.subtitle}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Extracted Resume Intelligence & Start Cockpit */}
            <div className="lg:col-span-5 space-y-6">
              {parsingResume ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-4 shadow-xs">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Analyzing Resume Profile...
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Extracting Name, Education, Skills, Projects, Internships, Certifications, and Achievements.
                    </p>
                  </div>
                </div>
              ) : extractedResume ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                        Analysis Complete
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1">
                        {extractedResume.name}
                      </h3>
                      <p className="text-xs text-slate-500">{extractedResume.education}</p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      {extractedResume.name.charAt(0)}
                    </div>
                  </div>

                  {/* Extracted 8 Fields Showcase */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">
                        1. Extracted Skills ({extractedResume.skills.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {extractedResume.skills.map((s) => (
                          <span
                            key={s}
                            className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold text-[11px]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block mb-1">
                        2. Key Projects ({extractedResume.projects.length})
                      </span>
                      <div className="space-y-1.5">
                        {extractedResume.projects.slice(0, 2).map((p, idx) => (
                          <div key={idx} className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="font-bold text-slate-800 text-[11px]">{p.title}</p>
                            <p className="text-[10px] text-slate-500 line-clamp-1">{p.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block mb-1">
                        3. Internships ({extractedResume.internships.length})
                      </span>
                      {extractedResume.internships.length > 0 ? (
                        <p className="text-[11px] text-slate-600">
                          {extractedResume.internships[0].role} at{' '}
                          <strong className="text-slate-800">{extractedResume.internships[0].company}</strong>
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">No formal internship detected (Academic projects will be prioritized).</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="font-bold text-slate-700 block text-[10px] uppercase">Certifications</span>
                        <p className="text-[11px] text-slate-600 truncate">{extractedResume.certifications[0] || 'Standard CS'}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700 block text-[10px] uppercase">Achievements</span>
                        <p className="text-[11px] text-slate-600 truncate">{extractedResume.achievements[0] || 'Hackathon / DSA'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Adaptive Options */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Target Recruiter</label>
                        <select
                          value={companyTarget}
                          onChange={(e) => setCompanyTarget(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                        >
                          {COMPANY_PRESETS.map((c) => (
                            <option key={c.name} value={c.name}>
                              {c.name} ({c.role.split(' ')[0]})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Difficulty Level</label>
                        <select
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value as any)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                        >
                          <option value="Beginner">Beginner (Easy)</option>
                          <option value="Intermediate">Intermediate (Medium)</option>
                          <option value="Advanced">Advanced (Hard)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={startInterview}
                      className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white rounded-2xl shadow-lg font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                    >
                      <Sparkles className="w-4 h-4 text-sky-200" />
                      <span>Start {companyTarget} Mock Interview Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-3xl border border-slate-200 p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-xs">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Awaiting Resume Upload
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Please upload a resume or select one of the candidate profiles on the left. The mock interview will be automatically generated from your resume content.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2: CHAT-STYLE LIVE AI INTERVIEW ROOM (ONE QUESTION AT A TIME)       */}
      {/* ========================================================================= */}
      {screen === 'interview' && (
        <div className="space-y-6">
          {/* Top Progress & Pacing Bar */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                Q{questionNumber}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Question {questionNumber} of {totalQuestions}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                    {currentCategory}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold">
                    {companyTarget} Placement Panel
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  Candidate: {extractedResume?.name} · Difficulty: {difficulty}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-semibold border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{formatTimer(elapsedSeconds)}</span>
              </div>
              <button
                onClick={handleRestart}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-medium hover:bg-slate-50 cursor-pointer"
              >
                Quit Session
              </button>
            </div>
          </div>

          {/* Progress Indicator Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            />
          </div>

          {/* Chat-Style Conversational Thread */}
          <div className="space-y-4">
            {/* Previous Conversation Turns */}
            {sessionHistory.map((item, idx) => {
              const isStrong = (item.feedback.score_out_of_10 || 7) >= 7;
              return (
                <div key={idx} className="space-y-3">
                  {/* Interviewer Message */}
                  <div className="flex items-start gap-3 max-w-3xl">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-xs">
                      AI
                    </div>
                    <div className="bg-slate-900 text-white rounded-2xl rounded-tl-none p-4 shadow-sm text-xs leading-relaxed">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">
                          Question {idx + 1} · {item.category}
                        </span>
                      </div>
                      <p className="font-semibold text-sm">"{item.question}"</p>
                    </div>
                  </div>

                  {/* Candidate Answer */}
                  <div className="flex items-start justify-end gap-3 ml-auto max-w-3xl">
                    <div className="bg-indigo-50 border border-indigo-100 text-slate-800 rounded-2xl rounded-tr-none p-4 shadow-sm text-xs leading-relaxed">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                          Your Response
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isStrong ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          Score: {item.feedback.score_out_of_10} / 10 {isStrong ? '✓ Strong' : '⚠ Weak'}
                        </span>
                      </div>
                      <p>{item.answer}</p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-xs">
                      You
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Current Active Interview Question */}
            <div className="flex items-start gap-3 max-w-3xl animate-in fade-in duration-200">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-md">
                AI
              </div>
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl rounded-tl-none p-6 shadow-xl border border-slate-800 space-y-4 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-sky-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{companyTarget} Interviewer · {currentCategory}</span>
                  </span>
                  <button
                    onClick={() => toggleSpeech(currentQuestion)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSpeaking ? 'bg-sky-500 text-white animate-pulse' : 'bg-white/10 hover:bg-white/20 text-slate-200'
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeaking ? 'Mute Voice' : 'Listen Question'}</span>
                  </button>
                </div>

                <h2 className="text-base sm:text-lg font-bold leading-relaxed">
                  "{currentQuestion}"
                </h2>

                <p className="text-[11px] text-slate-400 border-t border-white/10 pt-2.5">
                  Take your time to structure your points before answering. Mention trade-offs and real-world examples.
                </p>
              </div>
            </div>
          </div>

          {/* Student Answer Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-600" />
                <span>Your Answer (Speak or Type):</span>
              </label>

              {/* Speech-To-Text Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-200'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-indigo-600" />
                    <span>Speak with Mic</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="State your answer clearly. For technical questions, mention trade-offs and complexity. For HR questions, use Situation, Task, Action, and Result (STAR)..."
              rows={6}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:bg-white focus:outline-hidden focus:border-indigo-600 text-slate-800 leading-relaxed"
            />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-400">
                Word Count:{' '}
                <span className="font-semibold text-slate-700">
                  {studentAnswer.trim() ? studentAnswer.trim().split(/\s+/).length : 0} words
                </span>
                {isListening && (
                  <span className="ml-3 text-rose-500 font-semibold animate-pulse">
                    ● Recording your voice...
                  </span>
                )}
              </div>

              <button
                onClick={submitAnswer}
                disabled={evaluating || !studentAnswer.trim()}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {evaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Evaluating Response...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Answer for Evaluation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: INSTANT FEEDBACK PER QUESTION (SCORE OUT OF 10)                 */}
      {/* ========================================================================= */}
      {screen === 'evaluation' && lastFeedback && (
        <div className="space-y-6">
          {/* Top Banner with Score out of 10 */}
          {(() => {
            const isStrong = lastFeedback.score_out_of_10 >= 7;
            return (
              <div
                className={`rounded-3xl border p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${
                  isStrong
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50/70 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-20 h-20 rounded-2xl text-white flex flex-col items-center justify-center font-black shadow-md ${
                      isStrong ? 'bg-emerald-600' : 'bg-rose-600'
                    }`}
                  >
                    <span className="text-3xl leading-none">{lastFeedback.score_out_of_10}</span>
                    <span className="text-[10px] text-white/90 font-medium tracking-wider uppercase mt-1">
                      out of 10
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isStrong ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isStrong ? 'Strong Answer' : 'Weak Answer'}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        Question {questionNumber} of {totalQuestions}
                      </span>
                    </div>
                    <h3 className="text-lg font-black mt-1">
                      {isStrong ? 'Excellent Response! Campus Ready' : 'Needs Structural & Technical Improvement'}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Target Recruiter: <strong>{companyTarget}</strong> · Pacing: <strong>{difficulty}</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleProceedNext}
                  className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isLastQuestion ? 'View Final Placement Report' : 'Proceed to Next Question'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })()}

          {/* Strengths & Areas for Improvement Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                <ThumbsUp className="w-4 h-4" />
                <span>Observed Strengths</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {lastFeedback.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
                <ThumbsDown className="w-4 h-4" />
                <span>Areas for Improvement</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {lastFeedback.improvements.map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Better Sample Answer Card */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-indigo-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Better Sample Answer (Placement Benchmark)</span>
              </span>
              <span className="text-[11px] text-slate-400">STAR Method & Technical Trade-offs</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10 font-sans">
              {lastFeedback.ideal_answer}
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 4: COMPREHENSIVE FINAL REPORT & READINESS EVALUATION                */}
      {/* ========================================================================= */}
      {screen === 'report' && finalReport && (
        <div className="space-y-8">
          {/* Header Scorecard */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                {companyTarget} Technical Interview Evaluation
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Mock Interview Final Report
              </h2>
              <p className="text-xs text-slate-300 max-w-xl">
                Comprehensive performance breakdown across Technical Depth, Communication Clarity, Confidence, and Problem-Solving under placement scrutiny.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center p-4 bg-white/10 rounded-2xl border border-white/10">
                <span className="text-3xl font-black text-sky-300 block font-mono">
                  {finalReport.overall_score} / 10
                </span>
                <span className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">
                  Overall Score
                </span>
              </div>

              <div className="text-center p-4 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl">
                <span className="text-3xl font-black text-emerald-300 block font-mono">
                  {finalReport.interview_readiness_percentage}%
                </span>
                <span className="text-[11px] text-emerald-200 uppercase tracking-wider font-semibold">
                  Readiness
                </span>
              </div>
            </div>
          </div>

          {/* 4 Score Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Technical Score</span>
              <p className="text-2xl font-black font-mono text-indigo-600 mt-1">{finalReport.technical_score} / 10</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Communication</span>
              <p className="text-2xl font-black font-mono text-sky-600 mt-1">{finalReport.communication_score} / 10</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Confidence</span>
              <p className="text-2xl font-black font-mono text-emerald-600 mt-1">{finalReport.confidence_score} / 10</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Problem Solving</span>
              <p className="text-2xl font-black font-mono text-purple-600 mt-1">{finalReport.problem_solving_score} / 10</p>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Identified Strengths</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {finalReport.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Identified Weaknesses</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {finalReport.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Topics to Improve & Recommended Resources */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900">Recommended Next Steps & Learning Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {finalReport.recommended_resources.map((res, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {res.type}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">{res.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{res.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <button
              onClick={handleRestart}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs cursor-pointer"
            >
              Start Another Interview
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setScreen('history')}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <History className="w-4 h-4" />
                <span>View All Saved Interviews</span>
              </button>
              <button
                onClick={() => setCurrentTab('dsa')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs shadow-xs cursor-pointer"
              >
                Practice DSA Sheets
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 5: PAST INTERVIEW HISTORY & SCORES (SAVED IN DATABASE)              */}
      {/* ========================================================================= */}
      {screen === 'history' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Stored Interview History & Reports</h2>
              <p className="text-xs text-slate-500">
                Track your score progression across mock placement interviews
              </p>
            </div>
            <button
              onClick={() => setScreen('upload')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
            >
              Take New Interview
            </button>
          </div>

          {savedHistory.length === 0 ? (
            <div className="bg-slate-50 rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <History className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No Interview History Yet</h3>
              <p className="text-xs text-slate-500">Complete a mock interview to record scores in the database.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {item.companyTarget}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {item.difficulty} Pacing
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Mock Session with {item.candidateName} · {item.questionsCount} Questions Evaluated
                    </h3>
                    <div className="flex flex-wrap gap-1 text-[11px] text-slate-600">
                      <span>Skills: {item.extractedResume?.skills?.slice(0, 4).join(', ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-xl font-black font-mono text-emerald-600 block leading-tight">
                        {item.overallScore} / 10
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Readiness: {item.readinessPercentage}%
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setFinalReport(item.report);
                        setCompanyTarget(item.companyTarget);
                        setScreen('report');
                      }}
                      className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      View Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
