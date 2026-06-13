import Database from "better-sqlite3";
import { LicenseStatus } from "@phone-toolkit/shared-types";
import * as path from "path";

export class SqliteService {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(__dirname, "../db/license-cache.db");
    this.db = new Database(dbPath);
    this.initialize();
  }

  private initialize() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS license_cache (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        data TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
  }

  async getLicenseCache(): Promise<LicenseStatus | null> {
    const row = this.db.prepare("SELECT data FROM license_cache WHERE id = 1").get() as { data: string } | undefined;
    if (!row) return null;
    return JSON.parse(row.data) as LicenseStatus;
  }

  async saveLicenseCache(status: LicenseStatus): Promise<void> {
    const data = JSON.stringify(status);
    const updated_at = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO license_cache (id, data, updated_at) VALUES (1, ?, ?)
      ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
    `).run(data, updated_at);
  }
}