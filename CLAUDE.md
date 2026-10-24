# CLAUDE.md — standing notes for Claude Code

## Who I'm working with

- The owner is a **UX designer and a complete beginner** with code, Git and Claude Code.
- Explain what you did in **plain language**, avoid jargon (or explain it in a few words).
- Before larger changes, give a short plan and wait for an OK.
- When something needs doing outside the code (GitHub settings, phone install), give click-by-click steps.

## What this project is

A personal, mobile-first **calorie counter** for one person on one phone. Speed over precision:
logging a meal must take under 5 seconds (meal type + rough kcal, nothing else).
Main question it answers: "How many calories do I have left today?"

- Full brief: `design/brief.md` (original Word file: `design/brief.docx`)
- Mockups (Figma exports): `design/*.png` — follow them for layout and visual direction.

## How it's built

- **Plain HTML, CSS and JavaScript. No framework, no build step, no npm.** Keep it that way unless
  the owner agrees otherwise — the code must stay readable for a beginner.
- Installable **PWA**: `manifest.webmanifest` (home-screen install) + `sw.js` (offline).
- Hosted on **GitHub Pages** (free). Use relative paths everywhere (the site lives at `/calorie-counter/`).
- Data lives only in the phone's `localStorage` (key `calorie-counter-v1`). No server, no accounts.

| File | Job |
|---|---|
| `index.html` | Structure of all 3 screens, tab bar, "Log a meal" sheet, toast |
| `styles.css` | All styling; colours/sizes are variables at the top (`:root`) |
| `icons.js` | Line icons as inline SVG (`<span data-icon="name">`) |
| `data.js` | Saving/loading, goals, entries, date logic — no screen code |
| `app.js` | Drawing the screens and handling taps |
| `sw.js` | Service worker: network-first, falls back to cached copy offline |
| `fonts/` | Work Sans (variable font, OFL licence), self-hosted for offline use |
| `icons/` | App icons (placeholder: green square with gauge) |

If you add a new file the app needs offline, add it to the `FILES` list in `sw.js`.

## Key decisions (keep this list up to date)

- **Data model:** `entries: [{id, kcal, meal, time}]` and `goals: [{from: "YYYY-MM-DD", kcal}]`.
  A day's goal = the latest goal whose `from` is on/before that day, so changing the goal never rewrites
  history. Default goal 1,800 kcal. A new goal applies from today.
- **Day boundary:** local midnight in the phone's own time zone (= Europe/Warsaw at home).
  The app checks every 30 s and when reopened, and refreshes if the date changed.
- **History:** the per-day bar rows (with a goal tick) *are* the trend chart. Summary card = last 7 full
  days (yesterday back). List goes back up to 30 days, but not before the first logged day.
  Days with nothing logged show as "Nothing logged" and are left out of the average and "x / y" count.
- **Meal preselection:** Breakfast before 11:00, Lunch 11:00–15:00, Dinner 17:00–21:30, Snack otherwise.
- **Editing:** tap a meal row (or pencil) → the same sheet opens in edit mode. Time of a meal is not editable.
- **Deleting:** immediate, with an "Undo" bar for 5 seconds (no "are you sure?" dialog).
- **Copy:** use the mockup wording. Under goal: "A rough estimate is all you need."
  Over goal: "A little over. It's just one day." Exactly 0 left counts as at goal (green).
- **Limits:** a meal is 1–5,000 kcal; the goal is 500–10,000 kcal.
- **Not doing (yet):** dark mode, export/backup, food database, macros, accounts, reminders.

## Checking changes

There are no automated tests. To check a change, serve the folder (`python3 -m http.server`) and open it at
phone size (~390 px wide), e.g. with Playwright screenshots, and compare against the mockups in `design/`.
