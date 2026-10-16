/**
 * Fetch photos từ Wikimedia Commons cho các locations chưa có ảnh
 * Upload lên S3 và update Supabase
 *
 * Usage:
 *   npx ts-node scripts/fetch-location-photos.ts [--city=SG] [--limit=N] [--dry-run]
 */

import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

config({ path: path.resolve(process.cwd(), '.env.local') });

const S3_BUCKET = 'viloca-media';
const S3_BASE   = `https://${S3_BUCKET}.s3.ap-southeast-1.amazonaws.com`;

const DRY_RUN  = process.argv.includes('--dry-run');
const cityArg  = process.argv.find(a => a.startsWith('--city='));
const CITY     = cityArg ? cityArg.split('=')[1] : 'SG';
const limitArg = process.argv.find(a => a.startsWith('--limit='));
const LIMIT    = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
);

const SQL_OUT = path.resolve(process.cwd(), `supabase/update_photos_${CITY}_${Date.now()}.sql`);

const s3 = new S3Client({ region: process.env.AWS_REGION ?? 'ap-southeast-1' });

// English name hints for famous Vietnamese landmarks (for Wikipedia search)
const EN_NAME_MAP: Record<string, string> = {
  'Thảo Cầm Viên Sài Gòn':                    'Saigon Zoo and Botanical Gardens',
  'Địa Đạo Củ Chi':                            'Cu Chi tunnels',
  'Chùa Ngọc Hoàng (Phước Hải Tự)':           'Jade Emperor Pagoda Ho Chi Minh City',
  'Phố Đi Bộ Nguyễn Huệ':                     'Nguyen Hue pedestrian street Ho Chi Minh City',
  'Chùa Vĩnh Nghiêm':                          'Vinh Nghiem Pagoda Ho Chi Minh City',
  'Bến Bạch Đằng':                             'Bach Dang riverside Ho Chi Minh City',
  "L'Usine Café & Restaurant":                 'L Usine Le Loi Ho Chi Minh City',
  'Cộng Cà Phê Nguyễn Huệ':                   'Cong Caphe Vietnam coffee shop',
  'Đường Sách Nguyễn Văn Bình':               'Nguyen Van Binh Book Street Ho Chi Minh City',
  'The Workshop Coffee':                        'The Workshop Coffee Ho Chi Minh City cafe',
  'The Café Apartment (42 Nguyễn Huệ)':        'The Cafe Apartment Nguyen Hue building Ho Chi Minh',
  'Cà Phê Tư Ký':                              'Tu Ky coffee Cholon Ho Chi Minh City',
  'Cà Phê Vợt Chín Giao':                      'vot coffee traditional Ho Chi Minh Saigon',
  'Ơi Cafe':                                   'Oi Cafe rooftop Ho Chi Minh City',
  'Xưởng Gốm Workshop Sài Gòn':               'pottery workshop Saigon Ho Chi Minh City',
  'Wonderlust Art Space':                       'art gallery Ho Chi Minh City District 1',
};

// Direct Wikimedia Commons URLs for known locations (bypasses search API)
const DIRECT_URL_MAP: Record<string, string> = {
  'Phố Đi Bộ Nguyễn Huệ':                     'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Nguyen_Hue_Walking_Street_at_night_%281%29.jpg/1280px-Nguyen_Hue_Walking_Street_at_night_%281%29.jpg',
  'Chùa Vĩnh Nghiêm':                          'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vinh_Nghiem_Pagoda.jpg/1280px-Vinh_Nghiem_Pagoda.jpg',
  'Bến Bạch Đằng':                             'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/HCMC_Bach_Dang_Wharf.jpg/1280px-HCMC_Bach_Dang_Wharf.jpg',
  'Nhà Thờ Tân Định (Nhà Thờ Màu Hồng)':      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Tan_Dinh_Church_2019.jpg/1280px-Tan_Dinh_Church_2019.jpg',
  'Đường Sách Nguyễn Văn Bình':               'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Nguyen_Van_Binh_Book_Street_-_Ho_Chi_Minh_City.jpg/1280px-Nguyen_Van_Binh_Book_Street_-_Ho_Chi_Minh_City.jpg',
  'Cộng Cà Phê Nguyễn Huệ':                   'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Cong_Caphe%2C_Ho_Chi_Minh_City.jpg/1280px-Cong_Caphe%2C_Ho_Chi_Minh_City.jpg',
};

// ── Wikimedia Commons ─────────────────────────────────────────────────────────

