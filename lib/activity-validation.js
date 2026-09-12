import { z } from "zod";
import { PHONEME_LABELS } from "./phonemes.js";

export const ACTIVITY_TYPES = ["WORDLE", "WORD_SEARCH"];
export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];

export const DIFFICULTY_SETTINGS = {
  EASY: { maxGuesses: 8, gridSize: 8, allowDiagonals: false },
  MEDIUM: { maxGuesses: 6, gridSize: 10, allowDiagonals: true },
  HARD: { maxGuesses: 4, gridSize: 12, allowDiagonals: true },
};

const knownPhonemes = new Set(Object.keys(PHONEME_LABELS));
const optionalShortText = (maximum) =>
  z.union([z.string().trim().max(maximum), z.null()]).optional();

const activityFields = {
  title: z.string().trim().min(3, "Title must contain at least 3 characters.").max(60),
  type: z.enum(ACTIVITY_TYPES),
  difficulty: z.enum(DIFFICULTIES),
  hint: optionalShortText(160),
  instructions: optionalShortText(300),
  maxGuesses: z.number().int().min(3).max(12).optional(),
  gridSize: z.number().int().min(6).max(20).optional(),
  allowDiagonals: z.boolean().optional(),
  showHints: z.boolean().optional(),
  outputFileName: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only.")
    .optional(),
};

export const activityCreateSchema = z
  .object({
    ...activityFields,
    difficulty: activityFields.difficulty.default("MEDIUM"),
    showHints: activityFields.showHints.default(true),
  })
  .strict();

export const activityUpdateSchema = z
  .object(activityFields)
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one activity field to update.",
  });

export const phonemeSymbolSchema = z
  .string()
  .trim()
  .min(1, "A phoneme cannot be empty.")
  .max(8, "A phoneme symbol is too long.")
  .refine((symbol) => knownPhonemes.has(symbol), {
    message: "Use a phoneme from the supported HCE keyboard.",
  });

const wordFields = {
  word: z
    .string()
    .trim()
    .min(1, "Word is required.")
    .max(40)
    .refine((word) => /^[\p{L}\p{M}' -]+$/u.test(word), {
      message: "Word may contain letters, spaces, apostrophes and hyphens only.",
    }),
  phonemes: z.array(phonemeSymbolSchema).min(1).max(15),
  hint: optionalShortText(160),
  isTarget: z.boolean().optional(),
  position: z.number().int().min(0).max(999).optional(),
};

export const wordCreateSchema = z.object(wordFields).strict();

export const wordUpdateSchema = z
  .object(wordFields)
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one word field to update.",
  });

export function validationDetails(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || "request",
    message: issue.message,
  }));
}

export function parsePhonemeText(value) {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((part) => part.trim().replace(/^\/(.*)\/$/, "$1").trim())
    .filter(Boolean);
}

export function slugify(value) {
  return (
    String(value)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "phoneme-activity"
  );
}
