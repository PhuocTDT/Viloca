import os
import sys
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.drawing.image import Image as OpenpyxlImage
from PIL import Image as PILImage
import urllib.request
import urllib.parse
import json

sys.stdout.reconfigure(encoding='utf-8')

# 1. Tạo thư mục danang_jpg và danang_thumbs
src_danang = 'danang'
dst_danang_jpg = 'danang_jpg'
thumb_dir = 'danang_thumbs'
os.makedirs(dst_danang_jpg, exist_ok=True)
os.makedirs(thumb_dir, exist_ok=True)

# 2. Chuyển đổi toàn bộ ảnh hiện có trong danang sang danang_jpg
print(f"--- Bước 1: Chuyển đổi toàn bộ ảnh trong '{src_danang}/' sang '{dst_danang_jpg}/' ---")
files = [f for f in os.listdir(src_danang) if os.path.isfile(os.path.join(src_danang, f))]

for idx, filename in enumerate(files, 1):
    src_path = os.path.join(src_danang, filename)
    name_without_ext = os.path.splitext(filename)[0]
    orig_ext = os.path.splitext(filename)[1].lower()
    try:
        with PILImage.open(src_path) as img:
            has_alpha = img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info)
            jpg_name = f"{name_without_ext}.jpg"
            dst_jpg_path = os.path.join(dst_danang_jpg, jpg_name)

            if img.mode in ('RGBA', 'LA', 'P'):
                rgb_img = img.convert('RGBA')
                background = PILImage.new('RGB', rgb_img.size, (255, 255, 255))
                background.paste(rgb_img, mask=rgb_img.split()[3])
                background.save(dst_jpg_path, 'JPEG', quality=95, optimize=True)
            elif img.mode != 'RGB':
                rgb_img = img.convert('RGB')
                rgb_img.save(dst_jpg_path, 'JPEG', quality=95, optimize=True)
            else:
                img.save(dst_jpg_path, 'JPEG', quality=95, optimize=True)

            if has_alpha or orig_ext in ('.webp', '.png'):
                png_name = f"{name_without_ext}.png"
                dst_png_path = os.path.join(dst_danang_jpg, png_name)
                img.save(dst_png_path, 'PNG', optimize=True)
    except Exception as e:
        print(f"Lỗi khi chuyển đổi {filename}: {e}")

print(f" Đã chuyển đổi {len(files)} file ảnh sang '{dst_danang_jpg}/'.")
