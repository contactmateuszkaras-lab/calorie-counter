// ---------------------------------------------------------------
// app.js — what you see and what happens when you tap.
// It uses the functions from data.js to read and save meals.
// ---------------------------------------------------------------

// A shortcut: $('id') finds the element with that id in index.html.
function $(id) { return document.getElementById(id); }

// ---------- Formatting ----------

// 1250 -> "1,250". Negative numbers get a proper minus sign: "−200".
function formatKcal(n) {
  const text = Math.abs(n).toLocaleString('en-US');
  return n < 0 ? '−' + text : text;
}

// A time like "08:15"
function formatTime(ms) {
  const d = new Date(ms);
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

// "Sat, 24 October"
function formatLongDate(date) {
  return WEEKDAYS[date.getDay()] + ', ' + date.getDate() + ' ' + MONTHS[date.getMonth()];
}

// "23 Oct"
function formatShortDate(date) {
  return date.getDate() + ' ' + MONTHS[date.getMonth()].slice(0, 3);
}

// "17–23 October", or "28 Sep – 4 Oct" when the range spans two months
function formatRange(fromKey, toKey) {
  const from = dateFromKey(fromKey);
  const to = dateFromKey(toKey);
  if (from.getMonth() === to.getMonth()) {
    return from.getDate() + '–' + to.getDate() + ' ' + MONTHS[to.getMonth()];
  }
  return formatShortDate(from) + ' – ' + formatShortDate(to);
}

// ---------- Screen: Today ----------

function renderToday() {
  const today = todayKey();
  const goal = goalFor(today);
  const entries = entriesFor(today);
  const eaten = totalFor(today);
  const remaining = goal - eaten;
  const isOver = remaining < 0;

  $('today-date').textContent = formatLongDate(new Date());

  // The big card
  $('today-card').classList.toggle('is-over', isOver);
  $('today-label').textContent = isOver ? 'Over goal today' : 'Calories left today';
  $('today-icon').innerHTML = iconSvg(isOver ? 'minusCircle' : 'gauge');
  $('today-remaining').textContent = formatKcal(remaining);
  $('today-eaten').textContent = formatKcal(eaten) + ' / ' + formatKcal(goal) + ' kcal eaten';
  $('today-progress').style.width = Math.min(eaten / goal, 1) * 100 + '%';
  $('today-subline').textContent = isOver
    ? 'A little over. It’s just one day.'
    : 'A rough estimate is all you need.';

  // The meal list
  $('meal-count').textContent = entries.length === 1 ? '1 entry · kcal' : entries.length + ' entries · kcal';
  $('meal-hint').hidden = entries.length === 0;

  const list = $('meal-list');
  list.innerHTML = '';
  if (entries.length === 0) {
    list.innerHTML = '<li class="empty-state">Nothing logged yet today.</li>';
    return;
  }
  entries.forEach(function (entry) {
    const row = document.createElement('li');
    row.className = 'meal-row';
    row.innerHTML =
      '<button type="button" class="meal-main" aria-label="Edit ' + entry.meal + ', ' + entry.kcal + ' kcal">' +
        '<span class="meal-icon">' + iconSvg(entry.meal) + '</span>' +
        '<span class="meal-text">' +
          '<span class="meal-name">' + entry.meal + '</span>' +
          '<span class="meal-time">' + formatTime(entry.time) + '</span>' +
        '</span>' +
        '<span class="meal-kcal">' + formatKcal(entry.kcal) + '</span>' +
      '</button>' +
      '<button type="button" class="icon-button" data-action="edit" aria-label="Edit">' +
        '<span class="icon">' + iconSvg('pencil') + '</span></button>' +
      '<button type="button" class="icon-button" data-action="delete" aria-label="Delete">' +
        '<span class="icon">' + iconSvg('trash') + '</span></button>';

    row.querySelector('.meal-main').addEventListener('click', function () { openSheet(entry); });
    row.querySelector('[data-action="edit"]').addEventListener('click', function () { openSheet(entry); });
    row.querySelector('[data-action="delete"]').addEventListener('click', function () { removeMeal(entry.id); });
    list.appendChild(row);
  });
}

// Delete right away, and offer "Undo" for a few seconds.
function removeMeal(id) {
  const removed = deleteEntry(id);
  renderAll();
  showToast(removed.meal + ' deleted', function () {
    restoreEntry(removed);
    renderAll();
  });
}

// ---------- Screen: History ----------

const HISTORY_DAYS = 30; // how far back the list goes

function renderHistory() {
  const today = todayKey();
  const yesterday = addDays(today, -1);

  // Summary card: the last 7 full days (yesterday and the 6 days before)
  const weekStart = addDays(today, -7);
  $('week-range').textContent = formatRange(weekStart, yesterday);

  let loggedDays = 0;
  let sum = 0;
  let underCount = 0;
  for (let key = weekStart; key <= yesterday; key = addDays(key, 1)) {
    const total = totalFor(key);
    if (total === 0) continue; // days with nothing logged don't count
    loggedDays++;
    sum += total;
    if (total <= goalFor(key)) underCount++;
  }
  $('week-average').textContent = loggedDays ? formatKcal(Math.round(sum / loggedDays)) : '—';
  $('week-under').textContent = loggedDays ? underCount + ' / ' + loggedDays : '—';

  $('history-goal').textContent = 'Goal ' + formatKcal(goalFor(today)) + ' kcal';

  // Daily list: from yesterday back to the first day you logged (max 30 days)
  const list = $('history-list');
  list.innerHTML = '';
  const first = firstLoggedDay();
  if (!first || first >= today) {
    list.innerHTML = '<li class="empty-state">Your past days will show up here. Today’s total appears tomorrow.</li>';
    $('history-hint').hidden = true;
    return;
  }
  $('history-hint').hidden = false;

  const oldest = first > addDays(today, -HISTORY_DAYS) ? first : addDays(today, -HISTORY_DAYS);
  for (let key = yesterday; key >= oldest; key = addDays(key, -1)) {
    list.appendChild(historyRow(key));
  }
}

function historyRow(key) {
  const date = dateFromKey(key);
  const total = totalFor(key);
  const goal = goalFor(key);
  const diff = goal - total;
  const isEmpty = total === 0;
  const isOver = diff < 0;

  // The bar's full width stands for a bit more than the goal, so the tick sits near the right
  const scale = Math.max(goal * 1.15, total * 1.05);

  let diffText = '';
  if (isEmpty) diffText = '';
  else if (isOver) diffText = formatKcal(-diff) + ' over';
  else if (diff === 0) diffText = 'on goal';
  else diffText = formatKcal(diff) + ' left';

  const row = document.createElement('li');
  row.className = 'history-row' + (isOver ? ' is-over' : '') + (isEmpty ? ' is-empty' : '');
  row.innerHTML =
    '<p class="history-day">' + WEEKDAYS[date.getDay()] +
      '<span class="history-date">' + formatShortDate(date) + '</span></p>' +
    '<div>' +
      '<div class="history-top">' +
        '<span class="history-total">' + (isEmpty ? 'Nothing logged' : formatKcal(total)) + '</span>' +
        '<span class="history-diff">' + diffText + '</span>' +
      '</div>' +
      '<div class="bar">' +
        '<div class="bar-fill" style="width:' + (total / scale) * 100 + '%"></div>' +
        '<div class="bar-tick" style="left:' + (goal / scale) * 100 + '%"></div>' +
      '</div>' +
    '</div>';
  return row;
}

// ---------- Screen: Settings ----------

function renderSettings() {
  const input = $('goal-input');
  if (document.activeElement !== input) {
    input.value = formatKcal(goalFor(todayKey()));
    sizeGoalInput();
  }
}

// Make the goal box exactly as wide as the number in it
function sizeGoalInput() {
  const input = $('goal-input');
  input.style.width = Math.max(input.value.length, 3) + 0.4 + 'ch';
}

$('goal-input').addEventListener('input', function () {
  sizeGoalInput();
  $('goal-error').hidden = true;
});

$('goal-form').addEventListener('submit', function (event) {
  event.preventDefault(); // stop the browser from reloading the page
  const goal = parseWholeNumber($('goal-input').value);
  if (goal === null || goal < GOAL_MIN || goal > GOAL_MAX) {
    $('goal-error').textContent = 'Please enter a goal between ' + formatKcal(GOAL_MIN) +
      ' and ' + formatKcal(GOAL_MAX) + ' kcal.';
    $('goal-error').hidden = false;
    return;
  }
  setGoal(goal);
  $('goal-input').blur();
  renderAll();
  showToast('Goal saved · ' + formatKcal(goal) + ' kcal from today');
});

// ---------- The "Log a meal" sheet ----------

let editingId = null;     // null = adding a new meal; otherwise the id of the meal being edited
let selectedMeal = null;

function openSheet(entry) {
  editingId = entry ? entry.id : null;
  const input = $('kcal-input');
  input.value = entry ? String(entry.kcal) : '';
  selectMeal(entry ? entry.meal : mealForTime(new Date()));

  $('sheet-title').textContent = entry ? 'Edit meal' : 'Log a meal';
  $('sheet-footer').textContent = entry
    ? 'Logged at ' + formatTime(entry.time) + ' · edit anytime'
    : 'For today, ' + formatTime(Date.now()) + ' · edit anytime';
  resetKcalNote();
  updateSaveButton();

  $('sheet-backdrop').hidden = false;
  $('log-sheet').hidden = false;
  // Focusing straight away (inside the tap) is what makes phones open the number keyboard
  input.focus();
  if (entry) input.select();
  fitSheetAboveKeyboard();
}

function closeSheet() {
  $('kcal-input').blur();
  $('sheet-backdrop').hidden = true;
  $('log-sheet').hidden = true;
  $('log-sheet').style.bottom = '';
  editingId = null;
}

function selectMeal(meal) {
  selectedMeal = meal;
  document.querySelectorAll('#meal-types button').forEach(function (button) {
    button.setAttribute('aria-checked', button.dataset.meal === meal ? 'true' : 'false');
  });
}

function resetKcalNote() {
  $('kcal-note').textContent = 'Your best guess is enough.';
  $('kcal-note').classList.remove('is-error');
}

// The button text follows what you type: "Add 400 kcal"
function updateSaveButton() {
  const kcal = parseWholeNumber($('kcal-input').value);
  const valid = kcal !== null && kcal >= KCAL_MIN;
  $('save-meal').disabled = !valid;
  const amount = valid ? formatKcal(kcal) + ' kcal' : 'kcal';
  $('save-meal-text').textContent = editingId ? 'Save ' + amount : 'Add ' + amount;
  $('save-meal').querySelector('.icon').innerHTML = iconSvg(editingId ? 'check' : 'plus');
}

$('open-log').addEventListener('click', function () { openSheet(null); });
$('close-sheet').addEventListener('click', closeSheet);
$('sheet-backdrop').addEventListener('click', closeSheet);
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && !$('log-sheet').hidden) closeSheet();
});

