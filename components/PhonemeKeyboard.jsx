"use client";

import { KEYBOARD_ROWS, findPhoneme } from "@/lib/phonemes";

const CONSONANT_ROW_COUNT = 7;

export default function PhonemeKeyboard({ onSelect, disabled = false, showHints = true }) {
  const consonantRows = KEYBOARD_ROWS.slice(0, CONSONANT_ROW_COUNT);
  const vowelRows = KEYBOARD_ROWS.slice(CONSONANT_ROW_COUNT);

  return (
    <div className="w-full max-w-md">
      <KeyGroup
        label="Consonants"
        rows={consonantRows}
        onSelect={onSelect}
        disabled={disabled}
        showHints={showHints}
      />
      <KeyGroup
        label="Vowels"
        rows={vowelRows}
        onSelect={onSelect}
        disabled={disabled}
        showHints={showHints}
        className="mt-3"
      />
    </div>
  );
}

function KeyGroup({ label, rows, onSelect, disabled, showHints, className = "" }) {
  return (
    <div className={className}>
      <p className="mb-1.5 text-center text-[0.65rem] font-medium uppercase tracking-wide text-ink-soft">
        {label}
      </p>
      <div className="space-y-1">
        {rows.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.map((ipa, ci) =>
              ipa ? (
                <Key key={ci} ipa={ipa} onSelect={onSelect} disabled={disabled} showHints={showHints} />
              ) : (
                <span key={ci} className="h-9 w-9" aria-hidden />
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Key({ ipa, onSelect, disabled, showHints }) {
  const meta = findPhoneme(ipa);
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(ipa)}
      className="group relative h-9 w-9 rounded-md border border-border bg-surface font-mono text-xs font-medium text-ink transition-colors hover:border-primary hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-40"
      aria-label={showHints ? `/${ipa}/ sounds like ${meta?.label ?? ipa}, as in ${meta?.example ?? ""}` : `Phoneme /${ipa}/`}
    >
      {ipa}
      {meta && showHints && (
        <span className="pointer-events-none absolute bottom-[110%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 text-[0.65rem] text-paper opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {meta.label} (as in {meta.example})
        </span>
      )}
    </button>
  );
}