async function getWikimediaImageUrl(pageId: number): Promise<string | null> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&pageids=${pageId}&prop=imageinfo&iiprop=url&iiurlwidth=1200&format=json`;
  const res  = await fetch(url, { headers: { 'User-Agent': 'VilocaApp/1.0' } });
  const data = await res.json() as any;
  const page = data?.query?.pages?.[pageId];
  const info = page?.imageinfo?.[0];
  return info?.thumburl ?? info?.url ?? null;
}

// ── Wikipedia (article thumbnail) ─────────────────────────────────────────────

async function findWikipediaPhoto(searchQuery: string): Promise<string | null> {
  try {
    // Search for the article
    const q       = encodeURIComponent(searchQuery);
    const srUrl   = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${q}&srlimit=3&format=json`;
    const srRes   = await fetch(srUrl, { headers: { 'User-Agent': 'VilocaApp/1.0' } });
    const srData  = await srRes.json() as any;
    const results = srData?.query?.search ?? [];
    if (!results.length) return null;

    const title   = results[0].title;
    const imgUrl  = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=1200`;
    const imgRes  = await fetch(imgUrl, { headers: { 'User-Agent': 'VilocaApp/1.0' } });
    const imgData = await imgRes.json() as any;
    const pages   = imgData?.query?.pages ?? {};
    const page    = Object.values(pages)[0] as any;
    return page?.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

async function findPhoto(name: string, lat: number | null, lng: number | null): Promise<string | null> {
  // 0. Direct URL map (highest priority)
  if (DIRECT_URL_MAP[name]) return DIRECT_URL_MAP[name];

  // 1. Geosearch by coordinates (radius 150m)
  if (lat && lng) {
    try {
      const url  = `https://commons.wikimedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lng}&gsradius=150&gslimit=5&gsnamespace=6&format=json`;
      const res  = await fetch(url, { headers: { 'User-Agent': 'VilocaApp/1.0' } });
      const data = await res.json() as any;
      const hits = data?.query?.geosearch ?? [];
      for (const hit of hits) {
        const imgUrl = await getWikimediaImageUrl(hit.pageid);
        if (imgUrl) return imgUrl;
      }
    } catch { /* fall through */ }
  }

  // 2. Wikimedia Commons name search
  const queries = [name, `${name} Ho Chi Minh`, `${name} Saigon`];
  for (const q of queries) {
    try {
      const encoded = encodeURIComponent(q);
      const url  = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&srnamespace=6&srlimit=3&format=json`;
      const res  = await fetch(url, { headers: { 'User-Agent': 'VilocaApp/1.0' } });
      const data = await res.json() as any;
      const hits = data?.query?.search ?? [];
      for (const hit of hits) {
        const imgUrl = await getWikimediaImageUrl(hit.pageid);
        if (imgUrl) return imgUrl;
      }
    } catch { /* try next */ }
  }

  // 3. Wikipedia article thumbnail (English name map or fallback)
  const enName = EN_NAME_MAP[name] ?? `${name} Vietnam`;
  const wpUrl  = await findWikipediaPhoto(enName);
  if (wpUrl) return wpUrl;

  return null;
}

// ── S3 Upload ─────────────────────────────────────────────────────────────────

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

async function uploadToS3(imageUrl: string, slug: string): Promise<string | null> {
  const s3Key = `locations/${CITY}/${slug}/1.jpg`;
  try {
    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'VilocaApp/1.0 (https://viloca.app)',
        'Accept': 'image/*,*/*',
      },
      redirect: 'follow',
    });
    if (!res.ok) {
      console.error(`  Download failed: HTTP ${res.status} for ${imageUrl.slice(0, 80)}`);
      return null;
    }

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
    console.error(`  S3 upload failed:`, (err as Error).message);
    return null;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'} | City: ${CITY}\n`);

  // Fetch locations without photos
  const { data: locations, error } = await supabase
    .from('locations')
    .select('id, name, coordinates, photos')
    .eq('city', CITY)
    .is('photos', null)
    .limit(LIMIT === Infinity ? 1000 : LIMIT);

  if (error) { console.error('Supabase error:', error.message); process.exit(1); }
  if (!locations?.length) { console.log('Không có location nào thiếu ảnh.'); return; }

  console.log(`Tìm ảnh cho ${locations.length} locations...\n`);

  let found = 0, notFound = 0;
  const sqlLines: string[] = ['-- Auto-generated photo updates', `-- City: ${CITY} — ${new Date().toISOString()}`, ''];

  for (let i = 0; i < locations.length; i++) {
    const loc  = locations[i];
    const lat  = (loc.coordinates as any)?.lat ?? null;
    const lng  = (loc.coordinates as any)?.lng ?? null;
    const slug = toSlug(loc.name);

    process.stdout.write(`[${i + 1}/${locations.length}] ${loc.name} `);

    const sourceUrl = await findPhoto(loc.name, lat, lng);

    if (!sourceUrl) {
      console.log('✗ không tìm được ảnh');
      notFound++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`✓ (dry-run) ${sourceUrl.slice(0, 80)}...`);
      found++;
      continue;
    }

    const s3Url = await uploadToS3(sourceUrl, slug);
    if (!s3Url) {
      console.log('✗ upload S3 thất bại');
      notFound++;
      continue;
    }

    // Collect SQL instead of updating via anon key
    const escaped = loc.name.replace(/'/g, "''");
    sqlLines.push(`UPDATE locations SET photos = '${s3Url}' WHERE city = '${CITY}' AND name = '${escaped}';`);
    console.log(`✓ ${s3Url}`);
    found++;

    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\n✓ Tìm được: ${found} | ✗ Không có: ${notFound}`);

  if (!DRY_RUN && sqlLines.length > 3) {
    await fs.writeFile(SQL_OUT, sqlLines.join('\n'), 'utf8');
    console.log(`\nSQL saved → ${SQL_OUT}`);
  }
}

main().catch(console.error);
