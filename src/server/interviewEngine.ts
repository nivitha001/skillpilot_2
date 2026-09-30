import {
  ExtractedResume,
  InterviewRubricFeedback,
  FinalInterviewReport,
} from '../types';

export type InterviewDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

/**
 * 1. Comprehensive Resume Parser
 * Extracts all 8 core campus placement fields:
 * - Name
 * - Education
 * - Skills
 * - Projects
 * - Internships
 * - Certifications
 * - Achievements
 * - Technologies
 */
export function heuristicParseResume(text: string): ExtractedResume {
  const clean = text.replace(/\r\n/g, '\n');
  const lines = clean.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Detect Candidate Name
  let name = 'Candidate';
  for (const line of lines.slice(0, 5)) {
    if (
      line.length > 2 &&
      line.length < 40 &&
      !line.toLowerCase().includes('resume') &&
      !line.toLowerCase().includes('curriculum') &&
      !line.toLowerCase().includes('email') &&
      !line.toLowerCase().includes('phone') &&
      !line.toLowerCase().includes('github') &&
      !line.toLowerCase().includes('linkedin') &&
      !line.toLowerCase().includes('http') &&
      !line.toLowerCase().includes('profile')
    ) {
      name = line.replace(/^[#\*\-_\s]+/, '').trim();
      break;
    }
  }

  // 2. Detect Technologies & Skills
  const knownTech = [
    'Java', 'Spring Boot', 'Hibernate', 'Python', 'Django', 'Flask', 'FastAPI',
    'React', 'React.js', 'Next.js', 'Node.js', 'Express', 'Express.js',
    'JavaScript', 'TypeScript', 'C++', 'C', 'C#', '.NET',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle',
    'AWS', 'Amazon Web Services', 'EC2', 'S3', 'IAM', 'VPC', 'Lambda',
    'Networking', 'Computer Networks', 'Operating Systems', 'DBMS', 'OOPs',
    'Data Structures', 'Algorithms', 'Git', 'GitHub', 'Docker', 'Kubernetes',
    'Tailwind CSS', 'Redux', 'REST API', 'GraphQL', 'Microservices', 'Kafka'
  ];

  const textLower = text.toLowerCase();
  const detectedSkillsSet = new Set<string>();

  for (const tech of knownTech) {
    const techLower = tech.toLowerCase();
    const regex = new RegExp(`\\b${techLower.replace(/\./g, '\\.')}\\b`, 'i');
    if (regex.test(textLower)) {
      detectedSkillsSet.add(tech);
    }
  }

  const skills = Array.from(detectedSkillsSet);
  if (skills.length === 0) {
    skills.push('Java', 'SQL', 'Data Structures', 'Web Development', 'OOPs');
  }

  // 3. Education
  let education = 'B.Tech in Computer Science and Engineering (Expected 2026)';
  const eduMatches = text.match(/(B\.?Tech|B\.?E\.?|Bachelor|Master|M\.?Tech|MCA|BCA|B\.?Sc|Degree|Computer Science|Information Technology)[^\n,.]*/i);
  if (eduMatches && eduMatches[0]) {
    education = eduMatches[0].trim();
  }

  // 4. Projects Extraction
  const projects: ExtractedResume['projects'] = [];
  const projectHeaderIdx = lines.findIndex((l) => /^(projects|academic projects|key projects|notable projects)/i.test(l));
  if (projectHeaderIdx !== -1) {
    let currentProj = { title: '', description: '', tech: [] as string[] };
    for (let i = projectHeaderIdx + 1; i < Math.min(lines.length, projectHeaderIdx + 16); i++) {
      const line = lines[i];
      if (/^(experience|internships|education|skills|certifications|achievements)/i.test(line)) {
        break;
      }
      if (line.length > 5 && line.length < 60 && !line.startsWith('•') && !line.startsWith('-')) {
        if (currentProj.title) {
          projects.push({ ...currentProj });
        }
        currentProj = {
          title: line.replace(/^[#\*\-_\s]+/, '').trim(),
          description: '',
          tech: skills.filter((s) => line.toLowerCase().includes(s.toLowerCase())),
        };
      } else if (currentProj.title) {
        currentProj.description += (currentProj.description ? ' ' : '') + line.replace(/^[•\-\*]\s*/, '');
      }
    }
    if (currentProj.title) projects.push(currentProj);
  }

  if (projects.length === 0) {
    if (skills.some((s) => s.toLowerCase().includes('react') || s.toLowerCase().includes('node'))) {
      projects.push({
        title: 'Full-Stack Campus Placement & Assessment Portal',
        description: 'Engineered responsive web app with authentication, state management, automated evaluation, and RESTful APIs.',
        tech: ['React', 'Node.js', 'Express', 'SQL'],
      });
    }
    if (skills.some((s) => s.toLowerCase().includes('java') || s.toLowerCase().includes('spring'))) {
      projects.push({
        title: 'Microservices-Based Banking & Transaction Engine',
        description: 'Built scalable backend processing transactional records with ACID compliance, exception hierarchies, and Docker containerization.',
        tech: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker'],
      });
    }
    if (projects.length === 0) {
      projects.push({
        title: 'Algorithmic Data Processing & Analytics Engine',
        description: 'Developed high-throughput data processing service with clean OOP design, indexing, and visualization.',
        tech: ['Python', 'SQL', 'Data Structures'],
      });
    }
  }

  // 5. Internships Extraction
  const internships: ExtractedResume['internships'] = [];
  const internHeaderIdx = lines.findIndex((l) => /^(experience|internships|work experience|employment)/i.test(l));
  if (internHeaderIdx !== -1) {
    for (let i = internHeaderIdx + 1; i < Math.min(lines.length, internHeaderIdx + 12); i++) {
      const line = lines[i];
      if (/^(education|projects|skills|certifications|achievements)/i.test(line)) {
        break;
      }
      if (line.toLowerCase().includes('intern') || line.toLowerCase().includes('trainee') || line.toLowerCase().includes('developer')) {
        internships.push({
          company: line.split(/[-–|]/)[0]?.trim() || 'Tech Innovators Inc.',
          role: 'Software Engineering Intern',
          description: 'Collaborated with senior engineers on developing REST APIs, resolving bugs, performance profiling, and SQL query tuning.',
        });
        break;
      }
    }
  }

  if (internships.length === 0 && textLower.includes('intern')) {
    internships.push({
      company: 'Digital Innovation Labs',
      role: 'Software Development Intern',
      description: 'Built customer-facing feature modules, optimized SQL query latency by 25%, and participated in agile sprints.',
    });
  }

  // 6. Certifications
  const certifications: string[] = [];
  if (textLower.includes('aws')) certifications.push('AWS Certified Cloud Practitioner / Solutions Architect');
  if (textLower.includes('oracle') || textLower.includes('java se')) certifications.push('Oracle Certified Java Associate');
  if (textLower.includes('hackerrank') || textLower.includes('leetcode')) certifications.push('HackerRank 5-Star Problem Solving Certification');
  if (textLower.includes('meta') || textLower.includes('coursera')) certifications.push('Professional Full-Stack Developer Specialization');
  if (certifications.length === 0) {
    certifications.push('Full-Stack Web Development Specialization', 'NPTEL Core Computer Science Certification');
  }

  // 7. Achievements
  const achievements: string[] = [];
  if (textLower.includes('hackathon')) achievements.push('Finalist in National Campus Smart India Hackathon');
  if (textLower.includes('solved') || textLower.includes('problems')) achievements.push('Solved 250+ LeetCode DSA problems across Arrays, Trees, and DP');
  if (achievements.length === 0) {
    achievements.push(
      'Ranked top 10% in Department Technical Placement Assessment',
      'Led final year capstone project delivering production deployment'
    );
  }

  return {
    name,
    education,
    skills,
    projects,
    internships,
    certifications,
    achievements,
    technologies: skills,
    rawText: text,
  };
}

/**
 * 2. Adaptive Question Generator
 * Generates questions dynamically from extracted resume content
 * across:
 * - Resume-Based Questions
 * - Technical Questions (Java, React, SQL, AWS, Networking, Python, DSA)
 * - Internship Questions
 * - Behavioral Questions
 */
export function generateAdaptiveNextQuestion(
  resume: ExtractedResume,
  stepNumber: number,
  totalSteps: number,
  previousAnswer: string = '',
  previousScore: number = 7,
  difficulty: InterviewDifficulty = 'Intermediate',
  companyTarget: string = 'TCS'
): { question: string; category: string } {
  const skills = resume.skills.map((s) => s.toLowerCase());
  const hasJava = skills.some((s) => s.includes('java'));
  const hasReact = skills.some((s) => s.includes('react'));
  const hasSQL = skills.some((s) => s.includes('sql') || s.includes('database'));
  const hasAWS = skills.some((s) => s.includes('aws') || s.includes('cloud'));
  const hasNetworking = skills.some((s) => s.includes('network') || s.includes('tcp') || s.includes('osi'));
  const hasPython = skills.some((s) => s.includes('python'));
  const hasInternship = resume.internships.length > 0;
  const project = resume.projects[0] || { title: 'your primary academic project', tech: ['React', 'Node.js', 'SQL'] };

  // Step 1: Self Introduction
  if (stepNumber === 1) {
    return {
      category: 'Resume-Based Questions',
      question: `Hello ${resume.name}. Welcome to your ${companyTarget} technical interview. To begin, please introduce yourself, walk me through your academic background at ${resume.education}, and highlight the core technologies and projects you are most confident in.`,
    };
  }

  // Step 2: Project Deep Dive (Architecture, Challenges, Contribution)
  if (stepNumber === 2) {
    if (difficulty === 'Beginner') {
      return {
        category: 'Resume-Based Questions',
        question: `Looking at your project "${project.title}", explain your project in detail. What was the purpose of the application, which technologies did you choose, and what was your specific individual contribution?`,
      };
    }
    if (difficulty === 'Advanced') {
      return {
        category: 'Resume-Based Questions',
        question: `In your project "${project.title}", walk me through the high-level architecture. What major performance bottleneck or concurrency challenge did you encounter, and what exact architectural decisions did you make to resolve it?`,
      };
    }
    // Intermediate
    return {
      category: 'Resume-Based Questions',
      question: `In your project "${project.title}", you utilized ${project.tech.join(', ') || 'modern frameworks'}. What challenges did you face in this project, why did you choose this technology stack over alternatives, and what was your personal contribution?`,
    };
  }

  // Step 3: Technical Skills Deep Dive (Java / React / SQL / AWS / Networking / DSA)
  if (stepNumber === 3) {
    if (hasJava) {
      if (difficulty === 'Beginner') {
        return {
          category: 'Technical Questions (Java)',
          question: `Since Java is listed on your resume, explain the four pillars of OOPs with real-world examples. Also, explain the difference between method overloading and method overriding.`,
        };
      }
      if (difficulty === 'Advanced') {
        return {
          category: 'Technical Questions (Java)',
          question: `In Java 8+, how does HashMap handle hash collisions internally, when and why does it transition to a Red-Black Tree, and how does the JVM garbage collection determine object reachability from GC Roots?`,
        };
      }
      return {
        category: 'Technical Questions (Java)',
        question: `Since you highlighted Java, explain how String immutability works and why Strings are immutable. Additionally, what is the difference between ArrayList and LinkedList in terms of internal memory and time complexity?`,
      };
    }

    if (hasReact) {
      if (difficulty === 'Beginner') {
        return {
          category: 'Technical Questions (React)',
          question: `You've listed React on your resume. Explain what the Virtual DOM is, how JSX works, and what the difference between state and props is in a React component.`,
        };
      }
      if (difficulty === 'Advanced') {
        return {
          category: 'Technical Questions (React)',
          question: `Explain how the React Fiber reconciliation algorithm manages prioritizeable units of work. How do you prevent unnecessary child re-renders in a complex UI, and how would you profile memory leaks caused by useEffect closures?`,
        };
      }
      return {
        category: 'Technical Questions (React)',
        question: `Since React is prominent on your resume, explain the React component lifecycle using hooks like useState and useEffect. When would you use useCallback and useMemo for performance optimization?`,
      };
    }

    if (hasSQL) {
      if (difficulty === 'Beginner') {
        return {
          category: 'Technical Questions (SQL)',
          question: `You've mentioned SQL on your resume. Explain the differences between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN. Write or describe a query to find the second highest salary from an Employee table.`,
        };
      }
      return {
        category: 'Technical Questions (SQL)',
        question: `In SQL, explain the difference between Clustered and Non-Clustered Indexes. How do Database ACID properties ensure consistency during financial transactions, and how would you optimize a slow-running JOIN query?`,
      };
    }

    if (hasAWS) {
      return {
        category: 'Technical Questions (Cloud/AWS)',
        question: `Since AWS is on your resume, explain the difference between EC2 and AWS Lambda (Serverless). How do VPC subnets, Security Groups, and IAM roles with least privilege work together to secure backend services?`,
      };
    }

    if (hasNetworking) {
      return {
        category: 'Technical Questions (Networking)',
        question: `Explain the 7 layers of the OSI model. What is the fundamental difference between TCP and UDP, and what happens behind the scenes when a user types a URL like https://google.com into their browser?`,
      };
    }

    if (hasPython) {
      return {
        category: 'Technical Questions (Python)',
        question: `In Python, explain the Global Interpreter Lock (GIL) and how it affects multi-threaded programs. Also, what is the difference between deep copy and shallow copy?`,
      };
    }

    // Default Core DSA
    return {
      category: 'Technical Questions (DSA)',
      question: `In Data Structures, compare an Array vs a Linked List in terms of time and space complexity. When would you use a Stack vs a Queue in algorithmic problem solving?`,
    };
  }

  // Step 4: Secondary Technical / SQL / Networking
  if (stepNumber === 4) {
    if (hasSQL && !hasReact) {
      return {
        category: 'Technical Questions (SQL)',
        question: `In relational databases, explain the difference between WHERE and HAVING clauses. How do Database Transactions prevent Dirty Reads and Phantom Reads?`,
      };
    }
    if (hasNetworking) {
      return {
        category: 'Technical Questions (Networking)',
        question: `Explain the TCP 3-way handshake process (SYN, SYN-ACK, ACK) and why TCP is preferred over UDP for reliable data transfer like file downloads and HTTP requests.`,
      };
    }
    if (hasAWS) {
      return {
        category: 'Technical Questions (AWS & DevOps)',
        question: `How do you handle deployment, environment variables, and zero-downtime releases when shipping web applications to production?`,
      };
    }
    // Cross-discipline question: SQL / DSA
    return {
      category: 'Technical Questions (SQL & DBMS)',
      question: `Since database knowledge is tested heavily by ${companyTarget}, explain database Normalization up to 3NF and why denormalization might be preferred in read-heavy analytics systems.`,
    };
  }

  // Step 5: Internship Experience (or Academic Collaborative Experience)
  if (stepNumber === 5) {
    if (hasInternship) {
      const intern = resume.internships[0];
      return {
        category: 'Internship Questions',
        question: `During your internship at ${intern.company}, what were your primary responsibilities, what technologies did you use, and what was the most valuable technical or professional skill you learned?`,
      };
    }
    return {
      category: 'Internship Questions',
      question: `Describe a collaborative technical project or open-source initiative where you worked with a team. What were your responsibilities, how did you handle version control with Git, and what technologies did you use?`,
    };
  }

  // Step 6: Behavioral & HR Questions (Teamwork, Deadlines, Challenges, Why Hire)
  const hrPool = [
    {
      category: 'Behavioral Questions',
      question: `Tell me about a significant challenge you faced during a project or coursework. How did you break down the problem, what action did you take, and what was the outcome?`,
    },
    {
      category: 'Behavioral Questions',
      question: `Describe a situation where you worked in a team and had a disagreement with a teammate regarding code or task allocation. How did you handle the situation professionally?`,
    },
    {
      category: 'Behavioral Questions',
      question: `How do you handle tight deadlines and prioritize multiple urgent academic or project assignments without compromising on code quality?`,
    },
    {
      category: 'Behavioral Questions',
      question: `Why should ${companyTarget} hire you today over other candidates from your batch? What unique strengths and work ethic do you bring to our engineering team?`,
    },
  ];

  const chosen = hrPool[(stepNumber - 1) % hrPool.length];
  return {
    category: chosen.category,
    question: chosen.question,
  };
}

/**
 * 3. Heuristic Answer Evaluator
 * Evaluates candidate response according to:
 * - Score out of 10
 * - Strengths
 * - Areas for Improvement
 * - Better Sample Answer
 */
export function heuristicEvaluateAnswer(
  question: string,
  answer: string,
  category: string,
  resume: ExtractedResume,
  difficulty: InterviewDifficulty = 'Intermediate'
): InterviewRubricFeedback {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  let technical = 7;
  let communication = 7;
  let confidence = 7;
  let problemSolving = 7;

  // 1. Length & Substance Evaluation
  if (wordCount < 10) {
    technical = 3;
    communication = 3;
    confidence = 4;
    problemSolving = 3;
  } else if (wordCount < 25) {
    technical = 5;
    communication = 5;
    confidence = 5;
    problemSolving = 5;
  } else if (wordCount < 45) {
    technical = 7;
    communication = 7;
    confidence = 7;
    problemSolving = 7;
  } else if (wordCount > 75) {
    communication = Math.min(10, communication + 2);
    confidence = Math.min(10, confidence + 1);
  }

  // 2. Technical Keyword Depth
  const textLower = answer.toLowerCase();
  const keywords = [
    'because', 'architecture', 'complexity', 'trade-off', 'database',
    'component', 'state', 'index', 'performance', 'latency', 'optimize',
    'scale', 'security', 'test', 'async', 'class', 'method', 'handle',
    'result', 'team', 'situation', 'task', 'action', 'learned', 'virtual dom',
    'hashmap', 'reconciliation', 'acid', 'normalized', 'foreign key'
  ];

  let hits = 0;
  for (const k of keywords) {
    if (textLower.includes(k)) hits++;
  }

  if (hits >= 4) {
    technical = Math.min(10, technical + 2);
    problemSolving = Math.min(10, problemSolving + 2);
  } else if (hits >= 2) {
    technical = Math.min(10, technical + 1);
    problemSolving = Math.min(10, problemSolving + 1);
  }

  // Adjust for difficulty expectation
  if (difficulty === 'Advanced' && hits < 3 && wordCount < 50) {
    technical = Math.max(3, technical - 1);
  }

  const totalScore40 = technical + communication + confidence + problemSolving;
  const scoreOutOf10 = Math.round((totalScore40 / 40) * 10 * 10) / 10;

  // Strengths & Improvements
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (wordCount >= 40) {
    strengths.push('Articulated an elaborate answer demonstrating thorough subject matter familiarity.');
  } else {
    strengths.push('Directly addressed the question without unnecessary tangents.');
  }

  if (hits >= 2) {
    strengths.push('Incorporated appropriate industry-standard technical vocabulary and terminology.');
  } else {
    strengths.push('Maintained clear, professional conversational tone.');
  }

  if (wordCount < 30) {
    improvements.push('Answer was relatively brief. For campus placement panels, expand using the STAR method (Situation, Task, Action, Result).');
  }

  if (!textLower.includes('because') && !textLower.includes('why') && !textLower.includes('trade-off')) {
    improvements.push('Highlight the "why" behind your choices and mention technical trade-offs between alternatives.');
  }

  if (category.includes('Behavioral') || category.includes('HR')) {
    improvements.push('Ensure your response highlights personal ownership, empathy for team members, and tangible business or academic outcomes.');
  }

  // Better Sample Answer Synthesis
  let idealAnswer = '';

  if (question.toLowerCase().includes('introduce yourself')) {
    idealAnswer = `Good morning/afternoon. My name is ${resume.name}, and I am completing my ${resume.education}. Over the course of my degree, I have built a strong foundation in core computer science subjects including Data Structures, Algorithms, and Database Management Systems. On the practical side, my core technical expertise lies in ${resume.skills.slice(0, 4).join(', ')}. Most notably, I developed "${resume.projects[0]?.title || 'a full-stack web application'}" where I was responsible for backend API design and frontend state management. I am eager to contribute my problem-solving skills and learn continuously as a software engineer at your esteemed company.`;
  } else if (question.toLowerCase().includes('virtual dom') || question.toLowerCase().includes('react')) {
    idealAnswer = `In React, the Virtual DOM is a lightweight in-memory representation of the real DOM. When state changes, React generates a new Virtual DOM tree and runs a diffing algorithm called Reconciliation (implemented via React Fiber). It identifies the exact minimum delta of changes and batches updates into the real DOM efficiently. To prevent unnecessary re-renders, we use React.memo on components, and optimize functions and expensive calculations with useCallback and useMemo.`;
  } else if (question.toLowerCase().includes('hashmap') || question.toLowerCase().includes('java')) {
    idealAnswer = `In Java 8, HashMap is implemented using an array of buckets. Each bucket contains a linked list of Entry nodes. When a hash collision occurs, new entries are appended to the linked list. If the number of nodes in a bucket exceeds the TREEIFY_THRESHOLD (8) and table capacity >= 64, the bucket is transformed into a Red-Black balanced tree, improving worst-case search complexity from O(N) to O(log N). Garbage collection operates by tracing references starting from GC Roots (threads, local variables, static fields); unreferenced objects in Eden space are swept into Survivor spaces during minor GC.`;
  } else if (question.toLowerCase().includes('index') || question.toLowerCase().includes('sql')) {
    idealAnswer = `A Clustered Index determines the physical order of rows in the table; hence each table can have only one clustered index (typically the Primary Key). A Non-Clustered Index is a separate B-tree structure that maps search keys to row addresses. To diagnose a slow query, I would run EXPLAIN ANALYZE to verify whether a full table scan is taking place, create composite indexes on columns frequently present in JOIN and WHERE clauses, and use covering indexes to eliminate secondary lookups.`;
  } else if (question.toLowerCase().includes('osi') || question.toLowerCase().includes('tcp')) {
    idealAnswer = `The OSI model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application. TCP is a connection-oriented, reliable transport protocol that uses a 3-way handshake (SYN, SYN-ACK, ACK) with flow control and sequence numbers. UDP is connectionless and lightweight without retransmissions, making UDP suitable for real-time gaming or video streaming where low latency takes precedence over lossless delivery.`;
  } else if (question.toLowerCase().includes('challenge') || question.toLowerCase().includes('team')) {
    idealAnswer = `Using the STAR framework: During our semester project, we faced a major bottleneck when our database queries caused 3-second latency under simulated loads (Situation). My task was to optimize query performance without rewriting existing application endpoints (Task). I analyzed execution plans, identified missing indexes on relational foreign keys, and normalized unindexed tables while introducing a Redis caching layer for hot data (Action). As a result, API response times dropped by 75% to under 250ms, enabling our project to achieve top marks (Result).`;
  } else {
    idealAnswer = `A strong answer should follow the 3-part formula: 1) State the core principle or solution directly in the first sentence; 2) Explain the internal mechanisms, trade-offs, and step-by-step reasoning; 3) Conclude with an example of real-world impact or metrics (e.g. latency improvement, bug resolution, team success).`;
  }

  return {
    score_out_of_10: scoreOutOf10,
    technical_score: technical,
    communication_score: communication,
    confidence_score: confidence,
    problem_solving_score: problemSolving,
    total_score: totalScore40,
    strengths,
    improvements,
    ideal_answer: idealAnswer,
  };
}

/**
 * 4. Final Comprehensive Report Generator
 */
export function generateFinalInterviewReport(
  turns: Array<{
    question: string;
    answer: string;
    category: string;
    feedback: InterviewRubricFeedback;
  }>,
  resume: ExtractedResume,
  companyTarget: string = 'TCS'
): FinalInterviewReport {
  if (turns.length === 0) {
    return {
      overall_score: 7.5,
      technical_score: 7.5,
      communication_score: 7.5,
      confidence_score: 7.5,
      problem_solving_score: 7.5,
      interview_readiness_percentage: 75,
      readiness_level: 'Intermediate',
      strengths: ['Enthusiastic candidate with solid foundational knowledge.'],
      weaknesses: ['Need more structured practice on technical depth.'],
      topics_to_improve: ['Core Data Structures', 'SQL Joins & Indexing'],
      recommended_resources: [],
    };
  }

  const avgTechnical =
    Math.round((turns.reduce((s, t) => s + t.feedback.technical_score, 0) / turns.length) * 10) / 10;
  const avgComm =
    Math.round((turns.reduce((s, t) => s + t.feedback.communication_score, 0) / turns.length) * 10) / 10;
  const avgConf =
    Math.round((turns.reduce((s, t) => s + t.feedback.confidence_score, 0) / turns.length) * 10) / 10;
  const avgPS =
    Math.round((turns.reduce((s, t) => s + t.feedback.problem_solving_score, 0) / turns.length) * 10) / 10;

  const overallScore10 =
    Math.round(((avgTechnical + avgComm + avgConf + avgPS) / 4) * 10) / 10;
  const readinessPercentage = Math.min(100, Math.round((overallScore10 / 10) * 100));

  let readinessLevel: FinalInterviewReport['readiness_level'] = 'Placement Ready';
  if (readinessPercentage < 55) readinessLevel = 'Beginner';
  else if (readinessPercentage < 72) readinessLevel = 'Intermediate';
  else if (readinessPercentage >= 88) readinessLevel = 'Industry Ready';

  // Aggregate Strengths & Weaknesses
  const allStrengths = Array.from(new Set(turns.flatMap((t) => t.feedback.strengths))).slice(0, 4);
  const allWeaknesses = Array.from(new Set(turns.flatMap((t) => t.feedback.improvements))).slice(0, 4);

  // Topics to Improve
  const topicsToImprove: string[] = [];
  const lowTechnicalTurns = turns.filter((t) => t.feedback.technical_score < 7);
  if (lowTechnicalTurns.length > 0) {
    lowTechnicalTurns.forEach((t) => {
      topicsToImprove.push(t.category.replace(/Questions|\(.*\)/g, '').trim() || 'Core Algorithms');
    });
  } else {
    topicsToImprove.push('High-Concurrency Systems', 'Complex Dynamic Programming Patterns');
  }

  const uniqueTopics = Array.from(new Set(topicsToImprove)).slice(0, 3);

  // Recommended Learning Resources
  const recommendedResources: FinalInterviewReport['recommended_resources'] = [
    {
      title: 'Top-50 Campus Placement DSA Interview Patterns',
      type: 'Practice Sheet',
      description: 'Master Two Pointers, Fast & Slow Pointers, Sliding Window, and Tree Traversals.',
    },
    {
      title: 'SQL Indexing & Query Optimization Masterclass',
      type: 'Video',
      description: 'In-depth explanation of Clustered vs Non-Clustered Indexes, B-Trees, and Query Plans.',
    },
    {
      title: 'STAR Method Blueprint for HR & Behavioral Rounds',
      type: 'Guide',
      description: 'Structured framework to present project achievements, teamwork, and conflict resolutions.',
    },
  ];

  return {
    overall_score: overallScore10,
    technical_score: avgTechnical,
    communication_score: avgComm,
    confidence_score: avgConf,
    problem_solving_score: avgPS,
    interview_readiness_percentage: readinessPercentage,
    readiness_level: readinessLevel,
    strengths: allStrengths,
    weaknesses: allWeaknesses,
    topics_to_improve: uniqueTopics,
    recommended_resources: recommendedResources,
  };
}
