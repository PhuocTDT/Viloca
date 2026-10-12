## Why

Viloca có nhiều pure functions và custom hooks quan trọng (tính ngày đi, format thời gian, build URL bản đồ...) nhưng hoàn toàn không có test coverage. Những logic này đang chạy trực tiếp trên production mà không có safety net, khiến refactor và thêm tính năng mới rủi ro hơn cần thiết.

## What Changes

- Cài đặt Jest + ts-jest làm test runner (không cần React Native environment vì target là pure functions)
- Thêm script `test` vào `package.json`
- Fix deprecation warning trong `tsconfig.json` (`baseUrl` → `ignoreDeprecations`)
- Tạo `__tests__/` directory với unit tests cho các pure functions trong `app/trip/[id].tsx` và `app/create-trip.tsx`
- Tách các pure functions ra file riêng `src/lib/trip-utils.ts` để có thể import và test độc lập

## Capabilities

### New Capabilities

- `unit-test-infrastructure`: Setup Jest + ts-jest, cấu hình test environment, npm test script
- `trip-utils-tests`: Unit tests bao phủ `suggestTime`, `tripDayCount`, `dayLabel`, `formatDate`, `buildGoogleMapsUrl`, `stripDiacritics`

### Modified Capabilities

*(Không có thay đổi requirements — đây là infrastructure addition)*

## Impact

- **Files mới**: `jest.config.js`, `__tests__/trip-utils.test.ts`, `src/lib/trip-utils.ts`
- **Files sửa**: `package.json` (thêm devDependencies + script), `tsconfig.json` (fix deprecation), `app/trip/[id].tsx` và `app/create-trip.tsx` (import từ `trip-utils.ts` thay vì định nghĩa inline)
- **Dependencies mới**: `jest`, `ts-jest`, `@types/jest` (devDependencies)
- **Không ảnh hưởng** đến runtime bundle — toàn bộ là devDependencies và source code refactor không thay đổi behavior
