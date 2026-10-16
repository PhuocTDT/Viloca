## Why

Có 3 lỗ hổng quan trọng đang ảnh hưởng đến bảo mật và tính toàn vẹn của mô hình kinh doanh: (1) Edge Function `plan-trip` không verify JWT thực sự, cho phép spam AI không giới hạn; (2) freemium chỉ tồn tại trên paper — RLS cho phép mọi user đọc `name`, `address`, `coordinates` của locations; (3) TypeScript `Location` type không khớp với DB schema thực, gây ra silent type errors trong production.

## What Changes

- **plan-trip Edge Function**: thêm JWT verification qua `supabase.auth.getUser()`, thêm kiểm tra và decrement `ai_credits_remaining` trước khi gọi Bedrock
- **profiles table**: thêm column `plan TEXT DEFAULT 'free'` và `ai_credits_remaining INTEGER DEFAULT 3`
- **locations RLS**: tách policy thành free vs. pro — free users chỉ đọc được qua `locations_preview` view; pro users đọc full row
- **Location TypeScript type**: sync lại với DB schema thực (thêm `hint`, `vibes`, `coordinates`, `cover_image`; xóa các field không còn tồn tại)
- **import path fix**: `location/[id].tsx` dùng `@/lib/supabase` → `@/src/lib/supabase`

## Capabilities

### New Capabilities

- `ai-credits`: Quản lý quota AI generation per user — free users có 3 credits, pro users unlimited; plan-trip function enforce và decrement
- `freemium-locations`: Phân tầng data location theo plan — free chỉ thấy hint/vibes/cover; pro thấy name/address/coordinates

### Modified Capabilities

- (none — không có spec nào hiện tại cover các capability này)

## Impact

- **supabase/migrations/**: 1 migration mới — thêm `plan` + `ai_credits_remaining` vào `profiles`, cập nhật RLS policy trên `locations`
- **supabase/functions/plan-trip/index.ts**: verify JWT + credits check
- **src/types/index.ts**: sửa `Location` interface
- **app/location/[id].tsx**: fix import path
- **Không breaking**: existing trips và trip_items không bị ảnh hưởng
- **Breaking với free users**: sau khi deploy, free users sẽ không còn đọc được `name`/`address` của locations trực tiếp — cần app layer hiện thị đúng (blurred/locked state)
