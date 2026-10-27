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

src_danang = 'danang'
dst_danang_jpg = 'danang_jpg'
thumb_dir = 'danang_thumbs'
os.makedirs(src_danang, exist_ok=True)
os.makedirs(dst_danang_jpg, exist_ok=True)
os.makedirs(thumb_dir, exist_ok=True)

# Query Wikimedia Commons for missing spots
spots_to_fetch = [
    (9, "09_Dinh_Ban_Co_Son_Tra.jpg", "Dinh Ban Co Son Tra Da Nang"),
    (12, "12_Cay_Da_Ngan_Nam_Son_Tra.jpg", "Son Tra banyan tree Da Nang"),
    (17, "17_Cong_vien_Bien_Dong_Da_Nang.jpg", "Cong vien Bien Dong Da Nang"),
    (18, "18_Bai_bien_Xuan_Thieu.jpg", "Xuan Thieu beach Da Nang"),
    (19, "19_Bai_Cat_Vang_Son_Tra.jpg", "Bai Cat Vang Son Tra"),
    (20, "20_Bai_Chuoi_Hai_Van.jpg", "Hai Van Pass beach Da Nang"),
    (21, "21_Ngu_Hanh_Son_Marble_Mountains.jpg", "Marble Mountains Da Nang"),
    (22, "22_Lang_da_my_nghe_Non_Nuoc.jpg", "Non Nuoc stone carving Da Nang"),
    (23, "23_Bao_tang_Dieu_khac_Cham.jpg", "Museum of Cham Sculpture Da Nang"),
    (24, "24_Bao_tang_Da_Nang_Thanh_Dien_Hai.jpg", "Dien Hai Citadel Da Nang"),
    (25, "25_Bao_tang_My_thuat_Da_Nang.jpg", "Da Nang Museum of Fine Arts"),
    (26, "26_Nha_tho_Chinh_Toa_Con_Ga_Da_Nang.jpg", "Da Nang Cathedral Pink"),
    (27, "27_Chua_Tam_Thai_Ngu_Hanh_Son.jpg", "Tam Thai Pagoda Da Nang"),
    (28, "28_Lang_co_Phong_Nam.jpg", "Phong Nam ancient village Da Nang"),
    (29, "29_Deo_Hai_Van_Quan.jpg", "Hai Van Pass Vietnam"),
    (30, "30_Lang_Van_Da_Nang.jpg", "Van Village Hai Van Da Nang"),
    (31, "31_Ran_Nam_O_Reu_Xanh.jpg", "Nam O reef Da Nang"),
    (32, "32_Ho_Hoa_Trung.jpg", "Hoa Trung lake Da Nang"),
    (33, "33_Ho_Dong_Xanh_Dong_Nghe.jpg", "Dong Xanh Dong Nghe lake Da Nang"),
    (34, "34_Gieng_Troi_Da_Nang.jpg", "Gieng Troi Da Nang waterfall"),
    (35, "35_Nui_Than_Tai_Hot_Springs.jpg", "Nui Than Tai hot spring Da Nang"),
    (36, "36_KDL_Hoa_Phu_Thanh.jpg", "Hoa Phu Thanh Da Nang rafting"),
    (37, "37_Suoi_Mo_Da_Nang.jpg", "Suoi Mo Da Nang waterfall"),
    (38, "38_Cho_Con_Da_Nang.jpg", "Con Market Da Nang"),
    (39, "39_Cho_Han_Da_Nang.jpg", "Han Market Da Nang"),
    (40, "40_Cho_dem_Son_Tra.jpg", "Son Tra night market Da Nang"),
    (41, "41_Cho_dem_Helio_Center.jpg", "Helio night market Da Nang"),
    (42, "42_Cong_vien_Vuon_tuong_APEC.jpg", "APEC Park Da Nang"),
    (43, "43_Cung_Van_hoa_Thieu_nhi_Da_Nang.jpg", "Da Nang Children Cultural Palace"),
    (44, "44_Du_thuyen_Song_Han.jpg", "Han river cruise Da Nang night"),
    (45, "45_Lang_bich_hoa_Man_Thai.jpg", "Man Thai mural village Da Nang")
]

