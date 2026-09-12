import test from "node:test";
import assert from "node:assert/strict";
import {
  activityCreateSchema,
  parsePhonemeText,
  wordCreateSchema,
} from "../lib/activity-validation.js";

test("comma parsing preserves multi-character phonemes", () => {
  assert.deepEqual(parsePhonemeText("/tʃ/, /ɪ/, /n/"), ["tʃ", "ɪ", "n"]);
});

test("word validation accepts supported HCE phonemes", () => {
  const result = wordCreateSchema.safeParse({
    word: "CHIN",
    phonemes: ["tʃ", "ɪ", "n"],
    hint: "Below your mouth",
  });
  assert.equal(result.success, true);
});

test("word validation rejects unsupported phoneme data", () => {
  const result = wordCreateSchema.safeParse({ word: "TEST", phonemes: ["not-ipa"] });
  assert.equal(result.success, false);
  assert.match(result.error.issues[0].message, /supported HCE keyboard/i);
});

test("activity validation applies safe defaults", () => {
  const result = activityCreateSchema.parse({ title: "Test Wordle", type: "WORDLE" });
  assert.equal(result.difficulty, "MEDIUM");
  assert.equal(result.showHints, true);
});
