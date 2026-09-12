PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS "Activity" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "title" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "difficulty" TEXT NOT NULL,
  "hint" TEXT,
  "instructions" TEXT,
  "maxGuesses" INTEGER NOT NULL DEFAULT 6,
  "gridSize" INTEGER NOT NULL DEFAULT 10,
  "allowDiagonals" BOOLEAN NOT NULL DEFAULT true,
  "showHints" BOOLEAN NOT NULL DEFAULT true,
  "outputFileName" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Word" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "word" TEXT NOT NULL,
  "hint" TEXT,
  "isTarget" BOOLEAN NOT NULL DEFAULT false,
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "activityId" INTEGER NOT NULL,
  CONSTRAINT "Word_activityId_fkey"
    FOREIGN KEY ("activityId") REFERENCES "Activity" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "WordPhoneme" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "symbol" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "wordId" INTEGER NOT NULL,
  CONSTRAINT "WordPhoneme_wordId_fkey"
    FOREIGN KEY ("wordId") REFERENCES "Word" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Activity_type_idx" ON "Activity"("type");
CREATE INDEX IF NOT EXISTS "Activity_updatedAt_idx" ON "Activity"("updatedAt");
CREATE UNIQUE INDEX IF NOT EXISTS "Word_activityId_word_key" ON "Word"("activityId", "word");
CREATE INDEX IF NOT EXISTS "Word_activityId_idx" ON "Word"("activityId");
CREATE UNIQUE INDEX IF NOT EXISTS "WordPhoneme_wordId_position_key" ON "WordPhoneme"("wordId", "position");
CREATE INDEX IF NOT EXISTS "WordPhoneme_wordId_idx" ON "WordPhoneme"("wordId");