$('kcal-input').addEventListener('input', function () {
  // Keep digits only, in case something else gets pasted in
  this.value = this.value.replace(/\D/g, '');
  resetKcalNote();
  updateSaveButton();
});

document.querySelectorAll('#meal-types button').forEach(function (button) {
  button.addEventListener('click', function () {
    selectMeal(button.dataset.meal);
    $('kcal-input').focus(); // keep the keyboard open
  });
});

$('log-sheet').addEventListener('submit', function (event) {
  event.preventDefault();
  const kcal = parseWholeNumber($('kcal-input').value);
  if (kcal === null || kcal < KCAL_MIN || kcal > KCAL_MAX) {
    $('kcal-note').textContent = 'That looks too high. Please enter up to ' + formatKcal(KCAL_MAX) + ' kcal.';
    $('kcal-note').classList.add('is-error');
    return;
  }
  if (editingId) {
    updateEntry(editingId, kcal, selectedMeal);
  } else {
    addEntry(kcal, selectedMeal);
  }
  closeSheet();
  renderAll();
});

// On iPhones the keyboard can cover the bottom of the screen.
// This lifts the sheet so it always sits just above the keyboard.
function fitSheetAboveKeyboard() {
  const viewport = window.visualViewport;
  if (!viewport || $('log-sheet').hidden) return;
  const covered = window.innerHeight - viewport.height - viewport.offsetTop;
  $('log-sheet').style.bottom = Math.max(covered, 0) + 'px';
}
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', fitSheetAboveKeyboard);
  window.visualViewport.addEventListener('scroll', fitSheetAboveKeyboard);
}

