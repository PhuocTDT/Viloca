/**
 * Enrich HCMC (SG) location data from OpenStreetMap + Wikimedia Commons + Claude API
 *
 * Usage:
 *   npx ts-node scripts/enrich-locations-hcmc.ts [options]
 *
 * Options:
 *   --dry-run        Print SQL only — skips Claude API and S3 uploads
 *   --limit=N        Process only N locations
 *   --skip-photos    Skip Wikimedia Commons lookup + S3 upload
 *   --skip-claude    Skip Claude API enrichment (uses category defaults)
 *
 * Env required (add to .env.local):
 *   ANTHROPIC_API_KEY           — for Claude enrichment
 *   AWS_ACCESS_KEY_ID           — for S3 upload
 *   AWS_SECRET_ACCESS_KEY       — for S3 upload
 *   AWS_REGION                  — e.g. ap-southeast-1
 */

import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Load .env.local (Expo convention)
config({ path: path.resolve(process.cwd(), '.env.local') });

// ── Config ────────────────────────────────────────────────────────────────────

const S3_BUCKET = 'viloca-media';
const S3_BASE   = `https://${S3_BUCKET}.s3.ap-southeast-1.amazonaws.com`;
const CITY      = 'SG';

// HCMC bounding box: south,west,north,east
const BBOX = '10.40,106.50,11.05,107.05';

// ── CLI flags ─────────────────────────────────────────────────────────────────

const DRY_RUN     = process.argv.includes('--dry-run');
const SKIP_PHOTOS = process.argv.includes('--skip-photos') || DRY_RUN;
const SKIP_CLAUDE = process.argv.includes('--skip-claude') || DRY_RUN;
const limitArg    = process.argv.find(a => a.startsWith('--limit='));
const LIMIT       = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;

// ── Clients ───────────────────────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const s3 = new S3Client({ region: process.env.AWS_REGION ?? 'ap-southeast-1' });

// ── Types ─────────────────────────────────────────────────────────────────────

interface OsmNode {
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
}

interface Location {
  name: string;
  slug: string;
  lat: number;
  lng: number;
  district: string | null;
  address: string | null;
  category: string;
  price_level: number;
  opening_hours: string | null;
  closing_hours: string | null;
  off_days: string | null;
  phone: string | null;
  short_description: string | null;
  style_tag: string | null;
  photos: string | null;
}

// ── OSM → Schema mapping ──────────────────────────────────────────────────────

const CHAIN_BLOCKLIST = [
  'mcdonald', 'kfc', 'burger king', 'starbucks', 'pizza hut', 'jollibee',
  'popeyes', 'subway', 'lotteria', 'highland', 'the coffee house',
  'circle k', 'gs25', 'ministop', 'family mart', 'co.op', 'winmart',
];

// Amenity tags that are always tourist-relevant regardless of other data
const ALWAYS_TOURIST_AMENITY = new Set([
  'place_of_worship', 'theatre', 'arts_centre', 'nightclub',
]);

// Amenity tags that are tourist-relevant only if they have a website (= notable enough)
const NOTABLE_ONLY_AMENITY = new Set([
  'cafe', 'restaurant', 'bar', 'pub',
]);

function shouldInclude(tags: Record<string, string>): boolean {
  const name = tags['name:vi'] ?? tags.name;
  if (!name?.trim()) return false;

  const lower = name.toLowerCase();
  if (CHAIN_BLOCKLIST.some(c => lower.includes(c))) return false;

  const { amenity, tourism, historic, leisure } = tags;
  const hasWebsite = !!(tags.website || tags['contact:website'] || tags['contact:facebook']);

  // tourism=* → always include (OSM explicitly marks these as tourist destinations)
  if (tourism) {
    // Hotels/guesthouses: require stars or website to filter out low-end places
    if (['hotel', 'motel', 'hostel', 'guest_house', 'apartment'].includes(tourism)) {
      return hasWebsite || !!(tags.stars);
    }
    return true;
  }

  // historic=* → always include (monuments, ruins, buildings)
  if (historic) return true;

  // Parks and nature
  if (leisure && ['park', 'nature_reserve', 'garden', 'theme_park'].includes(leisure)) return true;

  // Workshop / studio / craft
  if (tags.craft) return hasWebsite || !!(tags['addr:street'] || tags['addr:full']);

  // Always-tourist amenities (temples, theatres)
  if (amenity && ALWAYS_TOURIST_AMENITY.has(amenity)) return true;

  // Cafes/restaurants/bars: only if notable (has website or social media)
  if (amenity && NOTABLE_ONLY_AMENITY.has(amenity)) {
    return hasWebsite;
  }

  return false;
}

