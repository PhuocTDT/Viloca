import os, sys, shutil
from PIL import Image
import openpyxl
from openpyxl.drawing.image import Image as OpenpyxlImage

sys.stdout.reconfigure(encoding='utf-8')

DANANG_DIR = 'd:/Desktop/Viloca/danang'
DANANG_JPG_DIR = 'd:/Desktop/Viloca/danang_jpg'
THUMBS_DIR = 'd:/Desktop/Viloca/danang_thumbs'
EXCEL_PATH = 'd:/Desktop/Viloca/Danh_Sach_45_Dia_Diem_Du_Lich_Da_Nang_Chuan_Dep.xlsx'

os.makedirs(DANANG_JPG_DIR, exist_ok=True)
os.makedirs(THUMBS_DIR, exist_ok=True)

# Define mapping for all 28 spots in the file:
# (row_index, stt, display_name, primary_raw_file, extra_raw_files)
SPOT_MAPPINGS = [
    {
        "stt": 1,
        "clean_name": "01_Cau_Rong",
        "primary": "03 TWN_5025 Dragon Bridge (Cầu Rồng) @ Da Nang in Vietnam.JPG",
        "extras": ["Cau-Rong-Da-Nang-ve-dem-Anh-Suu-tam.png", "Rong-pa2-01.jpg"]
    },
    {
        "stt": 2,
        "clean_name": "02_Cau_Song_Han",
        "primary": "Cau-quay-song-Han-toa-lac-tai-vi-tri-trung-tam-thanh-pho-Da-Nang-suu-tam.jpg",
        "extras": ["sm_cau_song_han_quay_luc_may_gio_07c8b89ce8.jpg"]
    },
    {
        "stt": 3,
        "clean_name": "03_Cau_Vang_Sun_World_Ba_Na_Hills",
        "primary": "1-cau-vang-da-nang-thuoc-sun-world-ba-na-hills.png",
        "extras": ["unnamed.jpg", "sun-world-ba-na-hills-0.jpg", "images.jfif"]
    },
    {
        "stt": 4,
        "clean_name": "04_Cau_Tinh_Yeu_Tuong_Ca_Chep_Hoa_Rong",
        "primary": "cau-tinh-yeu-da-nang-1024x659.jpg",
        "extras": ["vietgoing_bzf2103034311.webp", "images (1).jfif"]
    },
    {
        "stt": 5,
        "clean_name": "05_Cau_Thuan_Phuoc",
        "primary": "cau-thuan-phuoc-9.jpg",
        "extras": ["8118104845_117d5577af_c.jpg", "cau-thuan-phuoc.jpg"]
    },
    {
        "stt": 6,
        "clean_name": "06_Cau_Tran_Thi_Ly",
        "primary": "cau-tran-thi-ly-da-nang-9_1634091275.webp",
        "extras": ["Cau-Tran-Thi-Ly-Da-Nang-e1504710544812.png"]
    },
    {
        "stt": 7,
        "clean_name": "07_Ban_dao_Son_Tra",
        "primary": "Ban-dao-son-tra.jpg",
        "extras": ["ban-dao-son-tra (1).jpg", "ban-dao-son-tra-da-nang.jpg"]
    },
    {
        "stt": 10,
        "clean_name": "10_Ghenh_Bang",
        "primary": "TEwgr89n-Ghenh-Bang-8-1024x640.jpg",
        "extras": ["ghenh-bang-11.webp", "duong-den-ghenh-bang-da-nang.png"]
    },
    {
        "stt": 11,
        "clean_name": "11_Hai_dang_Tien_Sa",
        "primary": "tien-sa-lighthouse-hue-private-taxi-1.webp",
        "extras": ["hai-dang-tien-sa-2.jpg", "hai_dang_tien_sa_da_nang_8.jpg"]
    },
    {
        "stt": 13,
        "clean_name": "13_Bai_But_Bai_Rang_Son_Tra",
        "primary": "bai-rang.jpg",
        "extras": ["bai-but-da-nang-01_1632404654.webp", "bai-rang-da-nang-2.jpg"]
    },
    {
        "stt": 14,
        "clean_name": "14_Mui_Nghe_Son_Tra",
        "primary": "Toan-canh-Mui-Nghe-Son-Tra-nhin-tu-tren-cao-thay-ro-cac-mom-da-vuon-ra-bien.webp",
        "extras": ["mui-nghe-lan-ngam-san-ho-1762702601.jpg", "binh-minh-mui-nghe.jpg"]
    },
    {
        "stt": 15,
        "clean_name": "15_Bai_bien_My_Khe",
        "primary": "bai-bien-my-khe-542bc385afcf9.jpg",
        "extras": ["Bien-My-Khe-buoi-chieu.png", "ee42c001-3480-4996-a8d7-eb227afcbc5b.webp"]
    },
    {
        "stt": 16,
        "clean_name": "16_Bai_bien_Non_Nuoc",
        "primary": "Bai-bien-Non-Nuoc-–-vi-sao-la-diem-den-hap-dan-o-Da-Nang-Anh-Suu-tam.webp",
        "extras": ["bai-bien-non-nuoc-da-nang-1.webp", "bai-bien-non-nuoc-3.webp"]
    },
    {
        "stt": 17,
        "clean_name": "17_Cong_vien_Bien_Dong_Bai_Pham_Van_Dong",
        "primary": "bien-pham-van-dong-1-1758555695.jpg",
        "extras": []
    },
    {
        "stt": 18,
        "clean_name": "18_Bai_Cat_Vang_Son_Tra",
        "primary": "Du-lich-bai-cat-vang-Da-Nang.jpg",
        "extras": []
    },
    {
        "stt": 19,
        "clean_name": "19_Danh_thang_Ngu_Hanh_Son",
        "primary": "8d012ea602ef44b58f7500acb677783c.webp",
        "extras": []
    },
    {
        "stt": 20,
        "clean_name": "20_Bao_tang_Da_Nang_Thanh_Dien_Hai",
        "primary": "thanh-dien-hai-da-nang-02-1024x576.jpg",
        "extras": []
    },
    {
        "stt": 21,
        "clean_name": "21_Bao_tang_My_thuat_Da_Nang",
        "primary": "vn-11134259-7r98o-lwdtk7lcx42h96@resize_ss640x400.jfif",
        "extras": []
    },
    {
        "stt": 22,
        "clean_name": "22_Nha_tho_Chinh_Toa_Da_Nang",
        "primary": "Nha_Tho_Chinh_Toa_Da_Nang.jpg",
        "extras": []
    },
    {
        "stt": 23,
        "clean_name": "23_Deo_Hai_Van_Di_tich_Hai_Van_Quan",
        "primary": "deo-hai-van-2.webp",
        "extras": []
    },
    {
        "stt": 24,
        "clean_name": "24_Ho_Hoa_Trung",
        "primary": "ho-hoa-trung-da-nang-06.jpg",
        "extras": []
    },
    {
        "stt": 25,
        "clean_name": "25_Gieng_Troi_Da_Nang",
        "primary": "gieng-troi-da-nang-thumb-1-1.jpg",
        "extras": []
    },
    {
        "stt": 26,
        "clean_name": "26_Suoi_khoang_nong_Nui_Than_Tai",
        "primary": "suoi-khoang-nong.jpg",
        "extras": []
    },
    {
        "stt": 27,
        "clean_name": "27_Suoi_Mo_Da_Nang",
        "primary": "suoi-mo-da-nang-1.jpg",
        "extras": []
    },
    {
        "stt": 28,
        "clean_name": "28_Cho_Con",
        "primary": "cho-con-market-2_1662731910.jpg",
        "extras": []
    },
    {
        "stt": 29,
        "clean_name": "29_Cho_dem_Helio_Helio_Center",
        "primary": "cho-dem-helio-1_1637246454.webp",
        "extras": []
    },
    {
        "stt": 30,
        "clean_name": "30_Cong_vien_Vuon_tuong_APEC",
        "primary": "cong-vien-apec-1.jpg",
        "extras": []
    },
    {
        "stt": 31,
        "clean_name": "31_Cung_Van_hoa_Thieu_nhi_Da_Nang",
        "primary": "cung-van-hoa-thieu-nhi-da-nang.jpg",
        "extras": []
    },
]

