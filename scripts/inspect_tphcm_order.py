import os
import sys
import datetime

sys.stdout.reconfigure(encoding='utf-8')

folder = 'tphcm'
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
            'mtime': mtime,
            'ctime_str': ctime.strftime('%Y-%m-%d %H:%M:%S'),
            'mtime_str': mtime.strftime('%Y-%m-%d %H:%M:%S')
        })

# Sort by ctime ascending
files_by_ctime = sorted(files, key=lambda x: x['ctime'])

print(f"=== TOTAL FILES IN {folder}/: {len(files_by_ctime)} ===")
for i, item in enumerate(files_by_ctime, 1):
    sz = item['size']
    sz_str = f"{sz/(1024*1024):.2f} MB" if sz >= 1024*1024 else f"{sz/1024:.1f} KB"
    print(f"{i:2d}. [{item['ctime_str']}] {item['name']} ({sz_str})")