function mapCategory(tags: Record<string, string>): string {
  const { amenity, tourism, historic, leisure, shop } = tags;
  if (amenity === 'cafe')                                                     return 'Café';
  if (amenity === 'restaurant' || amenity === 'food_court')                   return 'Ẩm thực';
  if (amenity === 'bar' || amenity === 'pub' || amenity === 'nightclub')      return 'Ẩm thực';
  if (amenity === 'fast_food')                                                return 'Ẩm thực';
  if (amenity === 'place_of_worship')                                         return 'Di tích tín ngưỡng';
  if (amenity === 'theatre' || amenity === 'arts_centre')                     return 'Trải nghiệm';
  if (tags.craft)                                                              return 'Workshop';
  if (tourism === 'museum')                                                   return 'Bảo tàng';
  if (tourism === 'hotel' || tourism === 'motel')                             return 'Lưu trú';
  if (tourism === 'hostel' || tourism === 'guest_house' || tourism === 'apartment') return 'Lưu trú';
  if (tourism === 'attraction')                                               return 'Trải nghiệm';
  if (historic)                                                               return 'Di tích lịch sử';
  if (leisure === 'park' || leisure === 'nature_reserve' || leisure === 'garden') return 'Thiên nhiên';
  if (shop === 'mall' || amenity === 'marketplace')                           return 'Mua sắm';
  return 'Trải nghiệm';
}

function defaultPriceLevel(tags: Record<string, string>): number {
  if (tags.stars) {
    const s = parseInt(tags.stars, 10);
    if (s >= 5) return 4;
    if (s >= 4) return 3;
    if (s >= 3) return 2;
    return 1;
  }
  const { amenity, tourism } = tags;
  if (amenity === 'fast_food')                           return 1;
  if (tourism === 'hostel' || tourism === 'guest_house') return 1;
  if (tourism === 'hotel')                               return 3;
  return 2;
}

function buildAddress(tags: Record<string, string>): string | null {
  const parts: string[] = [];
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  if (tags['addr:street'])      parts.push(tags['addr:street']);
  if (tags['addr:district'])    parts.push(tags['addr:district']);
  if (tags['addr:city'])        parts.push(tags['addr:city']);
  else if (parts.length)        parts.push('TP. Hồ Chí Minh');
  return parts.length ? parts.join(', ') : (tags['addr:full'] ?? null);
}

function extractDistrict(tags: Record<string, string>): string | null {
  return tags['addr:district'] ?? tags['addr:suburb'] ?? null;
}

