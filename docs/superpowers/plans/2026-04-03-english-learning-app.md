# English Learning App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a conversation-focused English learning iOS app with AI chat, vocabulary tracking, and spaced repetition.

**Architecture:** Expo (React Native) app with file-based routing (expo-router). All data stored locally in SQLite. AI conversations via Google Gemini Flash free API. No backend.

**Tech Stack:** Expo SDK 52, TypeScript, expo-router, expo-sqlite, expo-speech, expo-secure-store, @google/generative-ai

---

## File Structure

```
english-app/
├── app/
│   ├── _layout.tsx               # Root layout — tab navigator (Chat, Vocabulary, Settings)
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab bar configuration
│   │   ├── index.tsx             # Chat Picker (home/default tab)
│   │   ├── vocabulary.tsx        # Vocabulary notebook screen
│   │   └── settings.tsx          # API key input screen
│   └── chat/
│       └── [id].tsx              # Chat screen (dynamic route)
├── src/
│   ├── db/
│   │   ├── database.ts           # SQLite init + migration
│   │   └── queries.ts            # All CRUD operations
│   ├── ai/
│   │   ├── gemini.ts             # Gemini API client
│   │   ├── prompts.ts            # System prompts per scenario
│   │   └── parser.ts             # Parse AI response into parts
│   ├── scenarios/
│   │   └── data.ts               # Scenario definitions
│   ├── components/
│   │   ├── ChatBubble.tsx        # Single message bubble with correction/word
│   │   ├── ScenarioCard.tsx      # Scenario card for picker list
│   │   ├── FlashCard.tsx         # Vocabulary review flashcard
│   │   └── StreakBar.tsx         # Minimal streak + word count bar
│   ├── hooks/
│   │   ├── useChat.ts            # Chat state + send/receive logic
│   │   └── useVocabulary.ts      # Vocabulary list + review logic
│   └── utils/
│       └── spaced-repetition.ts  # SM-2 algorithm (pure function)
├── __tests__/
│   ├── parser.test.ts
│   ├── spaced-repetition.test.ts
│   └── prompts.test.ts
├── app.json
├── package.json
└── tsconfig.json
```

---

## Task 1: Project Setup

**Files:**
- Create: `app.json`, `package.json`, `tsconfig.json`, `.gitignore`

- [ ] **Step 1: Create Expo project**

```bash
cd /Users/halil.tuksal/Projects/english-app
npx create-expo-app@latest . --template blank-typescript
```

If the directory isn't empty, move the `docs` folder out, create the project, then move `docs` back in.

- [ ] **Step 2: Install dependencies**

```bash
npx expo install expo-router expo-sqlite expo-speech expo-secure-store @google/generative-ai
npx expo install expo-constants expo-linking expo-status-bar react-native-safe-area-context react-native-screens react-native-gesture-handler
npm install --save-dev jest @types/jest ts-jest
```

- [ ] **Step 3: Configure expo-router in app.json**

Update `app.json`:
```json
{
  "expo": {
    "name": "English Coach",
    "slug": "english-coach",
    "version": "1.0.0",
    "scheme": "english-coach",
    "platforms": ["ios"],
    "ios": {
      "bundleIdentifier": "com.halil.englishcoach",
      "supportsTablet": true
    },
    "plugins": ["expo-router", "expo-sqlite", "expo-speech", "expo-secure-store"],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

- [ ] **Step 4: Configure Jest**

Add to `package.json`:
```json
{
  "scripts": {
    "test": "jest"
  },
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "testMatch": ["**/__tests__/**/*.test.ts"]
  }
}
```

- [ ] **Step 5: Update .gitignore**

Ensure `.gitignore` includes:
```
node_modules/
.expo/
dist/
ios/
android/
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: initialize Expo project with dependencies"
```

---

## Task 2: Spaced Repetition Algorithm

**Files:**
- Create: `src/utils/spaced-repetition.ts`
- Test: `__tests__/spaced-repetition.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/spaced-repetition.test.ts`:
```typescript
import { calculateNextReview } from '../src/utils/spaced-repetition';

