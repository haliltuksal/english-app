# Level System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace flat scenario list with CEFR-based level progression system (A1→C2) with performance tracking and assessment conversations.

**Architecture:** Extend existing SQLite schema, restructure scenarios by level, modify system prompts to be level-aware, redesign home screen with progress UI.

**Tech Stack:** Same as existing — Expo, TypeScript, expo-sqlite, Groq API (Llama 3.3)

---

## File Structure (changes/additions)

```
src/
├── levels/
│   ├── data.ts              # Level definitions + per-level scenarios
│   ├── progress.ts          # Level progress logic (correction rate, mastery check, level-up eligibility)
│   └── assessment.ts        # Assessment prompt builder + result parser
├── db/
│   ├── database.ts          # Add new tables + migration
│   └── queries.ts           # Add progress/assessment queries
├── ai/
│   └── prompts.ts           # Level-aware system prompts
├── hooks/
│   ├── useChat.ts           # Track corrections per conversation
│   └── useProgress.ts       # New: level progress hook
├── components/
│   ├── LevelBadge.tsx       # New: level display with progress bar
│   └── ScenarioCard.tsx     # Minor: add lock state
app/
├── (tabs)/
│   └── index.tsx            # Redesign with level UI
└── level-up.tsx             # New: level-up celebration screen
```

---

## Task 1: Level Definitions + Per-Level Scenarios

**Files:**
- Create: `src/levels/data.ts`
- Modify: `src/scenarios/data.ts` — add `level` field to each scenario

- [ ] **Step 1: Create level definitions**

Create `src/levels/data.ts`:
```typescript
export interface Level {
  id: string;
  name: string;
  description: string;
  conversationsRequired: number;
  maxCorrectionRate: number; // e.g., 0.4 = 40%
  vocabMasteredRequired: number;
  aiComplexity: string; // instruction for system prompt
}

export const levels: Level[] = [
  {
    id: 'A1',
    name: 'Beginner',
    description: 'Basic words and simple sentences',
    conversationsRequired: 5,
    maxCorrectionRate: 0.6,
    vocabMasteredRequired: 30,
    aiComplexity: 'Use very simple, short sentences with basic vocabulary. Speak slowly and clearly. Correct all mistakes gently. Avoid idioms and complex grammar.',
  },
  {
    id: 'A2',
    name: 'Elementary',
    description: 'Everyday topics and simple conversations',
    conversationsRequired: 10,
    maxCorrectionRate: 0.4,
    vocabMasteredRequired: 100,
    aiComplexity: 'Use simple, clear sentences about everyday topics. Introduce common phrases and expressions. Correct mistakes with brief explanations.',
  },
  {
    id: 'B1',
    name: 'Intermediate',
    description: 'Work topics and natural conversation',
    conversationsRequired: 15,
    maxCorrectionRate: 0.3,
    vocabMasteredRequired: 300,
    aiComplexity: 'Use natural English with moderate complexity. Include common idioms and phrasal verbs. Discuss work and technical topics. Correct grammar and suggest better word choices.',
  },
  {
    id: 'B2',
    name: 'Upper-Intermediate',
    description: 'Complex discussions and professional English',
    conversationsRequired: 20,
    maxCorrectionRate: 0.2,
    vocabMasteredRequired: 600,
    aiComplexity: 'Use complex sentence structures and varied vocabulary. Include idioms, collocations, and nuanced expressions. Discuss abstract and technical topics in depth. Only correct significant errors and suggest more natural alternatives.',
  },
  {
    id: 'C1',
    name: 'Advanced',
    description: 'Professional and academic discussions',
    conversationsRequired: 25,
    maxCorrectionRate: 0.15,
    vocabMasteredRequired: 1000,
    aiComplexity: 'Use sophisticated, native-level English. Include advanced vocabulary, complex grammar, and cultural references. Focus on nuance, tone, and register. Only correct subtle errors.',
  },
  {
    id: 'C2',
    name: 'Mastery',
    description: 'Native-level fluency',
    conversationsRequired: 0,
    maxCorrectionRate: 0.1,
    vocabMasteredRequired: 0,
    aiComplexity: 'Treat the user as a near-native speaker. Use the full range of English including rare vocabulary, complex rhetoric, and subtle humor. Challenge them with debates and nuanced arguments. Only flag the most subtle errors.',
  },
];

export function getLevelById(id: string): Level | undefined {
  return levels.find((l) => l.id === id);
}

export function getNextLevel(currentId: string): Level | undefined {
  const idx = levels.findIndex((l) => l.id === currentId);
  return idx >= 0 && idx < levels.length - 1 ? levels[idx + 1] : undefined;
}
```

