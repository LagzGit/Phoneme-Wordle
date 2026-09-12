import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { runtimeDatabaseUrl } from "../lib/database-url.js";

const adapter = new PrismaBetterSqlite3({
  url: runtimeDatabaseUrl(),
});
const prisma = new PrismaClient({ adapter });

const activities = [
  {
    title: "TH Sound Wordle",
    type: "WORDLE",
    difficulty: "MEDIUM",
    hint: "Listen for the unvoiced TH sound at the start.",
    instructions: "Select one phoneme for each box, then submit your guess.",
    maxGuesses: 6,
    gridSize: 10,
    allowDiagonals: true,
    showHints: true,
    outputFileName: "th-sound-wordle",
    words: [
      { word: "THIN", phonemes: ["θ", "ɪ", "n"], hint: "Not thick", isTarget: true },
    ],
  },
  {
    title: "J Sound Wordle",
    type: "WORDLE",
    difficulty: "EASY",
    hint: "The first phoneme sounds like J.",
    instructions: "Use the phoneme keyboard and try the target in eight guesses.",
    maxGuesses: 8,
    gridSize: 8,
    allowDiagonals: false,
    showHints: true,
    outputFileName: "j-sound-wordle",
    words: [
      { word: "JAM", phonemes: ["dʒ", "æ", "m"], hint: "A fruit spread", isTarget: true },
    ],
  },
  {
    title: "SH, CH and TH Word Search",
    type: "WORD_SEARCH",
    difficulty: "MEDIUM",
    hint: "Look horizontally, vertically and diagonally.",
    instructions: "Select the first and last phoneme of each hidden word.",
    maxGuesses: 6,
    gridSize: 10,
    allowDiagonals: true,
    showHints: true,
    outputFileName: "sh-ch-th-word-search",
    words: [
      { word: "THIN", phonemes: ["θ", "ɪ", "n"], hint: "Not thick" },
      { word: "THEN", phonemes: ["ð", "e", "n"], hint: "At that time" },
      { word: "SHIP", phonemes: ["ʃ", "ɪ", "p"], hint: "A large boat" },
      { word: "CHIN", phonemes: ["tʃ", "ɪ", "n"], hint: "Below your mouth" },
      { word: "JAM", phonemes: ["dʒ", "æ", "m"], hint: "A fruit spread" },
    ],
  },
];

async function main() {
  await prisma.activity.deleteMany();
  await prisma.$executeRawUnsafe(
    "DELETE FROM sqlite_sequence WHERE name IN ('Activity', 'Word', 'WordPhoneme')"
  );

  for (const activity of activities) {
    const { words, ...activityData } = activity;
    await prisma.activity.create({
      data: {
        ...activityData,
        words: {
          create: words.map((word, position) => ({
            word: word.word,
            hint: word.hint,
            isTarget: word.isTarget || false,
            position,
            phonemes: {
              create: word.phonemes.map((symbol, phonemePosition) => ({
                symbol,
                position: phonemePosition,
              })),
            },
          })),
        },
      },
    });
  }

  console.log(`Seeded ${activities.length} activity configurations.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
