"use client";

import { useState } from "react";
import { WORDLE_TARGET, findPhoneme } from "@/lib/phonemes";
import { generateWordleHTML } from "@/lib/exportWordle";
import { downloadHTML } from "@/lib/download";
import WordlePreview from "@/components/WordlePreview";
import PhonemeTile from "@/components/PhonemeTile";

const DIFFICULTIES = [
  { label: "Easy", guesses: 8 },
  { label: "Medium", guesses: 6 },
  { label: "Hard", guesses: 4 },
];

export default function WordleBuilderPage() {
  const [maxGuesses, setMaxGuesses] = useState(6);
  const [title, setTitle] = useState("Phoneme Wordle");
  const [downloaded, setDownloaded] = useState(false);
  const target = WORDLE_TARGET;

  function handleGenerate() {
    const html = generateWordleHTML({
      target,
      maxGuesses,
      activityTitle: title.trim() || "Phoneme Wordle",
    });
    downloadHTML(`${slugify(title || "phoneme-wordle")}.html`, html);
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
          Phoneme Wordle
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Configure the fixed Assessment 1 target, try it in the live preview,
          then generate a single HTML file to share with your class.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
        <div className="space-y-6 rounded-xl border border-border bg-surface p-5">
          <div>
            <label
              htmlFor="activity-title"
              className="block text-sm font-medium text-ink"
            >
              Activity title
            </label>
            <input
              id="activity-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={60}
              className="mt-1.5 w-full rounded-md border border-border bg-paper px-3 py-2 text-sm text-ink focus:border-primary"
              placeholder="e.g. Week 4 — SH sound"
            />
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-ink">
              Difficulty
            </legend>
            <div className="mt-2 flex gap-2">
              {DIFFICULTIES.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setMaxGuesses(option.guesses)}
                  aria-pressed={maxGuesses === option.guesses}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    maxGuesses === option.guesses
                      ? "border-primary bg-primary-soft text-primary-dark"
                      : "border-border bg-paper text-ink-soft hover:bg-paper-alt"
                  }`}
                >
                  {option.label}
                  <span className="block text-[0.65rem] font-normal">
                    {option.guesses} guesses
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <p className="text-sm font-medium text-ink">Target word</p>
            <p className="mt-1.5 font-mono text-sm font-semibold text-ink">
              {target.word}
            </p>
            <p className="mt-2 text-xs text-ink-soft">
              Assessment 1 uses one fixed Wordle target. Word-list management
              is introduced in Assessment 2.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-ink">
              Phonemes in this word
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {target.phonemes.map((ipa, i) => {
                const meta = findPhoneme(ipa);
                return (
                  <PhonemeTile
                    key={i}
                    ipa={ipa}
                    label={meta?.label ?? ipa}
                    example={meta?.example ?? target.word.toLowerCase()}
                    size="2.6rem"
                    as="div"
                  />
                );
              })}
            </div>
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
          <WordlePreview
            key={`${target.word}-${maxGuesses}`}
            target={target}
            maxGuesses={maxGuesses}
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
      .replace(/(^-|-$)+/g, "") || "phoneme-wordle"
  );
}
