import Link from "next/link";
import PhonemeTile from "@/components/PhonemeTile";

const HERO_STRIP = [
  { ipa: "θ", label: "TH", example: "thin" },
  { ipa: "ʃ", label: "SH", example: "ship" },
  { ipa: "tʃ", label: "CH", example: "choice" },
  { ipa: "ŋ", label: "NG", example: "ring" },
  { ipa: "ɹ", label: "R", example: "ring" },
];

export default function HomePage() {
  return (
    <div>
      <section className="border-b border-border bg-paper-alt">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:py-20">
          <div className="max-w-xl">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-primary">
              Assessment 2 — Backend and database integration
            </p>
            <h1 className="font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              Build phoneme-based Wordle &amp; Word Search activities.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
              A classroom activity builder for Speech Pathology teachers.
              Store phoneme word lists and activity settings, retrieve them
              through the backend, preview the result, then generate a single
              HTML file your class can play in any browser.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/activities"
                className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
              >
                Create or manage activities
              </Link>
              <Link
                href="/wordle"
                className="rounded-md border border-primary px-5 py-2.5 text-sm font-semibold text-primary-dark transition-colors hover:bg-primary-soft"
              >
                Open Wordle builder
              </Link>
            </div>
          </div>

          <div className="flex-1">
            <p className="mb-3 text-center text-sm font-medium text-ink-soft lg:text-left">
              Hover or focus a tile to reveal the English equivalent
            </p>
            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
              {HERO_STRIP.map((p) => (
                <PhonemeTile key={p.ipa} {...p} size="4.2rem" as="div" />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-display text-2xl font-semibold text-ink">
          How the builder works
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <StepCard
            index="01"
            title="Store"
            body="Create reusable activity records with words, ordered phonemes, hints and difficulty settings."
          />
          <StepCard
            index="02"
            title="Retrieve"
            body="Select a saved Wordle or Word Search and preview the exact data returned by the backend API."
          />
          <StepCard
            index="03"
            title="Generate"
            body="Generate a self-contained .html activity from the selected database record."
          />
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <ActivityLink
              href="/activities"
              eyebrow="Database"
              title="Activity Manager"
              body="Create, read, update and delete activity configurations, words and multi-character phoneme values."
            />
            <ActivityLink
              href="/wordle"
              eyebrow="Activity 1"
              title="Phoneme Wordle"
              body="A single target word, guessed one phoneme at a time. Hover hints show the phonetic-to-English letter match; a correct guess reveals the full spelling."
            />
            <ActivityLink
              href="/wordsearch"
              eyebrow="Activity 2"
              title="Phoneme Word Search"
              body="A five-word phoneme-focused search grid, with each word displayed as hoverable phoneme tiles alongside the puzzle."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function StepCard({ index, title, body }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <span className="font-mono text-xs text-primary">{index}</span>
      <h3 className="mt-2 font-display text-lg font-semibold text-ink">
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}

function ActivityLink({ href, eyebrow, title, body }) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-border bg-paper p-6 transition-colors hover:border-primary hover:bg-primary-soft/40"
    >
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-primary">
        {eyebrow}
      </p>
      <h3 className="mt-2 font-display text-xl font-semibold text-ink">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
      <span className="mt-4 inline-block text-sm font-semibold text-primary-dark underline-offset-4 group-hover:underline">
        Open builder →
      </span>
    </Link>
  );
}