// ---------- Toast (small message bar) ----------

let toastTimer = null;

function showToast(text, onUndo) {
  $('toast-text').textContent = text;
  const action = $('toast-action');
  action.hidden = !onUndo;
  action.onclick = function () {
    hideToast();
    if (onUndo) onUndo();
  };
  $('toast').hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 5000);
}

function hideToast() {
  $('toast').hidden = true;
}

// ---------- Moving between screens ----------
// The address ends in #today, #history or #settings; that decides which screen shows.

const SCREENS = ['today', 'history', 'settings'];

function showScreen() {
  const name = SCREENS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'today';
  SCREENS.forEach(function (screen) {
    $('screen-' + screen).hidden = screen !== name;
  });
  document.querySelectorAll('.tab').forEach(function (tab) {
    const active = tab.dataset.screen === name;
    tab.classList.toggle('is-active', active);
    if (active) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  });
  hideToast();
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', showScreen);

// ---------- Keeping everything up to date ----------

let renderedDay = null;

function renderAll() {
  renderedDay = todayKey();
  renderToday();
  renderHistory();
  renderSettings();
}

// A new day starts at midnight. Check every 30 seconds, and whenever
// the app comes back to the front, whether the date has changed.
function refreshIfNewDay() {
  if (todayKey() !== renderedDay) renderAll();
}
setInterval(refreshIfNewDay, 30 * 1000);
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'visible') refreshIfNewDay();
});

// ---------- Start ----------

fillIcons(document);
renderAll();
showScreen();

// Register the service worker, which makes the app work offline.
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js');
}
