// Goi AI qua Bedrock, giong plan-trip. Truoc day file nay dung Anthropic SDK truc tiep
// voi ANTHROPIC_API_KEY — nhung secret do chua bao gio duoc set tren project (`supabase
// secrets list` chi co AWS_* va BEDROCK_MODEL_ID), nen function crash ngay khi invoke.
// Project da chuan hoa tren Bedrock; day la mot duong AI thay vi hai.
import { BedrockRuntimeClient, ConverseCommand } from 'npm:@aws-sdk/client-bedrock-runtime';
import { FetchHttpHandler } from 'npm:@smithy/fetch-http-handler';
import { createClient } from 'npm:@supabase/supabase-js';

const bedrock = new BedrockRuntimeClient({
  region: Deno.env.get('AWS_REGION') ?? 'ap-southeast-2',
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!,
  },
  requestHandler: new FetchHttpHandler(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

async function generateHint(loc: {
  id: string;
  short_description: string | null;
  long_description: string | null;
  category: string;
  vibes: string[];
}): Promise<string> {
  // `description` cu la cot nguon nhung no rong 0/70 rows — migration dinh dien no
  // (20260626000000_enrich_locations_fields.sql) chua bao gio duoc ap. Nguon that la
  // short_description (67/70) voi long_description (33/70) lam fallback; 0/70 rows
  // thieu ca hai.
  const sourceText = loc.short_description || loc.long_description || '';
  const vibesStr = (loc.vibes as string[])?.join(', ') || '';

  const prompt = `Bạn là copywriter du lịch sáng tạo. Viết 2-3 câu gợi mở sự tò mò về một địa điểm du lịch văn hóa Việt Nam.

TUYỆT ĐỐI KHÔNG được nhắc đến:
- Tên địa điểm, tên tỉnh/thành phố, tên đường
- Địa chỉ cụ thể, tọa độ, vị trí

CHỈ được gợi lên:
- Cảm xúc, trải nghiệm, bầu không khí
- Điều đặc biệt mà người đến đây sẽ cảm nhận được
- Sự kỳ bí, nét văn hóa độc đáo

Thể loại: ${loc.category}
Vibes: ${vibesStr}
Mô tả nội bộ (KHÔNG tiết lộ chi tiết này): ${sourceText}

ĐỊNH DẠNG BẮT BUỘC:
- Đúng 2-3 câu, tối đa 60 từ. Đây là teaser trên card điện thoại, không phải bài viết.
- Văn xuôi thuần. KHÔNG tiêu đề, KHÔNG markdown, không dấu #, không **in đậm**, không gạch đầu dòng.
- Bắt đầu ngay bằng câu đầu tiên của teaser. Không mở đầu bằng nhãn kiểu "Gợi mở..." hay tên thể loại.
- Viết trọn câu cuối, không bỏ lửng.

Viết bằng tiếng Việt, văn phong thơ mộng và cuốn hút.`;

  // Cung model id va env var nhu plan-trip, de hai function khong lech nhau.
  // maxTokens 500: o 300 phan lon hint bi cat giua cau. Do dai that duoc chan
  // bang prompt (2-3 cau / 60 tu), khong bang maxTokens — cat bang token thi
  // ra cau bo lung, con chan bang prompt thi ra cau tron.
  const response = await bedrock.send(new ConverseCommand({
    modelId: Deno.env.get('BEDROCK_MODEL_ID') ?? 'us.anthropic.claude-haiku-4-5-20251001-v1:0',
    messages: [{ role: 'user', content: [{ text: prompt }] }],
    inferenceConfig: { maxTokens: 500, temperature: 0.8 },
  }));

  const raw = response.output?.message?.content?.[0]?.text?.trim() ?? '';

  // Luoi an toan: prompt da cam markdown, nhung model van co the chen heading.
  // Bo heading dan dau va danh dau in dam con sot lai.
  return raw
    .replace(/^\s*#{1,6}\s+.*(?:\n+|$)/, '')  // bo dong heading dau tien
    .replace(/\*\*/g, '')
    .replace(/\s*\n+\s*/g, ' ')
    .trim();
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (!req.headers.get('Authorization')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Optional { limit } — sinh mot mau nho de nguoi doc truoc khi chay het bang.
  // hint null thi vo hai, hint do thi co hai, nen can cong kiem tay o giua.
  let limit: number | null = null;
  try {
    const body = await req.json();
    if (typeof body?.limit === 'number' && body.limit > 0) limit = body.limit;
  } catch {
    // khong co body — chay toan bo
  }

  // Fetch active locations without a hint yet
  const { data: locs, error: locsErr } = await supabase
    .from('locations')
    .select('id, name, short_description, long_description, category, vibes')
    .eq('is_active', true)
    .is('hint', null);

  if (locsErr) {
    return new Response(JSON.stringify({ error: locsErr.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Only process those with some source text
  const withSource = (locs ?? []).filter((l) => l.short_description || l.long_description);
  const eligible = limit ? withSource.slice(0, limit) : withSource;

  if (!eligible.length) {
    return new Response(
      JSON.stringify({ message: 'No locations need hints', count: 0 }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
    // Tra ve hint vua sinh kem ten dia diem, de doc duoc mau ngay trong response
    // thay vi phai query lai. Can ten de biet hint thuoc dia diem nao, va de
    // phat hien hint lam lo ten.
    hints: [] as { name: string; hint: string; leaks_name: boolean }[],
  };
  const BATCH_SIZE = 5;

  for (let i = 0; i < eligible.length; i += BATCH_SIZE) {
    const batch = eligible.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (loc) => {
        try {
          const hint = await generateHint(loc as any);
          const { error: updateErr } = await supabase
            .from('locations')
            .update({ hint, hint_generated_at: new Date().toISOString() })
            .eq('id', loc.id);
          if (updateErr) throw new Error(updateErr.message);
          results.success++;
          results.hints.push({
            name: (loc as { name: string }).name,
            hint,
            leaks_name: hint.toLowerCase().includes(
              (loc as { name: string }).name.toLowerCase(),
            ),
          });
        } catch (e) {
          results.failed++;
          results.errors.push(`${loc.id}: ${String(e)}`);
        }
      }),
    );

    if (i + BATCH_SIZE < eligible.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return new Response(
    JSON.stringify({ message: `Processed ${eligible.length} locations`, ...results }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
});
