# Viloca

Ứng dụng du lịch Việt Nam: khám phá địa điểm và văn hóa địa phương, lên lịch trình (tự sắp xếp hoặc nhờ AI), ghi nhật ký chuyến đi và chia sẻ cùng cộng đồng.

**Công nghệ:** Expo SDK 56, React Native 0.85, TypeScript (strict), expo-router (định tuyến theo file), Supabase (Auth, Postgres, Edge Functions), Zustand, AWS Bedrock (AI lên lịch). Giao diện chủ yếu viết bằng `StyleSheet`; NativeWind có cấu hình nhưng gần như không được dùng.

## Chạy ở máy

Yêu cầu: Node 22 (CI dùng bản này), npm, Expo Go hoặc trình giả lập Android/iOS.

```bash
npm install
cp .env.example .env.local      # rồi điền giá trị thật
npm start                       # hoặc: npm run android / npm run ios
```

`.env.local` cần hai biến (xem `.env.example`):

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Chỉ đặt giá trị công khai (anon key) vào biến `EXPO_PUBLIC_*`: chúng được đóng gói vào app. Không đưa service role key hay khóa AWS vào các biến này.

> **Web:** `app.json` hiện chỉ khai báo `ios` và `android`, nên `npm run web` sẽ báo lỗi. Muốn chạy web cần thêm `"web"` vào `platforms`, cài `react-dom`, và xử lý các lỗi tương thích (NativeWind `darkMode`, bản đồ chỉ có bản native).

## Kiểm thử và kiểm tra kiểu

```bash
npm test               # Jest (ts-jest, môi trường node): hiện chỉ có test cho src/lib/trip-utils
npx tsc --noEmit       # typecheck; còn 1 lỗi đã biết ở app/_layout.tsx (props của <StatusBar>)
```

CI (`.github/workflows/ci.yml`) chạy `npm ci`, `npm test` (bắt buộc pass) và `tsc --noEmit` (chưa chặn merge cho đến khi lỗi nêu trên được sửa).

## Cấu trúc

```
app/                 Màn hình (expo-router)
  (auth)/            Đăng nhập, đăng ký, xác thực email, chọn độ tuổi, splash
  (app)/             Tab chính: Home (index), Khám phá (explore), workspace, profile/
  trip/, location/, post/, experience/, create-trip.tsx, search.tsx
src/
  components/        home/ (thẻ, chip, bộ lọc), ui/ (Button, Avatar, ScreenWrapper...)
  hooks/             Truy vấn Supabase (useLocations, useUpcomingTrip, ...)
  lib/               supabase.ts, i18n.ts (vi/en), trip-utils.ts (có test)
  store/, theme/, types/
lib/, store/, hooks/, components/, types/   Phần cũ ở gốc (Mascot Sen, authStore, useGoogleAuth)
supabase/
  migrations/        Schema và RLS (xem lưu ý bên dưới)
  functions/         plan-trip, get-distances, generate-location-hint, batch-generate-hints
openspec/            Các change đã/đang làm (proposal, design, tasks)
docs/                Tài liệu sản phẩm và kỹ thuật
```

Lưu ý: dự án đang có **hai client Supabase** (`lib/supabase.ts` ở gốc và `src/lib/supabase.ts`); phần lớn code dùng bản trong `src/`.

## Backend (Supabase)

- Cách triển khai và cấu hình: `docs/deploy-supabase.md` (danh sách "13 migrations" trong file đó đã cũ, hiện có 50 file).
- Một số file migration **trùng timestamp** nên thứ tự chạy phụ thuộc tên file; kiểm tra kỹ trước khi dùng `supabase db push` lên môi trường thật.
- Edge Functions đọc các biến môi trường: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `BEDROCK_MODEL_ID`, `GOOGLE_ROUTES_API_KEY`, `ANTHROPIC_API_KEY` (đặt trong Supabase, không đặt trong `.env.local` của app).

## Tài liệu

- `docs/ROADMAP.md`, `docs/Viloca_Phase1_Plan.md`: roadmap cũ (đang mâu thuẫn nhau, chờ gộp).
- `docs/SPEC_MVP.md`, `docs/ARCHITECTURE.md`: mô tả cấu trúc cũ, chưa cập nhật.
