import * as SQLite from 'expo-sqlite';

export const migrateDbIfNeeded = async (db) => {
  const DATABASE_VERSION = 1;
  let { user_version: currentDbVersion } = await db.getFirstAsync(
    'PRAGMA user_version'
  );

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentDbVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      CREATE TABLE IF NOT EXISTS work_sessions (
        id INTEGER PRIMARY KEY NOT NULL,
        date TEXT NOT NULL,
        hours REAL NOT NULL,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    currentDbVersion = 1;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  console.log('Database migration completed successfully');
};

export const addSession = async (db, date, hours, notes) => {
  const result = await db.runAsync(
    'INSERT INTO work_sessions (date, hours, notes) VALUES (?, ?, ?)',
    date,
    hours,
    notes
  );
  return result.lastInsertRowId;
};

export const getSessions = async (db) => {
  return await db.getAllAsync('SELECT * FROM work_sessions ORDER BY date DESC, created_at DESC');
};

export const deleteSession = async (db, id) => {
  await db.runAsync('DELETE FROM work_sessions WHERE id = ?', id);
};

export const updateSession = async (db, id, date, hours, notes) => {
  await db.runAsync(
    'UPDATE work_sessions SET date = ?, hours = ?, notes = ? WHERE id = ?',
    date,
    hours,
    notes,
    id
  );
};
