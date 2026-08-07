"use client";

import { useMemo, useState } from "react";
import { WORDSEARCH_PRESET } from "@/lib/phonemes";
import { generateGrid } from "@/lib/wordsearch";
import { generateWordSearchHTML } from "@/lib/exportWordSearch";
import { downloadHTML } from "@/lib/download";
import WordSearchPreview from "@/components/WordSearchPreview";

const DIFFICULTIES = {
  Easy: { size: 8, allowDiagonals: false },
  Medium: { size: 10, allowDiagonals: true },
  Hard: { size: 12, allowDiagonals: true },
};

export default function WordSearchBuilderPage() {
  const [difficulty, setDifficulty] = useState("Medium");
  const [title, setTitle] = useState("Phoneme Word Search");
  const [downloaded, setDownloaded] = useState(false);

  const words = WORDSEARCH_PRESET;
  const { size, allowDiagonals } = DIFFICULTIES[difficulty];

  const { grid, placements } = useMemo(
    () =>
      generateGrid({
        words,
        size,
        allowDiagonals,
      }),
    [size, allowDiagonals, words]
  );

  const enrichedWords = words;

  function handleGenerate() {
    const html = generateWordSearchHTML({
      grid,
      placements,
      words: enrichedWords,
      activityTitle: title.trim() || "Phoneme Word Search",
    });
    downloadHTML(`${slugify(title || "phoneme-word-search")}.html`, html);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
          Builder
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
          Phoneme Word Search
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
          A fixed set of five phoneme-based words is arranged into a grid.
          Adjust the puzzle size below, try it in the preview, then generate
          a shareable HTML file.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
        <div className="space-y-6 rounded-xl border border-border bg-surface p-5">
          <div>
            <label htmlFor="ws-title" className="block text-sm font-medium text-ink">
              Activity title
            </label>
            <input
              id="ws-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={60}
              className="mt-1.5 w-full rounded-md border border-border bg-paper px-3 py-2 text-sm text-ink focus:border-primary"
              placeholder="e.g. SH & CH word search"
            />
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-ink">Difficulty</legend>
            <div className="mt-2 flex gap-2">
              {Object.entries(DIFFICULTIES).map(([label, option]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setDifficulty(label)}
                  aria-pressed={difficulty === label}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    difficulty === label
                      ? "border-primary bg-primary-soft text-primary-dark"
                      : "border-border bg-paper text-ink-soft hover:bg-paper-alt"
                  }`}
                >
                  {label}
                  <span className="block text-[0.65rem] font-normal">
                    {option.size} × {option.size}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-soft">
              Easy uses straight words; Medium and Hard can also use diagonals.
            </p>
          </fieldset>

          <div>
            <p className="text-sm font-medium text-ink">Word list (fixed)</p>
            <p className="mt-1 text-xs text-ink-soft">
              {words.map((w) => w.word).join(", ")} — dynamic word-list
              management is introduced in Assessment 2.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
          >
            {downloaded ? "Downloaded ✓" : "Generate & download .html"}
          </button>
        </div>

        {/* Live preview */}
        <div className="rounded-xl border border-border bg-paper-alt p-6">
          <p className="mb-4 text-center text-sm font-medium text-ink-soft">
            Live preview
          </p>
          <WordSearchPreview
            key={difficulty}
            grid={grid}
            placements={placements}
            words={enrichedWords}
          />
        </div>
      </div>
    </div>
  );
}

function slugify(str) {
  return (
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "phoneme-word-search"
  );
}
