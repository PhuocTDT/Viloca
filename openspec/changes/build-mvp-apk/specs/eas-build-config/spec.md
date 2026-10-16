## ADDED Requirements

### Requirement: EAS Build preview profile xuất APK

Project SHALL có `eas.json` với profile `preview` cấu hình `buildType: "apk"` để EAS Build tạo file APK installable thay vì AAB.

#### Scenario: Build profile tồn tại và đúng format

- **WHEN** developer chạy `eas build -p android --profile preview`
- **THEN** EAS Build tạo file `.apk` có thể download và cài trực tiếp trên Android

#### Scenario: Profile production không ảnh hưởng

- **WHEN** project sau này cần submit lên Play Store
- **THEN** profile `production` (mặc định AAB) có thể thêm vào mà không conflict với profile `preview`

### Requirement: Supabase credentials được inject qua EAS secrets

Project SHALL không commit Supabase URL và anon key vào repository. Các giá trị này SHALL được lưu dưới dạng EAS secrets và inject tại build time.

#### Scenario: Secrets được set trước khi build

- **WHEN** `EXPO_PUBLIC_SUPABASE_URL` và `EXPO_PUBLIC_SUPABASE_ANON_KEY` được set qua `eas secret:create`
- **THEN** APK build thành công và app kết nối được Supabase sau khi cài

#### Scenario: Thiếu secrets

- **WHEN** secrets chưa được set và developer trigger build
- **THEN** app vẫn build thành công (Expo không fail build nếu thiếu EXPO_PUBLIC vars) nhưng app sẽ không kết nối được Supabase — developer MUST set secrets trước khi distribute

### Requirement: app.json có đủ metadata cho production APK

`app.json` SHALL có `android.package` hợp lệ, icons đầy đủ, và permissions text phù hợp cho `expo-location` và `expo-image-picker`.

#### Scenario: Package name đã được đặt

- **WHEN** EAS Build đọc `app.json`
- **THEN** APK được ký với package `com.thuanpne.viloca` (đã có sẵn)

#### Scenario: Location permission hiển thị đúng

- **WHEN** user lần đầu dùng tính năng tìm địa điểm
- **THEN** dialog permission hiển thị text tiếng Việt hoặc tiếng Anh rõ ràng về lý do cần location

#### Scenario: Image picker permission hiển thị đúng

- **WHEN** user chọn ảnh cover cho trip
- **THEN** dialog permission hiển thị text rõ ràng về lý do cần truy cập ảnh
