import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { runtimeDatabaseUrl } from "./database-url.js";

const globalForPrisma = globalThis;

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: runtimeDatabaseUrl() });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.phonemePrisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.phonemePrisma = prisma;
}
