## Why

Viloca cần được đưa đến tay người dùng thật để test MVP. Hiện tại app chỉ chạy được qua Expo Go hoặc dev build trên máy lập trình viên — không thể share cho người dùng bên ngoài. Mục tiêu là tạo ra file APK cài được trực tiếp trên Android mà không cần đăng ký Google Play Store.

## What Changes

- Thêm `eas.json` với profile `preview` (build APK, không phải AAB)
- Cấu hình EAS secrets cho Supabase environment variables
- Xác minh `app.json` đủ metadata cho production build (permissions, icons, package name)
- Build APK qua EAS Build cloud service
- Không cần Google Maps API key (app dùng `Linking.openURL` thay vì embedded MapView)
- Không cần Google Play Developer account

## Capabilities

### New Capabilities

- `eas-build-config`: Cấu hình EAS Build với profile preview để xuất APK installable

### Modified Capabilities

- (không có thay đổi yêu cầu ở cấp spec)

## Impact

- **Files mới**: `eas.json`
- **Files sửa**: `app.json` (thêm permissions text nếu thiếu, verify metadata)
- **Dependencies**: `eas-cli` cài global (không vào `package.json`)
- **Không ảnh hưởng**: source code app, Supabase schema, existing tests
- **Yêu cầu bên ngoài**: tài khoản Expo (expo.dev), Supabase URL + anon key của dev project
