import sqlite3 from "sqlite3";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const dbPath = path.join(__dirname, "../joblinker.db");
const sqlite = sqlite3.verbose();
const db = new sqlite.Database(dbPath);

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON");

// Wrapper pour compatibilité avec l'interface pg
const promisifiedQuery = (sql: string, params: any[] = []) => {
  return new Promise((resolve, reject) => {
    // Normaliser les paramètres PostgreSQL ($1, $2) en points d'interrogation (?)
    let normalizedSql = sql;
    const pgParams: any[] = [];
    let paramIndex = 0;
    
    normalizedSql = sql.replace(/\$(\d+)/g, () => {
      paramIndex++;
      pgParams.push(params[paramIndex - 1]);
      return "?";
    });

    if (normalizedSql.trim().toUpperCase().startsWith("SELECT")) {
      db.all(normalizedSql, pgParams, (err, rows) => {
        if (err) reject(err);
        else resolve({ rows: rows || [] });
      });
    } else {
      db.run(normalizedSql, pgParams, function(err) {
        if (err) reject(err);
        else resolve({ rows: [{ id: this.lastID }] });
      });
    }
  });
};

export const pool = {
  query: promisifiedQuery,
  connect: () => Promise.resolve({
    query: promisifiedQuery,
    release: () => {},
  }),
  end: () => {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });
  },
};
