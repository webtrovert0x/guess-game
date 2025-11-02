let secretNumber;
let attempts;
let currentDifficulty = null;

// Background audio state (HTMLAudioElement)
let audioPlaying = false;

// Game session state
let lowBound = 1;
let highBound = 100;
let maxHints = 2;
let hintsRemaining = 0;
let gameStartMs = 0;

// Statistics structure persisted in localStorage
const STATS_KEY = 'gg_stats_v1';
let stats = {
  easy: { games: 0, wins: 0, losses: 0, bestAttempts: null, bestTimeMs: null },
  medium: { games: 0, wins: 0, losses: 0, bestAttempts: null, bestTimeMs: null },
  hard: { games: 0, wins: 0, losses: 0, bestAttempts: null, bestTimeMs: null }
};

function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      const obj = JSON.parse(raw);
      // simple shape check
      if (obj && obj.easy && obj.medium && obj.hard) stats = obj;
    }
  } catch (e) { /* ignore */ }
}

function saveStats() {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch (e) { }
}

function msToSec(ms) { return (ms / 1000).toFixed(1) + 's'; }

function renderStats() {
  const el = document.getElementById('statsText');
  if (!el) return;
  const s = stats[currentDifficulty || 'easy'];
  const lines = [];
  function lineFor(d) {
    const sd = stats[d];
    const bestA = sd.bestAttempts == null ? '-' : sd.bestAttempts + ' tries';
    const bestT = sd.bestTimeMs == null ? '-' : msToSec(sd.bestTimeMs);
    return `${d[0].toUpperCase()+d.slice(1)} — Games: ${sd.games}, Wins: ${sd.wins}, Losses: ${sd.losses}, Best: ${bestA} | ${bestT}`;
  }
  lines.push(lineFor('easy'));
  lines.push(lineFor('medium'));
  lines.push(lineFor('hard'));
  el.textContent = lines.join('\n');
}

function renderBest() {
  const el = document.getElementById('bestDisplay');
  if (!el || !currentDifficulty) return;
  const s = stats[currentDifficulty];
  const bestA = s.bestAttempts == null ? '—' : `${s.bestAttempts} tries`;
  const bestT = s.bestTimeMs == null ? '—' : msToSec(s.bestTimeMs);
  el.textContent = `Best (${difficultySettings[currentDifficulty].name}): ${bestA} | ${bestT}`;
}

function updateHintsUI() {
  const b = document.getElementById('hintButton');
  const info = document.getElementById('hintsInfo');
  if (b) b.disabled = hintsRemaining <= 0 || !currentDifficulty;
  if (info) info.textContent = currentDifficulty ? `Hints left: ${hintsRemaining}` : '';
}

// Simple sound effects using short-lived AudioContext
function playSfx(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    let freq = 440; // default A4
    if (type === 'win') freq = 880; // higher
    else if (type === 'lose') freq = 220; // lower
    else if (type === 'bad') freq = 150;
    else if (type === 'tick') freq = 660;
    o.frequency.value = freq;
    o.type = 'sine';
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    const dur = type === 'win' ? 0.25 : type === 'lose' ? 0.35 : 0.12;
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.start();
    o.stop(ctx.currentTime + dur + 0.02);
    o.onended = () => ctx.close();
  } catch (e) { /* ignore sfx errors */ }
}

const difficultySettings = {
  easy: {
    range: 50,
    attempts: 10,
    name: 'Easy'
  },
  medium: {
    range: 100,
    attempts: 10,
    name: 'Medium'
  },
  hard: {
    range: 200,
    attempts: 10,
    name: 'Hard'
  }
};

function setDifficulty(difficulty) {
  currentDifficulty = difficulty;
  const settings = difficultySettings[difficulty];


  const input = document.getElementById('guessInput');
  input.min = 1;
  input.max = settings.range;
  input.disabled = false;


  document.getElementById('range-text').textContent = `Try to guess the number between 1 and ${settings.range}!`;
  document.getElementById('guessButton').disabled = false;
  document.getElementById('message').textContent = 'Make your first guess!';


  initGame();
}