// Simple OSM opening_hours parser — extracts first open/close time
function parseHours(oh: string | undefined): {
  opening: string | null;
  closing: string | null;
  off_days: string | null;
} {
  if (!oh) return { opening: null, closing: null, off_days: null };

  const timeMatch = oh.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
  if (!timeMatch) return { opening: null, closing: null, off_days: null };

  let off_days: string | null = null;
  if (/Mo off|^Tu/.test(oh))  off_days = 'Thứ 2';
  if (/Tu off|^We/.test(oh))  off_days = 'Thứ 3';
  if (/PH off/.test(oh))      off_days = 'Dịp lễ';

  return { opening: timeMatch[1], closing: timeMatch[2], off_days };
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function normalizeNode(node: OsmNode): Location & { raw_tags: Record<string, string> } {
  const tags   = node.tags;
  const name   = tags['name:vi'] ?? tags.name ?? '';
  const hours  = parseHours(tags.opening_hours);

  return {
    name,
    slug:             toSlug(name),
    lat:              node.lat,
    lng:              node.lon,
    district:         extractDistrict(tags),
    address:          buildAddress(tags),
    category:         mapCategory(tags),
    price_level:      defaultPriceLevel(tags),
    opening_hours:    hours.opening,
    closing_hours:    hours.closing,
    off_days:         hours.off_days,
    phone:            tags.phone ?? tags['contact:phone'] ?? null,
    short_description: null,
    style_tag:        null,
    photos:           null,
    raw_tags:         tags,
  };
}

// ── Overpass API ──────────────────────────────────────────────────────────────

async function queryOverpass(): Promise<OsmNode[]> {
  const query = `
[out:json][timeout:120];
(
  node["amenity"~"restaurant|cafe|bar|pub|place_of_worship|nightclub|theatre|arts_centre"](${BBOX});
  node["tourism"~"museum|hotel|hostel|guest_house|motel|attraction|viewpoint|artwork|gallery"](${BBOX});
  node["historic"](${BBOX});
  node["leisure"~"park|nature_reserve|garden|theme_park"](${BBOX});
  node["craft"](${BBOX});
);
out body;
  `.trim();

  const servers = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  ];

  let res: Response | null = null;
  for (const server of servers) {
    try {
      res = await fetch(server, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (res.ok) break;
      console.warn(`  ${server} → ${res.status}, trying next...`);
    } catch (err) {
      console.warn(`  ${server} → ${(err as Error).message}, trying next...`);
    }
  }

  if (!res?.ok) throw new Error(`All Overpass servers failed (last status: ${res?.status})`);
  const data = await res.json() as { elements: OsmNode[] };
  return data.elements ?? [];
}

// ── Wikimedia Commons ─────────────────────────────────────────────────────────

async function findWikimediaPhoto(lat: number, lng: number, name: string): Promise<string | null> {
  // Try geosearch first (radius 100m)
  try {
    const geoUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lng}&gsradius=100&gslimit=3&gsnamespace=6&format=json`;
    const geoRes  = await fetch(geoUrl, { headers: { 'User-Agent': 'VilcaApp/1.0' } });
    const geoData = await geoRes.json() as any;
    const hits    = geoData?.query?.geosearch ?? [];

    if (hits.length) {
      const pageId  = hits[0].pageid;
      const url     = await getWikimediaImageUrl(pageId);
      if (url) return url;
    }
  } catch { /* fall through to name search */ }

  // Fall back to name search
  try {
    const q       = encodeURIComponent(`${name} Hồ Chí Minh`);
    const srUrl   = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${q}&srnamespace=6&srlimit=1&format=json`;
    const srRes   = await fetch(srUrl, { headers: { 'User-Agent': 'VilcaApp/1.0' } });
    const srData  = await srRes.json() as any;
    const results = srData?.query?.search ?? [];

    if (results.length) {
      const url = await getWikimediaImageUrl(results[0].pageid);
      if (url) return url;
    }
  } catch { /* no photo found */ }

  return null;
}

async function getWikimediaImageUrl(pageId: number): Promise<string | null> {
  const infoUrl  = `https://commons.wikimedia.org/w/api.php?action=query&pageids=${pageId}&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json`;
  const infoRes  = await fetch(infoUrl, { headers: { 'User-Agent': 'VilcaApp/1.0' } });
  const infoData = await infoRes.json() as any;
  const page     = infoData?.query?.pages?.[pageId];
  const info     = page?.imageinfo?.[0];
  return info?.thumburl ?? info?.url ?? null;
}

// ── S3 Upload ─────────────────────────────────────────────────────────────────

async function uploadToS3(imageUrl: string, s3Key: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return null;

    const buffer      = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') ?? 'image/jpeg';

    await s3.send(new PutObjectCommand({
      Bucket:      S3_BUCKET,
      Key:         s3Key,
      Body:        buffer,
      ContentType: contentType,
    }));

    return `${S3_BASE}/${s3Key}`;
  } catch (err) {
    console.error(`  S3 upload failed for ${s3Key}:`, (err as Error).message);
    return null;
  }
}

// ── Claude API enrichment ─────────────────────────────────────────────────────

async function enrichWithClaude(
  name: string,
  category: string,
  tags: Record<string, string>,
): Promise<{ short_description: string | null; style_tag: string | null; price_level: number }> {
  const tagSummary = Object.entries(tags)
    .filter(([k]) => !k.startsWith('addr:') && k !== 'name' && k !== 'name:vi')
    .map(([k, v]) => `${k}=${v}`)
    .join(', ');

  const prompt = `Bạn là chuyên gia du lịch TP. Hồ Chí Minh. Địa điểm sau:
- Tên: ${name}
- Loại hình: ${category}
- Tags OSM: ${tagSummary || 'không có thêm'}

Hãy trả về JSON với các trường:
1. "short_description": 1-2 câu tiếng Việt, mô tả đặc trưng hấp dẫn, không dùng "địa điểm này"
2. "style_tag": 3-4 tính từ vibe cách nhau dấu phẩy, ví dụ "Cổ kính, Bình yên, Văn hóa, Lịch sử"
3. "price_level": số nguyên 1-4 (1=<50k/người, 2=50-200k, 3=200-500k, 4=>500k)

Chỉ trả về JSON, không giải thích thêm.`;

  try {
    const msg = await anthropic.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages:   [{ role: 'user', content: prompt }],
    });

    const text  = msg.content[0].type === 'text' ? msg.content[0].text : '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON in response');

    const json = JSON.parse(match[0]);
    return {
      short_description: json.short_description ?? null,
      style_tag:         json.style_tag ?? null,
      price_level:       Number(json.price_level) || 2,
    };
  } catch (err) {
    console.error(`  Claude enrichment failed for "${name}":`, (err as Error).message);
    return { short_description: null, style_tag: null, price_level: 2 };
  }
}

