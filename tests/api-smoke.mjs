import assert from "node:assert/strict";

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
let createdActivityId;

async function jsonRequest(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
  });
  const payload = await response.json();
  return { response, payload };
}

try {
  const health = await jsonRequest("/health");
  assert.equal(health.response.status, 200);
  assert.equal(health.payload.database, "connected");

  const created = await jsonRequest("/api/activities", {
    method: "POST",
    body: JSON.stringify({
      title: "API Smoke Test Wordle",
      type: "WORDLE",
      difficulty: "HARD",
      hint: "Temporary automated check",
      outputFileName: "api-smoke-test-wordle",
    }),
  });
  assert.equal(created.response.status, 201);
  createdActivityId = created.payload.data.id;

  const invalid = await jsonRequest(`/api/activities/${createdActivityId}/words`, {
    method: "POST",
    body: JSON.stringify({ word: "INVALID", phonemes: ["not-ipa"] }),
  });
  assert.equal(invalid.response.status, 400);
  assert.equal(invalid.payload.error, "VALIDATION_ERROR");

  const withWord = await jsonRequest(`/api/activities/${createdActivityId}/words`, {
    method: "POST",
    body: JSON.stringify({
      word: "CHIN",
      phonemes: ["tʃ", "ɪ", "n"],
      hint: "Below your mouth",
    }),
  });
  assert.equal(withWord.response.status, 201);
  const wordId = withWord.payload.data.words[0].id;

  const updated = await jsonRequest(`/api/words/${wordId}`, {
    method: "PATCH",
    body: JSON.stringify({ hint: "Part of the face" }),
  });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.payload.data.words[0].hint, "Part of the face");

  const read = await jsonRequest(`/api/activities/${createdActivityId}`);
  assert.equal(read.response.status, 200);
  assert.deepEqual(read.payload.data.words[0].phonemes, ["tʃ", "ɪ", "n"]);

  const exported = await fetch(`${baseUrl}/api/activities/${createdActivityId}/export`);
  assert.equal(exported.status, 200);
  assert.match(exported.headers.get("content-type"), /text\/html/);
  assert.match(await exported.text(), /CHIN/);

  const deleted = await jsonRequest(`/api/activities/${createdActivityId}`, {
    method: "DELETE",
  });
  assert.equal(deleted.response.status, 200);
  createdActivityId = undefined;

  console.log("API smoke test passed: health, validation, CRUD and export.");
} finally {
  if (createdActivityId) {
    await fetch(`${baseUrl}/api/activities/${createdActivityId}`, { method: "DELETE" });
  }
}
