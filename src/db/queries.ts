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
  // Use local date formatting to match user's timezone
  const rows = await db.getAllAsync<{ day: string }>(
    `SELECT DISTINCT date(started_at, 'localtime') as day FROM conversations ORDER BY day DESC`
  );

  if (rows.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  // Format today in local timezone as YYYY-MM-DD
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

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