describe('calculateNextReview', () => {
  const baseDate = new Date('2026-04-03T10:00:00Z');

  test('first correct review: interval = 1 day', () => {
    const result = calculateNextReview({
      repetitionCount: 0,
      easeFactor: 2.5,
      correct: true,
      now: baseDate,
    });
    expect(result.repetitionCount).toBe(1);
    expect(result.easeFactor).toBe(2.5);
    expect(result.nextReviewAt).toBe('2026-04-04T10:00:00.000Z');
  });

  test('second correct review: interval = 3 days', () => {
    const result = calculateNextReview({
      repetitionCount: 1,
      easeFactor: 2.5,
      correct: true,
      now: baseDate,
    });
    expect(result.repetitionCount).toBe(2);
    expect(result.nextReviewAt).toBe('2026-04-06T10:00:00.000Z');
  });

  test('third correct review: interval = 3 * 2.5 = 7.5 -> 8 days', () => {
    const result = calculateNextReview({
      repetitionCount: 2,
      easeFactor: 2.5,
      correct: true,
      now: baseDate,
    });
    expect(result.repetitionCount).toBe(3);
    expect(result.nextReviewAt).toBe('2026-04-11T10:00:00.000Z');
  });

  test('incorrect answer resets to 1 day, lowers ease factor', () => {
    const result = calculateNextReview({
      repetitionCount: 5,
      easeFactor: 2.5,
      correct: false,
      now: baseDate,
    });
    expect(result.repetitionCount).toBe(0);
    expect(result.easeFactor).toBe(2.3);
    expect(result.nextReviewAt).toBe('2026-04-04T10:00:00.000Z');
  });

  test('ease factor does not go below 1.3', () => {
    const result = calculateNextReview({
      repetitionCount: 3,
      easeFactor: 1.3,
      correct: false,
      now: baseDate,
    });
    expect(result.easeFactor).toBe(1.3);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest __tests__/spaced-repetition.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement SM-2 algorithm**

Create `src/utils/spaced-repetition.ts`:
```typescript
interface ReviewInput {
  repetitionCount: number;
  easeFactor: number;
  correct: boolean;
  now?: Date;
}

interface ReviewResult {
  repetitionCount: number;
  easeFactor: number;
  nextReviewAt: string;
}

export function calculateNextReview(input: ReviewInput): ReviewResult {
  const now = input.now ?? new Date();
  let { repetitionCount, easeFactor } = input;

  if (input.correct) {
    repetitionCount += 1;
  } else {
    easeFactor = Math.max(1.3, easeFactor - 0.2);
    repetitionCount = 0;
  }

  let intervalDays: number;
  if (repetitionCount <= 1) {
    intervalDays = 1;
  } else if (repetitionCount === 2) {
    intervalDays = 3;
  } else {
    // For rep 3+: previous interval * easeFactor
    // rep 2 interval = 3, so rep 3 = round(3 * easeFactor)
    let prev = 3;
    for (let i = 3; i <= repetitionCount; i++) {
      prev = Math.round(prev * easeFactor);
    }
    intervalDays = prev;
  }

  const nextDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  return {
    repetitionCount,
    easeFactor,
    nextReviewAt: nextDate.toISOString(),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest __tests__/spaced-repetition.test.ts
```

Expected: all 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/spaced-repetition.ts __tests__/spaced-repetition.test.ts
git commit -m "feat: add SM-2 spaced repetition algorithm with tests"
```

---

## Task 3: AI Response Parser

**Files:**
- Create: `src/ai/parser.ts`
- Test: `__tests__/parser.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/parser.test.ts`:
```typescript
import { parseAIResponse } from '../src/ai/parser';

describe('parseAIResponse', () => {
  test('parses full response with correction and new word', () => {
    const raw = `That sounds great! Tell me more about the project you worked on.
---
Correction: "I worked on fixing" (not "worked on fix")
New word: deadline — son teslim tarihi`;

    const result = parseAIResponse(raw);
    expect(result.content).toBe('That sounds great! Tell me more about the project you worked on.');
    expect(result.correction).toBe('"I worked on fixing" (not "worked on fix")');
    expect(result.newWord).toBe('deadline — son teslim tarihi');
  });

  test('parses response with Great! correction', () => {
    const raw = `Perfect explanation! What tools did you use?
---
Correction: Great!
New word: scalable — ölçeklenebilir`;

    const result = parseAIResponse(raw);
    expect(result.content).toBe('Perfect explanation! What tools did you use?');
    expect(result.correction).toBeNull();
    expect(result.newWord).toBe('scalable — ölçeklenebilir');
  });

  test('handles response without separator (fallback)', () => {
    const raw = 'Hello! How are you today?';
    const result = parseAIResponse(raw);
    expect(result.content).toBe('Hello! How are you today?');
    expect(result.correction).toBeNull();
    expect(result.newWord).toBeNull();
  });

  test('handles multiline content before separator', () => {
    const raw = `That's a good point.

I think we should discuss this further in the next meeting.
---
Correction: Great!
New word: agenda — gündem`;

    const result = parseAIResponse(raw);
    expect(result.content).toBe("That's a good point.\n\nI think we should discuss this further in the next meeting.");
    expect(result.newWord).toBe('agenda — gündem');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest __tests__/parser.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement parser**

Create `src/ai/parser.ts`:
```typescript
export interface ParsedResponse {
  content: string;
  correction: string | null;
  newWord: string | null;
}

export function parseAIResponse(raw: string): ParsedResponse {
  const separatorIndex = raw.indexOf('\n---\n');

  if (separatorIndex === -1) {
    return { content: raw.trim(), correction: null, newWord: null };
  }

  const content = raw.substring(0, separatorIndex).trim();
  const metaSection = raw.substring(separatorIndex + 5);

  let correction: string | null = null;
  let newWord: string | null = null;

  for (const line of metaSection.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('Correction:')) {
      const value = trimmed.substring('Correction:'.length).trim();
      correction = value.toLowerCase() === 'great!' ? null : value;
    } else if (trimmed.startsWith('New word:')) {
      newWord = trimmed.substring('New word:'.length).trim();
    }
  }

  return { content, correction, newWord };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest __tests__/parser.test.ts
```

Expected: all 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ai/parser.ts __tests__/parser.test.ts
git commit -m "feat: add AI response parser with tests"
```

---

## Task 4: Scenario Data + System Prompts

**Files:**
- Create: `src/scenarios/data.ts`, `src/ai/prompts.ts`
- Test: `__tests__/prompts.test.ts`

- [ ] **Step 1: Create scenario definitions**

Create `src/scenarios/data.ts`:
```typescript
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
```

- [ ] **Step 2: Write failing tests for prompts**

Create `__tests__/prompts.test.ts`:
```typescript
import { buildSystemPrompt } from '../src/ai/prompts';

describe('buildSystemPrompt', () => {
  test('builds prompt for a scenario', () => {
    const prompt = buildSystemPrompt({
      id: 'standup',
      title: 'Daily Standup',
      description: 'Report your progress',
      category: 'work',
      difficulty: 'easy',
      aiRole: 'a friendly tech lead running the daily standup',
      context: 'You are leading a daily standup meeting.',
    });

    expect(prompt).toContain('a friendly tech lead running the daily standup');
    expect(prompt).toContain('Turkish');
    expect(prompt).toContain('Correction');
    expect(prompt).toContain('New word');
  });

  test('builds prompt for free chat (no scenario)', () => {
    const prompt = buildSystemPrompt(null);
    expect(prompt).toContain('English conversation partner');
    expect(prompt).toContain('Turkish');
    expect(prompt).toContain('Correction');
    expect(prompt).toContain('New word');
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npx jest __tests__/prompts.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement system prompts**

Create `src/ai/prompts.ts`:
```typescript
import { Scenario } from '../scenarios/data';

export function buildSystemPrompt(scenario: Scenario | null): string {
  const roleDescription = scenario
    ? `You are ${scenario.aiRole}. ${scenario.context}`
    : 'You are a friendly English conversation partner. Talk about any topic the user wants.';

  return `${roleDescription}

IMPORTANT RULES:
1. The user is a Turkish-speaking software developer learning English at B1-B2 level.
2. Use clear, natural English. Gradually increase complexity as the conversation progresses.
3. Keep the conversation going — ask follow-up questions, share related thoughts, advance the topic.
4. Be encouraging and supportive, not pedantic.

RESPONSE FORMAT (follow this exactly for every message):
Write your natural response first. Then add a separator and metadata:

[Your natural conversational response here]
---
Correction: [If the user made a grammar or vocabulary mistake, explain the correction briefly. If no mistakes, write "Great!"]
New word: [Pick ONE useful English word or phrase from YOUR response and provide its Turkish meaning, like: "deadline — son teslim tarihi"]

RULES FOR CORRECTIONS:
- Only correct clear mistakes, not style preferences
- Be brief: show the correct form and the wrong form
- Example: "worked on fixing" (not "worked on fix")

RULES FOR NEW WORDS:
- Pick words the user likely doesn't know yet
- Prefer practical, commonly used words
- Always include the Turkish meaning after a dash
- Pick from YOUR response, not the user's message

When the user sends "end" or you've exchanged 15+ messages, provide a conversation summary:
📊 **Conversation Summary**
- **Topic:** [what you talked about]
- **New words:** [list all new words from the conversation with Turkish meanings]
- **Mistakes:** [common patterns in user's mistakes]
- **Tip:** [one specific suggestion for improvement]
- **Keep it up!** [encouraging closing message]`;
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx jest __tests__/prompts.test.ts
```

Expected: all 2 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/scenarios/data.ts src/ai/prompts.ts __tests__/prompts.test.ts
git commit -m "feat: add scenario definitions and system prompt builder"
```

---

## Task 5: Database Layer

**Files:**
- Create: `src/db/database.ts`, `src/db/queries.ts`

- [ ] **Step 1: Create database initialization + migration**

Create `src/db/database.ts`:
```typescript
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('english-coach.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scenario_type TEXT NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      message_count INTEGER NOT NULL DEFAULT 0,
      summary TEXT
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'ai')),
      content TEXT NOT NULL,
      correction TEXT,
      new_word TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    );

    CREATE TABLE IF NOT EXISTS vocabulary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL,
      turkish_meaning TEXT NOT NULL,
      example_sentence TEXT,
      conversation_id INTEGER,
      next_review_at TEXT NOT NULL,
      ease_factor REAL NOT NULL DEFAULT 2.5,
      repetition_count INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    );
  `);

  return db;
}
```

- [ ] **Step 2: Create query functions**

Create `src/db/queries.ts`:
```typescript
import { getDatabase } from './database';

// --- Conversations ---

export interface ConversationRow {
  id: number;
  scenario_type: string;
  started_at: string;
  ended_at: string | null;
  message_count: number;
  summary: string | null;
}

export async function createConversation(scenarioType: string): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO conversations (scenario_type, started_at, message_count) VALUES (?, ?, 0)',
    scenarioType,
    new Date().toISOString()
  );
  return result.lastInsertRowId;
}

export async function getRecentConversations(limit = 10): Promise<ConversationRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<ConversationRow>(
    'SELECT * FROM conversations ORDER BY started_at DESC LIMIT ?',
    limit
  );
}

export async function getActiveConversations(): Promise<ConversationRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<ConversationRow>(
    'SELECT * FROM conversations WHERE ended_at IS NULL ORDER BY started_at DESC'
  );
}

export async function endConversation(id: number, summary: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE conversations SET ended_at = ?, summary = ? WHERE id = ?',
    new Date().toISOString(),
    summary,
    id
  );
}

export async function incrementMessageCount(conversationId: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE conversations SET message_count = message_count + 1 WHERE id = ?',
    conversationId
  );
}

// --- Messages ---

export interface MessageRow {
  id: number;
  conversation_id: number;
  role: 'user' | 'ai';
  content: string;
  correction: string | null;
  new_word: string | null;
  created_at: string;
}

export async function addMessage(
  conversationId: number,
  role: 'user' | 'ai',
  content: string,
  correction: string | null = null,
  newWord: string | null = null
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO messages (conversation_id, role, content, correction, new_word, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    conversationId,
    role,
    content,
    correction,
    newWord,
    new Date().toISOString()
  );
  await incrementMessageCount(conversationId);
  return result.lastInsertRowId;
}

export async function getMessages(conversationId: number): Promise<MessageRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<MessageRow>(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
    conversationId
  );
}

export async function getMessageCount(conversationId: number): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM messages WHERE conversation_id = ?',
    conversationId
  );
  return row?.count ?? 0;
}

// --- Vocabulary ---

export interface VocabularyRow {
  id: number;
  word: string;
  turkish_meaning: string;
  example_sentence: string | null;
  conversation_id: number | null;
  next_review_at: string;
  ease_factor: number;
  repetition_count: number;
}

export async function addVocabulary(
  word: string,
  turkishMeaning: string,
  exampleSentence: string | null,
  conversationId: number | null
): Promise<number> {
  const db = await getDatabase();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const result = await db.runAsync(
    'INSERT INTO vocabulary (word, turkish_meaning, example_sentence, conversation_id, next_review_at) VALUES (?, ?, ?, ?, ?)',
    word,
    turkishMeaning,
    exampleSentence,
    conversationId,
    tomorrow.toISOString()
  );
  return result.lastInsertRowId;
}

export async function getAllVocabulary(): Promise<VocabularyRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<VocabularyRow>(
    'SELECT * FROM vocabulary ORDER BY next_review_at ASC'
  );
}

export async function getDueVocabulary(): Promise<VocabularyRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<VocabularyRow>(
    'SELECT * FROM vocabulary WHERE next_review_at <= ? ORDER BY next_review_at ASC',
    new Date().toISOString()
  );
}

export async function updateVocabularyReview(
  id: number,
  nextReviewAt: string,
  easeFactor: number,
  repetitionCount: number
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE vocabulary SET next_review_at = ?, ease_factor = ?, repetition_count = ? WHERE id = ?',
    nextReviewAt,
    easeFactor,
    repetitionCount,
    id
  );
}

export async function getTotalWordsLearned(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM vocabulary'
  );
  return row?.count ?? 0;
}

export async function getStreak(): Promise<number> {
  const db = await getDatabase();
  // Count consecutive days with at least one conversation, going back from today
  const rows = await db.getAllAsync<{ day: string }>(
    `SELECT DISTINCT date(started_at) as day FROM conversations ORDER BY day DESC`
  );

  if (rows.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < rows.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedStr = expectedDate.toISOString().split('T')[0];

    if (rows[i].day === expectedStr) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/db/database.ts src/db/queries.ts
git commit -m "feat: add SQLite database layer with conversations, messages, vocabulary queries"
```

---

## Task 6: Gemini API Client

**Files:**
- Create: `src/ai/gemini.ts`

- [ ] **Step 1: Implement Gemini client**

Create `src/ai/gemini.ts`:
```typescript
import { GoogleGenerativeAI, Content } from '@google/generative-ai';
import * as SecureStore from 'expo-secure-store';
import { buildSystemPrompt } from './prompts';
import { Scenario } from '../scenarios/data';

const API_KEY_STORE = 'gemini_api_key';

export async function getApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(API_KEY_STORE);
}

export async function setApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(API_KEY_STORE, key);
}

export async function deleteApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(API_KEY_STORE);
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export async function sendMessage(
  scenario: Scenario | null,
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('API key not set. Please add your Gemini API key in Settings.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const systemPrompt = buildSystemPrompt(scenario);

  const contents: Content[] = history.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));

  const chat = model.startChat({
    history: contents,
    systemInstruction: systemPrompt,
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}
```

- [ ] **Step 2: Commit**

```bash
git add src/ai/gemini.ts
git commit -m "feat: add Gemini API client with secure key storage"
```

---

## Task 7: Navigation + Layout

**Files:**
- Create: `app/_layout.tsx`, `app/(tabs)/_layout.tsx`

- [ ] **Step 1: Create root layout**

Create `app/_layout.tsx`:
```typescript
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="chat/[id]"
        options={{
          headerShown: true,
          headerTitle: 'Chat',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
```

- [ ] **Step 2: Create tab layout**

Create `app/(tabs)/_layout.tsx`:
```typescript
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="vocabulary"
        options={{
          title: 'Words',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/_layout.tsx app/\(tabs\)/_layout.tsx
git commit -m "feat: add navigation with tabs (chat, vocabulary, settings)"
```

---

## Task 8: Shared Components

**Files:**
- Create: `src/components/StreakBar.tsx`, `src/components/ScenarioCard.tsx`, `src/components/ChatBubble.tsx`, `src/components/FlashCard.tsx`

- [ ] **Step 1: Create StreakBar component**

Create `src/components/StreakBar.tsx`:
```typescript
import { View, Text, StyleSheet } from 'react-native';

interface StreakBarProps {
  streak: number;
  wordsLearned: number;
}

export function StreakBar({ streak, wordsLearned }: StreakBarProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.item}>🔥 {streak} day streak</Text>
      <Text style={styles.item}>📚 {wordsLearned} words</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  item: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
});
```

- [ ] **Step 2: Create ScenarioCard component**

Create `src/components/ScenarioCard.tsx`:
```typescript
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Scenario } from '../scenarios/data';

interface ScenarioCardProps {
  scenario: Scenario;
  onPress: () => void;
}

const difficultyColors = {
  easy: '#4CAF50',
  medium: '#FF9800',
  hard: '#F44336',
};

export function ScenarioCard({ scenario, onPress }: ScenarioCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{scenario.title}</Text>
        <View style={[styles.badge, { backgroundColor: difficultyColors[scenario.difficulty] }]}>
          <Text style={styles.badgeText}>{scenario.difficulty}</Text>
        </View>
      </View>
      <Text style={styles.description}>{scenario.description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },
  description: {
    fontSize: 13,
    color: '#777',
  },
});
```

- [ ] **Step 3: Create ChatBubble component**

Create `src/components/ChatBubble.tsx`:
```typescript
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';

interface ChatBubbleProps {
  role: 'user' | 'ai';
  content: string;
  correction: string | null;
  newWord: string | null;
}

export function ChatBubble({ role, content, correction, newWord }: ChatBubbleProps) {
  const isUser = role === 'user';

  const speakWord = (text: string) => {
    // Extract just the English word (before the dash)
    const englishPart = text.split('—')[0].trim().split(' — ')[0].trim();
    Speech.speak(englishPart, { language: 'en-US', rate: 0.8 });
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.aiText]}>{content}</Text>
      </View>
      {!isUser && (correction || newWord) && (
        <View style={styles.metaContainer}>
          {correction && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>✏️ </Text>
              <Text style={styles.metaText}>{correction}</Text>
            </View>
          )}
          {newWord && (
            <TouchableOpacity style={styles.metaRow} onPress={() => speakWord(newWord)}>
              <Text style={styles.metaLabel}>💡 </Text>
              <Text style={styles.metaText}>{newWord}</Text>
              <Text style={styles.speakIcon}> 🔊</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  aiContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#E9E9EB',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFF',
  },
  aiText: {
    color: '#333',
  },
  metaContainer: {
    maxWidth: '80%',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0E6CC',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  metaLabel: {
    fontSize: 13,
  },
  metaText: {
    fontSize: 13,
    color: '#555',
    flex: 1,
  },
  speakIcon: {
    fontSize: 13,
  },
});
```

- [ ] **Step 4: Create FlashCard component**

Create `src/components/FlashCard.tsx`:
```typescript
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import { useState } from 'react';

interface FlashCardProps {
  word: string;
  turkishMeaning: string;
  exampleSentence: string | null;
  onCorrect: () => void;
  onIncorrect: () => void;
}

export function FlashCard({ word, turkishMeaning, exampleSentence, onCorrect, onIncorrect }: FlashCardProps) {
  const [revealed, setRevealed] = useState(false);

  const speak = () => {
    Speech.speak(word, { language: 'en-US', rate: 0.8 });
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={speak}>
        <Text style={styles.word}>{word} 🔊</Text>
      </TouchableOpacity>

      {exampleSentence && <Text style={styles.example}>"{exampleSentence}"</Text>}

      {!revealed ? (
        <TouchableOpacity style={styles.revealButton} onPress={() => setRevealed(true)}>
          <Text style={styles.revealButtonText}>Show Meaning</Text>
        </TouchableOpacity>
      ) : (
        <>
          <Text style={styles.meaning}>{turkishMeaning}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.incorrectButton]} onPress={onIncorrect}>
              <Text style={styles.buttonText}>Bilmiyordum ❌</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.correctButton]} onPress={onCorrect}>
              <Text style={styles.buttonText}>Biliyordum ✅</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  word: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  example: {
    fontSize: 15,
    color: '#777',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
  },
  meaning: {
    fontSize: 22,
    fontWeight: '600',
    color: '#007AFF',
    marginVertical: 16,
  },
  revealButton: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  revealButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  incorrectButton: {
    backgroundColor: '#FFEBEE',
  },
  correctButton: {
    backgroundColor: '#E8F5E9',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
```

- [ ] **Step 5: Commit**

```bash
git add src/components/
git commit -m "feat: add StreakBar, ScenarioCard, ChatBubble, FlashCard components"
```

---

## Task 9: useChat Hook

**Files:**
- Create: `src/hooks/useChat.ts`

- [ ] **Step 1: Implement chat hook**

Create `src/hooks/useChat.ts`:
```typescript
import { useState, useEffect, useCallback } from 'react';
import { getScenarioById, Scenario } from '../scenarios/data';
import { sendMessage, ChatMessage } from '../ai/gemini';
import { parseAIResponse, ParsedResponse } from '../ai/parser';
import * as queries from '../db/queries';

export interface DisplayMessage {
  id: number;
  role: 'user' | 'ai';
  content: string;
  correction: string | null;
  newWord: string | null;
}

export function useChat(conversationId: number, scenarioType: string) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scenario: Scenario | null = scenarioType === 'free'
    ? null
    : getScenarioById(scenarioType) ?? null;

  // Load existing messages on mount
  useEffect(() => {
    (async () => {
      const rows = await queries.getMessages(conversationId);
      setMessages(rows.map((r) => ({
        id: r.id,
        role: r.role,
        content: r.content,
        correction: r.correction,
        newWord: r.new_word,
      })));
    })();
  }, [conversationId]);

  // Send initial AI greeting if no messages yet
  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
      sendInitialGreeting();
    }
  }, []);

  const sendInitialGreeting = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const greeting = await sendMessage(scenario, [], 'Start the conversation. Greet the user and set the scene.');
      const parsed = parseAIResponse(greeting);
      const msgId = await queries.addMessage(
        conversationId, 'ai', parsed.content, parsed.correction, parsed.newWord
      );
      if (parsed.newWord) {
        await saveWord(parsed.newWord, parsed.content);
      }
      setMessages([{
        id: msgId, role: 'ai', content: parsed.content,
        correction: parsed.correction, newWord: parsed.newWord,
      }]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, scenario]);

  const send = useCallback(async (text: string) => {
    if (isLoading || isEnded) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    setError(null);

    // Check if user wants to end
    const wantsEnd = trimmed.toLowerCase() === 'end';

    // Save user message
    const userMsgId = await queries.addMessage(conversationId, 'user', trimmed);
    const userMsg: DisplayMessage = {
      id: userMsgId, role: 'user', content: trimmed,
      correction: null, newWord: null,
    };
    setMessages((prev) => [...prev, userMsg]);

    setIsLoading(true);

    try {
      // Build history for API
      const currentMessages = await queries.getMessages(conversationId);
      const history: ChatMessage[] = currentMessages.slice(0, -1).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.role === 'user' ? m.content : `${m.content}${m.correction ? `\n---\nCorrection: ${m.correction}` : ''}${m.new_word ? `\nNew word: ${m.new_word}` : ''}`,
      }));

      // Check message count for auto-summary
      const msgCount = currentMessages.length;
      let userText = trimmed;
      if (wantsEnd || msgCount >= 15) {
        userText = wantsEnd ? trimmed : trimmed + '\n\n[This is message 15+. Please provide the conversation summary after your response.]';
      }

      const response = await sendMessage(scenario, history, userText);
      const parsed = parseAIResponse(response);

      const aiMsgId = await queries.addMessage(
        conversationId, 'ai', parsed.content, parsed.correction, parsed.newWord
      );

      if (parsed.newWord) {
        await saveWord(parsed.newWord, parsed.content);
      }

      const aiMsg: DisplayMessage = {
        id: aiMsgId, role: 'ai', content: parsed.content,
        correction: parsed.correction, newWord: parsed.newWord,
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (wantsEnd || msgCount >= 15) {
        setIsEnded(true);
        await queries.endConversation(conversationId, parsed.content);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, scenario, isLoading, isEnded]);

  return { messages, isLoading, isEnded, error, send };
}

async function saveWord(newWordStr: string, context: string): Promise<void> {
  // Parse "word — meaning" format
  const dashIndex = newWordStr.indexOf('—') !== -1
    ? newWordStr.indexOf('—')
    : newWordStr.indexOf(' — ') !== -1
      ? newWordStr.indexOf(' — ')
      : newWordStr.indexOf('-');

  if (dashIndex === -1) return;

  const word = newWordStr.substring(0, dashIndex).trim();
  const meaning = newWordStr.substring(dashIndex + 1).trim().replace(/^—\s*/, '');

  if (word && meaning) {
    await queries.addVocabulary(word, meaning, context, null);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useChat.ts
git commit -m "feat: add useChat hook with message send/receive and auto vocabulary save"
```

---

## Task 10: useVocabulary Hook

**Files:**
- Create: `src/hooks/useVocabulary.ts`

- [ ] **Step 1: Implement vocabulary hook**

Create `src/hooks/useVocabulary.ts`:
```typescript
import { useState, useEffect, useCallback } from 'react';
import * as queries from '../db/queries';
import { VocabularyRow } from '../db/queries';
import { calculateNextReview } from '../utils/spaced-repetition';

export function useVocabulary() {
  const [allWords, setAllWords] = useState<VocabularyRow[]>([]);
  const [dueWords, setDueWords] = useState<VocabularyRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const [all, due] = await Promise.all([
      queries.getAllVocabulary(),
      queries.getDueVocabulary(),
    ]);
    setAllWords(all);
    setDueWords(due);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const reviewWord = useCallback(async (word: VocabularyRow, correct: boolean) => {
    const result = calculateNextReview({
      repetitionCount: word.repetition_count,
      easeFactor: word.ease_factor,
      correct,
    });

    await queries.updateVocabularyReview(
      word.id,
      result.nextReviewAt,
      result.easeFactor,
      result.repetitionCount
    );

    await refresh();
  }, [refresh]);

  return { allWords, dueWords, isLoading, refresh, reviewWord };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useVocabulary.ts
git commit -m "feat: add useVocabulary hook with spaced repetition review"
```

---

## Task 11: Chat Picker Screen (Home)

**Files:**
- Create: `app/(tabs)/index.tsx`

- [ ] **Step 1: Implement chat picker screen**

Create `app/(tabs)/index.tsx`:
```typescript
import { View, Text, SectionList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { StreakBar } from '../../src/components/StreakBar';
import { ScenarioCard } from '../../src/components/ScenarioCard';
import { scenarios, Scenario } from '../../src/scenarios/data';
import * as queries from '../../src/db/queries';
import { getDatabase } from '../../src/db/database';
import { useFocusEffect } from 'expo-router';

interface ActiveConversation {
  id: number;
  scenario_type: string;
  message_count: number;
}

export default function ChatPickerScreen() {
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [wordsLearned, setWordsLearned] = useState(0);
  const [activeConversations, setActiveConversations] = useState<ActiveConversation[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    await getDatabase(); // ensure DB is initialized
    const [s, w, active] = await Promise.all([
      queries.getStreak(),
      queries.getTotalWordsLearned(),
      queries.getActiveConversations(),
    ]);
    setStreak(s);
    setWordsLearned(w);
    setActiveConversations(active);
  };

  const startConversation = async (scenarioType: string) => {
    await getDatabase();
    const id = await queries.createConversation(scenarioType);
    router.push(`/chat/${id}?scenario=${scenarioType}`);
  };

  const resumeConversation = (conv: ActiveConversation) => {
    router.push(`/chat/${conv.id}?scenario=${conv.scenario_type}`);
  };

  const categories: { title: string; key: Scenario['category'] }[] = [
    { title: '💼 Work', key: 'work' },
    { title: '🗣️ Daily', key: 'daily' },
    { title: '⚙️ Technical', key: 'technical' },
  ];

  const sections = categories.map((cat) => ({
    title: cat.title,
    data: scenarios.filter((s) => s.category === cat.key),
  }));

  return (
    <View style={styles.container}>
      <StreakBar streak={streak} wordsLearned={wordsLearned} />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            {activeConversations.length > 0 && (
              <View style={styles.activeSection}>
                <Text style={styles.activeSectionTitle}>Continue Conversation</Text>
                {activeConversations.map((conv) => (
                  <TouchableOpacity
                    key={conv.id}
                    style={styles.activeCard}
                    onPress={() => resumeConversation(conv)}
                  >
                    <Text style={styles.activeCardTitle}>
                      {conv.scenario_type === 'free' ? 'Free Chat' : conv.scenario_type}
                    </Text>
                    <Text style={styles.activeCardMeta}>{conv.message_count} messages</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.freeChat}
              onPress={() => startConversation('free')}
            >
              <Text style={styles.freeChatText}>💬 Free Chat</Text>
              <Text style={styles.freeChatSub}>Talk about anything you want</Text>
            </TouchableOpacity>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <ScenarioCard
            scenario={item}
            onPress={() => startConversation(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  list: {
    paddingBottom: 20,
  },
  activeSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  activeSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  activeCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1976D2',
  },
  activeCardMeta: {
    fontSize: 13,
    color: '#64B5F6',
  },
  freeChat: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  freeChatText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  freeChatSub: {
    fontSize: 13,
    color: '#B3D9FF',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/\(tabs\)/index.tsx
git commit -m "feat: add chat picker home screen with scenarios and active conversations"
```

---

## Task 12: Chat Screen

**Files:**
- Create: `app/chat/[id].tsx`

- [ ] **Step 1: Implement chat screen**

Create `app/chat/[id].tsx`:
```typescript
import { View, TextInput, FlatList, StyleSheet, TouchableOpacity, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useRef } from 'react';
import { ChatBubble } from '../../src/components/ChatBubble';
import { useChat } from '../../src/hooks/useChat';

export default function ChatScreen() {
  const { id, scenario } = useLocalSearchParams<{ id: string; scenario: string }>();
  const conversationId = parseInt(id, 10);
  const scenarioType = scenario ?? 'free';

  const { messages, isLoading, isEnded, error, send } = useChat(conversationId, scenarioType);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    send(inputText);
    setInputText('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ChatBubble
            role={item.role}
            content={item.content}
            correction={item.correction}
            newWord={item.newWord}
          />
        )}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {isLoading && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>Typing...</Text>
        </View>
      )}

      {isEnded ? (
        <View style={styles.endedBanner}>
          <Text style={styles.endedText}>Conversation ended. Great practice! 🎉</Text>
        </View>
      ) : (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type in English..."
            placeholderTextColor="#999"
            multiline
            editable={!isLoading}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  messageList: {
    paddingVertical: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    paddingBottom: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#B0C4DE',
  },
  sendButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
  },
  typingIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  typingText: {
    color: '#999',
    fontStyle: 'italic',
  },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    padding: 10,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    textAlign: 'center',
  },
  endedBanner: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    alignItems: 'center',
  },
  endedText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E7D32',
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/chat/
git commit -m "feat: add chat screen with messaging UI and AI integration"
```

---

## Task 13: Vocabulary Screen

**Files:**
- Create: `app/(tabs)/vocabulary.tsx`

- [ ] **Step 1: Implement vocabulary screen**

Create `app/(tabs)/vocabulary.tsx`:
```typescript
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useVocabulary } from '../../src/hooks/useVocabulary';
import { FlashCard } from '../../src/components/FlashCard';
import { VocabularyRow } from '../../src/db/queries';

type Mode = 'list' | 'review';

export default function VocabularyScreen() {
  const { allWords, dueWords, isLoading, refresh, reviewWord } = useVocabulary();
  const [mode, setMode] = useState<Mode>('list');
  const [reviewIndex, setReviewIndex] = useState(0);

  useFocusEffect(
    useCallback(() => {
      refresh();
      setReviewIndex(0);
    }, [])
  );

  const handleReview = async (word: VocabularyRow, correct: boolean) => {
    await reviewWord(word, correct);
    setReviewIndex((prev) => prev + 1);
  };

  if (mode === 'review') {
    if (reviewIndex >= dueWords.length) {
      return (
        <View style={styles.centered}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneText}>All done! No more words to review.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => { setMode('list'); setReviewIndex(0); }}>
            <Text style={styles.backButtonText}>Back to List</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const currentWord = dueWords[reviewIndex];
    return (
      <View style={styles.centered}>
        <Text style={styles.reviewProgress}>
          {reviewIndex + 1} / {dueWords.length}
        </Text>
        <FlashCard
          word={currentWord.word}
          turkishMeaning={currentWord.turkish_meaning}
          exampleSentence={currentWord.example_sentence}
          onCorrect={() => handleReview(currentWord, true)}
          onIncorrect={() => handleReview(currentWord, false)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {dueWords.length > 0 && (
        <TouchableOpacity
          style={styles.reviewBanner}
          onPress={() => { setMode('review'); setReviewIndex(0); }}
        >
          <Text style={styles.reviewBannerText}>
            📝 {dueWords.length} words to review — Start
          </Text>
        </TouchableOpacity>
      )}

      {allWords.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No words yet. Start a conversation to build your vocabulary!</Text>
        </View>
      ) : (
        <FlatList
          data={allWords}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.wordRow}>
              <Text style={styles.wordText}>{item.word}</Text>
              <Text style={styles.meaningText}>{item.turkish_meaning}</Text>
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 20,
  },
  list: {
    paddingBottom: 20,
  },
  reviewBanner: {
    backgroundColor: '#FF9800',
    padding: 14,
    margin: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  reviewBannerText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  wordRow: {
    backgroundColor: '#FFF',
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  meaningText: {
    fontSize: 14,
    color: '#777',
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
  },
  doneEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  doneText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  backButton: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  reviewProgress: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/\(tabs\)/vocabulary.tsx
git commit -m "feat: add vocabulary screen with word list and flashcard review"
```

---

## Task 14: Settings Screen

**Files:**
- Create: `app/(tabs)/settings.tsx`

- [ ] **Step 1: Implement settings screen**

Create `app/(tabs)/settings.tsx`:
```typescript
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { getApiKey, setApiKey, deleteApiKey } from '../../src/ai/gemini';

export default function SettingsScreen() {
  const [key, setKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadKey();
  }, []);

  const loadKey = async () => {
    const stored = await getApiKey();
    if (stored) {
      setHasKey(true);
      setKey(stored);
    }
  };

  const saveKey = async () => {
    if (!key.trim()) {
      Alert.alert('Error', 'Please enter a valid API key');
      return;
    }
    await setApiKey(key.trim());
    setHasKey(true);
    setIsEditing(false);
    Alert.alert('Saved', 'API key saved successfully');
  };

  const removeKey = async () => {
    Alert.alert('Remove API Key', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await deleteApiKey();
          setKey('');
          setHasKey(false);
          setIsEditing(false);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gemini API Key</Text>
        <Text style={styles.sectionDescription}>
          Get your free API key from Google AI Studio (aistudio.google.com)
        </Text>

        {hasKey && !isEditing ? (
          <View style={styles.keyStatus}>
            <Text style={styles.keyStatusText}>✅ API key is set</Text>
            <View style={styles.keyActions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => setIsEditing(true)}>
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={removeKey}>
                <Text style={[styles.actionButtonText, styles.dangerText]}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <TextInput
              style={styles.input}
              value={key}
              onChangeText={setKey}
              placeholder="Paste your Gemini API key here"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveKey}>
              <Text style={styles.saveButtonText}>Save API Key</Text>
            </TouchableOpacity>
            {isEditing && (
              <TouchableOpacity style={styles.cancelButton} onPress={() => { setIsEditing(false); loadKey(); }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>English Coach v1.0</Text>
        <Text style={styles.aboutText}>Conversation-focused English learning app</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: 16,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
  },
  cancelButton: {
    padding: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 15,
  },
  keyStatus: {
    gap: 12,
  },
  keyStatusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  keyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dangerButton: {
    backgroundColor: '#FFEBEE',
  },
  dangerText: {
    color: '#D32F2F',
  },
  aboutText: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/\(tabs\)/settings.tsx
git commit -m "feat: add settings screen with Gemini API key management"
```

---

## Task 15: TestFlight Build

**Files:**
- Modify: `app.json`

- [ ] **Step 1: Install EAS CLI**

```bash
npm install -g eas-cli
```

- [ ] **Step 2: Configure EAS**

```bash
cd /Users/halil.tuksal/Projects/english-app
eas init
eas build:configure
```

This creates `eas.json`. Verify it contains iOS build profiles.

- [ ] **Step 3: Update eas.json for TestFlight**

Ensure `eas.json` has:
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "ios": {
        "distribution": "store"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

Replace Apple ID values with actual credentials.

- [ ] **Step 4: Build for TestFlight**

```bash
eas build --platform ios --profile production
```

Wait for build to complete on EAS servers.

- [ ] **Step 5: Submit to TestFlight**

```bash
eas submit --platform ios --profile production
```

- [ ] **Step 6: Commit build config**

```bash
git add eas.json app.json
git commit -m "feat: add EAS build configuration for TestFlight"
```
