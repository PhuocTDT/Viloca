import {
  formatLocalDate,
  todayStr,
  getDaysInMonth,
  getMondayFirstStartOffset,
} from '../src/lib/date-utils';

describe('Monthly Checkin Calendar date utilities', () => {
  it('formats dates consistently in YYYY-MM-DD local format', () => {
    const d = new Date(2026, 9, 27); // Month index 9 = October
    expect(formatLocalDate(d)).toBe('2026-10-27');
  });

  it('generates a valid today string', () => {
    const str = todayStr();
    expect(str).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('correctly calculates days in month and start day offset for Monday-first layout', () => {
    // October 2026
    const year = 2026;
    const month = 9; // October (0-indexed)
    const daysInMonth = getDaysInMonth(year, month);
    expect(daysInMonth).toBe(31);

    // 2026-10-01: In 2026, Oct 1 is Thursday.
    // Sunday=0, Monday=1, Tuesday=2, Wednesday=3, Thursday=4
    const startOffset = getMondayFirstStartOffset(year, month);
    expect(startOffset).toBe(3); // Thursday is index 3 in Monday-first
  });

  it('handles February in leap and non-leap years', () => {
    expect(getDaysInMonth(2024, 1)).toBe(29); // Leap year
    expect(getDaysInMonth(2026, 1)).toBe(28); // Non-leap year
  });
});
