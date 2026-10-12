## Context

Viloca là Expo SDK 56 + React Native 0.85 + TypeScript strict. Hiện tại không có test framework nào được cài đặt. Các pure functions quan trọng (`suggestTime`, `tripDayCount`, `buildGoogleMapsUrl`, v.v.) được định nghĩa inline bên trong các screen components lớn, không thể import và test độc lập.

TypeScript đang có 1 deprecation warning: `baseUrl` sẽ bị loại bỏ trong TS 7.0.

## Goals / Non-Goals

**Goals:**
- Cài Jest + ts-jest hoạt động được trong môi trường Windows + TypeScript strict
- Tách pure functions ra `src/lib/trip-utils.ts` để testable
- Viết unit tests bao phủ toàn bộ pure functions với edge cases
- Fix `tsconfig.json` deprecation warning

**Non-Goals:**
- Component tests (React Native component rendering) — quá phức tạp, ROI thấp lúc này
- Hook tests với Supabase mock — để sau phase 2
- E2E tests (Maestro/Detox) — để sau khi có test foundation
- CI pipeline integration — để sau

## Decisions

### 1. Jest + ts-jest, không dùng Vitest

Vitest phù hợp với web (Vite ecosystem). Jest + ts-jest là standard cho React Native / Expo và có `jest-expo` preset sẵn. Dù phase này chỉ test pure functions (không cần RN environment), vẫn dùng Jest để dễ mở rộng sau.

**Alternatives considered:**
- `vitest`: Nhanh hơn nhưng không tích hợp tốt với Expo ecosystem về sau
- `jest-expo` preset ngay từ đầu: Sẽ cần cài nhiều peer deps hơn; để phase 2 khi test hooks/components

### 2. `testEnvironment: "node"` thay vì `jsdom`

Pure functions không cần DOM. Node environment nhanh hơn, ít setup hơn.

### 3. Tách pure functions ra `src/lib/trip-utils.ts`

Hiện tại `suggestTime`, `tripDayCount`, `dayLabel`, `formatDate`, `buildGoogleMapsUrl` được định nghĩa trực tiếp trong `app/trip/[id].tsx` và `stripDiacritics` trong `app/create-trip.tsx`. Để test được cần export chúng.

Giải pháp: tách ra `src/lib/trip-utils.ts`, import lại từ các screen. Behavior không thay đổi.

### 4. Path alias `@/*` trong jest config

`tsconfig.json` dùng `"@/*": ["./*"]`. Jest cần `moduleNameMapper` để resolve alias này, dùng `ts-jest` với `pathsToModuleNameMapper` từ tsconfig.

### 5. Fix `tsconfig.json` với `ignoreDeprecations: "6.0"`

`baseUrl` vẫn cần thiết cho path aliases với `expo-router`. Thêm `ignoreDeprecations` thay vì xóa `baseUrl` — đây là cách Expo recommend.

## Risks / Trade-offs

- **[Risk]** `app/trip/[id].tsx` import từ `trip-utils.ts` thay vì inline → nếu extract sai signature thì runtime lỗi
  **Mitigation**: Viết test trước (TDD-style), chạy test pass, sau đó mới sửa screen import

- **[Risk]** `ts-jest` version incompatibility với TypeScript ~6.0.3
  **Mitigation**: Dùng `ts-jest@^29` đã support TS 6.x; kiểm tra peer deps trước khi install

- **[Trade-off]** Tách functions ra file mới làm tăng số file nhỏ
  **Acceptable**: `trip-utils.ts` là home tự nhiên cho shared trip logic; sẽ được tái dùng khi refactor thêm

## Migration Plan

1. Cài devDependencies (không ảnh hưởng production bundle)
2. Tạo `jest.config.js` + fix `tsconfig.json`
3. Tạo `src/lib/trip-utils.ts` với các functions đã extract
4. Cập nhật imports trong `app/trip/[id].tsx` và `app/create-trip.tsx`
5. Viết tests → chạy `npm test` → confirm pass
6. Không cần rollback strategy vì toàn bộ là additive (devDeps + new file + import changes)

## Open Questions

- Có cần thêm coverage thresholds (e.g., `--coverage`) ngay lần đầu không? → Không, để sau khi team quen với workflow
- `buildGoogleMapsUrl` dùng `encodeURIComponent` — có cần test URL encoding edge cases không? → Có, Vietnamese place names cần test