def convert_to_jpg(src_path, dst_path):
    try:
        with Image.open(src_path) as img:
            if img.mode in ('RGBA', 'LA', 'P'):
                rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                rgb_img.paste(img, mask=img.split()[3] if len(img.split()) > 3 else None)
                rgb_img.save(dst_path, 'JPEG', quality=95)
            else:
                img.convert('RGB').save(dst_path, 'JPEG', quality=95)
        return True
    except Exception as e:
        print(f"Error converting {src_path}: {e}")
        return False

def make_thumbnail(src_path, dst_thumb_path, target_size=(150, 90)):
    try:
        with Image.open(src_path) as img:
            img = img.convert('RGB')
            # Aspect fill & center crop
            src_w, src_h = img.size
            tgt_w, tgt_h = target_size
            src_aspect = src_w / src_h
            tgt_aspect = tgt_w / tgt_h

            if src_aspect > tgt_aspect:
                # Wider: scale by height, crop sides
                new_h = tgt_h
                new_w = int(src_w * (tgt_h / src_h))
                img_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                left = (new_w - tgt_w) // 2
                img_cropped = img_resized.crop((left, 0, left + tgt_w, tgt_h))
            else:
                # Taller: scale by width, crop top/bottom
                new_w = tgt_w
                new_h = int(src_h * (tgt_w / src_w))
                img_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                top = (new_h - tgt_h) // 2
                img_cropped = img_resized.crop((0, top, tgt_w, top + tgt_h))

            img_cropped.save(dst_thumb_path, 'JPEG', quality=92)
        return True
    except Exception as e:
        print(f"Error making thumb for {src_path}: {e}")
        return False

