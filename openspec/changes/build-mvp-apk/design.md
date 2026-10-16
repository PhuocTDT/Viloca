## Context

Viloca là Expo SDK 56 + React Native 0.85 app. Hiện tại chưa có `eas.json` và chưa từng build native. App cần được phân phối dưới dạng APK để người dùng cài trực tiếp (sideload) trên Android — không qua Google Play Store.

**Constraints quan trọng đã xác minh:**
- `react-native-maps` có trong dependencies nhưng không được import/sử dụng ở đâu → không cần Google Maps API key
- SerpAPI chỉ dùng trong offline scripts, không trong app runtime
- Maps navigation dùng `Linking.openURL(google_maps_url)` — deep link, không cần native maps SDK
- `app.json` đã có `android.package: "com.thuanpne.viloca"` và adaptive icons đầy đủ
- Supabase dev project sẽ được dùng cho production MVP (chấp nhận risk free tier pausing)

## Goals / Non-Goals

**Goals:**
- Tạo APK installable qua EAS Build cloud (profile `preview`)
- Bảo vệ Supabase credentials bằng EAS secrets (không commit vào repo)
- APK cài được trên Android 8+ (API 26+) không cần adb hay developer mode đặc biệt
- Người dùng chỉ cần bật "Cài từ nguồn không xác định" trong Settings

**Non-Goals:**
- Google Play Store submission
- iOS build
- Production Supabase environment (tách biệt với dev)
- Code signing tự quản lý (dùng managed credentials của EAS)
- Push notifications (chưa có trong app)

## Decisions

### D1: EAS Build thay vì Local Build

**Chọn:** EAS Build (cloud)

**Lý do:** Local build trên Windows yêu cầu Android SDK + JDK + Gradle setup phức tạp. EAS Build handle tất cả trong môi trường Linux cloud, cho kết quả nhất quán và không cần cài toolchain. Free tier đủ cho MVP (30 builds/tháng).

**Thay thế đã xem xét:** `expo run:android` (local) — nhanh hơn nhưng phụ thuộc vào môi trường máy lập trình viên, không reproducible.

### D2: Profile `preview` thay vì `production`

**Chọn:** profile `preview`

**Lý do:** Profile `preview` mặc định xuất `.apk` (installable trực tiếp). Profile `production` xuất `.aab` chỉ dùng được với Play Store. Cho MVP sideload, APK là đúng format.

```json
// eas.json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### D3: EAS Secrets cho Environment Variables

**Chọn:** EAS secrets (server-side, encrypted)

**Lý do:** `EXPO_PUBLIC_*` vars nếu để trong file (`.env`, `eas.json` env section) sẽ bị commit vào repo hoặc expose trong build logs. EAS secrets inject chúng tại build time, không lưu trong codebase.

**Cách thiết lập:**
```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value <url>
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <key>
```

### D4: Managed Credentials (Code Signing)

**Chọn:** EAS Managed Credentials

**Lý do:** Expo tự tạo và quản lý keystore cho Android signing. Không cần tự tạo keystore và bảo quản — phù hợp cho MVP. Keystore được lưu trên Expo servers.

**Lưu ý:** Nếu sau này muốn tự quản lý keystore (bắt buộc khi chuyển sang Play Store với app đã có users), cần export keystore từ EAS trước khi switch.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Supabase free tier tự pause sau 7 ngày không active | Theo dõi Supabase dashboard; unpause thủ công; nếu launch rộng → upgrade Pro ($25/month) |
| APK sideload yêu cầu user bật "Unknown sources" | Hướng dẫn rõ trong link download; user tech-savvy ở MVP phase thường biết cách |
| EAS Build free tier: 30 builds/tháng | Đủ cho MVP; nếu cần nhiều hơn → EAS Production plan |
| Keystore managed bởi Expo | Export keystore trước khi rời Expo nếu cần tự quản lý sau này |
| APK size lớn hơn AAB (~30-50MB thêm) | Chấp nhận được cho direct distribution |

## Migration Plan

1. Cài `eas-cli` global
2. Login với tài khoản expo.dev
3. Tạo `eas.json` với profile `preview`
4. Chạy `eas build:configure` để link project với Expo account
5. Set EAS secrets cho Supabase credentials
6. Verify `app.json` permissions và metadata
7. Trigger build: `eas build -p android --profile preview`
8. Download APK từ link Expo cung cấp (~15-20 phút build time)
9. Share link APK cho users

**Rollback:** Không áp dụng — build là one-way operation. Nếu build lỗi, fix và rebuild.

## Open Questions

- Supabase anon key có cần rotate trước khi share APK không? (anon key là public-safe theo design của Supabase, nhưng nên verify RLS policies trước)
- Cần thêm `expo-notifications` permission vào app.json không? (chưa có feature này, bỏ qua)
