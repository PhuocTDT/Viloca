import type { TripItem } from '../types';

export interface OfflineMapStop {
  order: number;
  name: string;
  address: string;
  time: string;
  note: string;
  lat: number | null;
  lng: number | null;
}

export interface OfflineMapSnapshot {
  version: 1;
  tripId: string;
  day: number;
  signature: string;
  savedAt: string;
  title: string;
  stops: OfflineMapStop[];
  image: string;
}

export function offlineMapStops(items: TripItem[]): OfflineMapStop[] {
  return [...items].sort((a, b) => a.sort_order - b.sort_order).map((item, index) => {
    const loc = item.locations;
    const coord = loc?.coordinates;
    const valid = coord && Number.isFinite(coord.lat) && Number.isFinite(coord.lng)
      && Math.abs(coord.lat) <= 85 && Math.abs(coord.lng) <= 180;
    return {
      order: index + 1,
      name: loc?.name ?? item.experience_title ?? '—',
      address: loc?.address ?? loc?.district ?? item.experience_location ?? '',
      time: item.visit_time ?? '',
      note: item.note ?? '',
      lat: valid ? coord.lat : null,
      lng: valid ? coord.lng : null,
    };
  });
}

// Include the stop legend, not just coordinates: edits must never silently show an old route.
export function offlineMapSignature(stops: OfflineMapStop[]): string {
  return JSON.stringify(stops);
}

export function escapeMapHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

export function validMapImage(image: unknown): image is string {
  return typeof image === 'string' && image.length < 16_000_000
    && /^data:image\/png;base64,iVBORw0KGgo[A-Za-z0-9+/=]+$/.test(image);
}

/** Fully self-contained image viewer. No CDN, tiles, fonts or GPS are needed. */
export function offlineMapHtml(snapshot: OfflineMapSnapshot): string {
  if (!validMapImage(snapshot.image)) throw new Error('Invalid map image');
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=5"/>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'"/>
<style>*{box-sizing:border-box}body{margin:0;background:#eef2f5;font:14px sans-serif}#viewport{overflow:auto;height:100vh;width:100vw;display:block}img{display:block;object-fit:contain;margin:auto}nav{position:fixed;right:12px;top:12px;display:flex;gap:6px}button{font-size:20px;min-width:44px;height:44px;background:white;border:1px solid #bbb;border-radius:8px}</style></head>
<body><div id="viewport"><img id="map" alt="${escapeMapHtml(snapshot.title)}" src="${snapshot.image}"/></div>
<nav><button aria-label="Zoom out" onclick="resize(-.5)">−</button><button aria-label="Fit map" onclick="resize(0)">↔</button><button aria-label="Zoom in" onclick="resize(.5)">+</button></nav>
<script>var scale=1;var img=document.getElementById('map');function resize(delta){scale=delta===0?1:Math.max(1,Math.min(5,scale+delta));var fit=Math.min(innerWidth/img.naturalWidth,innerHeight/img.naturalHeight);img.style.width=(img.naturalWidth*fit*scale)+'px';img.style.height=(img.naturalHeight*fit*scale)+'px'}img.onload=function(){resize(0)};window.onresize=function(){resize(0)};</script></body></html>`;
}

