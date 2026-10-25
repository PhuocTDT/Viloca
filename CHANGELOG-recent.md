# Tổng hợp thay đổi gần đây của Viloca

Dự án có 112 commit. Các thay đổi gần đây nhất là từ 24/09 đến 16/10/2026, toàn bộ do ThuanPne thực hiện. Nhánh `main` và nhánh làm việc `claude/lucid-maxwell-vdqe4q` đang trỏ cùng một chỗ, và chưa có thay đổi nào chưa commit.

## 12–16/10 — Dữ liệu, bảo mật, build (PR #14 `feat/foster-tripUI` đã merge vào main)

PR này gộp 126 file, khoảng +19.9k/−4.5k dòng.

- **Làm lại dữ liệu địa điểm (free tier)** (`03058c7`):
  - Thêm 4 migration: tự suy ra các trường free-tier, suy ra ảnh bìa (cover image), chuẩn hoá và seed lại bảng vibes, bỏ cột rating khỏi `locations_preview`.
  - Có spec OpenSpec `revive-location-data`.
- **Phân quyền theo gói** (`39c8609`):
  - Thêm `plan` và `ai_credits` vào bảng `profiles`.
  - RLS của bảng `locations` giờ phân tầng theo gói.
  - Có spec OpenSpec `fix-freemium-and-security`.
- **Pipeline dữ liệu địa điểm HCMC** (`8b7669d`):
  - Thêm script `enrich-locations-hcmc.ts` và `fetch-location-photos.ts`, mở rộng `upload-photos-s3.sh`.
  - Thêm các file seed SQL cho HCMC và các file cập nhật ảnh.
- **Lọc trip theo mã thành phố, thêm category chip cho search** (`b87d66a`):
  - Sửa `explore`, `index`, `create-trip`, `search`.
  - Viết lại `CategoryChips`.
  - Sửa edge function `plan-trip`.
- **Sửa `batch-generate-hints`** (`e4c49bd`): chuyển sang Bedrock và sửa lại cột nguồn dữ liệu.
- **Build APK** (`4ff8a5b`): thêm cấu hình EAS (`eas.json`), `.npmrc`, `metro.config.js` để bundle Metro chạy được.
- **Jest** (`7204a18`):
  - Thêm hạ tầng test (`jest.config.js`, `__tests__/trip-utils.test.ts`).
  - Khôi phục module `src/lib/trip-utils.ts` bị thiếu.

## 24/09 — Redesign Home và đa ngôn ngữ

- **Home page mới**:
  - Header/card mới với bong bóng thoại của Sen (mascot) xoay vòng thông điệp.
  - Thêm các component `FeaturedPlaceCard`, `PlaceGridCard`, `HomeSectionHeader`, `CategoryChips`, `VibeChips`.
  - Dữ liệu lấy từ DB qua các hook `useCategories`, `useFeaturedLocation`, `useVibes`, `useUserLocation`, `usePlaceDistances`.
  - Thêm edge function `get-distances`.
  - Thêm các bảng `categories` và `vibes`, và cột `is_featured` cho `locations`.
- **Chuyển đổi VI/EN**:
  - Thêm `src/lib/i18n.ts`, `langStore` và component `LangToggle`.
  - Dịch sang tiếng Anh các màn: auth, home, trip detail, create-trip, location, explore, profile, search, post, age-select, verify-email, add-location, experience.
- **Khác**: thêm bucket `avatars`, bảng `post_saves`, và tài liệu thiết kế và kế hoạch cho phần home (`docs/.../2026-09-24-home-below-search-*`).

## Các PR/merge trước đó

- #7 function_overview
- #8 plan_trip_by_AI
- #10 social-posts
- Merge `feat/Home_page`
- Merge `feat/user_info`
- Merge "maps location to app"

## Lưu ý

- `CLAUDE.md` đang lỗi thời so với code:
  - Ghi "No lint or test scripts" nhưng giờ đã có Jest.
  - Mô tả cấu trúc `app/`, `lib/`, `store/` ở gốc, trong khi code mới nằm ở `src/`.
  - Chưa nhắc tới i18n, edge functions, hay OpenSpec.
- Repo có nhiều file seed/update SQL kèm timestamp trong `supabase/`, trong đó có 3 file seed HCMC gần như trùng kích thước (404 dòng mỗi file).
