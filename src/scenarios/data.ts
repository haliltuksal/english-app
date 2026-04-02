export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: 'work' | 'daily' | 'technical';
  difficulty: 'easy' | 'medium' | 'hard';
  aiRole: string;
  context: string;
}

export const scenarios: Scenario[] = [
  // Work
  {
    id: 'job-interview',
    title: 'Job Interview',
    description: 'Practice answering common interview questions',
    category: 'work',
    difficulty: 'hard',
    aiRole: 'a senior hiring manager at a tech company',
    context: 'You are conducting a technical job interview for a software developer position. Ask about experience, projects, and technical skills.',
  },
  {
    id: 'standup',
    title: 'Daily Standup',
    description: 'Report your progress in a daily meeting',
    category: 'work',
    difficulty: 'easy',
    aiRole: 'a friendly tech lead running the daily standup',
    context: 'You are leading a daily standup meeting. Ask team members what they did yesterday, what they plan to do today, and if they have any blockers.',
  },
  {
    id: 'code-review',
    title: 'Code Review',
    description: 'Discuss code changes with a colleague',
    category: 'work',
    difficulty: 'medium',
    aiRole: 'a senior developer reviewing a pull request',
    context: 'You are reviewing the user\'s pull request. Ask about design decisions, suggest improvements, and discuss trade-offs.',
  },
  {
    id: 'email-writing',
    title: 'Email Writing',
    description: 'Draft professional emails together',
    category: 'work',
    difficulty: 'medium',
    aiRole: 'a colleague helping draft a professional email',
    context: 'Help the user compose a professional email. Ask who the email is for, what the purpose is, and help them write it step by step.',
  },
  {
    id: 'pair-programming',
    title: 'Pair Programming',
    description: 'Solve a coding problem while communicating',
    category: 'work',
    difficulty: 'hard',
    aiRole: 'a pair programming partner',
    context: 'You are pair programming with the user. Discuss approaches, ask about their thought process, and collaborate on solving a problem.',
  },
  // Daily
  {
    id: 'restaurant',
    title: 'At a Restaurant',
    description: 'Order food and interact with a waiter',
    category: 'daily',
    difficulty: 'easy',
    aiRole: 'a friendly waiter at a restaurant',
    context: 'You are a waiter at a casual restaurant. Greet the customer, describe the specials, take their order, and make small talk.',
  },
  {
    id: 'directions',
    title: 'Asking for Directions',
    description: 'Navigate a new city by asking locals',
    category: 'daily',
    difficulty: 'easy',
    aiRole: 'a helpful local on the street',
    context: 'The user is a tourist asking for directions. Give clear directions using landmarks, street names, and distance estimates.',
  },
  {
    id: 'meeting-people',
    title: 'Meeting New People',
    description: 'Introduce yourself and make small talk',
    category: 'daily',
    difficulty: 'easy',
    aiRole: 'someone at a tech meetup',
    context: 'You just met the user at a tech meetup. Make small talk, ask about their work, hobbies, and interests.',
  },
  {
    id: 'shopping',
    title: 'Shopping',
    description: 'Buy things at a store, ask about products',
    category: 'daily',
    difficulty: 'easy',
    aiRole: 'a store assistant',
    context: 'You are a helpful store assistant. Help the customer find what they need, describe products, suggest alternatives, and handle payment.',
  },
  // Technical
  {
    id: 'pr-description',
    title: 'PR Description',
    description: 'Write and explain pull request descriptions',
    category: 'technical',
    difficulty: 'medium',
    aiRole: 'a team lead who reviews PR descriptions',
    context: 'Help the user write clear PR descriptions. Ask what changes they made, why, and how to test them. Give feedback on clarity.',
  },
  {
    id: 'bug-report',
    title: 'Bug Report',
    description: 'Report and describe bugs clearly',
    category: 'technical',
    difficulty: 'medium',
    aiRole: 'a QA engineer receiving a bug report',
    context: 'The user is reporting a bug. Ask for steps to reproduce, expected vs actual behavior, environment details, and severity.',
  },
  {
    id: 'slack-message',
    title: 'Slack Messages',
    description: 'Write clear async messages to teammates',
    category: 'technical',
    difficulty: 'easy',
    aiRole: 'a remote teammate on Slack',
    context: 'You are chatting with the user on Slack. Discuss work topics, ask for updates, share information. Keep messages concise like real Slack.',
  },
  {
    id: 'documentation',
    title: 'Writing Documentation',
    description: 'Write technical docs and READMEs',
    category: 'technical',
    difficulty: 'hard',
    aiRole: 'a tech writer reviewing documentation',
    context: 'Help the user write clear technical documentation. Ask what they want to document, for whom, and give feedback on clarity and structure.',
  },
];

export function getScenarioById(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}

export function getScenariosByCategory(category: Scenario['category']): Scenario[] {
  return scenarios.filter((s) => s.category === category);
}
