import openpyxl
import sys

sys.stdout.reconfigure(encoding='utf-8')

wb = openpyxl.load_workbook('Danh_Sach_45_Dia_Diem_Du_Lich_Da_Nang_Chuan_Dep.xlsx')
ws = wb.active

print("Sheet name:", ws.title)
print("Images count:", len(ws._images))

for idx, img in enumerate(ws._images[:10]):
    print(f"Img {idx+1}: size=({img.width}x{img.height}), cell=({img.anchor._from.row+1}, {img.anchor._from.col+1})")
