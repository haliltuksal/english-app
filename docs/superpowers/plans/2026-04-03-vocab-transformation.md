# Vocabulary Learning App Transformation Plan

**Goal:** Transform chat-based English learning app into structured daily vocabulary learning with AI teaching, quizzes, and spaced repetition.

**Approach:** Refactor existing screens and add new DB tables. Keep: settings, API layer, TTS, SM-2, level system. Replace: chat → word sessions, scenarios → word bank.

---

## Task 1: New DB Tables + Word Queries
- Add `words`, `user_words`, `daily_sessions` tables
- Add session/word CRUD queries

## Task 2: Word Bank Data
- Create 200 words across 5 levels (A2-C2), 40 per level
- Categories: everyday, work, tech, academic, expressions

## Task 3: AI Teaching + Quiz Prompts
- `src/ai/teach.ts` — word teaching prompt + quiz generation
- Structured JSON responses from AI

## Task 4: Session Logic Hook
- `src/hooks/useSession.ts` — daily word selection, teaching flow, quiz state
- Mix new words + review words based on spaced repetition

## Task 5: Dashboard Hook + Stats
- `src/hooks/useDashboard.ts` — streak, total words, weak words, today's session status

## Task 6: New Components
- WordTeachCard, QuizCard, SessionProgress, DashboardStats

## Task 7: New Screens
- Dashboard (home tab), Session screen, Updated vocabulary screen

## Task 8: Navigation + Cleanup
- Update tab layout, add session route, wire everything
