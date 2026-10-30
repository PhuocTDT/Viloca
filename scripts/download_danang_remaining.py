import urllib.request
import urllib.parse
import json
import os
import time
from PIL import Image as PILImage

queries = [
    (18, "18_Bai_bien_Xuan_Thieu.jpg", "Xuan Thieu Beach Da Nang"),
    (22, "22_Lang_da_my_nghe_Non_Nuoc.jpg", "Non Nuoc sculpture village"),
    (24, "24_Bao_tang_Da_Nang_Thanh_Dien_Hai.jpg", "Dien Hai Citadel"),
    (25, "25_Bao_tang_My_thuat_Da_Nang.jpg", "Da Nang Fine Arts Museum"),
    (26, "26_Nha_tho_Chinh_Toa_Con_Ga_Da_Nang.jpg", "Da Nang Cathedral"),
    (27, "27_Chua_Tam_Thai_Ngu_Hanh_Son.jpg", "Tam Thai Pagoda"),
    (28, "28_Lang_co_Phong_Nam.jpg", "Phong Nam village"),
    (29, "29_Deo_Hai_Van_Quan.jpg", "Hai Van Pass"),
    (31, "31_Ran_Nam_O_Reu_Xanh.jpg", "Nam O Da Nang"),
    (32, "32_Ho_Hoa_Trung.jpg", "Hoa Trung Da Nang"),
    (34, "34_Gieng_Troi_Da_Nang.jpg", "Gieng Troi Da Nang"),
    (35, "35_Nui_Than_Tai_Hot_Springs.jpg", "Nui Than Tai Da Nang"),
    (36, "36_KDL_Hoa_Phu_Thanh.jpg", "Hoa Phu Thanh"),
    (37, "37_Suoi_Mo_Da_Nang.jpg", "Suoi Mo Da Nang"),
    (38, "38_Cho_Con_Da_Nang.jpg", "Con Market Da Nang"),
    (39, "39_Cho_Han_Da_Nang.jpg", "Han Market Da Nang"),
    (40, "40_Cho_dem_Son_Tra.jpg", "Son Tra night market"),
    (41, "41_Cho_dem_Helio_Center.jpg", "Helio Center Da Nang"),
    (43, "43_Cung_Van_hoa_Thieu_nhi_Da_Nang.jpg", "Da Nang Children Palace"),
    (44, "44_Du_thuyen_Song_Han.jpg", "Han River Bridge Da Nang"),
    (45, "45_Lang_bich_hoa_Man_Thai.jpg", "Man Thai Da Nang")
]

def search_original_url(q):
    params = {
        'action': 'query',
        'generator': 'search',
        'gsrsearch': q,
        'gsrnamespace': 6,
        'gsrlimit': 3,
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
        print(f"Error searching {q}: {e}")
    return None

for stt, fn, q in queries:
    dst = os.path.join('danang_jpg', fn)
    if os.path.exists(dst):
        continue

    time.sleep(2.0)
    url = search_original_url(q)
    if not url:
        url = search_original_url(q.split()[0] + " Da Nang")

    if url:
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'VilocaTravelBot/1.0 (contact@viloca.vn)'})
            with urllib.request.urlopen(req, timeout=15) as res, open(os.path.join('danang', fn), 'wb') as f:
                f.write(res.read())
            with PILImage.open(os.path.join('danang', fn)) as im:
                im.convert('RGB').save(dst, 'JPEG', quality=95)
            print(f"[{stt:02d}] Success: {fn}")
        except Exception as e:
            print(f"[{stt:02d}] Download error for {fn}: {e}")
    else:
        print(f"[{stt:02d}] No image found for {q}")

print("All queries completed!")
