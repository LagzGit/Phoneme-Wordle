// Word search grid generator where EACH CELL HOLDS ONE PHONEME UNIT — not
// one letter — matching the course's reference implementation and the
// corpus note "Each phoneme occupies a separate cell." A digraph like /tʃ/
// still occupies a single cell, just like a plain consonant.

const ALL_DIRECTIONS = [
  { dr: 0, dc: 1 }, // right
  { dr: 0, dc: -1 }, // left
  { dr: 1, dc: 0 }, // down
  { dr: -1, dc: 0 }, // up
  { dr: 1, dc: 1 }, // down-right
  { dr: 1, dc: -1 }, // down-left
  { dr: -1, dc: 1 }, // up-right
  { dr: -1, dc: -1 }, // up-left
];

const ORTHOGONAL_DIRECTIONS = ALL_DIRECTIONS.slice(0, 4);

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @param {{word: string, phonemes: string[]}[]} words
 * @param {number} size
 * @param {boolean} allowDiagonals
 * @param {number} seed
 */
export function generateGrid({ words, size = 10, allowDiagonals = true, seed = 42 }) {
  const rand = mulberry32(seed);
  const grid = Array.from({ length: size }, () => Array(size).fill(""));
  const directions = allowDiagonals ? ALL_DIRECTIONS : ORTHOGONAL_DIRECTIONS;

  // Filler pool: phonemes actually used across the target words, so any
  // "distractor" symbol a student sees is still one they're practising —
  // matching the reference tool's approach.
  const pool = Array.from(new Set(words.flatMap((w) => w.phonemes)));
  const fallbackPool = ["p", "t", "k", "s", "n", "æ", "ɪ"];
  const fillerPool = pool.length ? pool : fallbackPool;

  const sorted = [...words].sort((a, b) => b.phonemes.length - a.phonemes.length);
  const placements = [];

  for (const w of sorted) {
    const units = w.phonemes;
    let placed = false;
    for (let attempt = 0; attempt < 300 && !placed; attempt++) {
      const dir = directions[Math.floor(rand() * directions.length)];
      const row = Math.floor(rand() * size);
      const col = Math.floor(rand() * size);
      const endRow = row + dir.dr * (units.length - 1);
      const endCol = col + dir.dc * (units.length - 1);
      if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue;

      let fits = true;
      for (let i = 0; i < units.length; i++) {
        const r = row + dir.dr * i;
        const c = col + dir.dc * i;
        const existing = grid[r][c];
        if (existing && existing !== units[i]) {
          fits = false;
          break;
        }
      }
      if (!fits) continue;

      const cells = [];
      for (let i = 0; i < units.length; i++) {
        const r = row + dir.dr * i;
        const c = col + dir.dc * i;
        grid[r][c] = units[i];
        cells.push([r, c]);
      }
      placements.push({ word: w.word, cells });
      placed = true;
    }
    if (!placed) {
      // Fallback: lay it out horizontally starting at row (index in list),
      // overwriting fillers if necessary, so generation never silently fails.
      const row = placements.length % size;
      const cells = [];
      for (let i = 0; i < units.length && i < size; i++) {
        grid[row][i] = units[i];
        cells.push([row, i]);
      }
      placements.push({ word: w.word, cells });
    }
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) {
        grid[r][c] = fillerPool[Math.floor(rand() * fillerPool.length)];
      }
    }
  }

  return { grid, placements };
}