print("=== BẮT ĐẦU CHUYỂN ĐỔI & ĐỔI TÊN ẢNH THEO THỨ TỰ ===")

primary_thumbs = {}

for item in SPOT_MAPPINGS:
    stt = item["stt"]
    clean_name = item["clean_name"]
    primary_src = os.path.join(DANANG_DIR, item["primary"])
    primary_dst = os.path.join(DANANG_JPG_DIR, f"{clean_name}.jpg")
    thumb_dst = os.path.join(THUMBS_DIR, f"{clean_name}_thumb.jpg")

    if os.path.exists(primary_src):
        convert_to_jpg(primary_src, primary_dst)
        make_thumbnail(primary_dst, thumb_dst)
        primary_thumbs[stt] = thumb_dst
        print(f"[{stt:02d}] Đã xử lý ảnh chính: {item['primary']} -> {clean_name}.jpg")
    else:
        print(f"[{stt:02d}] CẢNH BÁO: Không tìm thấy file {primary_src}")

    # Process extra images if any
    for idx, extra_f in enumerate(item["extras"], 2):
        extra_src = os.path.join(DANANG_DIR, extra_f)
        extra_dst = os.path.join(DANANG_JPG_DIR, f"{clean_name}_{idx}.jpg")
        if os.path.exists(extra_src):
            convert_to_jpg(extra_src, extra_dst)
            print(f"     Ảnh phụ {idx}: {extra_f} -> {clean_name}_{idx}.jpg")

print(f"\nTổng số ảnh đại diện đã tạo thumbnail: {len(primary_thumbs)}/28")

print("\n=== BẮT ĐẦU CHÈN ẢNH VÀO FILE EXCEL CHUẨN ===")
wb = openpyxl.load_workbook(EXCEL_PATH)
ws = wb.active

# Clear any previous images in openpyxl sheet
ws._images.clear()

# Find row mapping in Excel sheet
row_for_stt = {}
for r in range(4, ws.max_row + 1):
    val = ws.cell(r, 1).value
    if val is not None:
        try:
            val_int = int(val)
            row_for_stt[val_int] = r
        except:
            pass

print(f"Tìm thấy các hàng STT trong Excel: {sorted(row_for_stt.keys())}")

inserted_count = 0
for stt, thumb_path in primary_thumbs.items():
    if stt in row_for_stt and os.path.exists(thumb_path):
        row_idx = row_for_stt[stt]
        img = OpenpyxlImage(thumb_path)
        img.width = 150
        img.height = 90
        # Position image at column J (column 10)
        cell_ref = f"J{row_idx}"
        ws.add_image(img, cell_ref)
        ws.row_dimensions[row_idx].height = 82
        inserted_count += 1
        print(f"Đã chèn ảnh STT {stt:02d} vào ô {cell_ref} (Hàng {row_idx})")

# Ensure column J width is appropriate
ws.column_dimensions['J'].width = 24

wb.save(EXCEL_PATH)
print(f"\n=> Đã cập nhật thành công file: {EXCEL_PATH}")
print(f"=> Tổng cộng {inserted_count} ảnh thực tế đã được nhúng chính xác 100%!")
