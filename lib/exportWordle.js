import { PHONEME_LABELS, KEYBOARD_ROWS } from "./phonemes.js";

function esc(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function scriptData(value) {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");
}

export function generateWordleHTML({
  target,
  maxGuesses,
  activityTitle,
  activityHint,
  instructions,
  showHints = true,
}) {
  const data = {
    word: target.word,
    phonemes: target.phonemes,
    maxGuesses,
    showHints,
    labels: PHONEME_LABELS,
    keyboardRows: KEYBOARD_ROWS,
  };

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
    --amber:#d98d2b; --amber-soft:#f7e6c6; --brick:#ab4c3f; --brick-soft:#f3ddd7;
  }
  *{box-sizing:border-box;}
  body{
    margin:0; min-height:100vh; background:var(--paper); color:var(--ink);
    font-family:'IBM Plex Sans', Arial, sans-serif; display:flex; flex-direction:column; align-items:center;
    padding:2rem 1rem 4rem;
  }
  h1{font-family:Georgia, serif; font-size:1.6rem; margin:0 0 0.25rem;}
  p.sub{color:var(--ink-soft); margin:0 0 1.5rem; text-align:center; max-width:32rem;}
  .activity-hint{max-width:32rem; margin:0 0 1rem; border:1px solid var(--border); background:var(--primary-soft); padding:0.65rem 0.85rem; border-radius:0.5rem;}
  .board{display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1.5rem;}
  .row{display:flex; gap:0.5rem;}
  .tile{
    width:3.6rem; height:3.6rem; border:2px solid var(--border); border-radius:0.65rem;
    display:flex; align-items:center; justify-content:center; font-family:'IBM Plex Mono', monospace;
    font-size:1rem; background:var(--surface); font-weight:600;
  }
  .tile.correct{background:var(--amber-soft); border-color:var(--amber); color:#7a5218;}
  .tile.present{background:var(--primary-soft); border-color:var(--primary); color:var(--primary);}
  .tile.absent{background:var(--brick-soft); border-color:var(--brick); color:var(--brick);}
  .current-guess{margin-bottom:1rem; font-family:'IBM Plex Mono', monospace; font-size:1.1rem; min-height:1.6rem;}
  .keyboard-group{margin-bottom:0.75rem;}
  .keyboard-label{
    text-align:center; font-size:0.65rem; text-transform:uppercase; letter-spacing:0.05em;
    color:var(--ink-soft); margin-bottom:0.35rem;
  }
  .keyboard-row{display:flex; justify-content:center; gap:0.3rem; margin-bottom:0.3rem;}
  .key{
    position:relative; width:2.4rem; height:2.4rem; border-radius:0.4rem; border:1px solid var(--border);
    background:var(--surface); font-family:'IBM Plex Mono', monospace; font-size:0.75rem; cursor:pointer;
  }
  .key.spacer{visibility:hidden; cursor:default;}
  .key:hover, .key:focus-visible{background:var(--primary-soft); border-color:var(--primary);}
  .key .hint{
    position:absolute; bottom:110%; left:50%; transform:translateX(-50%);
    background:var(--ink); color:var(--paper); font-size:0.65rem; padding:0.2rem 0.4rem; border-radius:0.3rem;
    white-space:nowrap; opacity:0; pointer-events:none; transition:opacity 0.15s; z-index:2;
  }
  .key:hover .hint, .key:focus-visible .hint{opacity:1;}
  .controls{display:flex; gap:0.75rem; margin-bottom:1.25rem;}
  button.action{
    font-family:inherit; font-size:0.95rem; padding:0.55rem 1.1rem; border-radius:0.5rem; border:1px solid var(--primary);
    background:var(--primary); color:#fff; cursor:pointer;
  }
  button.action.secondary{background:var(--surface); color:var(--primary);}
  button.action:disabled{opacity:0.5; cursor:not-allowed;}
  .message{min-height:1.5rem; font-weight:600; margin-bottom:0.5rem;}
  .message.win{color:var(--amber);}
  .message.lose{color:var(--brick);}
  .reveal{
    margin-top:0.5rem; text-align:center; font-family:Georgia, serif; font-size:1.3rem;
    display:none;
  }
  .reveal.show{display:block;}
  footer{margin-top:2rem; color:var(--ink-soft); font-size:0.8rem; text-align:center;}
</style>
</head>
<body>
  <h1>${esc(activityTitle)}</h1>
  <p class="sub">${esc(instructions || "Guess the phoneme-based word. Select a phoneme for each box, then press Enter.")}</p>
  ${activityHint ? `<p class="activity-hint"><strong>Hint:</strong> ${esc(activityHint)}</p>` : ""}

  <div class="message" id="message" role="status" aria-live="polite"></div>
  <div class="board" id="board"></div>
  <div class="current-guess" id="currentGuess"></div>

  <div class="controls">
    <button class="action secondary" id="backspaceBtn" type="button">⌫ Back</button>
    <button class="action" id="enterBtn" type="button">Enter ↵</button>
  </div>

  <div id="keyboard"></div>

  <div class="reveal" id="reveal"></div>

  <footer>Phoneme-based classroom activity — generated with the Speech Pathology Wordle &amp; Word Search Builder.</footer>

<script>
  const DATA = ${scriptData(data)};
  const targetPhonemes = DATA.phonemes;
  const wordLength = targetPhonemes.length;
  const maxGuesses = DATA.maxGuesses;

  let guesses = [];
  let currentGuess = [];
  let gameOver = false;

  const boardEl = document.getElementById('board');
  const keyboardEl = document.getElementById('keyboard');
  const currentGuessEl = document.getElementById('currentGuess');
  const messageEl = document.getElementById('message');
  const revealEl = document.getElementById('reveal');
  const enterBtn = document.getElementById('enterBtn');
  const backspaceBtn = document.getElementById('backspaceBtn');

  function meta(ipa) {
    return DATA.labels[ipa] || { label: ipa, example: '' };
  }

  function renderBoard() {
    boardEl.innerHTML = '';
    for (let r = 0; r < maxGuesses; r++) {
      const rowEl = document.createElement('div');
      rowEl.className = 'row';
      const guess = guesses[r];
      for (let c = 0; c < wordLength; c++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        if (guess) {
          tile.textContent = meta(guess.ipas[c]).label;
          tile.classList.add(guess.states[c]);
        }
        rowEl.appendChild(tile);
      }
      boardEl.appendChild(rowEl);
    }
  }

  function renderKeyboard() {
    keyboardEl.innerHTML = '';
    const groups = [
      { label: 'Consonants', rows: DATA.keyboardRows.slice(0, 7) },
      { label: 'Vowels', rows: DATA.keyboardRows.slice(7) },
    ];
    groups.forEach(group => {
      const groupEl = document.createElement('div');
      groupEl.className = 'keyboard-group';
      const labelEl = document.createElement('div');
      labelEl.className = 'keyboard-label';
      labelEl.textContent = group.label;
      groupEl.appendChild(labelEl);
      group.rows.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'keyboard-row';
        row.forEach(ipa => {
          const key = document.createElement('button');
          key.type = 'button';
          if (!ipa) {
            key.className = 'key spacer';
            rowEl.appendChild(key);
            return;
          }
          key.className = 'key';
          key.textContent = ipa;
          const m = meta(ipa);
          key.setAttribute('aria-label', DATA.showHints ? '/' + ipa + '/ sounds like ' + m.label + ' as in ' + m.example : 'Phoneme /' + ipa + '/');
          if (DATA.showHints) {
            const hint = document.createElement('span');
            hint.className = 'hint';
            hint.textContent = m.label + ' (as in ' + m.example + ')';
            key.appendChild(hint);
          }
          key.addEventListener('click', () => addPhoneme(ipa));
          rowEl.appendChild(key);
        });
        groupEl.appendChild(rowEl);
      });
      keyboardEl.appendChild(groupEl);
    });
  }

  function renderCurrentGuess() {
    currentGuessEl.textContent = currentGuess.length
      ? currentGuess.map(ipa => '/' + ipa + '/').join(' ')
      : 'Selected phonemes will appear here…';
  }

  function addPhoneme(ipa) {
    if (gameOver || currentGuess.length >= wordLength) return;
    currentGuess.push(ipa);
    renderCurrentGuess();
  }

  function backspace() {
    if (gameOver) return;
    currentGuess.pop();
    renderCurrentGuess();
  }

  function submitGuess() {
    if (gameOver) return;
    if (currentGuess.length !== wordLength) {
      messageEl.textContent = 'Select ' + wordLength + ' phonemes before submitting.';
      messageEl.className = 'message';
      return;
    }
    const states = currentGuess.map((ipa, i) => {
      if (ipa === targetPhonemes[i]) return 'correct';
      if (targetPhonemes.includes(ipa)) return 'present';
      return 'absent';
    });
    guesses.push({ ipas: currentGuess.slice(), states });
    const won = states.every(s => s === 'correct');
    currentGuess = [];
    renderBoard();
    renderCurrentGuess();

    if (won) {
      gameOver = true;
      messageEl.textContent = 'Correct! Great listening.';
      messageEl.className = 'message win';
      showReveal();
    } else if (guesses.length >= maxGuesses) {
      gameOver = true;
      messageEl.textContent = 'Out of guesses — here is the answer:';
      messageEl.className = 'message lose';
      showReveal();
    } else {
      messageEl.textContent = '';
      messageEl.className = 'message';
    }
    if (gameOver) {
      enterBtn.disabled = true;
      backspaceBtn.disabled = true;
    }
  }

  function showReveal() {
    const phonemeLine = DATA.phonemes.map(p => '/' + p + '/').join(' ');
    revealEl.innerHTML = phonemeLine + ' &rarr; <strong>' + DATA.word + '</strong>';
    revealEl.classList.add('show');
  }

  enterBtn.addEventListener('click', submitGuess);
  backspaceBtn.addEventListener('click', backspace);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitGuess();
    if (e.key === 'Backspace') backspace();
  });

  renderBoard();
  renderKeyboard();
  renderCurrentGuess();
</script>
</body>
</html>`;
}
