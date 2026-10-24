import type { Trip, TripItem } from '@/src/types';

const SLOT_BASE_MIN: Record<string, number> = {
  morning: 7 * 60,
  afternoon: 13 * 60,
  evening: 18 * 60,
};

export function suggestTime(slot: string, slotIndex: number): string {
  const total = (SLOT_BASE_MIN[slot] ?? 7 * 60) + slotIndex * 90;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function tripDayCount(trip: Trip): number {
  if (trip.start_date && trip.end_date) {
    const diff = Math.ceil(
      (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / 86400000
    ) + 1;
    return Math.max(1, Math.min(diff, 30));
  }
  return 0;
}

export function dayLabel(trip: Trip, dayNum: number): string {
  if (!trip.start_date) return `Ngày ${dayNum}`;
  const d = new Date(trip.start_date);
  d.setDate(d.getDate() + dayNum - 1);
  return `Ngày ${dayNum} · ${d.getDate()}/${d.getMonth() + 1}`;
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function buildGoogleMapsUrl(dayItems: TripItem[]): string {
  const sorted = [...dayItems].sort((a, b) => a.sort_order - b.sort_order);
  const waypoints = sorted.map(item => {
    const loc = item.locations as any;
    if (loc?.coordinates?.lat && loc?.coordinates?.lng) {
      return `${loc.coordinates.lat},${loc.coordinates.lng}`;
    }
    if (loc?.address) return encodeURIComponent(loc.address);
    return null;
  }).filter(Boolean) as string[];

  if (waypoints.length === 0) return 'https://maps.google.com';
  if (waypoints.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${waypoints[0]}`;
  }
  const origin = waypoints[0];
  const destination = waypoints[waypoints.length - 1];
  const middle = waypoints.slice(1, -1);
  const waypointsParam = middle.length > 0 ? `&waypoints=${middle.join('|')}` : '';
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypointsParam}&travelmode=driving`;
}

export function stripDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, (c) => c === 'đ' ? 'd' : 'D');
}

function pad2(n: number) { return String(n).padStart(2, '0'); }

/** YYYY-MM-DD theo giờ địa phương (toISOString trả ngày UTC nên lệch trước 7h sáng ở Việt Nam). */
export function localDateString(d = new Date()): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Số ngày lịch giữa hôm nay và `dateStr` (YYYY-MM-DD), tính ở nửa đêm địa phương. */
export function daysFromToday(dateStr: string, now = new Date()): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.max(0, Math.round((target - today) / 86_400_000));
}