function initGame() {
  if (!currentDifficulty) {
    return;
  }

  const settings = difficultySettings[currentDifficulty];
  secretNumber = Math.floor(Math.random() * settings.range) + 1;
  attempts = settings.attempts;

  // session bounds and hints
  lowBound = 1; highBound = settings.range;
  maxHints = 2; hintsRemaining = maxHints;
  gameStartMs = Date.now();

  document.getElementById('remaining').textContent = `Remaining attempts: ${attempts}`;
  document.getElementById('message').textContent = 'Make your first guess!';
  document.getElementById('guessInput').value = '';
  document.getElementById('guessInput').disabled = false;
  document.getElementById('guessButton').disabled = false;
  // hide reset button if present
  const restartBtn = document.getElementById('restartButton');
  const changeBtn = document.getElementById('changeDifficultyButton');
  if (restartBtn) restartBtn.style.display = 'none';
  if (changeBtn) changeBtn.style.display = 'none';
  document.getElementById('difficulty-select').style.display = 'block';

  updateHintsUI();
  renderBest();

  // If user previously enabled background audio, start it now (this is a user gesture)
  try {
    if (localStorage.getItem('bgAudioEnabled') === 'true') {
      playAmbient();
    }
  } catch (e) {
    // localStorage may be unavailable in some contexts
  }
}

function checkGuess() {
  const guessInput = document.getElementById('guessInput');
  const guess = parseInt(guessInput.value);
  const messageElement = document.getElementById('message');
  const settings = difficultySettings[currentDifficulty];

  if (isNaN(guess) || guess < 1 || guess > settings.range) {
    messageElement.textContent = `Please enter a valid number between 1 and ${settings.range}.`;
    playSfx('bad');
    return;
  }

  attempts--;
  document.getElementById('remaining').textContent = `Remaining attempts: ${attempts}`;

  if (guess === secretNumber) {
    messageElement.textContent = `Congratulations! You've won! The number was ${secretNumber}`;
    playSfx('win');
    endGame(true);
  } else {
    // update bounds
    if (guess < secretNumber) lowBound = Math.max(lowBound, guess + 1);
    else highBound = Math.min(highBound, guess - 1);

    if (attempts === 0) {
      messageElement.textContent = `Game Over! The number was ${secretNumber}`;
      playSfx('lose');
      endGame(false);
    } else {
      messageElement.textContent = guess < secretNumber ? 'Too low! Try again.' : 'Too high! Try again.';
      playSfx('tick');
    }
  }

  guessInput.value = '';
  guessInput.focus();
}

function endGame(won) {
  document.getElementById('guessInput').disabled = true;
  document.getElementById('guessButton').disabled = true;
  const restartBtn = document.getElementById('restartButton');
  const changeBtn = document.getElementById('changeDifficultyButton');
  if (restartBtn) restartBtn.style.display = 'inline-block';
  if (changeBtn) changeBtn.style.display = 'inline-block';
  document.getElementById('message').style.color = won ? '#4CAF50' : '#f44336';

  // update statistics
  const d = currentDifficulty;
  if (d) {
    const settings = difficultySettings[d];
    const attemptsUsed = settings.attempts - attempts;
    const elapsed = Date.now() - gameStartMs;
    const sd = stats[d];
    sd.games += 1;
    if (won) {
      sd.wins += 1;
      if (sd.bestAttempts == null || attemptsUsed < sd.bestAttempts) sd.bestAttempts = attemptsUsed;
      if (sd.bestTimeMs == null || elapsed < sd.bestTimeMs) sd.bestTimeMs = elapsed;
    } else {
      sd.losses += 1;
    }
    saveStats();
    renderStats();
    renderBest();
  }
}

function resetGame() {
  document.getElementById('message').style.color = 'black';
  document.getElementById('difficulty-select').style.display = 'block';
  document.getElementById('range-text').textContent = 'Select a difficulty to start!';
  document.getElementById('message').textContent = 'Choose your difficulty level';
  document.getElementById('guessInput').disabled = true;
  document.getElementById('guessButton').disabled = true;
  document.getElementById('remaining').textContent = '';
  const restartBtn2 = document.getElementById('restartButton');
  const changeBtn2 = document.getElementById('changeDifficultyButton');
  if (restartBtn2) restartBtn2.style.display = 'none';
  if (changeBtn2) changeBtn2.style.display = 'none';
  currentDifficulty = null;
  updateHintsUI();
}

function restartGame() {
  if (!currentDifficulty) return;
  document.getElementById('message').style.color = 'black';
  initGame();
}

function provideHint() {
  if (!currentDifficulty || hintsRemaining <= 0) return;
  const settings = difficultySettings[currentDifficulty];
  const hintEl = document.getElementById('hintText');
  let text = '';
  if (hintsRemaining === maxHints) {
    // first hint: parity
    text = `Hint: The secret number is ${secretNumber % 2 === 0 ? 'even' : 'odd'}.`;
  } else {
    // range hint based on bounds
    text = `Hint: It's between ${lowBound} and ${highBound}.`;
  }
  hintsRemaining--;
  if (hintEl) hintEl.textContent = text;
  updateHintsUI();
}


initGame();


document.getElementById('guessInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter' && !this.disabled) {
    checkGuess();
  }
});

