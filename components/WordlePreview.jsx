"use client";

import { useMemo, useState } from "react";
import PhonemeKeyboard from "./PhonemeKeyboard";
import { findPhoneme } from "@/lib/phonemes";

// NOTE: the parent passes a `key` derived from (target, maxGuesses) so this
// component remounts — and its state resets cleanly — whenever the builder
// configuration changes, rather than syncing state inside an effect.
export default function WordlePreview({ target, maxGuesses, showHints = true }) {
  const targetPhonemes = useMemo(() => target.phonemes, [target]);
  const wordLength = targetPhonemes.length;

  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState([]);
  const [status, setStatus] = useState("playing"); // playing | won | lost

  function addPhoneme(ipa) {
    if (status !== "playing" || current.length >= wordLength) return;
    setCurrent((c) => [...c, ipa]);
  }

  function backspace() {
    if (status !== "playing") return;
    setCurrent((c) => c.slice(0, -1));
  }

  function submit() {
    if (status !== "playing" || current.length !== wordLength) return;
    const states = current.map((ipa, i) => {
      if (ipa === targetPhonemes[i]) return "correct";
      if (targetPhonemes.includes(ipa)) return "present";
      return "absent";
    });
    const nextGuesses = [...guesses, { ipas: current, states }];
    setGuesses(nextGuesses);
    setCurrent([]);
    if (states.every((s) => s === "correct")) {
      setStatus("won");
    } else if (nextGuesses.length >= maxGuesses) {
      setStatus("lost");
    }
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        aria-live="polite"
        className="min-h-[1.5rem] text-sm font-semibold"
        style={{
          color:
            status === "won"
              ? "var(--amber)"
              : status === "lost"
                ? "var(--brick)"
                : "var(--ink-soft)",
        }}
      >
        {status === "won" && "Correct! Great listening."}
        {status === "lost" && "Out of guesses — answer revealed below."}
        {status === "playing" && "Preview: try the activity yourself."}
      </div>

      <div className="flex flex-col gap-2">
        {Array.from({ length: maxGuesses }).map((_, rowIndex) => {
          const guess = guesses[rowIndex];
          const isCurrentRow = rowIndex === guesses.length && status === "playing";
          return (
            <div key={rowIndex} className="flex gap-2">
              {Array.from({ length: wordLength }).map((_, colIndex) => {
                let content = "";
                let state;
                if (guess) {
                  const ph = findPhoneme(guess.ipas[colIndex]);
                  content = ph ? ph.label : guess.ipas[colIndex];
                  state = guess.states[colIndex];
                } else if (isCurrentRow) {
                  const ipa = current[colIndex];
                  content = ipa ? `/${ipa}/` : "";
                }
                return (
                  <div
                    key={colIndex}
                    className="flex h-12 w-12 items-center justify-center rounded-lg border-2 font-mono text-xs font-semibold"
                    style={{
                      borderColor:
                        state === "correct"
                          ? "var(--amber)"
                          : state === "present"
                            ? "var(--primary)"
                            : state === "absent"
                              ? "var(--brick)"
                              : "var(--border)",
                      background:
                        state === "correct"
                          ? "var(--amber-soft)"
                          : state === "present"
                            ? "var(--primary-soft)"
                            : state === "absent"
                              ? "var(--brick-soft)"
                              : "var(--surface)",
                    }}
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={backspace}
          disabled={status !== "playing"}
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-paper-alt disabled:opacity-40"
        >
          ⌫ Back
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={status !== "playing" || current.length !== wordLength}
          className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
        >
          Enter ↵
        </button>
      </div>

      <PhonemeKeyboard
        onSelect={addPhoneme}
        disabled={status !== "playing"}
        showHints={showHints}
      />

      {status !== "playing" && (
        <div className="rounded-lg border border-amber bg-amber-soft px-4 py-3 text-center">
          <p className="font-mono text-sm text-ink-soft">
            {target.phonemes.map((p) => `/${p}/`).join(" ")}
          </p>
          <p className="mt-1 font-display text-xl font-semibold text-ink">
            {target.word}
          </p>
        </div>
      )}
    </div>
  );
}
