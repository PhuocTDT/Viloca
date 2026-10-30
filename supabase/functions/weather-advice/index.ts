import { createClient } from 'npm:@supabase/supabase-js';
import { WEATHER_ADAPTATION_CONFIG as CFG } from '../_shared/weather-adaptation/config.ts';
import { activityWindow, assessWeatherImpact, scheduleFingerprint, vietnamDayStart, type WeatherImpact } from '../_shared/weather-adaptation/impact.ts';
import { getHourlyForecast } from '../_shared/weather-adaptation/forecast.ts';
import { transportAdvice } from '../_shared/weather-adaptation/transport.ts';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const LEVEL = { none: 0, unknown: 0, caution: 1, high: 2 } as const;

function reply(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' } });
}

function localTime(epochMs: number): string {
  const date = new Date(epochMs + 7 * 3_600_000);
  return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
}

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (n: number) => n * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function verifiedOpening(hours: unknown, epochMs: number, duration: number): boolean {
  if (!hours || typeof hours !== 'object') return false;
  const start = new Date(epochMs + 7 * 3_600_000);
  const weekday = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][start.getUTCDay()];
  const slots = (hours as Record<string, unknown>)[weekday];
  if (!Array.isArray(slots)) return false;
  const minute = start.getUTCHours() * 60 + start.getUTCMinutes();
  return slots.some((slot: unknown) => {
    if (!Array.isArray(slot) || slot.length !== 2 ||
        !/^\d{2}:\d{2}$/.test(slot[0]) || !/^\d{2}:\d{2}$/.test(slot[1])) return false;
    const toMinutes = (value: string) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
    return minute >= toMinutes(slot[0]) && minute + duration <= toMinutes(slot[1]);
  });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (request.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
  const url = Deno.env.get('SUPABASE_URL');
  const anon = Deno.env.get('SUPABASE_ANON_KEY');
  const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !anon || !secret) return reply({ error: 'Weather advice is not configured' }, 503);
  const authorization = request.headers.get('Authorization') ?? '';
  if (!authorization.startsWith('Bearer ')) return reply({ error: 'Authentication required' }, 401);
  const userClient = createClient(url, anon, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
  const admin = createClient(url, secret, { auth: { persistSession: false } });
  const { data: auth, error: authError } = await userClient.auth.getUser(authorization.slice(7));
  if (authError || !auth.user) return reply({ error: 'Authentication required' }, 401);

  try {
    const body = await request.json();
    const tripId = typeof body.tripId === 'string' ? body.tripId : '';
    const language = body.language === 'en' ? 'en' : 'vi';
    const { data: trip, error: tripError } = await userClient.from('trips')
      .select('id,user_id,start_date,end_date,status,itinerary_revision').eq('id', tripId).single();
    if (tripError || !trip || trip.user_id !== auth.user.id) return reply({ error: 'Trip not found' }, 404);
    if (!trip.start_date || trip.status === 'completed') return reply({ alerts: [], checkedAt: Date.now(), reason: 'trip_without_active_dates' });
    const { data: items, error: itemsError } = await userClient.from('trip_items')
      .select('*,locations(id,name,name_en,city,district,coordinates,duration_minutes,travel_region,shelter_type,shelter_verified_at,weather_exposure,structured_opening_hours)')
      .eq('trip_id', tripId).order('day_number').order('sort_order');
    if (itemsError) throw itemsError;
    const now = Date.now();
    const alerts = [];
    let unavailableCount = 0;
    for (const item of (items ?? []).slice(0, 60)) {
      const place = item.locations;
      const coords = place?.coordinates;
      const duration = item.weather_duration_minutes ?? place?.duration_minutes ?? null;
      const window = activityWindow(trip, item, duration);
      if (!window || window.to <= now || window.from > now + CFG.proactiveHours * 3_600_000) continue;
      if (!Number.isFinite(coords?.lat) || !Number.isFinite(coords?.lng)) { unavailableCount++; continue; }
      let forecast;
      try { forecast = await getHourlyForecast(coords.lat, coords.lng); }
      catch { unavailableCount++; continue; }
      const impact = assessWeatherImpact(trip, item, duration, place?.weather_exposure ?? 'ordinary', forecast);
      if (!impact) continue;
      if (impact.level === 'unknown') { unavailableCount++; continue; }
      const fingerprint = scheduleFingerprint(trip, item);
      const { data: oldEvents } = await admin.from('trip_weather_events').select('*')
        .eq('item_id', item.id).eq('schedule_fingerprint', fingerprint)
        .in('status', ['open','kept']).order('created_at', { ascending: false }).limit(1);
      const previous = oldEvents?.[0];
      // Missing forecast values cannot prove that an existing warning has cleared.
      if (impact.level === 'none') {
        if (previous?.status === 'open' || previous?.status === 'kept') {
          const oldClear = previous.last_clear_at ? Date.parse(previous.last_clear_at) : 0;
          const clearObservations = oldClear && now - oldClear >= 30 * 60_000 ? previous.clear_observations + 1 : Math.max(1, previous.clear_observations);
          await admin.from('trip_weather_events').update({
            clear_observations: clearObservations, last_clear_at: new Date(now).toISOString(),
            status: clearObservations >= 2 ? 'resolved' : previous.status, updated_at: new Date(now).toISOString(),
          }).eq('id', previous.id);
        }
        continue;
      }
      if (previous?.status === 'kept' && LEVEL[impact.level] <= previous.accepted_level &&
          impact.kinds.every((kind) => previous.risk_kinds.includes(kind))) continue;
      let event = previous?.status === 'open' ? previous : null;
      if (!event) {
        const inserted = await admin.from('trip_weather_events').insert({
          trip_id: tripId, item_id: item.id, schedule_fingerprint: fingerprint,
          episode_key: crypto.randomUUID(), risk_signature: impact.riskSignature,
          risk_level: LEVEL[impact.level], risk_kinds: impact.kinds,
          source_fetched_at: new Date(forecast.fetchedAt).toISOString(),
        }).select().single();
        if (inserted.error) throw inserted.error;
        event = inserted.data;
      } else {
        await admin.from('trip_weather_events').update({
          risk_signature: impact.riskSignature, risk_level: LEVEL[impact.level], risk_kinds: impact.kinds,
          source_fetched_at: new Date(forecast.fetchedAt).toISOString(),
          clear_observations: 0, last_clear_at: null, updated_at: new Date(now).toISOString(),
        }).eq('id', event.id);
      }
      const proposals: Array<{ id: string; action: string; label: string; checked: boolean }> = [];
      const addProposal = async (action: string, target: Record<string, unknown>, label: string, checked: boolean) => {
        const issued = await admin.from('trip_weather_proposals').insert({
          event_id: event.id, trip_id: tripId, item_id: item.id,
          action, target, expected_revision: trip.itinerary_revision,
          schedule_fingerprint: fingerprint,
          forecast_fetched_at: new Date(forecast.fetchedAt).toISOString(),
          expires_at: new Date(now + CFG.cacheFreshMs).toISOString(),
        }).select('id').single();
        if (issued.error) throw issued.error;
        proposals.push({ id: issued.data.id, action, label, checked });
      };
      await addProposal('keep', {}, language === 'vi' ? 'Giữ nguyên lịch trình' : 'Keep the itinerary', true);

      // Do not claim an alternative is verified without duration and structured opening hours.
      if (duration && item.visit_time && place?.structured_opening_hours) {
        let count = 0;
        const dayStart = vietnamDayStart(trip.start_date, item.day_number)!;
        for (let start = window.from + CFG.optionStepMinutes * 60_000;
             start + duration * 60_000 <= dayStart + 23 * 3_600_000;
             start += CFG.optionStepMinutes * 60_000) {
          if (start <= now || count >= 3) break;
          const candidate = assessWeatherImpact(trip, { ...item, visit_time: localTime(start) }, duration,
            place.weather_exposure ?? 'ordinary', forecast);
          if (!candidate || LEVEL[candidate.level] >= LEVEL[impact.level] || candidate.incomplete ||
              !verifiedOpening(place.structured_opening_hours, start, duration)) continue;
          const overlaps = (items ?? []).some((other) => {
            if (other.id === item.id || other.day_number !== item.day_number) return false;
            const otherWindow = activityWindow(trip, other, other.weather_duration_minutes ?? other.locations?.duration_minutes);
            return !otherWindow || !(start + (duration + CFG.unknownTravelBufferMinutes) * 60_000 <= otherWindow.from ||
              otherWindow.to + CFG.unknownTravelBufferMinutes * 60_000 <= start);
          });
          if (overlaps) continue;
          const targetTime = localTime(start);
          await addProposal('later', { day_number: item.day_number, visit_time: targetTime },
            language === 'vi' ? `Dời tới ${targetTime} (dự báo ít ảnh hưởng hơn)` : `Move to ${targetTime} (forecast is more favorable)`, true);
          count++;
        }
      }

      if (trip.end_date && item.visit_time && duration) {
        const days = Math.min(30, Math.round((Date.parse(trip.end_date) - Date.parse(trip.start_date)) / 86_400_000) + 1);
        for (let day = item.day_number + 1, count = 0; day <= days && count < 2; day++) {
          const candidate = assessWeatherImpact(trip, { ...item, day_number: day }, duration,
            place.weather_exposure ?? 'ordinary', forecast);
          const targetTime = item.visit_time.slice(0, 5);
          const checked = !!candidate && candidate.level !== 'unknown' && !candidate.incomplete &&
            LEVEL[candidate.level] < LEVEL[impact.level] && !!place?.structured_opening_hours &&
            verifiedOpening(place.structured_opening_hours, candidate.from, duration);
          if (candidate?.level === 'high') continue;
          await addProposal('other_day', { day_number: day, visit_time: targetTime, manual: !checked },
            language === 'vi' ? `Ngày ${day}, ${targetTime}${checked ? ' · dự báo ít ảnh hưởng hơn' : ' · cần tự kiểm tra'}` :
              `Day ${day}, ${targetTime}${checked ? ' · more favorable forecast' : ' · check conditions yourself'}`, checked);
          count++;
        }
      }

      if (place?.travel_region) {
        const { data: indoors } = await admin.from('locations')
          .select('id,name,name_en,coordinates,structured_opening_hours,duration_minutes,price_per_person')
          .eq('travel_region', place.travel_region).eq('shelter_type', 'indoor')
          .not('shelter_verified_at', 'is', null).eq('is_active', true).limit(50);
        const options = (indoors ?? []).filter((candidate) => candidate.coordinates &&
          distanceKm(coords, candidate.coordinates) <= CFG.indoorRadiusKm && candidate.duration_minutes &&
          verifiedOpening(candidate.structured_opening_hours, window.from, candidate.duration_minutes))
          .sort((a, b) => distanceKm(coords, a.coordinates) - distanceKm(coords, b.coordinates)).slice(0, 3);
        for (const candidate of options) {
          await addProposal('indoor', { location_id: candidate.id },
            language === 'vi' ? `Thay bằng ${candidate.name}` : `Replace with ${candidate.name_en || candidate.name}`, true);
        }
      }
      alerts.push({ eventId: event.id, itemId: item.id, itemName: place?.name ?? item.experience_title ?? 'Hoạt động',
        region: place?.travel_region ?? null, dayNumber: item.day_number, time: item.visit_time?.slice(0,5) ?? null,
        impact, firstObservation: !previous, proposals,
        transport: transportAdvice(place?.travel_region, impact as WeatherImpact, language) });
    }
    alerts.sort((a, b) => LEVEL[b.impact.level] - LEVEL[a.impact.level] || a.impact.from - b.impact.from);
    return reply({ alerts, checkedAt: now, unavailableCount });
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : 'Weather advice failed' }, 500);
  }
});
