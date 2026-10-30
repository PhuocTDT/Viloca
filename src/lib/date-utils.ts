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

/**
 * "Today" theo giờ Việt Nam (UTC+7 cố định, không DST) — dùng cho logic điểm
 * danh để khớp đúng ngày với `(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date`
 * ở server, bất kể máy người dùng đặt timezone nào.
 */
export function vnTodayStr(): string {
  const vn = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const y = vn.getUTCFullYear();
  const m = String(vn.getUTCMonth() + 1).padStart(2, '0');
  const day = String(vn.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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
