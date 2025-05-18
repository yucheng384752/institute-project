import cv2
import numpy as np
from PIL import ImageFont, ImageDraw, Image
from pyzbar.pyzbar import decode
from pathlib import Path

#讀取圖片
img = cv2.imread("barcode-detect\\20250515_215742.jpg")

#前處理(灰階，去雜訊，二值化，增強對比)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
blur = cv2.GaussianBlur(gray, (3, 3), 0)
thresh = cv2.adaptiveThreshold (
    blur, 255,
    cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv2.THRESH_BINARY, 11, 2)
enhanced = cv2.equalizeHist(thresh)

#ZBar解碼
barcodes =decode(Image.fromarray(enhanced))

if barcodes:
    for barcode in barcodes:
        x, y, w, h = barcode.rect
        data = barcode.data.decode('utf-8')
        cv2.rectangle(img, (x,y), (x+w, y+h), (0,0,255), 2)
        cv2.putText(img, data, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        print('result:', data)
else:
    print('no barcode')
    
cv2.imshow('enhanced detection', img)
cv2.waitKey(0)
cv2.destroyAllWindows()