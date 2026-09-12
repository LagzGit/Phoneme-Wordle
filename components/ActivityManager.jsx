"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DIFFICULTY_SETTINGS,
  parsePhonemeText,
  slugify,
} from "@/lib/activity-validation";
import { KEYBOARD_ROWS, PHONEME_LABELS } from "@/lib/phonemes";

const PHONEME_OPTIONS = KEYBOARD_ROWS.flat().filter(Boolean);

const EMPTY_ACTIVITY = {
  title: "",
  type: "WORDLE",
  difficulty: "MEDIUM",
  hint: "",
  instructions: "",
  showHints: true,
};

const EMPTY_WORD = { word: "", phonemes: "", hint: "" };

function readableType(type) {
  return type === "WORD_SEARCH" ? "Word Search" : "Wordle";
}

function activityFormValue(activity) {
  return {
    title: activity.title,
    type: activity.type,
    difficulty: activity.difficulty,
    hint: activity.hint || "",
    instructions: activity.instructions || "",
    maxGuesses: activity.maxGuesses,
    gridSize: activity.gridSize,
    allowDiagonals: activity.allowDiagonals,
    showHints: activity.showHints,
    outputFileName: activity.outputFileName,
  };
}

async function apiRequest(url, options) {
  const response = await fetch(url, {
    ...options,
    headers: options?.body ? { "Content-Type": "application/json" } : undefined,
  });
  const payload = await response.json();
  if (!response.ok) {
    const detail = payload.details?.map((item) => `${item.field}: ${item.message}`).join(" ");
    throw new Error([payload.message || "The request failed.", detail].filter(Boolean).join(" "));
  }
  return payload.data;
}

