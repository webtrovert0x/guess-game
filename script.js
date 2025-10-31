let secretNumber;
let attempts;
let currentDifficulty = null;

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

  // Update input range
  const input = document.getElementById('guessInput');
  input.min = 1;
  input.max = settings.range;
  input.disabled = false;

  // Update UI text
  document.getElementById('range-text').textContent = `Try to guess the number between 1 and ${settings.range}!`;
  document.getElementById('guessButton').disabled = false;
  document.getElementById('message').textContent = 'Make your first guess!';

  // Initialize the game with new settings
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
  document.getElementById('resetButton').style.display = 'none';
  document.getElementById('difficulty-select').style.display = 'block';
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
  document.getElementById('resetButton').style.display = 'inline-block';
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
  document.getElementById('resetButton').style.display = 'none';
  currentDifficulty = null;
}


initGame();


document.getElementById('guessInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter' && !this.disabled) {
    checkGuess();
  }
});