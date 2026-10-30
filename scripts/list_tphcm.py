import os
import sys
import datetime

sys.stdout.reconfigure(encoding='utf-8')

target_dirs = []
for root, dirs, files in os.walk('.'):
    # skip .git, node_modules
    if '.git' in root or 'node_modules' in root:
        continue
    for d in dirs:
        if d.lower() in ['tphcm', 'tp.hcm', 'tp_hcm', 'saigon', 'sai gon', 'sai_gon']:
            target_dirs.append(os.path.join(root, d))

print(f"Discovered target directories: {target_dirs}")

tphcm_path = 'tphcm' if os.path.exists('tphcm') else (target_dirs[0] if target_dirs else None)

if tphcm_path and os.path.exists(tphcm_path):
    print(f"\n--- Checking directory: {tphcm_path} ---")
    entries = []
    for f in os.listdir(tphcm_path):
        fp = os.path.join(tphcm_path, f)
        if os.path.isfile(fp):
            stat = os.stat(fp)
            ctime = datetime.datetime.fromtimestamp(stat.st_ctime) # Windows creation time (download time)
            mtime = datetime.datetime.fromtimestamp(stat.st_mtime) # Modification time
            entries.append({
                'name': f,
                'path': fp,
                'size_kb': stat.st_size / 1024,
                'ctime': ctime,
                'mtime': mtime,
                'ctime_str': ctime.strftime('%Y-%m-%d %H:%M:%S'),
                'mtime_str': mtime.strftime('%Y-%m-%d %H:%M:%S')
            })

    # Sort by ctime (creation / download time on Windows) ascending
    entries_by_ctime = sorted(entries, key=lambda x: x['ctime'])
    print(f"\nTotal files: {len(entries_by_ctime)}")
    print("\n=== Danh sách file theo thứ tự thời gian tải về (Creation Time / Download Time) ===")
    for i, e in enumerate(entries_by_ctime, 1):
        print(f"{i:2d}. [{e['ctime_str']}] {e['name']} ({e['size_kb']:.1f} KB)")

    print("\n=== Danh sách file theo Modification Time (nếu khác Creation Time) ===")
    entries_by_mtime = sorted(entries, key=lambda x: x['mtime'])
    for i, e in enumerate(entries_by_mtime, 1):
        print(f"{i:2d}. [{e['mtime_str']}] {e['name']} ({e['size_kb']:.1f} KB)")
else:
    print("Folder tphcm does not exist yet.")
