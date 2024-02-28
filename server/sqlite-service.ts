import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve(process.env.DATABASE_URL ? process.env.DATABASE_URL : 'storage/sqlite.db');

if (fs.existsSync(dbPath)) {
    console.log('DB:', process.env.DATABASE_URL)
} else {
    console.error('ATENÇãO: Arquivo de banco de dados não encontrado');
}

export const sqlite = new Database(dbPath)
export const db: BetterSQLite3Database = drizzle(sqlite);