- [ ] **Step 2: Add `level` field to scenarios**

Modify `src/scenarios/data.ts` — add `level: string` to Scenario interface and assign each scenario a level. Restructure the list:

A2: introducing-yourself, restaurant, directions, standup, shopping, meeting-people
B1: job-interview, email-writing, bug-report, slack-message, pair-programming, describing-work
B2: code-review, documentation, pr-description, sprint-planning, negotiating-deadlines, technical-presentation
C1: system-design, conflict-resolution, writing-proposal, leading-meeting, explaining-concepts
C2: debating-decisions, writing-rfcs, executive-presentation, cross-team-alignment, mentoring

Add new scenarios for missing ones, update existing ones with level field.

- [ ] **Step 3: Commit**

```bash
git add src/levels/data.ts src/scenarios/data.ts
git commit -m "feat: add CEFR level definitions and assign levels to scenarios"
```

---

## Task 2: Database Migration + Progress Queries

**Files:**
- Modify: `src/db/database.ts` — add `user_progress`, `assessments` tables + alter `conversations`
- Modify: `src/db/queries.ts` — add progress/assessment CRUD

- [ ] **Step 1: Update database schema**

Add to `database.ts` `initDatabase()` after existing CREATE TABLE statements:

```sql
CREATE TABLE IF NOT EXISTS user_progress (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  current_level TEXT NOT NULL DEFAULT 'A2',
  conversations_at_level INTEGER NOT NULL DEFAULT 0,
  level_started_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT NOT NULL,
  conversation_id INTEGER,
  passed INTEGER NOT NULL DEFAULT 0,
  feedback TEXT,
  assessed_at TEXT NOT NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

-- Add columns to conversations if not exist
-- Use a safe migration approach
```

For altering existing conversations table (adding `level`, `correction_count`, `user_message_count`), use a migration check:

```typescript
// After table creation, run migration
const tableInfo = await db.getAllAsync<{name: string}>(`PRAGMA table_info(conversations)`);
const columns = tableInfo.map(c => c.name);
if (!columns.includes('level')) {
  await db.execAsync(`ALTER TABLE conversations ADD COLUMN level TEXT DEFAULT 'A2'`);
}
if (!columns.includes('correction_count')) {
  await db.execAsync(`ALTER TABLE conversations ADD COLUMN correction_count INTEGER DEFAULT 0`);
}
if (!columns.includes('user_message_count')) {
  await db.execAsync(`ALTER TABLE conversations ADD COLUMN user_message_count INTEGER DEFAULT 0`);
}

// Initialize user_progress if empty
const progress = await db.getFirstAsync('SELECT id FROM user_progress WHERE id = 1');
if (!progress) {
  await db.runAsync(
    'INSERT INTO user_progress (id, current_level, conversations_at_level, level_started_at) VALUES (1, ?, 0, ?)',
    'A2', new Date().toISOString()
  );
}
```

- [ ] **Step 2: Add queries**

Add to `queries.ts`:

```typescript
// --- User Progress ---
export interface ProgressRow {
  current_level: string;
  conversations_at_level: number;
  level_started_at: string;
}

export async function getProgress(): Promise<ProgressRow>
export async function updateLevel(newLevel: string): Promise<void>
export async function incrementConversationsAtLevel(): Promise<void>

// --- Assessments ---
export async function createAssessment(level: string, conversationId: number, passed: boolean, feedback: string): Promise<number>
export async function getLastAssessment(level: string): Promise<AssessmentRow | null>

// --- Conversation stats ---
export async function incrementCorrectionCount(conversationId: number): Promise<void>
export async function incrementUserMessageCount(conversationId: number): Promise<void>
export async function getCorrectionRateAtLevel(level: string, limit: number): Promise<number>
export async function getMasteredVocabCount(): Promise<number>
export async function createConversation(scenarioType: string, level: string): Promise<number>  // updated signature
```

