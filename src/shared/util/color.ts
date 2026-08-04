// Canvas fillStyle/strokeStyle can't resolve a `var(--x)` reference the way the DOM cascade
// does, so any CSS custom property handed to Chart.js must be read to its computed value
// first. Shared by every Chart.js-backed view (category summary doughnut, metrics usage line).
export function resolveCssColor(cssVar: string): string {
  const varName = cssVar.match(/var\((--[\w-]+)\)/)?.[1];
  if (!varName) return cssVar;
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}
