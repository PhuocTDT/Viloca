## 1. Cài EAS CLI và đăng nhập

- [x] 1.1 Cài EAS CLI global: `npm install -g eas-cli`
- [x] 1.2 Đăng nhập tài khoản Expo: `eas login` (tạo tài khoản tại expo.dev nếu chưa có)
- [x] 1.3 Link project với Expo account: `eas build:configure` (chạy tại root project, chọn Android khi được hỏi)

## 2. Tạo và cấu hình eas.json

- [x] 2.1 Tạo file `eas.json` tại root project với profile `preview` buildType `apk`
- [x] 2.2 Verify `eas.json` có cấu trúc đúng (xem design.md Decision D2)

## 3. Cấu hình Supabase secrets

- [x] 3.1 Set EAS secret cho Supabase URL: `eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value <url>`
- [x] 3.2 Set EAS secret cho Supabase anon key: `eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <key>`
- [x] 3.3 Verify secrets đã được set: `eas secret:list`

## 4. Verify app.json metadata

- [x] 4.1 Kiểm tra `android.package` = `"com.thuanpne.viloca"` (đã có)
- [x] 4.2 Kiểm tra adaptive icon paths tồn tại: `assets/android-icon-foreground.png`, `assets/android-icon-background.png`, `assets/android-icon-monochrome.png`
- [x] 4.3 Thêm permission text cho location vào `app.json` nếu chưa có (`android.permissions` với `ACCESS_FINE_LOCATION`)
- [x] 4.4 Thêm permission description text cho image picker nếu chưa có

## 5. Build APK

- [x] 5.1 Trigger build: `eas build -p android --profile preview`
- [x] 5.2 Chờ build hoàn tất (~15-20 phút), theo dõi log tại https://expo.dev/accounts/[username]/projects/viloca/builds
- [ ] 5.3 Download file APK từ link Expo cung cấp sau khi build xong
- [ ] 5.4 Test cài APK trên 1 thiết bị Android thật (enable "Install from unknown sources")
- [ ] 5.5 Verify app kết nối được Supabase: thử login với tài khoản test
