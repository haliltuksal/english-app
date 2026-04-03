import { getDatabase } from './database';

// --- Words ---

export interface WordRow {
  id: number;
  word: string;
  translation: string;
  definition: string | null;
  category: string;
  difficulty: string;
}

export async function getWordsByDifficulty(difficulty: string, limit: number = 20): Promise<WordRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<WordRow>(
    'SELECT * FROM words WHERE difficulty = ? ORDER BY RANDOM() LIMIT ?',
    difficulty, limit
  );
}

export async function getWordById(id: number): Promise<WordRow | null> {
  const db = await getDatabase();
  return db.getFirstAsync<WordRow>('SELECT * FROM words WHERE id = ?', id);
}

export async function getWordCount(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM words');
  return row?.count ?? 0;
}

export async function insertWord(word: string, translation: string, definition: string | null, category: string, difficulty: string): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT OR IGNORE INTO words (word, translation, definition, category, difficulty, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    word, translation, definition, category, difficulty, new Date().toISOString()
  );
  return result.lastInsertRowId;
}

export async function bulkInsertWords(words: { word: string; translation: string; category: string; difficulty: string }[]): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  for (const w of words) {
    await db.runAsync(
      'INSERT OR IGNORE INTO words (word, translation, category, difficulty, created_at) VALUES (?, ?, ?, ?, ?)',
      w.word, w.translation, w.category, w.difficulty, now
    );
  }
}

// --- User Words ---

export interface UserWordRow {
  id: number;
  word_id: number;
  seen_count: number;
  correct_count: number;
  last_seen_at: string | null;
  next_review_at: string;
  ease_factor: number;
}

export interface UserWordWithWord extends UserWordRow {
  word: string;
  translation: string;
  definition: string | null;
  category: string;
  difficulty: string;
}

export async function getUserWord(wordId: number): Promise<UserWordRow | null> {
  const db = await getDatabase();
  return db.getFirstAsync<UserWordRow>('SELECT * FROM user_words WHERE word_id = ?', wordId);
}

export async function createUserWord(wordId: number): Promise<number> {
  const db = await getDatabase();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const result = await db.runAsync(
    'INSERT OR IGNORE INTO user_words (word_id, next_review_at) VALUES (?, ?)',
    wordId, tomorrow.toISOString()
  );
  return result.lastInsertRowId;
}

export async function updateUserWordReview(
  wordId: number, correct: boolean, nextReviewAt: string, easeFactor: number
): Promise<void> {
  const db = await getDatabase();
  if (correct) {
    await db.runAsync(
      `UPDATE user_words SET
        seen_count = seen_count + 1,
        correct_count = correct_count + 1,
        last_seen_at = ?,
        next_review_at = ?,
        ease_factor = ?
      WHERE word_id = ?`,
      new Date().toISOString(), nextReviewAt, easeFactor, wordId
    );
  } else {
    await db.runAsync(
      `UPDATE user_words SET
        seen_count = seen_count + 1,
        last_seen_at = ?,
        next_review_at = ?,
        ease_factor = ?
      WHERE word_id = ?`,
      new Date().toISOString(), nextReviewAt, easeFactor, wordId
    );
  }
}

export async function getNewWordsForLevel(difficulty: string, excludeWordIds: number[], limit: number): Promise<WordRow[]> {
  const db = await getDatabase();
  if (excludeWordIds.length === 0) {
    return db.getAllAsync<WordRow>(
      'SELECT * FROM words WHERE difficulty = ? ORDER BY RANDOM() LIMIT ?',
      difficulty, limit
    );
  }
  const placeholders = excludeWordIds.map(() => '?').join(',');
  return db.getAllAsync<WordRow>(
    `SELECT * FROM words WHERE difficulty = ? AND id NOT IN (${placeholders}) ORDER BY RANDOM() LIMIT ?`,
    difficulty, ...excludeWordIds, limit
  );
}

export async function getDueReviewWords(limit: number): Promise<UserWordWithWord[]> {
  const db = await getDatabase();
  return db.getAllAsync<UserWordWithWord>(
    `SELECT uw.*, w.word, w.translation, w.definition, w.category, w.difficulty
     FROM user_words uw
     JOIN words w ON uw.word_id = w.id
     WHERE uw.next_review_at <= ?
     ORDER BY uw.next_review_at ASC
     LIMIT ?`,
    new Date().toISOString(), limit
  );
}

export async function getAllUserWords(): Promise<UserWordWithWord[]> {
  const db = await getDatabase();
  return db.getAllAsync<UserWordWithWord>(
    `SELECT uw.*, w.word, w.translation, w.definition, w.category, w.difficulty
     FROM user_words uw
     JOIN words w ON uw.word_id = w.id
     ORDER BY uw.last_seen_at DESC`
  );
}

export async function getWeakWords(limit: number = 20): Promise<UserWordWithWord[]> {
  const db = await getDatabase();
  return db.getAllAsync<UserWordWithWord>(
    `SELECT uw.*, w.word, w.translation, w.definition, w.category, w.difficulty
     FROM user_words uw
     JOIN words w ON uw.word_id = w.id
     WHERE uw.seen_count >= 2 AND (CAST(uw.correct_count AS REAL) / uw.seen_count) < 0.6
     ORDER BY (CAST(uw.correct_count AS REAL) / uw.seen_count) ASC
     LIMIT ?`,
    limit
  );
}

export async function getLearnedWordCount(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM user_words WHERE seen_count > 0'
  );
  return row?.count ?? 0;
}

export async function getSeenWordIds(): Promise<number[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ word_id: number }>('SELECT word_id FROM user_words');
  return rows.map(r => r.word_id);
}

// --- Daily Sessions ---

export interface SessionRow {
  id: number;
  session_date: string;
  word_ids: string; // JSON array
  new_word_count: number;
  review_word_count: number;
  completed: number;
  quiz_score: number | null;
  created_at: string;
}

export async function getTodaySession(): Promise<SessionRow | null> {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  return db.getFirstAsync<SessionRow>(
    'SELECT * FROM daily_sessions WHERE session_date = ? ORDER BY created_at DESC LIMIT 1',
    today
  );
}

export async function createDailySession(wordIds: number[], newCount: number, reviewCount: number): Promise<number> {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const result = await db.runAsync(
    'INSERT INTO daily_sessions (session_date, word_ids, new_word_count, review_word_count, created_at) VALUES (?, ?, ?, ?, ?)',
    today, JSON.stringify(wordIds), newCount, reviewCount, new Date().toISOString()
  );
  return result.lastInsertRowId;
}

export async function completeSession(sessionId: number, quizScore: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE daily_sessions SET completed = 1, quiz_score = ? WHERE id = ?',
    quizScore, sessionId
  );
}

export async function getSessionStreak(): Promise<number> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ day: string }>(
    `SELECT DISTINCT session_date as day FROM daily_sessions WHERE completed = 1 ORDER BY day DESC`
  );
  if (rows.length === 0) return 0;

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < rows.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedStr = `${expectedDate.getFullYear()}-${String(expectedDate.getMonth() + 1).padStart(2, '0')}-${String(expectedDate.getDate()).padStart(2, '0')}`;

    if (rows[i].day === expectedStr) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export async function getCompletedSessionCount(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM daily_sessions WHERE completed = 1'
  );
  return row?.count ?? 0;
}

export async function getAverageQuizScore(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ avg: number | null }>(
    'SELECT AVG(quiz_score) as avg FROM daily_sessions WHERE completed = 1 AND quiz_score IS NOT NULL'
  );
  return row?.avg ?? 0;
}
