import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

src_folder = 'tphcm'
dst_folder = 'jpg'

# Tạo thư mục jpg nếu chưa tồn tại
os.makedirs(dst_folder, exist_ok=True)

if not os.path.exists(src_folder):
    print(f"Thư mục nguồn '{src_folder}' không tồn tại.")
    sys.exit(1)

files = [f for f in os.listdir(src_folder) if os.path.isfile(os.path.join(src_folder, f))]

print(f"Bắt đầu chuyển đổi {len(files)} file từ '{src_folder}/' sang thư mục '{dst_folder}/'...")
print("(Lưu ý: Tất cả file gốc trong thư mục tphcm/ được giữ nguyên vẹn 100%)\n")

converted_count = 0
results = []

for idx, filename in enumerate(files, 1):
    src_path = os.path.join(src_folder, filename)
    name_without_ext = os.path.splitext(filename)[0]
    orig_ext = os.path.splitext(filename)[1].lower()

    try:
        with Image.open(src_path) as img:
            # Kiểm tra xem ảnh có kênh alpha (transparency) không
            has_alpha = img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info)

            # Xuất sang định dạng JPG chuẩn
            jpg_name = f"{name_without_ext}.jpg"
            dst_jpg_path = os.path.join(dst_folder, jpg_name)

            # Chuyển đổi màu để lưu JPG
            if img.mode in ('RGBA', 'LA', 'P'):
                rgb_img = img.convert('RGBA')
                # Tạo nền trắng cho ảnh trong suốt khi lưu sang JPG
                background = Image.new('RGB', rgb_img.size, (255, 255, 255))
                background.paste(rgb_img, mask=rgb_img.split()[3]) # alpha channel
                background.save(dst_jpg_path, 'JPEG', quality=95, optimize=True)
            elif img.mode != 'RGB':
                rgb_img = img.convert('RGB')
                rgb_img.save(dst_jpg_path, 'JPEG', quality=95, optimize=True)
            else:
                img.save(dst_jpg_path, 'JPEG', quality=95, optimize=True)

            out_files = [jpg_name]

            # Nếu ảnh gốc có alpha hoặc là PNG/WEBP, tạo thêm bản PNG giữ nguyên độ trong suốt
            if has_alpha or orig_ext in ('.webp', '.png'):
                png_name = f"{name_without_ext}.png"
                dst_png_path = os.path.join(dst_folder, png_name)
                img.save(dst_png_path, 'PNG', optimize=True)
                out_files.append(png_name)

            converted_count += 1
            results.append({
                'idx': idx,
                'src': filename,
                'orig_ext': orig_ext,
                'out_files': out_files,
                'size_orig': os.path.getsize(src_path) / 1024,
                'size_jpg': os.path.getsize(dst_jpg_path) / 1024
            })
            print(f"[{idx:2d}/{len(files)}] Đã chuyển: {filename} ({orig_ext}) -> {', '.join(out_files)}")

    except Exception as e:
        print(f"[{idx:2d}/{len(files)}] Lỗi khi xử lý {filename}: {e}")

print(f"\n Hoàn tất! Đã xuất {converted_count} ảnh vào thư mục '{dst_folder}/'.")
