import os
import sys
import datetime

sys.stdout.reconfigure(encoding='utf-8')

folder = 'tphcm'
if not os.path.exists(folder):
    print(f"Folder '{folder}' does not exist.")
    sys.exit(1)

files = []
for f in os.listdir(folder):
    fp = os.path.join(folder, f)
    if os.path.isfile(fp):
        stat = os.stat(fp)
        ctime = datetime.datetime.fromtimestamp(stat.st_ctime)
        mtime = datetime.datetime.fromtimestamp(stat.st_mtime)
        files.append({
            'name': f,
            'size': stat.st_size,
            'ctime': ctime,
            'mtime': mtime
        })

# Sắp xếp theo thứ tự thời gian tải về (Creation Time)
files_by_ctime = sorted(files, key=lambda x: x['ctime'])

print(f"=== TỔNG CỘNG: {len(files_by_ctime)} FILE TRONG THƯ MỤC tphcm/ ===")
print("Thứ tự sắp xếp theo THỜI GIAN TẢI VỀ (Creation Time / Sớm nhất -> Mới nhất):\n")

for idx, item in enumerate(files_by_ctime, 1):
    if item['size'] >= 1024 * 1024:
        sz_str = f"{item['size'] / (1024 * 1024):.2f} MB"
    else:
        sz_str = f"{item['size'] / 1024:.1f} KB"

    time_str = item['ctime'].strftime("%Y-%m-%d %H:%M:%S")
    print(f"{idx:2d}. [{time_str}] {item['name']} ({sz_str})")
