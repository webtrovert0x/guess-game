let secretNumber;
let attempts;
const maxAttempts = 10;

function initGame() {
  secretNumber = Math.floor(Math.random() * 100) + 1;
  attempts = maxAttempts;
  document.getElementById('remaining').textContent = `Remaining attempts: ${attempts}`;
  document.getElementById('message').textContent = 'Make your first guess!';
  document.getElementById('guessInput').value = '';
  document.getElementById('guessInput').disabled = false;
  document.getElementById('guessButton').disabled = false;
  document.getElementById('resetButton').style.display = 'none';
}

function checkGuess() {
  const guessInput = document.getElementById('guessInput');
  const guess = parseInt(guessInput.value);
  const messageElement = document.getElementById('message');

  if (isNaN(guess) || guess < 1 || guess > 100) {
    messageElement.textContent = 'Please enter a valid number between 1 and 100.';
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
  initGame();
}


initGame();


document.getElementById('guessInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter' && !this.disabled) {
    checkGuess();
  }
});