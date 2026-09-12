"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { downloadHTML } from "@/lib/download";
import { generateGrid } from "@/lib/wordsearch";
import WordSearchPreview from "@/components/WordSearchPreview";

export default function WordSearchBuilder({ initialActivityId }) {
  const [activities, setActivities] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/activities?type=WORD_SEARCH")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || "Could not load Word Search activities.");
        return payload.data;
      })
      .then((data) => {
        if (!active) return;
        setActivities(data);
        const requestedId = Number(initialActivityId);
        const requested = data.find((item) => item.id === requestedId);
        setSelectedId(requested?.id ?? data[0]?.id ?? null);
      })
      .catch((loadError) => active && setError(loadError.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [initialActivityId]);

  const activity = activities.find((item) => item.id === selectedId) || null;
  const puzzle = useMemo(() => {
    if (!activity || activity.words.length < 2) return null;
    return generateGrid({
      words: activity.words,
      size: activity.gridSize,
      allowDiagonals: activity.allowDiagonals,
      seed: activity.id * 101,
    });
  }, [activity]);

  async function handleGenerate() {
    if (!activity) return;
    setError("");
    try {
      const response = await fetch(`/api/activities/${activity.id}/export`);
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.message || "The activity could not be generated.");
      }
      downloadHTML(`${activity.outputFileName}.html`, await response.text());
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch (generateError) {
      setError(generateError.message);
    }
  }

  if (loading) return <PageMessage>Loading saved Word Search activities…</PageMessage>;

  if (!activity) {
    return (
      <PageMessage>
        <p>{error || "No Word Search configurations are stored yet."}</p>
        <Link href="/activities" className="button-primary mt-4">Create a saved activity</Link>
      </PageMessage>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Database-driven builder</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Phoneme Word Search</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
          The word list and puzzle settings below come from the selected database record.
        </p>
      </header>

      {error && <div className="mb-5 rounded-lg border border-brick bg-brick-soft px-4 py-3 text-sm text-brick">{error}</div>}

      <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
        <div className="space-y-6 rounded-xl border border-border bg-surface p-5">
          <div>
            <label htmlFor="wordsearch-activity" className="block text-sm font-medium text-ink">Saved activity</label>
            <select
              id="wordsearch-activity"
              value={activity.id}
              onChange={(event) => setSelectedId(Number(event.target.value))}
              className="form-control mt-1.5"
            >
              {activities.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-ink-soft">Difficulty</dt><dd className="font-semibold text-ink">{activity.difficulty}</dd></div>
            <div><dt className="text-ink-soft">Grid</dt><dd className="font-semibold text-ink">{activity.gridSize} × {activity.gridSize}</dd></div>
            <div><dt className="text-ink-soft">Diagonals</dt><dd className="font-semibold text-ink">{activity.allowDiagonals ? "Allowed" : "Off"}</dd></div>
            <div><dt className="text-ink-soft">Stored words</dt><dd className="font-semibold text-ink">{activity.words.length}</dd></div>
          </dl>

          {activity.hint && <div className="rounded-lg bg-primary-soft p-3 text-sm text-primary-dark"><span className="font-semibold">Activity hint:</span> {activity.hint}</div>}

          <div>
            <p className="text-sm font-medium text-ink">Database word list</p>
            <ul className="mt-2 space-y-1 text-sm text-ink-soft">
              {activity.words.map((word) => (
                <li key={word.id}><span className="font-semibold text-ink">{word.word}</span> — <span className="font-mono">{word.phonemes.map((value) => `/${value}/`).join(" ")}</span></li>
              ))}
            </ul>
          </div>

          {!puzzle && <p className="rounded-lg border border-dashed border-border p-3 text-sm text-brick">Add at least two words in Saved Activities before generating this puzzle.</p>}
          <button type="button" onClick={handleGenerate} disabled={!puzzle} className="button-primary w-full disabled:opacity-40">
            {downloaded ? "Downloaded ✓" : "Generate stored activity .html"}
          </button>
          <Link href="/activities" className="button-secondary w-full">Manage saved activities</Link>
        </div>

        <div className="rounded-xl border border-border bg-paper-alt p-6">
          <p className="mb-4 text-center text-sm font-medium text-ink-soft">Live preview from database data</p>
          {puzzle ? (
            <WordSearchPreview
              key={`${activity.id}-${activity.updatedAt}`}
              grid={puzzle.grid}
              placements={puzzle.placements}
              words={activity.words}
              showHints={activity.showHints}
            />
          ) : (
            <p className="text-center text-sm text-ink-soft">Add two or more words to preview this activity.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PageMessage({ children }) {
  return <div className="mx-auto max-w-2xl px-4 py-20 text-center text-ink-soft">{children}</div>;
}
