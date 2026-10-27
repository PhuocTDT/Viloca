import urllib.request
import urllib.parse
import json
import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

remaining_spots = [
    (18, "Pho_di_bo_Bui_Vien", "Bui Vien street Saigon"),
    (19, "Ben_Bach_Dang_Saigon_Waterbus", "Saigon Waterbus Bach Dang"),
    (20, "Cau_Ba_Son_Thu_Thiem_2", "Ba Son Bridge Thu Thiem 2"),
    (21, "Cau_Mong_Saigon", "Mong Bridge Saigon"),
    (22, "Nha_tho_Tan_Dinh_Pink_Church", "Tan Dinh Church Saigon"),
    (23, "Chua_Ngoc_Hoang_Jade_Emperor", "Jade Emperor Pagoda Saigon"),
    (24, "Chua_Vinh_Nghiem", "Vinh Nghiem Pagoda Saigon"),
    (25, "Chua_Buu_Long", "Buu Long Pagoda Saigon"),
    (26, "Chua_Ba_Thien_Hau_Cho_Lon", "Ba Thien Hau Temple Saigon"),
    (27, "Hoi_quan_Nghia_An_Chua_Ong", "Nghia An Hoi Quan Cho Lon"),
    (28, "Chua_Giac_Lam", "Giac Lam Pagoda Saigon"),
    (29, "Lang_Ong_Ba_Chieu_Le_Van_Duyet", "Lang Ong Ba Chieu Saigon"),
    (30, "Chua_Phap_Hoa_Nhieu_Loc", "Chua Phap Hoa Saigon"),
    (31, "Den_Mariamman_Chua_Ba_An", "Mariamman Temple Ho Chi Minh City"),
    (32, "Thanh_duong_Jamia_Al_Musulman", "Saigon Central Mosque Dong Du"),
    (33, "Nha_tho_Cha_Tam_Cho_Lon", "Cha Tam Church Saigon"),
    (34, "Cho_Binh_Tay_Cho_Lon", "Binh Tay Market Saigon"),
    (35, "Cho_hoa_Ho_Thi_Ky", "Ho Thi Ky flower market"),
    (36, "Cho_Tan_Dinh", "Tan Dinh Market Saigon"),
    (37, "Pho_long_den_Luong_Nhu_Hoc", "Luong Nhu Hoc lantern"),
    (38, "Pho_do_co_Le_Cong_Kieu", "Le Cong Kieu Antique Street"),
    (39, "Thao_Cam_Vien_Sai_Gon", "Saigon Zoo and Botanical Gardens"),
    (40, "Cong_vien_Dam_Sen", "Dam Sen Cultural Park"),
    (41, "KDL_Suoi_Tien", "Suoi Tien Theme Park"),
    (42, "Cau_Anh_Sao_Phu_My_Hung", "Starlight Bridge Ho Chi Minh City"),
    (43, "Dia_dao_Cu_Chi", "Cu Chi Tunnels"),
    (44, "Rung_ngap_man_Can_Gio_Dao_Khi", "Can Gio Mangrove"),
    (45, "Nong_trang_Xanh_Green_Noen_Cu_Chi", "Cu Chi agriculture Vietnam")
]

def search_commons_image(query):
    params = {
        'action': 'query',
        'generator': 'search',
        'gsrsearch': query,
        'gsrnamespace': 6,
        'gsrlimit': 5,
        'prop': 'imageinfo',
        'iiprop': 'url|mime|size',
        'format': 'json'
    }
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={'User-Agent': 'VilocaTravelBot/1.0 (contact@viloca.vn)'})
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            data = json.loads(res.read().decode('utf-8'))
            pages = data.get('query', {}).get('pages', {})
            for p in pages.values():
                ii = p.get('imageinfo', [])
                if ii and 'url' in ii[0]:
                    mime = ii[0].get('mime', '')
                    if mime in ['image/jpeg', 'image/png', 'image/webp']:
                        # Prefer reasonably sized images
                        raw_url = ii[0]['url'].split('?')[0]
                        return raw_url
    except Exception as e:
        print(f"Lỗi tìm kiếm '{query}': {e}")
    return None

def download_file(url, target_path):
    req = urllib.request.Request(url, headers={'User-Agent': 'VilocaTravelBot/1.0 (contact@viloca.vn)'})
    with urllib.request.urlopen(req, timeout=15) as res, open(target_path, 'wb') as f:
        f.write(res.read())

print("Bắt đầu tải ảnh từ STT 18 đến 45...")
os.makedirs('tphcm', exist_ok=True)
os.makedirs('jpg', exist_ok=True)

for stt, name_slug, q in remaining_spots:
    print(f"[{stt}/45] Đang tìm ảnh: {name_slug} (query: {q})...")
    img_url = search_commons_image(q)
    if not img_url:
        # fallback query
        img_url = search_commons_image(q.split()[0] + " Saigon")

    if img_url:
        ext = os.path.splitext(img_url)[1].lower()
        if not ext:
            ext = '.jpg'
        tphcm_filename = f"{stt:02d}_{name_slug}{ext}"
        tphcm_path = os.path.join('tphcm', tphcm_filename)
        try:
            download_file(img_url, tphcm_path)
            size_kb = os.path.getsize(tphcm_path) / 1024
            print(f"  -> Đã tải về 'tphcm/{tphcm_filename}' ({size_kb:.1f} KB)")
        except Exception as e:
            print(f"  -> Lỗi tải '{img_url}': {e}")
    else:
        print(f"  -> Không tìm thấy ảnh cho: {name_slug}")

print("\nĐã tải xong toàn bộ ảnh! Tiếp theo tiến hành chuyển đổi sang thư mục 'jpg/'...")

# Chuyển đổi toàn bộ thư mục tphcm sang jpg
src_folder = 'tphcm'
dst_folder = 'jpg'
files = [f for f in os.listdir(src_folder) if os.path.isfile(os.path.join(src_folder, f))]

for idx, filename in enumerate(files, 1):
    src_path = os.path.join(src_folder, filename)
    name_without_ext = os.path.splitext(filename)[0]
    orig_ext = os.path.splitext(filename)[1].lower()
    try:
        with Image.open(src_path) as img:
            has_alpha = img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info)
            jpg_name = f"{name_without_ext}.jpg"
            dst_jpg_path = os.path.join(dst_folder, jpg_name)

            if img.mode in ('RGBA', 'LA', 'P'):
                rgb_img = img.convert('RGBA')
                background = Image.new('RGB', rgb_img.size, (255, 255, 255))
                background.paste(rgb_img, mask=rgb_img.split()[3])
                background.save(dst_jpg_path, 'JPEG', quality=95, optimize=True)
            elif img.mode != 'RGB':
                rgb_img = img.convert('RGB')
                rgb_img.save(dst_jpg_path, 'JPEG', quality=95, optimize=True)
            else:
                img.save(dst_jpg_path, 'JPEG', quality=95, optimize=True)

            if has_alpha or orig_ext in ('.webp', '.png'):
                png_name = f"{name_without_ext}.png"
                dst_png_path = os.path.join(dst_folder, png_name)
                img.save(dst_png_path, 'PNG', optimize=True)
    except Exception as e:
        print(f"Lỗi khi chuyển đổi {filename}: {e}")

print(f"\n HOÀN TẤT TOÀN BỘ 45 ĐỊA ĐIỂM! Đã chuyển đổi đầy đủ vào thư mục 'jpg/'.")
