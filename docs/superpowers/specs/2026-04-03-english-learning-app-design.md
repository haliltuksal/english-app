# English Learning App — Design Spec

## Overview

Conversation-focused English learning app for iOS (TestFlight). Built for a Turkish-speaking developer who wants to improve English, primarily for career/work contexts. AI-powered chat with real-time corrections and automatic vocabulary building.

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Mobile | Expo (React Native) + TypeScript | Developer knows React/TS, EAS Build for TestFlight |
| AI | Google Gemini Flash (Free Tier) | Free, 15 RPM / 1M tokens per day, sufficient quality |
| Database | expo-sqlite | Local-only, no backend needed |
| TTS | expo-speech | Pronunciation for words/sentences |
| Secure Storage | expo-secure-store | Store Gemini API key securely |

No backend server. All data on device, direct Gemini API calls.

## Screens

### 1. Chat Picker (Home Screen)
- Minimal top bar: streak counter + total words learned
- Scenario cards list — tap to start a conversation
- "Free Chat" option — no scenario, open topic
- Active/recent conversations shown at top for continuation
- Scenario categories:
  - **Work:** job interview, standup, code review, email writing, pair programming
  - **Daily:** restaurant, directions, meeting people, shopping
  - **Technical:** PR description, bug report, Slack message, documentation

### 2. Chat (Core Screen)
- Messaging UI (WhatsApp-style)
- AI responds naturally, then below a separator:
  - **Correction:** grammar/vocabulary fix if needed, otherwise "Great!"
  - **New word:** 1 word/phrase from AI's response with Turkish meaning
- Tap any word to see Turkish meaning + hear pronunciation (TTS)
- Chat ends when user types "end" or after 15+ messages, AI generates summary
- End-of-chat summary: learned words list, mistakes summary
- Learned words auto-saved to vocabulary notebook

### 3. Vocabulary Notebook
- Auto-collected words from conversations
- Each entry: English word, Turkish meaning, example sentence, source conversation
- Spaced repetition flashcard review mode
- Filter: known/unknown, by category

## AI Chat Mechanism

### System Prompt Strategy
Each conversation starts with a system prompt shaped by:
- Selected scenario (role, context, expected vocabulary)
- User's level (B1-B2, gradually increasing difficulty)
- Behavior rules (see below)

### AI Behavior Rules
1. Use English appropriate for B1-B2 level, gradually increase complexity
2. Every response: natural reply + correction (if any) + 1 new word/phrase with Turkish meaning
3. Keep conversation alive — ask follow-up questions, advance the topic
4. Stay in character if a scenario is selected (interviewer, teammate, customer, etc.)
5. Be encouraging, not pedantic

### Message Format
```
[Natural response in English]
---
Correction: [fix or "Great!"]
New word: [word] — [Turkish meaning]
```

### Conversation End
When user sends "end" or after 15+ messages, AI produces:
- Summary of the conversation topic
- List of new words learned (with meanings)
- Common mistakes made
- Encouragement + suggestion for next practice

## Data Model (SQLite)

### conversations
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment |
| scenario_type | TEXT | Scenario identifier or "free" |
| started_at | TEXT | ISO timestamp |
| ended_at | TEXT | ISO timestamp, nullable |
| message_count | INTEGER | Total messages |
| summary | TEXT | AI-generated summary, nullable |

### messages
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment |
| conversation_id | INTEGER FK | References conversations.id |
| role | TEXT | "user" or "ai" |
| content | TEXT | Message text |
| correction | TEXT | Grammar/vocab correction, nullable |
| new_word | TEXT | New word suggestion, nullable |
| created_at | TEXT | ISO timestamp |

### vocabulary
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment |
| word | TEXT | English word/phrase |
| turkish_meaning | TEXT | Turkish translation |
| example_sentence | TEXT | Example usage |
| conversation_id | INTEGER FK | Source conversation |
| next_review_at | TEXT | Next spaced repetition date |
| ease_factor | REAL | SM-2 ease factor, default 2.5 |
| repetition_count | INTEGER | Times reviewed, default 0 |

### Spaced Repetition (SM-2)
- Correct answer: interval increases (1d → 3d → 7d → 14d → 30d...)
- Incorrect answer: reset to 1 day
- ease_factor adjusts based on difficulty rating

## Non-Goals (YAGNI)
- No user accounts / authentication
- No backend server
- No social features
- No gamification beyond streak counter
- No speech-to-text input (text only for v1)
- No offline AI (requires internet for Gemini API)
- No fancy UI — functional and clean is enough
