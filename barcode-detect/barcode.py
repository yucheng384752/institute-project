import cv2
import numpy as np
from PIL import ImageFont, ImageDraw, Image
from pyzbar.pyzbar import decode


img = cv2.imread("barcode-detect\\20250515_215742.jpg")

def putText(x, y, text, color=(0, 0, 0)):
    
    fontpath = "C:/Windows/Fonts/msjh.ttc"  # 微軟正黑體
    font = ImageFont.truetype(fontpath, 20)
    img_pil = Image.fromarray(img)
    draw = ImageDraw.Draw(img_pil)
    draw.text((x, y), text, fill=color, font=font)
    return np.array(img_pil)
barcodes = decode(Image.fromarray(img))

if barcodes:
    for i, barcode in enumerate(barcodes):
        x, y, w, h = barcode.rect
        data = barcode.data.decode('utf-8')

        # 防止座標超出邊界
        x1 = max(x - w, 0)
        y1 = max(y - h, 0)
        x2 = min(x + 2 * w, img.shape[1])
        y2 = min(y + 2 * h, img.shape[0])

        # 裁切原圖範圍
        img_change = img[y1:y2, x1:x2].copy()

        # 將條碼編號繪製在裁切圖左上角
        img_change = putText(img_change, 10, 10, data, color=(0, 0, 255))

        # 顯示並儲存裁切圖片
        cv2.imshow(f'barcode_{i}', img_change)
        cv2.imwrite(f'barcode_crop_{i}.jpg', img_change)
    
cv2.imshow('audio1', img_change)
cv2.waitKey(0)
cv2.destroyAllWindows()