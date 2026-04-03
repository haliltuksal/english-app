import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = initDatabase();
  }
  return dbPromise;
}

async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('english-coach.db');

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
  `);

  // Migration: add new columns to conversations if they don't exist
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

  return db;
}
