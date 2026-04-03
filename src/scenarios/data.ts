export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: 'work' | 'daily' | 'technical';
  difficulty: 'easy' | 'medium' | 'hard';
  aiRole: string;
  context: string;
  level: string;
}

export const scenarios: Scenario[] = [
  // A2 - Elementary
  {
    id: 'introducing-yourself',
    title: 'Introducing Yourself',
    description: 'Practice introducing yourself in English',
    category: 'daily',
    difficulty: 'easy',
    aiRole: 'a friendly new acquaintance',
    context: 'You just met the user for the first time. Ask simple questions about their name, where they are from, and what they do. Keep your language very simple and encouraging.',
    level: 'A2',
  },
  {
    id: 'restaurant',
    title: 'At a Restaurant',
    description: 'Order food and interact with a waiter',
    category: 'daily',
    difficulty: 'easy',
    aiRole: 'a friendly waiter at a restaurant',
    context: 'You are a waiter at a casual restaurant. Greet the customer, describe the specials, take their order, and make small talk.',
    level: 'A2',
  },
  {
    id: 'directions',
    title: 'Asking for Directions',
    description: 'Navigate a new city by asking locals',
    category: 'daily',
    difficulty: 'easy',
    aiRole: 'a helpful local on the street',
    context: 'The user is a tourist asking for directions. Give clear directions using landmarks, street names, and distance estimates.',
    level: 'A2',
  },
  {
    id: 'standup',
    title: 'Daily Standup',
    description: 'Report your progress in a daily meeting',
    category: 'work',
    difficulty: 'easy',
    aiRole: 'a friendly tech lead running the daily standup',
    context: 'You are leading a daily standup meeting. Ask team members what they did yesterday, what they plan to do today, and if they have any blockers.',
    level: 'A2',
  },
  {
    id: 'shopping',
    title: 'Shopping',
    description: 'Buy things at a store, ask about products',
    category: 'daily',
    difficulty: 'easy',
    aiRole: 'a store assistant',
    context: 'You are a helpful store assistant. Help the customer find what they need, describe products, suggest alternatives, and handle payment.',
    level: 'A2',
  },
  {
    id: 'meeting-people',
    title: 'Meeting New People',
    description: 'Introduce yourself and make small talk',
    category: 'daily',
    difficulty: 'easy',
    aiRole: 'someone at a tech meetup',
    context: 'You just met the user at a tech meetup. Make small talk, ask about their work, hobbies, and interests.',
    level: 'A2',
  },

  // B1 - Intermediate
  {
    id: 'job-interview',
    title: 'Job Interview',
    description: 'Practice answering common interview questions',
    category: 'work',
    difficulty: 'hard',
    aiRole: 'a senior hiring manager at a tech company',
    context: 'You are conducting a technical job interview for a software developer position. Ask about experience, projects, and technical skills.',
    level: 'B1',
  },
  {
    id: 'email-writing',
    title: 'Email Writing',
    description: 'Draft professional emails together',
    category: 'work',
    difficulty: 'medium',
    aiRole: 'a colleague helping draft a professional email',
    context: 'Help the user compose a professional email. Ask who the email is for, what the purpose is, and help them write it step by step.',
    level: 'B1',
  },
  {
    id: 'bug-report',
    title: 'Bug Report',
    description: 'Report and describe bugs clearly',
    category: 'technical',
    difficulty: 'medium',
    aiRole: 'a QA engineer receiving a bug report',
    context: 'The user is reporting a bug. Ask for steps to reproduce, expected vs actual behavior, environment details, and severity.',
    level: 'B1',
  },
  {
    id: 'slack-message',
    title: 'Slack Messages',
    description: 'Write clear async messages to teammates',
    category: 'technical',
    difficulty: 'easy',
    aiRole: 'a remote teammate on Slack',
    context: 'You are chatting with the user on Slack. Discuss work topics, ask for updates, share information. Keep messages concise like real Slack.',
    level: 'B1',
  },
  {
    id: 'pair-programming',
    title: 'Pair Programming',
    description: 'Solve a coding problem while communicating',
    category: 'work',
    difficulty: 'hard',
    aiRole: 'a pair programming partner',
    context: 'You are pair programming with the user. Discuss approaches, ask about their thought process, and collaborate on solving a problem.',
    level: 'B1',
  },
  {
    id: 'describing-work',
    title: 'Describing Your Work',
    description: 'Explain your role and projects to others',
    category: 'work',
    difficulty: 'medium',
    aiRole: 'a curious colleague from another team',
    context: 'You are meeting the user at a company all-hands. Ask them about their role, what projects they are working on, and what technologies they use. Show genuine interest.',
    level: 'B1',
  },

  // B2 - Upper-Intermediate
  {
    id: 'code-review',
    title: 'Code Review',
    description: 'Discuss code changes with a colleague',
    category: 'work',
    difficulty: 'medium',
    aiRole: 'a senior developer reviewing a pull request',
    context: "You are reviewing the user's pull request. Ask about design decisions, suggest improvements, and discuss trade-offs.",
    level: 'B2',
  },
  {
    id: 'documentation',
    title: 'Writing Documentation',
    description: 'Write technical docs and READMEs',
    category: 'technical',
    difficulty: 'hard',
    aiRole: 'a tech writer reviewing documentation',
    context: 'Help the user write clear technical documentation. Ask what they want to document, for whom, and give feedback on clarity and structure.',
    level: 'B2',
  },
  {
    id: 'pr-description',
    title: 'PR Description',
    description: 'Write and explain pull request descriptions',
    category: 'technical',
    difficulty: 'medium',
    aiRole: 'a team lead who reviews PR descriptions',
    context: 'Help the user write clear PR descriptions. Ask what changes they made, why, and how to test them. Give feedback on clarity.',
    level: 'B2',
  },
  {
    id: 'sprint-planning',
    title: 'Sprint Planning',
    description: 'Discuss and plan work for an upcoming sprint',
    category: 'work',
    difficulty: 'medium',
    aiRole: 'a product manager running sprint planning',
    context: 'You are facilitating a sprint planning session. Discuss upcoming tickets with the user, ask for effort estimates, clarify requirements, and help prioritize the backlog.',
    level: 'B2',
  },
  {
    id: 'negotiating-deadlines',
    title: 'Negotiating Deadlines',
    description: 'Push back on unrealistic timelines professionally',
    category: 'work',
    difficulty: 'hard',
    aiRole: 'a project manager pushing for an earlier deadline',
    context: 'You are a project manager who wants the user to deliver a feature by end of next week. The user needs to negotiate a more realistic timeline. Be firm but open to discussion.',
    level: 'B2',
  },
  {
    id: 'technical-presentation',
    title: 'Technical Presentation',
    description: 'Present a technical topic to a mixed audience',
    category: 'technical',
    difficulty: 'hard',
    aiRole: 'an audience member at a technical talk',
    context: 'The user is giving a short technical presentation. Ask clarifying questions, probe for deeper explanation of complex points, and give feedback on clarity and structure.',
    level: 'B2',
  },

  // C1 - Advanced
  {
    id: 'system-design',
    title: 'System Design Discussion',
    description: 'Walk through a system design problem',
    category: 'technical',
    difficulty: 'hard',
    aiRole: 'a senior staff engineer in a system design interview',
    context: 'You are interviewing the user on a system design problem. Ask them to design a scalable service, probe their architectural decisions, discuss trade-offs, and challenge assumptions.',
    level: 'C1',
  },
  {
    id: 'conflict-resolution',
    title: 'Conflict Resolution',
    description: 'Navigate a workplace disagreement professionally',
    category: 'work',
    difficulty: 'hard',
    aiRole: 'a colleague with whom you have a professional disagreement',
    context: 'You and the user have a disagreement about the technical direction of a project. Express your position clearly, listen to theirs, and work toward a resolution. Be professional but direct.',
    level: 'C1',
  },
  {
    id: 'writing-proposal',
    title: 'Writing a Proposal',
    description: 'Draft and refine a technical or business proposal',
    category: 'technical',
    difficulty: 'hard',
    aiRole: 'a senior stakeholder reviewing the proposal',
    context: 'The user is presenting a proposal for a new initiative. Ask probing questions about goals, feasibility, risks, and success metrics. Give structured feedback on their arguments.',
    level: 'C1',
  },
  {
    id: 'leading-meeting',
    title: 'Leading a Meeting',
    description: 'Facilitate a team discussion and drive decisions',
    category: 'work',
    difficulty: 'hard',
    aiRole: 'a team member participating in a meeting the user is facilitating',
    context: 'The user is leading a team meeting to decide on a technical approach. Participate actively, raise concerns, go slightly off-topic occasionally, and require the user to keep the discussion on track and reach a decision.',
    level: 'C1',
  },
  {
    id: 'explaining-concepts',
    title: 'Explaining Complex Concepts',
    description: 'Break down a complex idea for a non-technical audience',
    category: 'technical',
    difficulty: 'medium',
    aiRole: 'a non-technical business stakeholder',
    context: 'You are a business stakeholder with no engineering background. The user needs to explain a complex technical concept to you. Ask naive questions, push for analogies, and give feedback on how well they simplified the idea.',
    level: 'C1',
  },

  // C2 - Mastery
  {
    id: 'debating-decisions',
    title: 'Debating Technical Decisions',
    description: 'Defend or challenge an architectural decision with nuance',
    category: 'technical',
    difficulty: 'hard',
    aiRole: 'a distinguished engineer with a strong opposing view',
    context: 'You strongly disagree with the technical decision the user has made. Engage in a rigorous debate using precise technical language, historical precedent, and nuanced arguments. Challenge every assumption but remain intellectually honest.',
    level: 'C2',
  },
  {
    id: 'writing-rfcs',
    title: 'Writing RFCs',
    description: 'Draft a Request for Comments document for a technical change',
    category: 'technical',
    difficulty: 'hard',
    aiRole: 'a principal engineer providing detailed RFC feedback',
    context: "The user is walking you through their RFC. Give deep, critical feedback on the problem statement, proposed solution, alternatives considered, and rollout plan. Use precise engineering vocabulary and challenge any vague or unsupported claims.",
    level: 'C2',
  },
  {
    id: 'executive-presentation',
    title: 'Executive Presentation',
    description: 'Present a strategic initiative to leadership',
    category: 'work',
    difficulty: 'hard',
    aiRole: 'a C-level executive being briefed on an engineering initiative',
    context: 'You are a VP of Engineering hearing a pitch for a major technical investment. Ask sharp business-focused questions about ROI, risk, timeline, and competitive advantage. Use executive register and push the user to justify every claim concisely.',
    level: 'C2',
  },
  {
    id: 'cross-team-alignment',
    title: 'Cross-Team Alignment',
    description: 'Build consensus across teams with competing priorities',
    category: 'work',
    difficulty: 'hard',
    aiRole: 'a lead from a partner team with conflicting priorities',
    context: 'Your team has competing priorities with the user\'s team. Engage in a realistic alignment conversation: negotiate shared goals, surface hidden concerns, and require the user to demonstrate diplomacy, clarity, and strategic thinking.',
    level: 'C2',
  },
  {
    id: 'mentoring',
    title: 'Mentoring a Junior Engineer',
    description: 'Guide a junior engineer through a career or technical challenge',
    category: 'work',
    difficulty: 'medium',
    aiRole: 'a junior engineer seeking mentorship',
    context: 'You are a junior engineer feeling stuck on a technical problem and uncertain about your career growth. Ask the user (your mentor) for guidance. Require them to explain clearly, show empathy, and give actionable, nuanced advice.',
    level: 'C2',
  },
];

export function getScenarioById(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}

export function getScenariosByCategory(category: Scenario['category']): Scenario[] {
  return scenarios.filter((s) => s.category === category);
}

export function getScenariosByLevel(level: string): Scenario[] {
  return scenarios.filter((s) => s.level === level);
}
