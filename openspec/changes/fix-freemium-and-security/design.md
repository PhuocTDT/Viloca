## Context

Viloca dùng Supabase (Postgres + RLS + Edge Functions) và AWS Bedrock cho AI trip planning. Có 3 lỗ hổng độc lập cần fix theo thứ tự ưu tiên:

1. **plan-trip** chỉ check `Authorization` header tồn tại, không gọi `getUser()` → JWT expired hoặc giả vẫn pass
2. **locations RLS** `authenticated_read_locations` → `FOR SELECT TO authenticated USING (is_active = true)` cấp quyền đọc toàn bộ row kể cả `name`, `address`, `coordinates` cho mọi free user
3. **TypeScript Location interface** có `city`, `district`, `google_maps_url`, `price_level` nhưng DB thực tế không có — đã bị drift từ lần refactor schema

## Goals / Non-Goals

**Goals:**
- Verify JWT thật sự trong plan-trip trước khi gọi Bedrock
- Enforce freemium tại DB layer (RLS + column) thay vì chỉ app layer
- Sync TypeScript type với DB schema thực
- Fix import path stale trong location/[id].tsx

**Non-Goals:**
- Không build paywall UI/upgrade flow trong change này
- Không thay đổi logic AI planning
- Không thêm Stripe/payment integration
- Không migrate existing free users lên pro

## Decisions

### D1: JWT Verification — dùng `getUser()` thay vì parse header thủ công

`supabase.auth.getUser(jwt)` verify signature + expiry qua Supabase Auth API. Alternative là decode JWT thủ công với `jose` library — bỏ vì cần manage JWKS rotation, thêm dependency.

### D2: Credits tracking — column trên `profiles` thay vì separate table

`profiles.ai_credits_remaining INTEGER DEFAULT 3` đủ đơn giản. Alternative là bảng `ai_usage` riêng để track lịch sử — bỏ vì over-engineering cho MVP, dễ thêm sau.

Decrement dùng Postgres atomic update:
```sql
UPDATE profiles
SET ai_credits_remaining = ai_credits_remaining - 1
WHERE id = $user_id AND ai_credits_remaining > 0
RETURNING ai_credits_remaining
```
Nếu 0 rows affected → credits đã hết, trả về 402.

### D3: Freemium RLS — Column-level Security thay vì split table

Option A: Tách `locations` thành `locations` (premium) và `locations_public` (free) — rejected vì join phức tạp, duplicate data.

Option B (chosen): Giữ một bảng, dùng `locations_preview` view (đã có) + sửa RLS:
- Free users: `SELECT` via `locations_preview` view (chỉ free fields)
- Pro users: `SELECT` trực tiếp từ `locations` (full fields)
- Detect plan từ `profiles.plan` trong RLS policy: `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND plan = 'pro')`

### D4: TypeScript type — sửa interface, không tạo type mới

Sửa `Location` interface trong `src/types/index.ts` để match schema DB thực. Các field cũ (`city`, `district`, `google_maps_url`) đã không còn trong DB sau migration `20260626000000_alter_locations_table.sql` — xóa khỏi type. TypeScript compile errors sau khi sửa sẽ chỉ ra các chỗ code đang dùng sai field.

## Risks / Trade-offs

- **[Risk] Breaking free users** → Sau khi deploy migration, free users không đọc được `name`/`address` nếu app vẫn query trực tiếp `locations` table. Mitigation: app `location/[id].tsx` cần switch sang query `locations_preview` cho free users — sẽ làm trong task riêng, nhưng breaking window ngắn vì chỉ ảnh hưởng nếu RLS được enable trước khi app update.
- **[Risk] TypeScript errors cascade** → Khi sửa `Location` interface, nhiều file có thể break. Mitigation: fix lần lượt từ type outward, TypeScript sẽ chỉ đúng chỗ.
- **[Risk] Credits decrement race condition** → Nếu user gọi plan-trip 2 lần đồng thời. Mitigation: Postgres `UPDATE ... WHERE credits > 0 RETURNING` là atomic, chỉ 1 request thành công.

## Migration Plan

1. Deploy migration (profiles columns + RLS update) — **đây là bước breaking nếu app chưa ready**
2. Deploy plan-trip Edge Function update (JWT + credits check)
3. Deploy app update (type fixes + import path + location query fix)

Rollback: migration có thể `ALTER TABLE profiles DROP COLUMN` nếu cần; RLS policy có thể revert về bản cũ.

## Open Questions

- Free users hiện tại (existing): có cần backfill `ai_credits_remaining = 3` không? → Có, migration cần `DEFAULT 3` để cover existing rows.
- Pro plan: cách upgrade user? → Out of scope cho change này, admin có thể update trực tiếp qua Supabase Studio.