// Keyboard shortcuts: R=restart, C=change difficulty, H=hint
document.addEventListener('keydown', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
    // ignore when typing in fields (except Enter is handled above)
    if (e.key.toLowerCase() === 'h' && !document.getElementById('guessInput').disabled) {
      // allow H for hint even while in number input
      e.preventDefault();
      provideHint();
    }
    return;
  }
  const k = e.key.toLowerCase();
  if (k === 'r') { e.preventDefault(); restartGame(); }
  else if (k === 'c') { e.preventDefault(); resetGame(); }
  else if (k === 'h') { e.preventDefault(); provideHint(); }
});

/* --- Background audio implementation (HTMLAudio) --- */
const bgAudio = document.getElementById('bgAudio');
const audioFileInput = document.getElementById('audioFileInput');

function playAmbient() {
  if (!bgAudio) return;
  if (!bgAudio.src) {
    // prompt user to select a file if none set
    if (audioFileInput) audioFileInput.click();
    return;
  }
  bgAudio.volume = 0.12; // gentle default
  bgAudio.loop = true;
  bgAudio.play().then(() => {
    audioPlaying = !bgAudio.paused;
    updateAudioButton();
    try { localStorage.setItem('bgAudioEnabled', 'true'); } catch (e) { }
  }).catch(err => {
    console.warn('Audio play blocked or failed', err);
  });
}

function stopAmbient() {
  if (!bgAudio) return;
  bgAudio.pause();
  audioPlaying = false;
  updateAudioButton();
  try { localStorage.setItem('bgAudioEnabled', 'false'); } catch (e) { }
}

function toggleAmbient() {
  if (!bgAudio) return;
  if (!bgAudio.src) {
    if (audioFileInput) audioFileInput.click();
    return;
  }
  if (bgAudio.paused) playAmbient(); else stopAmbient();
}

function updateAudioButton() {
  const btn = document.getElementById('audioToggle');
  if (!btn) return;
  const isPlaying = bgAudio && !bgAudio.paused && !bgAudio.ended;
  if (isPlaying) {
    btn.classList.add('audio-toggle--on');
    btn.setAttribute('aria-pressed', 'true');
    btn.textContent = '🔊';
  } else {
    btn.classList.remove('audio-toggle--on');
    btn.setAttribute('aria-pressed', 'false');
    btn.textContent = '♪';
  }
}

// file input handler: set audio source from uploaded file
if (audioFileInput && bgAudio) {
  audioFileInput.addEventListener('change', function () {
    const file = this.files && this.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    bgAudio.src = url;
    bgAudio.load();
    // play immediately after selection
    playAmbient();
  });
}

// wire audio toggle button
const _audioBtn = document.getElementById('audioToggle');
if (_audioBtn) {
  _audioBtn.addEventListener('click', function () {
    // click is a user gesture; safe to start audio or open file picker
    toggleAmbient();
  });
}

// initialize UI button state
try {
  updateAudioButton();
} catch (e) {
  // ignore
}

// Volume slider and URL controls
(function setupAudioControls(){
  const slider = document.getElementById('volumeSlider');
  const label = document.getElementById('volumeValue');
  const urlInput = document.getElementById('audioUrlInput');
  const loadBtn = document.getElementById('loadAudioUrlBtn');

  // load saved volume
  try {
    const savedVol = localStorage.getItem('bgAudioVol');
    if (savedVol !== null && slider) {
      slider.value = savedVol;
      if (bgAudio) bgAudio.volume = parseFloat(savedVol);
      if (label) label.textContent = Math.round(parseFloat(savedVol) * 100) + '%';
    } else if (label && slider) {
      label.textContent = Math.round(parseFloat(slider.value) * 100) + '%';
    }
  } catch(e) {}

  if (slider) slider.addEventListener('input', () => {
    const v = parseFloat(slider.value);
    if (bgAudio) bgAudio.volume = v;
    if (label) label.textContent = Math.round(v * 100) + '%';
    try { localStorage.setItem('bgAudioVol', String(v)); } catch(e) {}
  });

  // load saved URL
  try {
    const savedUrl = localStorage.getItem('bgAudioUrl');
    if (savedUrl && urlInput) urlInput.value = savedUrl;
  } catch(e) {}

  if (loadBtn && urlInput && bgAudio) {
    loadBtn.addEventListener('click', () => {
      const val = (urlInput.value || '').trim();
      if (!val) return;
      bgAudio.src = val;
      bgAudio.load();
      try { localStorage.setItem('bgAudioUrl', val); } catch(e) {}
      // if user prefers audio enabled, attempt to play
      try { if (localStorage.getItem('bgAudioEnabled') === 'true') playAmbient(); } catch(e) {}
    });
  }
})();

// boot
loadStats();
renderStats();