export default function ActivityManager() {
  const [activities, setActivities] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [createForm, setCreateForm] = useState(EMPTY_ACTIVITY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest("/api/activities")
      .then((data) => {
        if (!active) return;
        setActivities(data);
        setSelectedId(data[0]?.id ?? null);
      })
      .catch((loadError) => active && setError(loadError.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const selected = activities.find((activity) => activity.id === selectedId) || null;

  function replaceActivity(updated) {
    setActivities((current) =>
      current.map((activity) => (activity.id === updated.id ? updated : activity))
    );
  }

  async function createActivity(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      const created = await apiRequest("/api/activities", {
        method: "POST",
        body: JSON.stringify({
          ...createForm,
          outputFileName: slugify(createForm.title),
        }),
      });
      setActivities((current) => [created, ...current]);
      setSelectedId(created.id);
      setCreateForm(EMPTY_ACTIVITY);
      setNotice("Activity created. Add its words below.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function removeActivity(id) {
    setActivities((current) => {
      const remaining = current.filter((activity) => activity.id !== id);
      setSelectedId(remaining[0]?.id ?? null);
      return remaining;
    });
    setNotice("Activity deleted.");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
          Database management
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
          Create and manage activities
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">
          Create, read, update and delete reusable Wordle or Word Search configurations.
          Every word and ordered phoneme is stored in SQLite through the backend API.
        </p>
      </header>

      {(error || notice) && (
        <div
          role="status"
          className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
            error
              ? "border-brick bg-brick-soft text-brick"
              : "border-primary bg-primary-soft text-primary-dark"
          }`}
        >
          {error || notice}
        </div>
      )}

      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-display text-xl font-semibold text-ink">Create an activity</h2>
        <form onSubmit={createActivity} className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Field label="Title" htmlFor="new-title">
            <input
              id="new-title"
              required
              minLength={3}
              maxLength={60}
              value={createForm.title}
              onChange={(event) =>
                setCreateForm((form) => ({ ...form, title: event.target.value }))
              }
              className="form-control"
              placeholder="e.g. Week 5 Wordle"
            />
          </Field>
          <Field label="Activity type" htmlFor="new-type">
            <select
              id="new-type"
              value={createForm.type}
              onChange={(event) =>
                setCreateForm((form) => ({ ...form, type: event.target.value }))
              }
              className="form-control"
            >
              <option value="WORDLE">Wordle</option>
              <option value="WORD_SEARCH">Word Search</option>
            </select>
          </Field>
          <Field label="Difficulty" htmlFor="new-difficulty">
            <select
              id="new-difficulty"
              value={createForm.difficulty}
              onChange={(event) =>
                setCreateForm((form) => ({ ...form, difficulty: event.target.value }))
              }
              className="form-control"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </Field>
          <Field label="Activity hint" htmlFor="new-hint">
            <input
              id="new-hint"
              maxLength={160}
              value={createForm.hint}
              onChange={(event) =>
                setCreateForm((form) => ({ ...form, hint: event.target.value }))
              }
              className="form-control"
              placeholder="Optional teacher hint"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-ink md:col-span-2">
            <input
              type="checkbox"
              checked={createForm.showHints}
              onChange={(event) =>
                setCreateForm((form) => ({ ...form, showHints: event.target.checked }))
              }
            />
            Show phoneme hints in the generated activity
          </label>
          <div className="md:col-span-2 lg:text-right">
            <button type="submit" className="button-primary">
              Create and save
            </button>
          </div>
        </form>
      </section>

      <div className="mt-8 grid gap-7 lg:grid-cols-[18rem_1fr]">
        <aside className="rounded-xl border border-border bg-surface p-4">
          <h2 className="font-display text-lg font-semibold text-ink">Stored records</h2>
          <p className="mt-1 text-xs text-ink-soft">{activities.length} activities in the database</p>
          {loading ? (
            <p className="mt-4 text-sm text-ink-soft">Loading activities…</p>
          ) : activities.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">No activities have been saved yet.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {activities.map((activity) => (
                <button
                  type="button"
                  key={activity.id}
                  onClick={() => {
                    setSelectedId(activity.id);
                    setError("");
                    setNotice("");
                  }}
                  className={`w-full rounded-lg border p-3 text-left ${
                    selectedId === activity.id
                      ? "border-primary bg-primary-soft"
                      : "border-border bg-paper hover:border-primary"
                  }`}
                >
                  <span className="block text-sm font-semibold text-ink">{activity.title}</span>
                  <span className="mt-1 block text-xs text-ink-soft">
                    {readableType(activity.type)} · {activity.difficulty.toLowerCase()} · {activity.words.length} word{activity.words.length === 1 ? "" : "s"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <main>
          {selected ? (
            <ActivityEditor
              key={selected.id}
              activity={selected}
              onChanged={replaceActivity}
              onDeleted={removeActivity}
              setError={setError}
              setNotice={setNotice}
            />
          ) : (
            !loading && (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-ink-soft">
                Create an activity to begin managing words and phonemes.
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}

function ActivityEditor({ activity, onChanged, onDeleted, setError, setNotice }) {
  const [form, setForm] = useState(() => activityFormValue(activity));
  const [newWord, setNewWord] = useState(EMPTY_WORD);
  const [editingWordId, setEditingWordId] = useState(null);
  const [editingWord, setEditingWord] = useState(EMPTY_WORD);
  const canAddWord = activity.type === "WORD_SEARCH" || activity.words.length === 0;
  const builderHref = activity.type === "WORDLE" ? "/wordle" : "/wordsearch";

  function setDifficulty(difficulty) {
    const settings = DIFFICULTY_SETTINGS[difficulty];
    setForm((current) => ({ ...current, difficulty, ...settings }));
  }

  async function saveActivity(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      const updated = await apiRequest(`/api/activities/${activity.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          maxGuesses: Number(form.maxGuesses),
          gridSize: Number(form.gridSize),
        }),
      });
      setForm(activityFormValue(updated));
      onChanged(updated);
      setNotice("Activity settings updated.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function deleteActivity() {
    if (!window.confirm(`Delete “${activity.title}” and all of its words?`)) return;
    setError("");
    try {
      await apiRequest(`/api/activities/${activity.id}`, { method: "DELETE" });
      onDeleted(activity.id);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function saveWord(event, wordId = null) {
    event.preventDefault();
    setError("");
    setNotice("");
    const source = wordId ? editingWord : newWord;
    const payload = {
      word: source.word,
      phonemes: parsePhonemeText(source.phonemes),
      hint: source.hint,
    };
    try {
      const updated = await apiRequest(
        wordId ? `/api/words/${wordId}` : `/api/activities/${activity.id}/words`,
        { method: wordId ? "PATCH" : "POST", body: JSON.stringify(payload) }
      );
      onChanged(updated);
      if (wordId) {
        setEditingWordId(null);
        setEditingWord(EMPTY_WORD);
        setNotice("Word updated.");
      } else {
        setNewWord(EMPTY_WORD);
        setNotice("Word created and stored.");
      }
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function deleteWord(word) {
    if (!window.confirm(`Delete the word “${word.word}”?`)) return;
    setError("");
    try {
      const updated = await apiRequest(`/api/words/${word.id}`, { method: "DELETE" });
      onChanged(updated);
      setNotice("Word deleted.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-primary">Activity ID #{activity.id}</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-ink">Edit configuration</h2>
          </div>
          <Link href={`${builderHref}?activityId=${activity.id}`} className="button-secondary">
            Open in {readableType(activity.type)} builder
          </Link>
        </div>

        <form onSubmit={saveActivity} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Title" htmlFor={`title-${activity.id}`}>
            <input
              id={`title-${activity.id}`}
              required
              minLength={3}
              maxLength={60}
              value={form.title}
              onChange={(event) => setForm((value) => ({ ...value, title: event.target.value }))}
              className="form-control"
            />
          </Field>
          <Field label="Activity type" htmlFor={`type-${activity.id}`}>
            <select
              id={`type-${activity.id}`}
              value={form.type}
              onChange={(event) => setForm((value) => ({ ...value, type: event.target.value }))}
              className="form-control"
            >
              <option value="WORDLE">Wordle</option>
              <option value="WORD_SEARCH">Word Search</option>
            </select>
          </Field>
          <Field label="Difficulty" htmlFor={`difficulty-${activity.id}`}>
            <select
              id={`difficulty-${activity.id}`}
              value={form.difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              className="form-control"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </Field>
          <Field label="Download filename" htmlFor={`filename-${activity.id}`}>
            <input
              id={`filename-${activity.id}`}
              required
              value={form.outputFileName}
              onChange={(event) => setForm((value) => ({ ...value, outputFileName: event.target.value }))}
              className="form-control"
              placeholder="week-5-activity"
            />
          </Field>
          <Field label="Activity hint" htmlFor={`hint-${activity.id}`}>
            <input
              id={`hint-${activity.id}`}
              maxLength={160}
              value={form.hint}
              onChange={(event) => setForm((value) => ({ ...value, hint: event.target.value }))}
              className="form-control"
            />
          </Field>
          <Field label="Student instructions" htmlFor={`instructions-${activity.id}`}>
            <input
              id={`instructions-${activity.id}`}
              maxLength={300}
              value={form.instructions}
              onChange={(event) => setForm((value) => ({ ...value, instructions: event.target.value }))}
              className="form-control"
            />
          </Field>
          <Field label="Maximum guesses" htmlFor={`guesses-${activity.id}`}>
            <input
              id={`guesses-${activity.id}`}
              type="number"
              min="3"
              max="12"
              value={form.maxGuesses}
              onChange={(event) => setForm((value) => ({ ...value, maxGuesses: event.target.value }))}
              className="form-control"
            />
          </Field>
          <Field label="Word Search grid size" htmlFor={`grid-${activity.id}`}>
            <input
              id={`grid-${activity.id}`}
              type="number"
              min="6"
              max="20"
              value={form.gridSize}
              onChange={(event) => setForm((value) => ({ ...value, gridSize: event.target.value }))}
              className="form-control"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={form.allowDiagonals}
              onChange={(event) => setForm((value) => ({ ...value, allowDiagonals: event.target.checked }))}
            />
            Allow diagonal Word Search placements
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={form.showHints}
              onChange={(event) => setForm((value) => ({ ...value, showHints: event.target.checked }))}
            />
            Show phoneme hints
          </label>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button type="submit" className="button-primary">Save changes</button>
            <button type="button" onClick={deleteActivity} className="button-danger">Delete activity</button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-display text-xl font-semibold text-ink">Words and phonemes</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Enter complete phonemes separated by commas. For example, CHIN is
          <span className="ml-1 font-mono">tʃ, ɪ, n</span>. The multi-character
          <span className="mx-1 font-mono">tʃ</span>is stored as one database value.
        </p>

        <div className="mt-5 space-y-3">
          {activity.words.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-4 text-sm text-ink-soft">
              No words stored yet.
            </p>
          ) : (
            activity.words.map((word) =>
              editingWordId === word.id ? (
                <WordForm
                  key={word.id}
                  idPrefix={`edit-${word.id}`}
                  value={editingWord}
                  setValue={setEditingWord}
                  onSubmit={(event) => saveWord(event, word.id)}
                  submitLabel="Update word"
                  onCancel={() => setEditingWordId(null)}
                />
              ) : (
                <div key={word.id} className="rounded-lg border border-border bg-paper p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">
                        {word.word} {word.isTarget && <span className="text-xs text-primary">· Wordle target</span>}
                      </p>
                      <p className="mt-1 font-mono text-sm text-primary-dark">
                        {word.phonemes.map((phoneme) => `/${phoneme}/`).join(" ")}
                      </p>
                      {word.hint && <p className="mt-1 text-xs text-ink-soft">Hint: {word.hint}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="button-small"
                        onClick={() => {
                          setEditingWordId(word.id);
                          setEditingWord({
                            word: word.word,
                            phonemes: word.phonemes.join(", "),
                            hint: word.hint || "",
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button type="button" className="button-small-danger" onClick={() => deleteWord(word)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            )
          )}
        </div>

        {canAddWord ? (
          <div className="mt-6 border-t border-border pt-5">
            <h3 className="font-semibold text-ink">Add a word</h3>
            <WordForm
              idPrefix={`new-word-${activity.id}`}
              value={newWord}
              setValue={setNewWord}
              onSubmit={saveWord}
              submitLabel="Add word to database"
            />
          </div>
        ) : (
          <p className="mt-5 rounded-lg bg-primary-soft px-4 py-3 text-sm text-primary-dark">
            This Wordle already has its one target word. Use Edit above to demonstrate the update operation.
          </p>
        )}
      </section>
    </div>
  );
}

function WordForm({ idPrefix, value, setValue, onSubmit, submitLabel, onCancel }) {
  function changePhonemeList(update) {
    setValue((current) => {
      const phonemes = parsePhonemeText(current.phonemes);
      const updated = update(phonemes);
      return { ...current, phonemes: updated.join(", ") };
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 grid gap-3 rounded-lg border border-border bg-paper-alt p-4 sm:grid-cols-3">
      <Field label="English word" htmlFor={`${idPrefix}-word`}>
        <input
          id={`${idPrefix}-word`}
          required
          maxLength={40}
          value={value.word}
          onChange={(event) => setValue((current) => ({ ...current, word: event.target.value }))}
          className="form-control"
          placeholder="CHIN"
        />
      </Field>
      <Field label="Phonemes (comma separated)" htmlFor={`${idPrefix}-phonemes`}>
        <input
          id={`${idPrefix}-phonemes`}
          required
          value={value.phonemes}
          onChange={(event) => setValue((current) => ({ ...current, phonemes: event.target.value }))}
          className="form-control font-mono"
          placeholder="tʃ, ɪ, n"
        />
      </Field>
      <Field label="Word hint" htmlFor={`${idPrefix}-hint`}>
        <input
          id={`${idPrefix}-hint`}
          maxLength={160}
          value={value.hint}
          onChange={(event) => setValue((current) => ({ ...current, hint: event.target.value }))}
          className="form-control"
          placeholder="Optional clue"
        />
      </Field>
      <fieldset className="rounded-lg border border-border bg-surface p-3 sm:col-span-3">
        <legend className="px-1 text-sm font-medium text-ink">
          Click phonemes to add them
        </legend>
        <p className="mb-3 text-xs text-ink-soft">
          Select the sounds in spoken order. Hover a button to see its English example.
        </p>
        <div className="flex flex-wrap gap-2">
          {PHONEME_OPTIONS.map((phoneme) => {
            const details = PHONEME_LABELS[phoneme];
            return (
              <button
                key={phoneme}
                type="button"
                className="button-small font-mono"
                title={`${details.label} as in ${details.example}`}
                aria-label={`Add phoneme /${phoneme}/, ${details.label} as in ${details.example}`}
                onClick={() => changePhonemeList((current) => [...current, phoneme])}
              >
                /{phoneme}/
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="button-secondary"
            onClick={() => changePhonemeList((current) => current.slice(0, -1))}
            disabled={!parsePhonemeText(value.phonemes).length}
          >
            Remove last
          </button>
          <button
            type="button"
            className="button-secondary"
            onClick={() => changePhonemeList(() => [])}
            disabled={!parsePhonemeText(value.phonemes).length}
          >
            Clear phonemes
          </button>
        </div>
      </fieldset>
      <div className="flex flex-wrap gap-2 sm:col-span-3">
        <button type="submit" className="button-primary">{submitLabel}</button>
        {onCancel && (
          <button type="button" className="button-secondary" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  );
}

function Field({ label, htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
      {label}
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}
