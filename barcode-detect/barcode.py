import cv2
import numpy as np
from PIL import ImageFont, ImageDraw, Image
from pyzbar.pyzbar import decode, ZBarSymbol
from pathlib import Path

# 圖片載入
img_path = "barcode-detect\\20250518_161452.jpg"
img = cv2.imread(img_path)

# 檢查 ISBN-13 是否有效
def is_valid_isbn13(code):
    if len(code) != 13 or not code.isdigit():
        return False
    total = sum((int(d) * (1 if i % 2 == 0 else 3)) for i, d in enumerate(code[:12]))
    check = (10 - total % 10) % 10
    return check == int(code[-1])

# 顯示中文字
def putText(img, x, y, text, color=(0, 0, 255)):
    fontpath = "C:/Windows/Fonts/msjh.ttc"  # 微軟正黑體
    font = ImageFont.truetype(fontpath, 24)
    img_pil = Image.fromarray(img)
    draw = ImageDraw.Draw(img_pil)
    draw.text((x, y), text, font=font, fill=color)
    return np.array(img_pil)

# 條碼掃描
barcodes = decode(Image.fromarray(img), symbols=[ZBarSymbol.EAN13])

found_isbn = False

for barcode in barcodes:
    code = barcode.data.decode('utf-8')
    x, y, w, h = barcode.rect

    if is_valid_isbn13(code):
        found_isbn = True

        print("偵測到 ISBN 條碼：", code)
        break
    else:
        print("無效條碼或非 ISBN：", code)

if not found_isbn:
    print("沒有找到有效的 ISBN 條碼")


