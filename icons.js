// All the little line icons used in the app, drawn as SVG (a code format for vector images).
// In the HTML, write <span class="icon" data-icon="NAME"></span> and the icon appears there.
// They use "currentColor", so an icon takes on the text colour around it.

const ICONS = {
  // Navigation + card
  gauge: '<circle cx="12" cy="12" r="9"/><path d="M12 12l3.5-3.5"/><path d="M7.5 15.5a6 6 0 0 1 0-7"/>',
  chart: '<path d="M6 20V12"/><path d="M12 20V5"/><path d="M18 20v-6"/>',
  sliders: '<path d="M4 7h10"/><path d="M18 7h2"/><circle cx="16" cy="7" r="2"/><path d="M4 17h2"/><path d="M10 17h10"/><circle cx="8" cy="17" r="2"/>',
  minusCircle: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',

  // Actions
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  close: '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>',
  pencil: '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/><path d="M14.5 5.5l3 3"/>',
  trash: '<path d="M4 7h16"/><path d="M9 7V4.5h6V7"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5.5"/><path d="M14 11v5.5"/>',

  // Settings
  phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',

  // Meal types
  Breakfast: '<path d="M4 10h13v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H16.5"/><path d="M8 3c-.8 1 .8 2 0 3.5"/><path d="M12 3c-.8 1 .8 2 0 3.5"/>',
  Lunch: '<path d="M3 13h18"/><path d="M4 13a8 5 0 0 1 16 0"/><path d="M4 16.5h16"/><path d="M5 16.5l1 3h12l1-3"/>',
  Dinner: '<path d="M7 3v18"/><path d="M4 3v5a3 3 0 0 0 6 0V3"/><path d="M17 21V3c-2 1.5-3 4-3 7v3h3"/>',
  Snack: '<path d="M12 7c-1.5-1.2-5-1.5-6.5 1S5 15 7 18s3.5 3 5 2c1.5 1 3 1 5-2s2.5-7.5 1-10-5-2.2-6-1z"/><path d="M12 7c0-2 1-3.5 2.5-4"/>',
};

// Returns the full <svg> code for an icon name.
function iconSvg(name) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
}

// Fills every <span data-icon="..."> found inside `root` with its icon.
function fillIcons(root) {
  root.querySelectorAll('[data-icon]').forEach(function (el) {
    el.innerHTML = iconSvg(el.dataset.icon);
  });
}
