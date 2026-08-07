"use client";

import { useState } from "react";
import PhonemeTile from "./PhonemeTile";
import { findPhoneme } from "@/lib/phonemes";

function cellKey(r, c) {
  return `${r},${c}`;
}

// NOTE: the parent passes a `key` derived from the grid configuration so
// this component remounts — and its selection/found state resets cleanly —
// whenever size, diagonals or shuffle seed change.
export default function WordSearchPreview({ grid, placements, words }) {
  const size = grid.length;
  const [selection, setSelection] = useState([]);
  const [found, setFound] = useState(new Set());
  const [feedback, setFeedback] = useState(
    "Select the first and last phoneme of a hidden word."
  );

  function selectCell(r, c) {
    if (selection.length === 0) {
      setSelection([[r, c]]);
      setFeedback("Start selected. Now choose the last phoneme of the word.");
      return;
    }

    const [sr, sc] = selection[0];
    const rowDistance = r - sr;
    const colDistance = c - sc;
    const straightLine =
      rowDistance === 0 ||
      colDistance === 0 ||
      Math.abs(rowDistance) === Math.abs(colDistance);

    if (!straightLine) {
      setSelection([]);
      setFeedback("Choose cells in one row, column or diagonal. Try again.");
      return;
    }

    const dr = Math.sign(rowDistance);
    const dc = Math.sign(colDistance);
    const steps = Math.max(Math.abs(rowDistance), Math.abs(colDistance));
    const cells = Array.from({ length: steps + 1 }, (_, i) => [
      sr + dr * i,
      sc + dc * i,
    ]);

    const match = placements.find((p) => {
      if (found.has(p.word)) return false;
      const a = new Set(cells.map(([cellRow, cellCol]) => cellKey(cellRow, cellCol)));
      const b = new Set(p.cells.map(([r, c]) => cellKey(r, c)));
      if (a.size !== b.size) return false;
      for (const k of a) if (!b.has(k)) return false;
      return true;
    });

    if (match) {
      const nextFound = new Set([...found, match.word]);
      setFound(nextFound);
      setFeedback(
        nextFound.size === words.length
          ? "All words found! Well done."
          : `${match.word} found.`
      );
    } else {
      setFeedback("That is not one of the target words. Try again.");
    }
    setSelection([]);
  }

  const selectedSet = new Set(selection.map(([r, c]) => cellKey(r, c)));
  const foundCellSet = new Set(
    placements
      .filter((p) => found.has(p.word))
      .flatMap((p) => p.cells.map(([r, c]) => cellKey(r, c)))
  );

  return (
    <div className="flex w-full flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
      <div className="max-w-full">
        <p className="mb-3 min-h-5 text-center text-xs text-ink-soft" aria-live="polite">
          {feedback}
        </p>
        <div className="max-w-full overflow-x-auto pb-1">
          <div
            className="grid w-max select-none gap-[2px] rounded-lg border-2 border-border bg-border"
            style={{ gridTemplateColumns: `repeat(${size}, 2.4rem)` }}
            aria-label="Phoneme word search grid"
          >
            {grid.map((row, r) =>
              row.map((unit, c) => {
                const key = cellKey(r, c);
                const isSelected = selectedSet.has(key);
                const isFound = foundCellSet.has(key);
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => selectCell(r, c)}
                    aria-label={`Row ${r + 1}, column ${c + 1}, phoneme /${unit}/`}
                    className="flex h-[2.4rem] w-[2.4rem] cursor-pointer items-center justify-center border-0 font-mono font-semibold"
                    style={{
                      background: isFound
                        ? "var(--amber-soft)"
                        : isSelected
                          ? "var(--primary-soft)"
                          : "var(--surface)",
                      color: isFound ? "#7a5218" : "var(--ink)",
                      fontSize: unit.length > 1 ? "0.7rem" : "0.9rem",
                    }}
                  >
                    {unit}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="w-full max-w-xs">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-soft">
          Words to find ({found.size}/{words.length})
        </p>
        <div className="space-y-2">
          {words.map((w) => {
            const isFound = found.has(w.word);
            return (
              <div
                key={w.word}
                className={`flex flex-wrap items-center gap-1.5 rounded-md border px-2.5 py-2 text-sm ${
                  isFound
                    ? "border-amber bg-amber-soft"
                    : "border-border bg-surface"
                }`}
              >
                <div className="flex flex-wrap gap-1">
                  {w.phonemes.map((ipa, i) => {
                    const meta = findPhoneme(ipa);
                    return (
                      <PhonemeTile
                        key={i}
                        ipa={ipa}
                        label={meta?.label ?? ipa}
                        example={meta?.example ?? w.word.toLowerCase()}
                        size="2rem"
                        as="div"
                      />
                    );
                  })}
                </div>
                <span
                  className={`ml-auto font-mono font-semibold ${
                    isFound ? "text-ink-soft line-through" : "text-ink"
                  }`}
                >
                  {w.word}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
