# Calorie Counter

A tiny personal calorie counter for the phone. Log a meal in a few seconds, see how many calories are left today, and look back at recent days.

- Works offline and can be added to the home screen (it's a PWA).
- All data stays on your phone. No account, no cloud.
- Built with plain HTML, CSS and JavaScript.

The brief and mockups are in [`design/`](design/). Notes for working on the project with Claude Code are in [`CLAUDE.md`](CLAUDE.md).

## Try it on your computer

From this folder, run `python3 -m http.server` and open <http://localhost:8000>. Use your browser's phone view (developer tools → device toolbar) for the intended size.

## Clearing data

The data is stored in the browser. Clearing the browser's site data for the app deletes your history.
