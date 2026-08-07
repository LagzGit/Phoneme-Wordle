import { PHONEME_LABELS } from "./phonemes";

function esc(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

export function generateWordSearchHTML({ grid, placements, words, activityTitle }) {
  const data = { grid, placements, words, labels: PHONEME_LABELS };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(activityTitle)}</title>
<style>
  :root{
    --paper:#f4f6f1; --surface:#fff; --ink:#142526; --ink-soft:#48605f;
    --border:#d6ddcf; --primary:#2b6669; --primary-soft:#dfeceb;
    --amber:#d98d2b; --amber-soft:#f7e6c6;
  }
  *{box-sizing:border-box;}
  body{
    margin:0; min-height:100vh; background:var(--paper); color:var(--ink);
    font-family:'IBM Plex Sans', Arial, sans-serif; display:flex; flex-direction:column; align-items:center;
    padding:2rem 1rem 4rem;
  }
  h1{font-family:Georgia, serif; font-size:1.6rem; margin:0 0 0.25rem;}
  p.sub{color:var(--ink-soft); margin:0 0 1.5rem; text-align:center; max-width:32rem;}
  .layout{display:flex; gap:2rem; flex-wrap:wrap; justify-content:center; align-items:flex-start; max-width:100%;}
  .grid-wrap{max-width:100%; overflow-x:auto; padding:0.15rem;}
  .grid{
    display:grid; gap:2px; background:var(--border); border:2px solid var(--border); border-radius:0.5rem;
    user-select:none; touch-action:none;
  }
  .cell{
    width:2.4rem; height:2.4rem; background:var(--surface); display:flex; align-items:center; justify-content:center;
    border:0; color:var(--ink); font-family:'IBM Plex Mono', monospace; font-weight:600; cursor:pointer; font-size:0.9rem;
  }
  .cell.multi{font-size:0.7rem;}
  .cell.selected{background:var(--primary-soft);}
  .cell.found{background:var(--amber-soft); color:#7a5218;}
  .wordlist{min-width:14rem;}
  .wordlist h2{font-size:1rem; margin:0 0 0.75rem; color:var(--ink-soft); text-transform:uppercase; letter-spacing:0.05em;}
  .word-item{
    display:flex; flex-wrap:wrap; align-items:center; gap:0.4rem; padding:0.4rem 0.5rem; border-radius:0.4rem; margin-bottom:0.35rem;
    border:1px solid var(--border); background:var(--surface); font-family:'IBM Plex Mono', monospace;
  }
  .word-item.found{background:var(--amber-soft); border-color:var(--amber); text-decoration:line-through; color:#7a5218;}
  .phoneme-chip{
    position:relative; display:inline-block; padding:0.15rem 0.4rem; border:1px solid var(--primary); border-radius:0.3rem;
    background:var(--primary-soft); color:var(--primary); font-size:0.8rem; cursor:default;
  }
  .phoneme-chip .hint{
    position:absolute; bottom:120%; left:50%; transform:translateX(-50%);
    background:var(--ink); color:var(--paper); font-size:0.65rem; padding:0.15rem 0.35rem; border-radius:0.3rem;
    white-space:nowrap; opacity:0; pointer-events:none; transition:opacity 0.15s;
  }
  .phoneme-chip:hover .hint, .phoneme-chip:focus-visible .hint{opacity:1;}
  :focus-visible{outline:2px solid var(--primary); outline-offset:2px;}
  .message{min-height:1.5rem; font-weight:600; margin-bottom:0.75rem; color:var(--amber);}
  footer{margin-top:2rem; color:var(--ink-soft); font-size:0.8rem; text-align:center;}
</style>
</head>
<body>
  <h1>${esc(activityTitle)}</h1>
  <p class="sub">Find every phoneme-based word hidden in the grid. Select the first and last phoneme of each word. This works with a mouse, touch or keyboard.</p>
  <div class="message" id="message" role="status" aria-live="polite"></div>

  <div class="layout">
    <div class="grid-wrap"><div class="grid" id="grid" aria-label="Phoneme word search grid"></div></div>
    <div class="wordlist">
      <h2>Words to find</h2>
      <div id="wordItems"></div>
    </div>
  </div>

  <footer>Phoneme-based classroom activity — generated with the Speech Pathology Wordle &amp; Word Search Builder.</footer>

<script>
  const DATA = ${JSON.stringify(data)};
  const size = DATA.grid.length;
  const gridEl = document.getElementById('grid');
  const wordItemsEl = document.getElementById('wordItems');
  const messageEl = document.getElementById('message');

  gridEl.style.gridTemplateColumns = 'repeat(' + size + ', 2.4rem)';

  let selectionCells = [];
  const foundWords = new Set();

  const cellEls = [];
  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      const unit = DATA.grid[r][c];
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell' + (unit.length > 1 ? ' multi' : '');
      cell.textContent = unit;
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.setAttribute('aria-label', 'Row ' + (r + 1) + ', column ' + (c + 1) + ', phoneme /' + unit + '/');
      cell.addEventListener('click', () => selectCell(r, c));
      gridEl.appendChild(cell);
      row.push(cell);
    }
    cellEls.push(row);
  }
  function selectCell(r, c) {
    if (selectionCells.length === 0) {
      selectionCells = [[r, c]];
      messageEl.textContent = 'Start selected. Now choose the last phoneme of the word.';
      paintSelection();
      return;
    }

    const start = selectionCells[0];
    const rowDistance = r - start[0];
    const colDistance = c - start[1];
    const straightLine = rowDistance === 0 || colDistance === 0 || Math.abs(rowDistance) === Math.abs(colDistance);
    if (!straightLine) {
      messageEl.textContent = 'Choose cells in one row, column or diagonal. Try again.';
      selectionCells = [];
      paintSelection();
      return;
    }

    const dr = Math.sign(rowDistance);
    const dc = Math.sign(colDistance);
    const steps = Math.max(Math.abs(rowDistance), Math.abs(colDistance));
    const cells = [start];
    for (let i = 1; i <= steps; i++) {
      cells.push([start[0] + dr * i, start[1] + dc * i]);
    }
    selectionCells = cells;
    paintSelection();
    checkSelection();
    cellEls.flat().forEach(cell => cell.classList.remove('selected'));
    selectionCells = [];
  }

  function paintSelection() {
    cellEls.flat().forEach(cell => cell.classList.remove('selected'));
    selectionCells.forEach(([r, c]) => cellEls[r][c] && cellEls[r][c].classList.add('selected'));
  }

  function sameCells(a, b) {
    if (a.length !== b.length) return false;
    const norm = arr => arr.map(p => p.join(',')).sort().join('|');
    return norm(a) === norm(b);
  }

  function checkSelection() {
    for (const placement of DATA.placements) {
      if (foundWords.has(placement.word)) continue;
      if (sameCells(selectionCells, placement.cells)) {
        foundWords.add(placement.word);
        placement.cells.forEach(([r, c]) => cellEls[r][c].classList.add('found'));
        renderWordList();
        if (foundWords.size === DATA.placements.length) {
          messageEl.textContent = 'All words found! Well done.';
        } else {
          messageEl.textContent = placement.word + ' found.';
        }
        return;
      }
    }
    messageEl.textContent = 'That is not one of the target words. Try again.';
  }

  function renderWordList() {
    wordItemsEl.innerHTML = '';
    DATA.words.forEach(w => {
      const item = document.createElement('div');
      item.className = 'word-item' + (foundWords.has(w.word) ? ' found' : '');
      const chips = w.phonemes.map(ipa => {
        const meta = DATA.labels[ipa] || { label: ipa, example: '' };
        return '<span class="phoneme-chip" tabindex="0" aria-label="/' + ipa + '/ sounds like ' + meta.label + ', as in ' + meta.example + '">/' + ipa + '/<span class="hint">' + meta.label + ' (as in ' + meta.example + ')</span></span>';
      }).join(' ');
      item.innerHTML = chips + ' <span style="margin-left:auto;font-weight:700;">' + w.word + '</span>';
      wordItemsEl.appendChild(item);
    });
  }

  renderWordList();
</script>
</body>
</html>`;
}
