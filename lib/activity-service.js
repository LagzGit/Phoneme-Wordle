import { prisma } from "./prisma.js";
import { AppError } from "./api-errors.js";
import { DIFFICULTY_SETTINGS, slugify } from "./activity-validation.js";

const activityInclude = {
  words: {
    orderBy: [{ position: "asc" }, { id: "asc" }],
    include: {
      phonemes: { orderBy: { position: "asc" } },
    },
  },
};

function cleanOptionalText(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const cleaned = value.trim();
  return cleaned || null;
}

function activityData(input, current = null) {
  const difficulty = input.difficulty || current?.difficulty || "MEDIUM";
  const defaults = DIFFICULTY_SETTINGS[difficulty];

  if (!current) {
    return {
      title: input.title.trim(),
      type: input.type,
      difficulty,
      hint: cleanOptionalText(input.hint),
      instructions: cleanOptionalText(input.instructions),
      maxGuesses: input.maxGuesses ?? defaults.maxGuesses,
      gridSize: input.gridSize ?? defaults.gridSize,
      allowDiagonals: input.allowDiagonals ?? defaults.allowDiagonals,
      showHints: input.showHints ?? true,
      outputFileName: input.outputFileName || slugify(input.title),
    };
  }

  const update = {};
  for (const key of ["title", "type", "difficulty", "showHints"]) {
    if (input[key] !== undefined) update[key] = input[key];
  }
  for (const key of ["hint", "instructions"]) {
    if (input[key] !== undefined) update[key] = cleanOptionalText(input[key]);
  }
  if (input.outputFileName !== undefined) {
    update.outputFileName = input.outputFileName;
  }

  if (input.difficulty !== undefined) {
    update.maxGuesses = input.maxGuesses ?? defaults.maxGuesses;
    update.gridSize = input.gridSize ?? defaults.gridSize;
    update.allowDiagonals = input.allowDiagonals ?? defaults.allowDiagonals;
  }
  for (const key of ["maxGuesses", "gridSize", "allowDiagonals"]) {
    if (input[key] !== undefined) update[key] = input[key];
  }

  return update;
}

function normaliseWord(input) {
  const data = {};
  if (input.word !== undefined) data.word = input.word.trim().toUpperCase();
  if (input.hint !== undefined) data.hint = cleanOptionalText(input.hint);
  if (input.position !== undefined) data.position = input.position;
  if (input.isTarget !== undefined) data.isTarget = input.isTarget;
  return data;
}

export function serializeActivity(activity) {
  return {
    ...activity,
    words: activity.words.map((word) => ({
      ...word,
      phonemes: word.phonemes.map((phoneme) => phoneme.symbol),
    })),
  };
}

export async function listActivities(type) {
  const activities = await prisma.activity.findMany({
    where: type ? { type } : undefined,
    orderBy: { updatedAt: "desc" },
    include: activityInclude,
  });
  return activities.map(serializeActivity);
}

export async function getActivity(id) {
  const activity = await prisma.activity.findUnique({
    where: { id },
    include: activityInclude,
  });
  if (!activity) {
    throw new AppError("Activity not found.", 404, "NOT_FOUND");
  }
  return serializeActivity(activity);
}

export async function createActivity(input) {
  const activity = await prisma.activity.create({
    data: activityData(input),
    include: activityInclude,
  });
  return serializeActivity(activity);
}

export async function updateActivity(id, input) {
  const current = await prisma.activity.findUnique({
    where: { id },
    include: { _count: { select: { words: true } } },
  });
  if (!current) {
    throw new AppError("Activity not found.", 404, "NOT_FOUND");
  }
  if (input.type === "WORDLE" && current._count.words > 1) {
    throw new AppError(
      "Remove extra words before changing this activity to Wordle.",
      409,
      "ACTIVITY_HAS_TOO_MANY_WORDS"
    );
  }
  const activity = await prisma.activity.update({
    where: { id },
    data: activityData(input, current),
    include: activityInclude,
  });
  return serializeActivity(activity);
}

export async function deleteActivity(id) {
  await prisma.activity.delete({ where: { id } });
}

export async function createWord(activityId, input) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { _count: { select: { words: true } } },
  });
  if (!activity) {
    throw new AppError("Activity not found.", 404, "NOT_FOUND");
  }
  if (activity.type === "WORDLE" && activity._count.words >= 1) {
    throw new AppError(
      "A Wordle activity can contain one target word. Edit or delete the existing word first.",
      409,
      "WORDLE_TARGET_EXISTS"
    );
  }

  await prisma.word.create({
    data: {
      ...normaliseWord(input),
      isTarget: activity.type === "WORDLE" ? true : false,
      position: input.position ?? activity._count.words,
      activityId,
      phonemes: {
        create: input.phonemes.map((symbol, position) => ({ symbol, position })),
      },
    },
  });
  return getActivity(activityId);
}

export async function updateWord(id, input) {
  const existing = await prisma.word.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Word not found.", 404, "NOT_FOUND");
  }

  const data = normaliseWord(input);
  if (input.phonemes !== undefined) {
    data.phonemes = {
      deleteMany: {},
      create: input.phonemes.map((symbol, position) => ({ symbol, position })),
    };
  }
  await prisma.word.update({ where: { id }, data });
  return getActivity(existing.activityId);
}

export async function deleteWord(id) {
  const existing = await prisma.word.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Word not found.", 404, "NOT_FOUND");
  }
  await prisma.word.delete({ where: { id } });
  return getActivity(existing.activityId);
}
