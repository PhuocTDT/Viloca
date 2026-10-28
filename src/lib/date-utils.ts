/**
 * Pure date formatting and calendar calculation utilities
 */

export function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayStr(): string {
  return formatLocalDate(new Date());
}

export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Returns Monday-first column offset (0 = Monday, ..., 6 = Sunday)
 */
export function getMondayFirstStartOffset(year: number, monthIndex: number): number {
  const firstDay = new Date(year, monthIndex, 1).getDay(); // 0 is Sunday
  return (firstDay + 6) % 7;
}