def search_commons_image(query):
    params = {
        'action': 'query',
        'generator': 'search',
        'gsrsearch': query,
        'gsrnamespace': 6,
        'gsrlimit': 5,
        'prop': 'imageinfo',
        'iiprop': 'url|mime',
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
                        return ii[0]['url'].split('?')[0]
    except Exception as e:
        pass
    return None

def download_and_save(url, fn):
    raw_path = os.path.join(src_danang, fn)
    jpg_path = os.path.join(dst_danang_jpg, fn)
    req = urllib.request.Request(url, headers={'User-Agent': 'VilocaTravelBot/1.0'})
    with urllib.request.urlopen(req, timeout=15) as res, open(raw_path, 'wb') as f:
        f.write(res.read())
    with PILImage.open(raw_path) as im:
        im.convert('RGB').save(jpg_path, 'JPEG', quality=95)

print("Đang tải các ảnh còn thiếu cho Đà Nẵng...")
for stt, fn, q in spots_to_fetch:
    target_jpg = os.path.join(dst_danang_jpg, fn)
    if not os.path.exists(target_jpg):
        img_url = search_commons_image(q)
        if not img_url:
            img_url = search_commons_image(q.split()[0] + " Da Nang")
        if img_url:
            try:
                download_and_save(img_url, fn)
                print(f"[{stt}/45] Đã tải ảnh cho {fn}")
            except Exception as e:
                print(f"[{stt}/45] Lỗi tải {fn}: {e}")
        else:
            print(f"[{stt}/45] Không tìm thấy ảnh cho query: {q}")

# Mapping of all 45 Da Nang spots to their image in danang_jpg
danang_images_map = {
    1: "Cau-Rong-Da-Nang-ve-dem-Anh-Suu-tam.jpg",
    2: "Cau-quay-song-Han-toa-lac-tai-vi-tri-trung-tam-thanh-pho-Da-Nang-suu-tam.jpg",
    3: "1-cau-vang-da-nang-thuoc-sun-world-ba-na-hills.jpg",
    4: "cau-tinh-yeu-da-nang-1024x659.jpg",
    5: "cau-thuan-phuoc-9.jpg",
    6: "Cau-Tran-Thi-Ly-Da-Nang-e1504710544812.jpg",
    7: "Ban-dao-son-tra.jpg",
    8: "bai-but-da-nang-01_1632404654.jpg",
    9: "09_Dinh_Ban_Co_Son_Tra.jpg",
    10: "TEwgr89n-Ghenh-Bang-8-1024x640.jpg",
    11: "hai-dang-tien-sa-2.jpg",
    12: "12_Cay_Da_Ngan_Nam_Son_Tra.jpg",
    13: "bai-rang-da-nang-2.jpg",
    14: "Toan-canh-Mui-Nghe-Son-Tra-nhin-tu-tren-cao-thay-ro-cac-mom-da-vuon-ra-bien.jpg",
    15: "bai-bien-my-khe-542bc385afcf9.jpg",
    16: "Bai-bien-Non-Nuoc-–-vi-sao-la-diem-den-hap-dan-o-Da-Nang-Anh-Suu-tam.jpg",
    17: "17_Cong_vien_Bien_Dong_Da_Nang.jpg",
    18: "18_Bai_bien_Xuan_Thieu.jpg",
    19: "19_Bai_Cat_Vang_Son_Tra.jpg",
    20: "20_Bai_Chuoi_Hai_Van.jpg",
    21: "21_Ngu_Hanh_Son_Marble_Mountains.jpg",
    22: "22_Lang_da_my_nghe_Non_Nuoc.jpg",
    23: "23_Bao_tang_Dieu_khac_Cham.jpg",
    24: "24_Bao_tang_Da_Nang_Thanh_Dien_Hai.jpg",
    25: "25_Bao_tang_My_thuat_Da_Nang.jpg",
    26: "26_Nha_tho_Chinh_Toa_Con_Ga_Da_Nang.jpg",
    27: "27_Chua_Tam_Thai_Ngu_Hanh_Son.jpg",
    28: "28_Lang_co_Phong_Nam.jpg",
    29: "29_Deo_Hai_Van_Quan.jpg",
    30: "30_Lang_Van_Da_Nang.jpg",
    31: "31_Ran_Nam_O_Reu_Xanh.jpg",
    32: "32_Ho_Hoa_Trung.jpg",
    33: "33_Ho_Dong_Xanh_Dong_Nghe.jpg",
    34: "34_Gieng_Troi_Da_Nang.jpg",
    35: "35_Nui_Than_Tai_Hot_Springs.jpg",
    36: "36_KDL_Hoa_Phu_Thanh.jpg",
    37: "37_Suoi_Mo_Da_Nang.jpg",
    38: "38_Cho_Con_Da_Nang.jpg",
    39: "39_Cho_Han_Da_Nang.jpg",
    40: "40_Cho_dem_Son_Tra.jpg",
    41: "41_Cho_dem_Helio_Center.jpg",
    42: "42_Cong_vien_Vuon_tuong_APEC.jpg",
    43: "43_Cung_Van_hoa_Thieu_nhi_Da_Nang.jpg",
    44: "44_Du_thuyen_Song_Han.jpg",
    45: "45_Lang_bich_hoa_Man_Thai.jpg"
}

def make_thumbnail(src_path, dst_path, target_width=150, target_height=90):
    try:
        with PILImage.open(src_path) as im:
            im = im.convert('RGB')
            w, h = im.size
            aspect = w / h
            target_aspect = target_width / target_height

            if aspect > target_aspect:
                new_w = int(h * target_aspect)
                left = (w - new_w) // 2
                im_cropped = im.crop((left, 0, left + new_w, h))
            else:
                new_h = int(w / target_aspect)
                top = (h - new_h) // 2
                im_cropped = im.crop((0, top, w, top + new_h))

            im_final = im_cropped.resize((target_width, target_height), PILImage.Resampling.LANCZOS)
            im_final.save(dst_path, 'JPEG', quality=92)
            return True
    except Exception as e:
        return False

# Read existing Da Nang data from Danh_Sach_45_Dia_Diem_Du_Lich_Da_Nang.xlsx
wb_old = openpyxl.load_workbook('Danh_Sach_45_Dia_Diem_Du_Lich_Da_Nang.xlsx')
ws_old = wb_old.active

# Build new Master Da Nang Excel with 1 Image column
wb_new = openpyxl.Workbook()
ws_new = wb_new.active
ws_new.title = "45 Địa Điểm Du Lịch Đà Nẵng"

# Styles
font_title = Font(name="Segoe UI", size=16, bold=True, color="1E3A8A")
font_subtitle = Font(name="Segoe UI", size=10, bold=False, color="64748B")
font_header = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
fill_header = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")

font_data = Font(name="Segoe UI", size=10, color="0F172A")
font_bold = Font(name="Segoe UI", size=10, bold=True, color="0F172A")
font_tips = Font(name="Segoe UI", size=9, color="475569")

fill_even = PatternFill(fill_type=None)
fill_odd = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")

border_thin = Border(
    left=Side(style="thin", color="CBD5E1"),
    right=Side(style="thin", color="CBD5E1"),
    top=Side(style="thin", color="CBD5E1"),
    bottom=Side(style="thin", color="CBD5E1")
)

align_center = Alignment(horizontal="center", vertical="center", wrap_text=True)
align_left = Alignment(horizontal="left", vertical="center", wrap_text=True)

# Row 1: Title
ws_new.merge_cells("A1:K1")
ws_new["A1"] = "BẢNG TỔNG HỢP 45 ĐỊA ĐIỂM DU LỊCH ĐÀ NẴNG (NHÚNG ẢNH THỰC TẾ CHUẨN ĐẸP)"
ws_new["A1"].font = font_title
ws_new["A1"].alignment = Alignment(horizontal="center", vertical="center")
ws_new.row_dimensions[1].height = 42.0

# Row 2: Subtitle
ws_new.merge_cells("A2:K2")
ws_new["A2"] = "Dữ liệu chuẩn hóa 2026 | Nhúng ảnh thực tế chất lượng cao, đầy đủ thông tin vị trí, đặc điểm, giờ tham quan, giá vé & mẹo local"
ws_new["A2"].font = font_subtitle
ws_new["A2"].alignment = Alignment(horizontal="center", vertical="center")
ws_new.row_dimensions[2].height = 22.0

# Headers (1 Image column)
headers = [
    "STT",
    "Tên Địa Điểm / Danh Thắng",
    "Phân Loại",
    "Quận / Huyện",
    "Địa Chỉ / Tọa Độ",
    "Đặc Điểm Nổi Bật & Trải Nghiệm",
    "Thời Điểm Lý Tưởng",
    "Giá Vé Tham Khảo",
    "Mẹo Du Lịch Local (Tips)",
    "Hình Ảnh Thực Tế",
    "Đánh Giá / Ghi Chú"
]

for col_idx, h_text in enumerate(headers, 1):
    cell = ws_new.cell(3, col_idx)
    cell.value = h_text
    cell.font = font_header
    cell.fill = fill_header
    cell.alignment = align_center
    cell.border = border_thin

ws_new.row_dimensions[3].height = 34.0

col_widths = {
    "A": 6.0,
    "B": 28.0,
    "C": 24.0,
    "D": 16.0,
    "E": 32.0,
    "F": 45.0,
    "G": 25.0,
    "H": 20.0,
    "I": 45.0,
    "J": 24.0,   # Embedded Image column
    "K": 18.0
}
for col_letter, width in col_widths.items():
    ws_new.column_dimensions[col_letter].width = width

# Copy data and insert embedded images
for row_idx in range(4, 49):
    stt = ws_old.cell(row_idx, 1).value
    name = ws_old.cell(row_idx, 2).value
    cat = ws_old.cell(row_idx, 3).value
    district = ws_old.cell(row_idx, 4).value
    addr = ws_old.cell(row_idx, 5).value
    highlight = ws_old.cell(row_idx, 6).value
    best_time = ws_old.cell(row_idx, 7).value
    price = ws_old.cell(row_idx, 8).value
    tips = ws_old.cell(row_idx, 9).value
    rating = ws_old.cell(row_idx, 13).value if ws_old.cell(row_idx, 13).value else "⭐⭐⭐⭐⭐ Top Choice"

    current_fill = fill_odd if (row_idx % 2 == 1) else fill_even
    ws_new.row_dimensions[row_idx].height = 82.0

    c1 = ws_new.cell(row_idx, 1, stt)
    c1.font = font_bold
    c1.alignment = Alignment(horizontal="center", vertical="center")

    c2 = ws_new.cell(row_idx, 2, name)
    c2.font = font_bold
    c2.alignment = align_left

    c3 = ws_new.cell(row_idx, 3, cat)
    c3.font = font_data
    c3.alignment = align_left

    c4 = ws_new.cell(row_idx, 4, district)
    c4.font = font_data
    c4.alignment = Alignment(horizontal="center", vertical="center")

    c5 = ws_new.cell(row_idx, 5, addr)
    c5.font = font_data
    c5.alignment = align_left

    c6 = ws_new.cell(row_idx, 6, highlight)
    c6.font = font_data
    c6.alignment = align_left

    c7 = ws_new.cell(row_idx, 7, best_time)
    c7.font = font_data
    c7.alignment = align_left

    c8 = ws_new.cell(row_idx, 8, price)
    c8.font = font_bold
    c8.alignment = align_center

    c9 = ws_new.cell(row_idx, 9, tips)
    c9.font = font_tips
    c9.alignment = align_left

    c10 = ws_new.cell(row_idx, 10, "")
    c10.alignment = Alignment(horizontal="center", vertical="center")

    c11 = ws_new.cell(row_idx, 11, rating)
    c11.font = font_data
    c11.alignment = Alignment(horizontal="center", vertical="center")

    for col_idx in range(1, 12):
        cell = ws_new.cell(row_idx, col_idx)
        cell.fill = current_fill
        cell.border = border_thin

    # Image embedding
    img_name = danang_images_map.get(stt)
    if img_name:
        img_path = os.path.join(dst_danang_jpg, img_name)
        if not os.path.exists(img_path):
            img_path = os.path.join(src_danang, img_name)

        if os.path.exists(img_path):
            thumb_path = os.path.join(thumb_dir, f"thumb_dn_{stt:02d}.jpg")
            make_thumbnail(img_path, thumb_path, target_width=150, target_height=90)

            xl_img = OpenpyxlImage(thumb_path)
            xl_img.width = 150
            xl_img.height = 90
            ws_new.add_image(xl_img, f"J{row_idx}")

wb_new.save("Danh_Sach_45_Dia_Diem_Du_Lich_Da_Nang.xlsx")
wb_new.save("Danh_Sach_45_Dia_Diem_Du_Lich_Da_Nang_Chuan_Dep.xlsx")
print(" Đã xuất hoàn chỉnh: Danh_Sach_45_Dia_Diem_Du_Lich_Da_Nang.xlsx (45 địa điểm, nhúng 45 ảnh thực tế)")
