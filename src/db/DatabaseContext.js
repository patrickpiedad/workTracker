import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { migrateDbIfNeeded } from './db';

const DatabaseContext = createContext(null);

export function DatabaseProvider({ children }) {
  if (Platform.OS === 'web') {
    return <WebDatabaseProvider>{children}</WebDatabaseProvider>;
  } else {
    return (
      <SQLite.SQLiteProvider
        databaseName="worktracker.db"
        onInit={migrateDbIfNeeded}
        onError={(error) => console.error('SQLite Error:', error)}
      >
        <NativeDatabaseInterceptor>{children}</NativeDatabaseInterceptor>
      </SQLite.SQLiteProvider>
    );
  }
}

// Native wrapper just to expose the same context interface if needed,
// but since we are using useSQLiteContext within the same library tree,
// strictly speaking we might want to wrap it to control access.
// However, to keep it simple, we can just use the functionality of expo-sqlite directly for native,
// but our hook `useAppDatabase` will unify access.
function NativeDatabaseInterceptor({ children }) {
  const db = SQLite.useSQLiteContext();
  return (
    <DatabaseContext.Provider value={db}>
      {children}
    </DatabaseContext.Provider>
  );
}

// Web Implementation backing to localStorage
function WebDatabaseProvider({ children }) {
  const [db] = useState(() => new LocalStorageDatabase());

  useEffect(() => {
    // Run "migration" (setup) on mount
    db.init();
  }, [db]);

  return (
    <DatabaseContext.Provider value={db}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useAppDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useAppDatabase must be used within a DatabaseProvider');
  }
  return context;
}

// Mock DB Class for Web
class LocalStorageDatabase {
  STORAGE_KEY = 'worktracker_db_v1';

  init() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) {
      this.saveData([]);
    }
  }

  getData() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveData(data) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  // Mimic expo-sqlite getFirstAsync
  async getFirstAsync(sql) {
    // Used for PRAGMA user_version check
    if (sql.includes('PRAGMA user_version')) {
      // We don't really use versions in localStorage for this simple polyfill
      return { user_version: 1 };
    }
    return null;
  }

  // Mimic expo-sqlite execAsync
  async execAsync(sql) {
    // Used for migrations
    return;
  }

  // Mimic expo-sqlite runAsync
  async runAsync(sql, ...args) {
    const sessions = this.getData();
    let lastInsertRowId = 0;

    if (sql.includes('INSERT INTO')) {
      // INSERT INTO work_sessions (date, hours, notes) VALUES (?, ?, ?)
      const newId = Date.now(); // Simple ID generation
      const [date, hours, notes] = args;
      const newSession = {
        id: newId,
        date,
        hours,
        notes,
        created_at: new Date().toISOString()
      };
      sessions.push(newSession);
      this.saveData(sessions);
      lastInsertRowId = newId;
    } else if (sql.includes('DELETE FROM')) {
      // DELETE FROM work_sessions WHERE id = ?
      const [id] = args;
      const filtered = sessions.filter(s => s.id !== id);
      this.saveData(filtered);
    } else if (sql.includes('UPDATE work_sessions')) {
      // UPDATE work_sessions SET date = ?, hours = ?, notes = ? WHERE id = ?
      const [date, hours, notes, id] = args;
      const index = sessions.findIndex(s => s.id === id);
      if (index !== -1) {
        sessions[index] = { ...sessions[index], date, hours, notes };
        this.saveData(sessions);
      }
    }

    return { lastInsertRowId };
  }

  // Mimic expo-sqlite getAllAsync
  async getAllAsync(sql) {
    if (sql.includes('SELECT * FROM work_sessions')) {
      const sessions = this.getData();
      // Simple sort by date DESC, created_at DESC
      // This mimics "ORDER BY date DESC, created_at DESC"
      return sessions.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA > dateB) return -1;
        if (dateA < dateB) return 1;
        // tie-break with created_at if generic date
        if (a.created_at > b.created_at) return -1;
        if (a.created_at < b.created_at) return 1;
        return 0;
      });
    }
    return [];
  }
}