Implement all functions with proper SQL queries.

- [ ] **Step 3: Commit**

```bash
git add src/db/database.ts src/db/queries.ts
git commit -m "feat: add level progression schema and progress queries"
```

---

## Task 3: Progress Logic + Assessment

**Files:**
- Create: `src/levels/progress.ts`
- Create: `src/levels/assessment.ts`

- [ ] **Step 1: Create progress checker**

Create `src/levels/progress.ts`:
```typescript
import { getLevelById, getNextLevel, Level } from './data';
import * as queries from '../db/queries';

export interface LevelProgress {
  currentLevel: Level;
  nextLevel: Level | undefined;
  conversationsCompleted: number;
  conversationsRequired: number;
  correctionRate: number;
  maxCorrectionRate: number;
  vocabMastered: number;
  vocabRequired: number;
  canTakeAssessment: boolean;
  isMaxLevel: boolean;
}

export async function getLevelProgress(): Promise<LevelProgress> {
  const progress = await queries.getProgress();
  const currentLevel = getLevelById(progress.current_level)!;
  const nextLevel = getNextLevel(progress.current_level);
  const correctionRate = await queries.getCorrectionRateAtLevel(progress.current_level, 10);
  const vocabMastered = await queries.getMasteredVocabCount();

  const isMaxLevel = !nextLevel;
  const meetsConversations = progress.conversations_at_level >= currentLevel.conversationsRequired;
  const meetsCorrectionRate = correctionRate <= currentLevel.maxCorrectionRate;
  const meetsVocab = vocabMastered >= currentLevel.vocabMasteredRequired;

  return {
    currentLevel,
    nextLevel,
    conversationsCompleted: progress.conversations_at_level,
    conversationsRequired: currentLevel.conversationsRequired,
    correctionRate,
    maxCorrectionRate: currentLevel.maxCorrectionRate,
    vocabMastered,
    vocabRequired: currentLevel.vocabMasteredRequired,
    canTakeAssessment: !isMaxLevel && meetsConversations && meetsCorrectionRate && meetsVocab,
    isMaxLevel,
  };
}

export async function levelUp(): Promise<string> {
  const progress = await queries.getProgress();
  const nextLevel = getNextLevel(progress.current_level);
  if (!nextLevel) throw new Error('Already at max level');
  await queries.updateLevel(nextLevel.id);
  return nextLevel.id;
}
```

- [ ] **Step 2: Create assessment prompt builder + result parser**

Create `src/levels/assessment.ts`:
```typescript
import { getNextLevel, getLevelById } from './data';

export function buildAssessmentPrompt(currentLevelId: string): string {
  const nextLevel = getNextLevel(currentLevelId);
  if (!nextLevel) return '';

  return `You are an English language assessor. The user is currently at ${currentLevelId} level and is being assessed for ${nextLevel.id} (${nextLevel.name}).

ASSESSMENT RULES:
1. Have a natural conversation but gradually increase complexity to ${nextLevel.id} level.
2. Test: grammar accuracy, vocabulary range, ability to express complex ideas, natural fluency.
3. Ask 5 questions that test ${nextLevel.id}-level skills. Mix topics: work, daily life, opinions.
4. After the user answers all 5 questions, provide your assessment.

${nextLevel.aiComplexity}

ASSESSMENT FORMAT (after 5 exchanges):
When you've asked 5 questions and received answers, respond with:

[Your final encouraging message]
---
ASSESSMENT_RESULT: PASS or FAIL
Feedback: [2-3 sentences about strengths and areas to improve]
Level: ${nextLevel.id}`;
}

export interface AssessmentResult {
  passed: boolean;
  feedback: string;
  level: string;
}

export function parseAssessmentResult(response: string): AssessmentResult | null {
  const resultMatch = response.match(/ASSESSMENT_RESULT:\s*(PASS|FAIL)/i);
  if (!resultMatch) return null;

  const passed = resultMatch[1].toUpperCase() === 'PASS';
  const feedbackMatch = response.match(/Feedback:\s*(.+)/i);
  const levelMatch = response.match(/Level:\s*(\w+)/i);

  return {
    passed,
    feedback: feedbackMatch?.[1]?.trim() || 'Assessment complete.',
    level: levelMatch?.[1]?.trim() || '',
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/levels/
git commit -m "feat: add level progress checker and assessment logic"
```

