# Number Guessing Game

A small browser-based number guessing game with difficulty levels, animated background, and optional background music.

## Features

- Random secret number generation per game
- Three difficulty levels: Easy, Medium, Hard
- Clean graphical UI with input and feedback (too high / too low / correct)
- Remaining attempts counter and win/loss states
- Animated flowing background shapes and UI animations
- Optional background music: upload a local audio file and toggle playback
- Restart / change difficulty without reloading the page

## Files

- `index.html` — main HTML, CSS styles, and UI layout
- `script.js` — game logic and audio handling

## How to run

1. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari).
2. Select a difficulty (Easy / Medium / Hard).
3. Enter your guess (use the Enter key or the Guess button).
4. Watch the feedback and remaining attempts.
5. After the game ends you can restart or change difficulty.

> Tip: Serving the folder over a simple local server can avoid some browser file restrictions (recommended when testing audio file uploads).

### Quick local server (optional)

- Python 3:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000` and click `index.html`.

## Background audio

- Click the round audio button (bottom-left) to upload and play a music file from your machine.
- The audio element loops while playing; press the button again to pause.
- The app remembers your preference to have audio enabled in localStorage, but uploaded local files will not persist across page reloads (object URLs are session-scoped). Use a remote URL if you want persistence.

## Controls and shortcuts

- Enter key submits a guess when the number input is focused.
- Buttons:
  - Difficulty buttons: pick a range & attempts and start a new game
  - Guess: submit a guess
  - Play Again / Change Difficulty: restart or change the level
  - Audio toggle: upload/play/pause background music

## Customization

- Difficulty settings are in `script.js` under the `difficultySettings` object — change ranges and attempts there.
- Background colors and animations are defined in `index.html` (CSS). Tweak gradients, blur, durations and shapes there.
- To use a remote audio file permanently, either add a small URL input to the UI or manually set the `src` of the `#bgAudio` element.
- Adjust default audio volume by changing `bgAudio.volume` in `script.js`.

## Accessibility

- Background animations respect the `prefers-reduced-motion` media query.
- Audio starts only after a user gesture (browsers enforce this). Consider adding ARIA live regions to announce feedback for screen readers.

## Troubleshooting

- If audio doesn't start, click the audio button to provide a user gesture. Some browsers block autoplay.
- If a local audio file fails, try a different format (MP3, OGG) supported by your browser.
- If UI elements don't show or the page behaves oddly, check the developer console for errors.

## Development notes

- No build step or external dependencies — plain HTML/CSS/JS.
- Contributions: fork the repo and open a PR.

## License

Consider adding a license. Common choices:

- MIT License — permissive and simple for small projects.

---

If you'd like, I can also:
- Add this `README.md` to the repo (done).
- Add a small screenshots section with example images.
- Add a remote-URL input for persistent background music.
- Add a volume slider UI.

Tell me which of those you'd like next and I'll implement it.