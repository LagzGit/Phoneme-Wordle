export function runtimeDatabaseUrl() {
  const configured = process.env.DATABASE_URL || "file:./dev.db";
  return configured === "file:./dev.db" ? "file:./prisma/dev.db" : configured;
}
