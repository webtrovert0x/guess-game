let secretNumber;
let attempts;
let currentDifficulty = null;

// Background audio state (HTMLAudioElement)
let audioPlaying = false;

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

  document.getElementById('remaining').textContent = `Remaining attempts: ${attempts}`;
  document.getElementById('message').textContent = 'Make your first guess!';
  document.getElementById('guessInput').value = '';
  document.getElementById('guessInput').disabled = false;
  document.getElementById('guessButton').disabled = false;
  // hide reset button if present
  const resetBtn = document.getElementById('resetButton');
  if (resetBtn) resetBtn.style.display = 'none';
  document.getElementById('difficulty-select').style.display = 'block';

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
    return;
  }

  attempts--;
  document.getElementById('remaining').textContent = `Remaining attempts: ${attempts}`;

  if (guess === secretNumber) {
    messageElement.textContent = `Congratulations! You've won! The number was ${secretNumber}`;
    endGame(true);
  } else {
    if (attempts === 0) {
      messageElement.textContent = `Game Over! The number was ${secretNumber}`;
      endGame(false);
    } else {
      messageElement.textContent = guess < secretNumber ? 'Too low! Try again.' : 'Too high! Try again.';
    }
  }

  guessInput.value = '';
  guessInput.focus();
}

function endGame(won) {
  document.getElementById('guessInput').disabled = true;
  document.getElementById('guessButton').disabled = true;
  const resetBtn2 = document.getElementById('resetButton');
  if (resetBtn2) resetBtn2.style.display = 'inline-block';
  document.getElementById('message').style.color = won ? '#4CAF50' : '#f44336';
}

function resetGame() {
  document.getElementById('message').style.color = 'black';
  document.getElementById('difficulty-select').style.display = 'block';
  document.getElementById('range-text').textContent = 'Select a difficulty to start!';
  document.getElementById('message').textContent = 'Choose your difficulty level';
  document.getElementById('guessInput').disabled = true;
  document.getElementById('guessButton').disabled = true;
  document.getElementById('remaining').textContent = '';
  const resetBtn3 = document.getElementById('resetButton');
  if (resetBtn3) resetBtn3.style.display = 'none';
  currentDifficulty = null;
}


initGame();


document.getElementById('guessInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter' && !this.disabled) {
    checkGuess();
  }
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