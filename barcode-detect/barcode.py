import cv2
import numpy as np
from PIL import ImageFont, ImageDraw, Image
from pyzbar.pyzbar import decode, ZBarSymbol
from pathlib import Path
import requests
from bs4 import BeautifulSoup

def barcodescan(img):
    # 檢查 ISBN-13 是否有效
    def is_valid_isbn13(code):
        if len(code) != 13 or not code.isdigit():
            return False
        total = sum((int(d) * (1 if i % 2 == 0 else 3)) for i, d in enumerate(code[:12]))
        check = (10 - total % 10) % 10
        return check == int(code[-1])


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
        
    return code if found_isbn else None



# 圖片載入
img_path = "barcode-detect\\20250518_161452.jpg"
img = cv2.imread(img_path)
if img is not None:
    isbn = barcodescan(img)
    print("書籍isbn：", isbn)
else:
    print("圖片載入失敗，請確認路徑")