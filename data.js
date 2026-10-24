// ---------------------------------------------------------------
// data.js — saving, loading and date logic. No screen code here.
// ---------------------------------------------------------------
//
// Everything is kept in the browser's localStorage on this phone,
// under one key, as a small JSON object shaped like this:
//
//   {
//     entries: [ { id, kcal, meal, time } ],   // time = when it was logged (milliseconds)
//     goals:   [ { from: "2026-10-24", kcal: 1800 } ]
//   }
//
// Goals are a list, not a single number: each goal has the day it
// started. To know a day's goal we take the latest goal that started
// on or before that day. That way changing your goal never rewrites
// History.

const STORAGE_KEY = 'calorie-counter-v1';
const DEFAULT_GOAL = 1800;
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

// Limits for what you can type
const KCAL_MIN = 1;
const KCAL_MAX = 5000;
const GOAL_MIN = 500;
const GOAL_MAX = 10000;

// ---------- Loading and saving ----------

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.entries) && Array.isArray(saved.goals)) {
      return saved;
    }
  } catch (e) {
    // Storage is unreadable (e.g. private browsing). Start fresh.
  }
  return { entries: [], goals: [] };
}

let state = loadState();

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save to this phone’s storage', e);
  }
}

// ---------- Dates ----------
// A "day key" is a date written as "YYYY-MM-DD" in the phone's local
// time. A new day starts at local midnight.

function dayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

function todayKey() {
  return dayKey(new Date());
}

// Turns "2026-10-24" back into a Date at local midnight.
function dateFromKey(key) {
  const parts = key.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

// The day key `days` days before (negative) or after (positive) `key`.
function addDays(key, days) {
  const date = dateFromKey(key);
  date.setDate(date.getDate() + days);
  return dayKey(date);
}

// ---------- Goals ----------

function goalFor(key) {
  let goal = DEFAULT_GOAL;
  // Goals are kept sorted oldest first, so the last match wins.
  state.goals.forEach(function (g) {
    if (g.from <= key) goal = g.kcal;
  });
  return goal;
}

// A new goal applies from today onward.
function setGoal(kcal) {
  const today = todayKey();
  // Drop any goal that started today (or later), then add the new one.
  state.goals = state.goals.filter(function (g) { return g.from < today; });
  // Before the very first change, remember that past days used the default.
  if (state.goals.length === 0) {
    state.goals.push({ from: '0000-01-01', kcal: DEFAULT_GOAL });
  }
  state.goals.push({ from: today, kcal: kcal });
  saveState();
}

// ---------- Entries (meals) ----------

function entriesFor(key) {
  return state.entries
    .filter(function (e) { return dayKey(new Date(e.time)) === key; })
    .sort(function (a, b) { return b.time - a.time; }); // newest first
}

function totalFor(key) {
  return entriesFor(key).reduce(function (sum, e) { return sum + e.kcal; }, 0);
}

function addEntry(kcal, meal) {
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    kcal: kcal,
    meal: meal,
    time: Date.now(),
  };
  state.entries.push(entry);
  saveState();
  return entry;
}

function updateEntry(id, kcal, meal) {
  const entry = state.entries.find(function (e) { return e.id === id; });
  if (!entry) return;
  entry.kcal = kcal;
  entry.meal = meal;
  saveState();
}

function deleteEntry(id) {
  const entry = state.entries.find(function (e) { return e.id === id; });
  state.entries = state.entries.filter(function (e) { return e.id !== id; });
  saveState();
  return entry; // returned so it can be put back with "Undo"
}

function restoreEntry(entry) {
  state.entries.push(entry);
  saveState();
}

// The day key of the oldest meal ever logged, or null if none.
function firstLoggedDay() {
  if (state.entries.length === 0) return null;
  const oldest = Math.min.apply(null, state.entries.map(function (e) { return e.time; }));
  return dayKey(new Date(oldest));
}

// ---------- Helpers ----------

// Which meal type to preselect, based on the time of day.
function mealForTime(date) {
  const minutes = date.getHours() * 60 + date.getMinutes();
  if (minutes < 11 * 60) return 'Breakfast';
  if (minutes < 15 * 60) return 'Lunch';
  if (minutes >= 17 * 60 && minutes < 21 * 60 + 30) return 'Dinner';
  return 'Snack';
}

// Reads a whole number from what was typed. Returns null if it isn't one.
function parseWholeNumber(text) {
  const digits = String(text).replace(/[\s,.]/g, '');
  if (!/^\d+$/.test(digits)) return null;
  return parseInt(digits, 10);
}
