# Phoneme Activity Builder

A Next.js frontend builder for phoneme-based **Wordle** and **Word Search**
classroom activities, built for Speech Pathology teachers and students.

> **Assessment 1 scope:** frontend design and usability only. There is no
> database or dynamic word-list management yet — both activities are built
> from a fixed, in-code phoneme corpus. Assessment 2 introduces the word
> bank and database-driven generation.

## Phoneme data

Both builders use the unit's supplied **HCE (Harrington, Cox & Evans) broad
Australian English** phonemic transcription:

- A 43-symbol keyboard chart (`KEYBOARD_ROWS` in `lib/phonemes.js`), laid
  out in the exact row groupings from the reference "Keyboard for wordle"
  chart — consonants by manner/place, vowels by height/backness.
- One fixed Wordle target (`WORDLE_TARGET`), keeping Assessment 1 focused on
  frontend design rather than word-list management.
- A fixed 5-word preset (`WORDSEARCH_PRESET`) for the Word Search activity,
  chosen for phoneme diversity across the SH/CH/TH/J digraphs.

The Word Search grid places **one phoneme per cell** (not one letter per
cell) — a digraph like `/tʃ/` occupies a single cell, matching the
convention described in the corpus ("Each phoneme occupies a separate
cell").

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

`npm run build` creates a production build; `npm run lint` runs ESLint.

> Note: this project uses `next/font/google` (Fraunces, IBM Plex Sans, IBM
> Plex Mono), which fetches font files at build time. An internet connection
> is required the first time you build or run the dev server.

## Pages

| Route          | Purpose                                                        |
| -------------- | ---------------------------------------------------------------- |
| `/`            | Home — project intro and links to both builders                |
| `/about`       | About — project scope, name/student number, video placeholder  |
| `/wordle`      | Wordle builder — config panel + live preview + HTML export     |
| `/wordsearch`  | Word Search builder — config panel + live preview + HTML export |
| `/settings`    | Light/dark theme preference, stored in a cookie                |

## Structure

```
app/                 Route pages (App Router)
components/           SiteHeader, SiteFooter, PhonemeTile, WordlePreview,
                      WordSearchPreview
lib/
  phonemes.js         IPA reference data + fixed preset word banks
  wordsearch.js       Word search grid generation algorithm
  exportWordle.js      Builds a standalone playable Wordle .html string
  exportWordSearch.js  Builds a standalone playable Word Search .html string
  download.js         Browser download helper
  theme.js            Cookie read/write helpers
```

## How "Generate" works

Each builder page keeps its live preview and its exported file in sync by
sharing the same data (target word / grid + placements) and interaction
logic. Clicking **Generate & download .html** calls the matching
`lib/exportWordle.js` or `lib/exportWordSearch.js` function, which returns a
complete, dependency-free HTML document (inline CSS + vanilla JS) and
triggers a browser download — no server or build step required to run the
generated file.

## Author

Tanish Sudan — Student Number: 22407274
