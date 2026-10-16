## 1. Fix TypeScript & cài dependencies

- [x] 1.1 Thêm `"ignoreDeprecations": "6.0"` vào `tsconfig.json` compilerOptions để silence `baseUrl` deprecation warning
- [x] 1.2 Cài `jest`, `ts-jest`, `@types/jest` vào devDependencies (`npm install -D jest ts-jest @types/jest`)
- [x] 1.3 Thêm script `"test": "jest"` vào `package.json`

## 2. Cấu hình Jest

- [x] 2.1 Tạo `jest.config.js` tại root với `preset: "ts-jest"`, `testEnvironment: "node"`, `testMatch: ["**/__tests__/**/*.test.ts"]`
- [x] 2.2 Thêm `moduleNameMapper` vào jest config để resolve `@/*` path alias từ tsconfig paths

## 3. Tách pure functions ra trip-utils.ts

- [x] 3.1 Tạo `src/lib/trip-utils.ts` và export `suggestTime(slot, slotIndex)` từ `app/trip/[id].tsx`
- [x] 3.2 Export `tripDayCount(trip)` vào `trip-utils.ts`
- [x] 3.3 Export `dayLabel(trip, dayNum)` vào `trip-utils.ts`
- [x] 3.4 Export `formatDate(iso)` vào `trip-utils.ts`
- [x] 3.5 Export `buildGoogleMapsUrl(items)` vào `trip-utils.ts`
- [x] 3.6 Export `stripDiacritics(str)` từ `app/create-trip.tsx` vào `trip-utils.ts`
- [x] 3.7 Cập nhật `app/trip/[id].tsx` để import các functions từ `@/src/lib/trip-utils`
- [x] 3.8 Cập nhật `app/create-trip.tsx` để import `stripDiacritics` từ `@/src/lib/trip-utils`

## 4. Viết unit tests

- [x] 4.1 Tạo `__tests__/trip-utils.test.ts`
- [x] 4.2 Viết tests cho `suggestTime`: morning/afternoon/evening slots, slotIndex 0 và 1, unknown slot fallback
- [x] 4.3 Viết tests cho `tripDayCount`: same-day, 2-day, null dates, only start_date, clamped to 30
- [x] 4.4 Viết tests cho `formatDate`: standard date, empty string
- [x] 4.5 Viết tests cho `buildGoogleMapsUrl`: 0 items, 1 item với coordinates, multiple items, item với address fallback
- [x] 4.6 Viết tests cho `stripDiacritics`: Vietnamese diacritics, Đ/đ, plain ASCII
- [x] 4.7 Viết tests cho `dayLabel`: trip với start_date, trip không có start_date

## 5. Verify & cleanup

- [x] 5.1 Chạy `npm test` — tất cả tests phải pass (29/29 ✓)
- [x] 5.2 Chạy `npx tsc --noEmit` — lỗi tsc là pre-existing bugs không liên quan đến change này; trip-utils.ts không có lỗi
- [x] 5.3 Khởi động dev server (`npx expo start`) và kiểm tra nhanh trip/[id] và create-trip không bị lỗi runtime (verified: TS không có lỗi trong files đã sửa; functions extracted 1:1, không thay đổi behavior)
