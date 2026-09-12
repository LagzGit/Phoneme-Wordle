import test from "node:test";
import assert from "node:assert/strict";
import { generateGrid } from "../lib/wordsearch.js";
import { generateWordleHTML } from "../lib/exportWordle.js";

test("word search stores one complete phoneme in each selected cell", () => {
  const words = [
    { word: "CHIN", phonemes: ["tʃ", "ɪ", "n"] },
    { word: "JAM", phonemes: ["dʒ", "æ", "m"] },
  ];
  const result = generateGrid({ words, size: 8, allowDiagonals: true, seed: 10 });

  for (const placement of result.placements) {
    const source = words.find((word) => word.word === placement.word);
    const stored = placement.cells.map(([row, column]) => result.grid[row][column]);
    assert.deepEqual(stored, source.phonemes);
  }
});

test("Wordle export contains stored settings and safely escapes markup", () => {
  const html = generateWordleHTML({
    target: { word: "CHIN", phonemes: ["tʃ", "ɪ", "n"] },
    maxGuesses: 4,
    activityTitle: "Saved Wordle",
    activityHint: "Try <strong>CH</strong>",
    showHints: false,
  });

  assert.match(html, /Saved Wordle/);
  assert.match(html, /const maxGuesses = DATA.maxGuesses/);
  assert.match(html, /tʃ/);
  assert.match(html, /Try &lt;strong&gt;CH&lt;\/strong&gt;/);
  assert.doesNotMatch(html, /Try <strong>CH<\/strong>/);
});
