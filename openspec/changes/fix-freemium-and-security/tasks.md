## 1. Database Migration

- [x] 1.1 Tạo migration mới: thêm `plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro'))` và `ai_credits_remaining INTEGER NOT NULL DEFAULT 3` vào bảng `profiles`
- [x] 1.2 Cập nhật RLS policy trên `locations`: xóa policy `authenticated_read_locations` hiện tại, thay bằng policy chỉ cho phép pro users (`profiles.plan = 'pro'`) đọc trực tiếp từ `locations`
- [x] 1.3 Thêm RLS policy cho `locations_preview` view: cho phép mọi authenticated user đọc view này

## 2. plan-trip Edge Function

- [x] 2.1 Thêm JWT verification: extract JWT từ Authorization header, gọi `supabase.auth.getUser(jwt)`, return 401 nếu error hoặc user null
- [x] 2.2 Sau khi verify user, query `profiles` lấy `plan` và `ai_credits_remaining` của user đó
- [x] 2.3 Nếu `plan = 'free'` và `ai_credits_remaining <= 0`, return HTTP 402 với `{ error: "No AI credits remaining", credits_remaining: 0 }`
- [x] 2.4 Wrap phần gọi Bedrock trong try/finally: decrement credits chỉ khi generation thành công (dùng atomic UPDATE WHERE credits > 0)
- [x] 2.5 Trả về `credits_remaining` trong response body khi thành công (free users biết còn bao nhiêu)

## 3. TypeScript Type Fix

- [x] 3.1 Đọc schema thực của `locations` table từ migration files để liệt kê đủ columns hiện tại
- [x] 3.2 Sửa `Location` interface trong `src/types/index.ts`: xóa các field không còn tồn tại (`city`, `district`, `google_maps_url`, `price_level`, `opening_hours`, `closing_hours`, `off_days`, `phone`, `short_description`, `long_description`, `photos`, `verified`); thêm các field đang thiếu (`hint`, `vibes`, `cover_image`, `images`, `price_per_person`, `duration_minutes`, `rating`, `coordinates`, `is_active`, `hint_generated_at`)
- [x] 3.3 Fix cascade TypeScript errors trong `app/location/[id].tsx` và các file khác dùng `Location` type

## 4. Import Path Fix

- [x] 4.1 Sửa import trong `app/location/[id].tsx`: `@/lib/supabase` → `@/src/lib/supabase`

## 5. Verification

- [x] 5.1 Chạy `npx tsc --noEmit` xác nhận không còn type errors liên quan đến Location
- [x] 5.2 Test thủ công plan-trip với expired/invalid JWT xác nhận 401 được trả về
- [x] 5.3 Xác nhận migration file hợp lệ (cú pháp SQL đúng, không conflict với migrations trước)
