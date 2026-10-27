import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

new_files = [
    "vietgoing_mfj2112173210.webp",
    "xe-buyt-song-sai-gon.jpg",
    "cau-ba-son-thiet-ke-1736564498.jpg",
    "cho-hoa-Ho-Thi-Ky-5.jpg",
    "edit_photo_tbsuvufcrk-1778660399.webp",
    "images.jfif",
    "images (1).jfif",
    "HON-SEN-KHO-02-min.jpg",
    "cau-anh-sao-2.jpg",
    "dia-dao-cu-chi-850.jpeg",
    "5352_Rung-ngap-man-Can-Gio-1-800x494.jpg"
]

for fn in new_files:
    fp = os.path.join('tphcm', fn)
    if os.path.exists(fp):
        with Image.open(fp) as im:
            print(f"File: {fn:40s} | Format: {im.format:6s} | Size: {im.size} | Mode: {im.mode}")
