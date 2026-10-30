import urllib.request
import urllib.parse
import json
import os
import time
from PIL import Image as PILImage

wiki_queries = [
    (18, "18_Bai_bien_Xuan_Thieu.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Da_Nang_Bay_view_from_Hai_Van_Pass.jpg/800px-Da_Nang_Bay_view_from_Hai_Van_Pass.jpg"),
    (22, "22_Lang_da_my_nghe_Non_Nuoc.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Sculpture_Non_Nuoc_Da_Nang.jpg/800px-Sculpture_Non_Nuoc_Da_Nang.jpg"),
    (24, "24_Bao_tang_Da_Nang_Thanh_Dien_Hai.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Thanh_Dien_Hai_Da_Nang.jpg/800px-Thanh_Dien_Hai_Da_Nang.jpg"),
    (25, "25_Bao_tang_My_thuat_Da_Nang.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Da_Nang_Fine_Arts_Museum.jpg/800px-Da_Nang_Fine_Arts_Museum.jpg"),
    (26, "26_Nha_tho_Chinh_Toa_Con_Ga_Da_Nang.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Da_Nang_Cathedral_2019.jpg/800px-Da_Nang_Cathedral_2019.jpg"),
    (27, "27_Chua_Tam_Thai_Ngu_Hanh_Son.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Chua_Tam_Thai_Marble_Mountains.jpg/800px-Chua_Tam_Thai_Marble_Mountains.jpg"),
    (28, "28_Lang_co_Phong_Nam.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Phong_Nam_Village_Gate_Da_Nang.jpg/800px-Phong_Nam_Village_Gate_Da_Nang.jpg"),
    (29, "29_Deo_Hai_Van_Quan.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Hai_Van_Pass_Gate.jpg/800px-Hai_Van_Pass_Gate.jpg"),
    (31, "31_Ran_Nam_O_Reu_Xanh.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Ran_Nam_O_Da_Nang_Green_Moss.jpg/800px-Ran_Nam_O_Da_Nang_Green_Moss.jpg"),
    (32, "32_Ho_Hoa_Trung.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Hoa_Trung_Lake_Da_Nang.jpg/800px-Hoa_Trung_Lake_Da_Nang.jpg"),
    (34, "34_Gieng_Troi_Da_Nang.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Gieng_Troi_Waterfall_Da_Nang.jpg/800px-Gieng_Troi_Waterfall_Da_Nang.jpg"),
    (35, "35_Nui_Than_Tai_Hot_Springs.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Nui_Than_Tai_Hot_Spring_Park.jpg/800px-Nui_Than_Tai_Hot_Spring_Park.jpg"),
    (36, "36_KDL_Hoa_Phu_Thanh.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Hoa_Phu_Thanh_Rafting_Da_Nang.jpg/800px-Hoa_Phu_Thanh_Rafting_Da_Nang.jpg"),
    (37, "37_Suoi_Mo_Da_Nang.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Suoi_Mo_Da_Nang_Stream.jpg/800px-Suoi_Mo_Da_Nang_Stream.jpg"),
    (38, "38_Cho_Con_Da_Nang.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Cho_Con_Market_Food_Court.jpg/800px-Cho_Con_Market_Food_Court.jpg"),
    (39, "39_Cho_Han_Da_Nang.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Han_Market_Da_Nang_Entrance.jpg/800px-Han_Market_Da_Nang_Entrance.jpg"),
    (40, "40_Cho_dem_Son_Tra.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Son_Tra_Night_Market_Street.jpg/800px-Son_Tra_Night_Market_Street.jpg"),
    (41, "41_Cho_dem_Helio_Center.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Helio_Night_Market_Da_Nang.jpg/800px-Helio_Night_Market_Da_Nang.jpg"),
    (43, "43_Cung_Van_hoa_Thieu_nhi_Da_Nang.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Da_Nang_Children_Cultural_Palace.jpg/800px-Da_Nang_Children_Cultural_Palace.jpg"),
    (44, "44_Du_thuyen_Song_Han.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Han_River_Bridge_night_view.jpg/800px-Han_River_Bridge_night_view.jpg"),
    (45, "45_Lang_bich_hoa_Man_Thai.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Man_Thai_Mural_Village_Fishing_Net.jpg/800px-Man_Thai_Mural_Village_Fishing_Net.jpg")
]

def search_via_wiki_api(title):
    params = {
        'action': 'query',
        'titles': title,
        'prop': 'pageimages',
        'format': 'json',
        'pithumbsize': 800
    }
    url = 'https://vi.wikipedia.org/w/api.php?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={'User-Agent': 'VilocaTravelBot/1.0 (travel@viloca.vn)'})
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            data = json.loads(res.read().decode('utf-8'))
            pages = data.get('query', {}).get('pages', {})
            for p in pages.values():
                if 'thumbnail' in p:
                    return p['thumbnail']['source']
    except Exception as e:
        pass
    return None

print("Fetching via Wikipedia API with safe intervals...")
for stt, fn, direct_url in wiki_queries:
    dst = os.path.join('danang_jpg', fn)
    if os.path.exists(dst):
        continue

    # Try direct or fallback
    time.sleep(1.0) # avoid 429
    req = urllib.request.Request(direct_url, headers={'User-Agent': 'VilocaTravelApp/1.0 (info@viloca.vn; contact@viloca.vn)'})
    try:
        with urllib.request.urlopen(req, timeout=10) as res, open(os.path.join('danang', fn), 'wb') as f:
            f.write(res.read())
        with PILImage.open(os.path.join('danang', fn)) as im:
            im.convert('RGB').save(dst, 'JPEG', quality=95)
        print(f"[{stt:02d}] Saved {fn}")
    except Exception as e:
        # Fallback: create placeholder or copy existing high quality relevant image
        print(f"[{stt:02d}] Error for {fn}: {e}")

print("Done fetching!")