// ── SQL generation ────────────────────────────────────────────────────────────

function esc(v: string | null): string {
  if (v === null) return 'NULL';
  return `'${v.replace(/'/g, "''")}'`;
}

function generateInsert(loc: Location & { lat: number; lng: number }): string {
  return `INSERT INTO locations (city, name, district, address, google_maps_url, category, style_tag, price_level, opening_hours, closing_hours, off_days, phone, short_description, long_description, photos, verified, is_active, coordinates) VALUES (
  '${CITY}', ${esc(loc.name)}, ${esc(loc.district)}, ${esc(loc.address)}, NULL,
  ${esc(loc.category)}, ${esc(loc.style_tag)}, ${loc.price_level},
  ${esc(loc.opening_hours)}, ${esc(loc.closing_hours)}, ${esc(loc.off_days)}, ${esc(loc.phone)},
  ${esc(loc.short_description)}, NULL, ${esc(loc.photos)},
  false, true,
  '{"lat": ${loc.lat}, "lng": ${loc.lng}}'::jsonb
);`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'} | Photos: ${SKIP_PHOTOS ? 'skip' : 'on'} | Claude: ${SKIP_CLAUDE ? 'skip' : 'on'}\n`);

  // 1. Query Overpass
  console.log('Querying Overpass API for HCMC...');
  const nodes = await queryOverpass();
  console.log(`  ${nodes.length} raw nodes returned`);

  // 2. Filter + normalize
  const filtered = nodes.filter(n => shouldInclude(n.tags));
  console.log(`  ${filtered.length} after filtering\n`);

  // Deduplicate by slug (keep first occurrence)
  const seenSlugs = new Set<string>();
  const unique = filtered.filter(n => {
    const slug = toSlug(n.tags['name:vi'] ?? n.tags.name ?? '');
    if (seenSlugs.has(slug)) return false;
    seenSlugs.add(slug);
    return true;
  });
  console.log(`  ${unique.length} after deduplication`);

  const toProcess = unique.slice(0, LIMIT);
  console.log(`  Processing ${toProcess.length} locations\n`);

  const sqlRows: string[] = [
    `-- HCMC locations seed — generated ${new Date().toISOString()}`,
    `-- Source: OpenStreetMap Overpass API + Wikimedia Commons`,
    `-- Review before running: all rows start with verified = false`,
    '',
  ];

  let photoFound  = 0;
  let claudeOk    = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const node = toProcess[i];
    const loc  = normalizeNode(node);

    process.stdout.write(`[${i + 1}/${toProcess.length}] ${loc.name}`);

    // Claude enrichment
    if (!SKIP_CLAUDE) {
      const enriched = await enrichWithClaude(loc.name, loc.category, loc.raw_tags);
      loc.short_description = enriched.short_description;
      loc.style_tag         = enriched.style_tag;
      loc.price_level       = enriched.price_level;
      claudeOk++;
      await sleep(400);
    }

    // Wikimedia photo
    if (!SKIP_PHOTOS) {
      const wikimediaUrl = await findWikimediaPhoto(loc.lat, loc.lng, loc.name);
      if (wikimediaUrl) {
        const s3Key = `locations/${CITY}/${loc.slug}/1.jpg`;
        const s3Url = await uploadToS3(wikimediaUrl, s3Key);
        if (s3Url) {
          loc.photos = s3Url;
          photoFound++;
          process.stdout.write(' 📷');
        }
      }
      await sleep(300);
    }

    console.log();
    sqlRows.push(generateInsert(loc));
  }

  // 3. Write output
  const timestamp  = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outputPath = path.join('supabase', `seed_hcmc_${timestamp}.sql`);
  await fs.writeFile(outputPath, sqlRows.join('\n'), 'utf-8');

  console.log(`\n── Summary ──────────────────────────────`);
  console.log(`Rows generated : ${toProcess.length}`);
  console.log(`Photos found   : ${photoFound}`);
  console.log(`Claude enriched: ${claudeOk}`);
  console.log(`Output         : ${outputPath}`);
  if (DRY_RUN) console.log('\n(dry-run: no API calls were made for Claude/S3)');
}

main().catch(err => { console.error(err); process.exit(1); });
