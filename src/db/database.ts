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
  `);

  return db;
}