---

## Task 4: Level-Aware System Prompts

**Files:**
- Modify: `src/ai/prompts.ts`

- [ ] **Step 1: Update buildSystemPrompt to accept level**

Update signature to `buildSystemPrompt(scenario: Scenario | null, levelId: string)`.

Add level-specific instructions from `getLevelById(levelId).aiComplexity` to the system prompt. The AI should adapt vocabulary, grammar complexity, and correction strictness based on the level.

- [ ] **Step 2: Update useChat.ts to pass level**

The hook needs to know the user's current level and pass it to `buildSystemPrompt`.

- [ ] **Step 3: Commit**

```bash
git add src/ai/prompts.ts src/hooks/useChat.ts
git commit -m "feat: make system prompts level-aware"
```

---

## Task 5: Track Corrections in useChat

**Files:**
- Modify: `src/hooks/useChat.ts`

- [ ] **Step 1: Track correction and user message counts**

After each AI response, if `parsed.correction` is not null, call `queries.incrementCorrectionCount(conversationId)`.
After each user message, call `queries.incrementUserMessageCount(conversationId)`.
When conversation ends, call `queries.incrementConversationsAtLevel()`.

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useChat.ts
git commit -m "feat: track corrections and user messages per conversation"
```

---

## Task 6: useProgress Hook

**Files:**
- Create: `src/hooks/useProgress.ts`

- [ ] **Step 1: Implement progress hook**

```typescript
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { getLevelProgress, LevelProgress } from '../levels/progress';

export function useProgress() {
  const [progress, setProgress] = useState<LevelProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const p = await getLevelProgress();
    setProgress(p);
    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => { refresh(); }, [refresh])
  );

  return { progress, isLoading, refresh };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useProgress.ts
git commit -m "feat: add useProgress hook for level tracking"
```

---

## Task 7: LevelBadge Component

**Files:**
- Create: `src/components/LevelBadge.tsx`

- [ ] **Step 1: Create level badge with progress bar**

A component showing:
- Current level badge (e.g., "A2")
- Level name
- Progress bar with 3 indicators: conversations %, correction rate, vocab mastered
- If `canTakeAssessment`: highlight "Take Assessment" CTA

- [ ] **Step 2: Commit**

```bash
git add src/components/LevelBadge.tsx
git commit -m "feat: add LevelBadge component with progress indicators"
```

---

## Task 8: Redesign Home Screen

**Files:**
- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: Replace StreakBar with LevelBadge**

- Top: LevelBadge showing current level + progress
- Assessment button (when eligible)
- Current level's scenarios
- Free Chat button
- Collapsible "Previous Levels" section

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/index.tsx
git commit -m "feat: redesign home screen with level-based progression"
```

---

## Task 9: Assessment Flow in Chat

**Files:**
- Modify: `src/hooks/useChat.ts`
- Modify: `app/chat/[id].tsx`

- [ ] **Step 1: Handle assessment conversations**

When `scenarioType === 'assessment'`:
- Use `buildAssessmentPrompt` instead of regular system prompt
- After AI response, check for `ASSESSMENT_RESULT` in the parsed content
- If found, save assessment result to DB
- If passed, trigger level-up

- [ ] **Step 2: Add assessment result UI in chat screen**

When assessment result is detected, show a special banner:
- PASS: "🎉 Congratulations! You've reached [level]!" with a "Continue" button
- FAIL: "Keep practicing! [feedback]" with encouragement

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useChat.ts app/chat/[id].tsx
git commit -m "feat: add assessment conversation flow with level-up"
```

---

## Task 10: Update createConversation + Chat Picker

**Files:**
- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: Pass level to createConversation**

When starting a new conversation, pass the current level from useProgress.

- [ ] **Step 2: Commit + Final review**

```bash
git add -A
git commit -m "feat: wire level to conversation creation"
```
