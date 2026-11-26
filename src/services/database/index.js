import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import config from '../../config/index.js';
import logger from '../../utils/logger.js';

const dbPath = path.join(config.paths.data, 'chocobot.db');

if (!fs.existsSync(config.paths.data)) {
  fs.mkdirSync(config.paths.data, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      jid TEXT PRIMARY KEY,
      wallet INTEGER DEFAULT 500,
      bank INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      exp INTEGER DEFAULT 0,
      last_work INTEGER DEFAULT 0,
      last_rob INTEGER DEFAULT 0,
      warns INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS groups (
      jid TEXT PRIMARY KEY,
      antilink INTEGER DEFAULT 0,
      welcome INTEGER DEFAULT 0,
      nsfw INTEGER DEFAULT 0,
      muted TEXT DEFAULT '[]',
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      type TEXT,
      chat_jid TEXT,
      players TEXT,
      state TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      expires_at INTEGER
    );
  `);

  // Migración: premiumUntil
  try {
    db.prepare('ALTER TABLE users ADD COLUMN premiumUntil INTEGER DEFAULT 0').run();
  } catch {}

  logger.info('Migraciones de base de datos aplicadas');
}

migrate();

export default db;
