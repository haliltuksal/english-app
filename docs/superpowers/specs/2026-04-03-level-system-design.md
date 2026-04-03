# Level-Based Progression System — Design Spec

## Overview

Replace the flat scenario list with a CEFR-based level system (A1→A2→B1→B2→C1→C2). The user starts at A2 (based on self-assessment), progresses through levels by completing conversations and demonstrating improvement. AI adapts difficulty per level. Focus: measurable growth, not gamification fluff.

## Level Structure

### 6 Levels (CEFR-aligned)

| Level | Name | AI Behavior | Vocabulary Target | Unlock Criteria |
|-------|------|-------------|-------------------|-----------------|
| A1 | Beginner | Very simple sentences, basic vocab, lots of encouragement | 50 words | Starting level option |
| A2 | Elementary | Simple sentences, everyday topics, gentle corrections | 150 words | Starting level option (user's current) |
| B1 | Intermediate | Natural speech, work topics, regular corrections | 400 words | 10 conversations + <40% correction rate + assessment pass |
| B2 | Upper-Intermediate | Complex topics, idioms, nuanced corrections | 800 words | 15 conversations + <30% correction rate + assessment pass |
| C1 | Advanced | Professional/academic English, subtle errors only | 1500 words | 20 conversations + <20% correction rate + assessment pass |
| C2 | Mastery | Native-level, debates, presentations, writing review | 2500+ words | 25 conversations + <10% correction rate + assessment pass |

### Level-Up Requirements (all must be met)
1. **Minimum conversations completed** at current level
2. **Correction rate below threshold** (measured over last 10 conversations)
3. **Vocabulary mastered** (spaced repetition: word reviewed 3+ times correctly)
4. **Assessment conversation passed** — AI evaluates in a special conversation

### Per-Level Scenarios

Each level has its own scenario set. Scenarios from lower levels remain accessible.

**A2 (User starts here):**
- Introducing yourself
- Ordering at a restaurant
- Asking for directions
- Daily standup (simple)
- Shopping

**B1:**
- Job interview (basic)
- Email writing
- Bug report
- Meeting new people at events
- Describing your work

**B2:**
- Code review discussion
- Sprint planning
- Writing documentation
- Negotiating deadlines
- Technical presentation

**C1:**
- System design discussion
- Conflict resolution at work
- Writing a proposal
- Leading a meeting
- Explaining complex concepts

**C2:**
- Debating technical decisions
- Writing & reviewing RFCs
- Executive summary presentation
- Cross-team alignment
- Mentoring junior developers

## Assessment Conversations

When level-up requirements 1-3 are met, an "Assessment" option appears. This is a special conversation where:
- AI asks questions targeting the NEXT level's difficulty
- AI scores responses internally (grammar, vocabulary range, fluency)
- After 10 exchanges, AI gives a verdict: PASS (level up) or KEEP_PRACTICING (stay, with specific feedback)
- Result is stored in DB

## Performance Tracking

### Correction Rate
- Each AI message either has a correction or "Great!"
- Rate = messages_with_corrections / total_user_messages (per conversation)
- Rolling average over last 10 conversations at current level

### Vocabulary Mastery
- Word is "mastered" when: reviewed via spaced repetition 3+ times with correct answers
- Count of mastered words tracked per level

## Data Model Changes

### New table: `user_progress`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Always 1 (single user) |
| current_level | TEXT | 'A1','A2','B1','B2','C1','C2' |
| conversations_at_level | INTEGER | Count at current level |
| level_started_at | TEXT | ISO timestamp |

### New table: `assessments`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment |
| level | TEXT | Level being assessed for |
| conversation_id | INTEGER FK | Assessment conversation |
| passed | INTEGER | 0 or 1 |
| feedback | TEXT | AI feedback |
| assessed_at | TEXT | ISO timestamp |

### Modify `conversations` table
- Add column: `level TEXT` — which level this conversation was at
- Add column: `correction_count INTEGER DEFAULT 0`
- Add column: `user_message_count INTEGER DEFAULT 0`

## UI Changes

### Home Screen (Chat Picker) — Redesigned
- Top: **Level badge** (e.g., "A2 — Elementary") + progress bar showing % to next level
- Below: **Stats row** — conversations at level, correction rate, words mastered
- **Scenarios section** — only current level's scenarios (with lower levels collapsible)
- **Assessment button** — appears when requirements met, glowing/highlighted
- **Free Chat** — always available, counts toward progress

### Level-Up Screen
- Shown after passing assessment
- "Congratulations! You've reached B1 — Intermediate"
- Summary of achievements
- New scenarios unlocked

## System Prompt Changes

The system prompt now includes the user's level. AI adapts:
- Vocabulary complexity
- Sentence structure
- Correction strictness
- Topic depth

## Non-Goals
- No XP/points system
- No daily goals (user's schedule is irregular)
- No leaderboards
- No paid features
