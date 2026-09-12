"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { downloadHTML } from "@/lib/download";
import WordlePreview from "@/components/WordlePreview";
import PhonemeTile from "@/components/PhonemeTile";
import { findPhoneme } from "@/lib/phonemes";

export default function WordleBuilder({ initialActivityId }) {
  const [activities, setActivities] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/activities?type=WORDLE")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || "Could not load Wordle activities.");
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
  const target = activity?.words.find((word) => word.isTarget) || activity?.words[0];

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

  if (loading) {
    return <PageMessage>Loading saved Wordle activities…</PageMessage>;
  }

  if (!activity) {
    return (
      <PageMessage>
        <p>{error || "No Wordle configurations are stored yet."}</p>
        <Link href="/activities" className="button-primary mt-4">Create a saved activity</Link>
      </PageMessage>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Database-driven builder</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Phoneme Wordle</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Select a saved configuration. Its target, phonemes, difficulty and output settings are retrieved from the backend.
        </p>
      </header>

      {error && <div className="mb-5 rounded-lg border border-brick bg-brick-soft px-4 py-3 text-sm text-brick">{error}</div>}

      <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
        <div className="space-y-6 rounded-xl border border-border bg-surface p-5">
          <div>
            <label htmlFor="wordle-activity" className="block text-sm font-medium text-ink">Saved activity</label>
            <select
              id="wordle-activity"
              value={activity.id}
              onChange={(event) => setSelectedId(Number(event.target.value))}
              className="form-control mt-1.5"
            >
              {activities.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-ink-soft">Difficulty</dt><dd className="font-semibold text-ink">{activity.difficulty}</dd></div>
            <div><dt className="text-ink-soft">Maximum guesses</dt><dd className="font-semibold text-ink">{activity.maxGuesses}</dd></div>
          </dl>

          {activity.hint && (
            <div className="rounded-lg bg-primary-soft p-3 text-sm text-primary-dark">
              <span className="font-semibold">Activity hint:</span> {activity.hint}
            </div>
          )}

          {target ? (
            <div>
              <p className="text-sm font-medium text-ink">Stored target word</p>
              <p className="mt-1.5 font-mono text-sm font-semibold text-ink">{target.word}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {target.phonemes.map((ipa, index) => {
                  const meta = findPhoneme(ipa);
                  return (
                    <PhonemeTile
                      key={`${ipa}-${index}`}
                      ipa={ipa}
                      label={meta?.label ?? ipa}
                      example={meta?.example ?? target.word.toLowerCase()}
                      size="2.6rem"
                      as="div"
                      showHint={activity.showHints}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-border p-3 text-sm text-brick">
              This configuration has no target word. Add one in Saved Activities.
            </p>
          )}

          <button type="button" onClick={handleGenerate} disabled={!target} className="button-primary w-full disabled:opacity-40">
            {downloaded ? "Downloaded ✓" : "Generate stored activity .html"}
          </button>
          <Link href="/activities" className="button-secondary w-full">Manage saved activities</Link>
        </div>

        <div className="rounded-xl border border-border bg-paper-alt p-6">
          <p className="mb-4 text-center text-sm font-medium text-ink-soft">Live preview from database data</p>
          {target ? (
            <WordlePreview
              key={`${activity.id}-${activity.updatedAt}`}
              target={target}
              maxGuesses={activity.maxGuesses}
              showHints={activity.showHints}
            />
          ) : (
            <p className="text-center text-sm text-ink-soft">Add a target word to preview this activity.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PageMessage({ children }) {
  return <div className="mx-auto max-w-2xl px-4 py-20 text-center text-ink-soft">{children}</div>;
}
