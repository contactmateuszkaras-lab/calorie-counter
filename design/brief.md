# Calorie Counter – MVP Brief

Oct 24, 2026 · @Mateusz

> Markdown copy of `brief.docx` (the original Word file), so it can be read on GitHub.

## Overview

A personal, mobile-first tool for rough calorie tracking against a daily goal. One user, one phone, no accounts.

- Core principle: speed over precision. Logging a meal takes under 5 seconds and never asks for weights or ingredients.
- Main question it answers: how many calories do I have left today?
- Secondary question: how have I been doing over recent days?

## Screens and features

The app has three screens: Today (the home screen), History and Settings.

### 1. Today

- Calories remaining is the dominant element: a large number calculated as goal minus eaten.
- Below it, a smaller line shows eaten / goal, e.g. "1,250 / 1,800 kcal".
- A simple progress indicator (bar or ring) shows how much of the goal is used.
- A list of today's entries, newest first. Each entry shows the meal type, kcal and time.
- Each entry can be deleted, and ideally edited (tap to change kcal or meal type).

### 2. Quick add

- Tap a prominent "Add" button on the Today screen.
- Pick a meal type from fixed options: Breakfast, Lunch, Dinner, Snack. One is preselected based on time of day.
- Type the kcal number. The numeric keyboard opens automatically.
- Tap Save. The entry appears in the list and the remaining number updates.

### 3. Over the goal

- When eaten exceeds the goal, the remaining number turns negative and prominent, e.g. −150.
- The number changes to a warning colour.
- A small, light-hearted subline appears under it, e.g. "That's enough for today".
- Under the goal, the subline is neutral, e.g. "kcal left today".

### 4. History

- One row per past day: date, total kcal eaten, and whether it was under or over the goal.
- Totals only. Individual entries from past days don't need to be shown.
- A simple chart of recent days (e.g. last 14 or 30 days) with the goal as a reference line, to show the trend.
- History records the goal that applied on each day, so changing the goal later doesn't rewrite the past.

### 5. Settings

- Daily goal, default 1,800 kcal, editable.
- A new goal applies from today onward.

## Out of scope

The following are deliberately excluded to keep the app simple:

- Food databases, barcode scanning and weighing.
- Macros (protein, carbs, fat).
- Accounts, logins, cloud sync and social features.
- Reminders and notifications.

Later ideas, not in this MVP:

- Simple gym workout tracking.
- Exporting or backing up data, or syncing it between devices.

## Technical approach

The app is a static web app installed on the phone as a PWA, with no backend.

- Platform: a Progressive Web App (PWA). It opens in the phone browser, can be added to the home screen, runs full-screen and works offline.
- Stack: plain HTML, CSS and JavaScript, or a lightweight framework if Claude Code recommends one. It should stay simple enough for a beginner to read.
- Data: stored on the device in browser storage. There is no server and no account.
- Known risk: clearing browser data deletes the history. This is acceptable for the MVP; backup or export is a later idea.
- Code: kept in a GitHub repository and built with Claude Code on the web.
- Hosting: GitHub Pages, which is free.
- Design: mobile-first, for a phone screen of roughly 375–430 px wide. Mockups come from Figma and are attached as images.
- Day boundary: a new day starts at local midnight (Europe/Warsaw).

## Done for v1

Version 1 is done when all of the following are true:

- [ ] The app is live on a GitHub Pages URL and installed on my phone's home screen.
- [ ] I can log a meal (meal type + kcal) in under 5 seconds.
- [ ] Remaining kcal updates instantly and shows a negative number with the subline when I'm over the goal.
- [ ] I can delete a wrong entry.
- [ ] The day resets at midnight, and yesterday's total appears in History.
- [ ] History shows past daily totals and a trend chart.
- [ ] I can change my daily goal in Settings.
- [ ] Data survives closing the app and restarting the phone.
