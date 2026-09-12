import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";
import { runtimeDatabaseUrl } from "../lib/database-url.js";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationPath = path.join(
  scriptDirectory,
  "migrations",
  "20260912190000_init",
  "migration.sql"
);
const configuredUrl = runtimeDatabaseUrl();

if (!configuredUrl.startsWith("file:")) {
  throw new Error("The local setup script requires a file-based SQLite URL.");
}

const databasePath = configuredUrl.slice("file:".length);
const absoluteDatabasePath = path.resolve(process.cwd(), databasePath);
fs.mkdirSync(path.dirname(absoluteDatabasePath), { recursive: true });

const database = new Database(absoluteDatabasePath);
try {
  database.exec(fs.readFileSync(migrationPath, "utf8"));
  console.log(`Database schema is ready at ${absoluteDatabasePath}.`);
} finally {
  database.close();
}
