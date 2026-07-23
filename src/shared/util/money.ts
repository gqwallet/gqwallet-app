// Formats a numeric amount as the app's currency (Peruvian sol), e.g. 3500 → "S/. 3,500".
export function formatMoney(value: number): string {
  return `S/. ${value.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
