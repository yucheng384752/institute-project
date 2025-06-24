from PIL import Image
from pyzbar.pyzbar import decode
import json
import qrcode

def generate_book_qrcode(book_data, filename="book_qrcode.png"):
    """
    Generates a QR code from book information.

    Args:
        book_data (dict): A dictionary containing book details.
        filename (str): The name of the output QR code image file.
    """
    qr_string = f"書名: {book_data['title']}\n" \
                f"作者: {book_data['author']}\n" \
                f"ISBN: {book_data['isbn']}\n" \
                f"分類: {book_data['category']}\n" \
                f"狀態: {book_data['status']}"

    # Create QR code instance
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_string)
    qr.make(fit=True)

    # Create an image from the QR Code instance
    img = qr.make_image(fill_color="black", back_color="white")

    # Save the image
    img.save(filename)
    print(f"QR code saved as {filename}")

def scan_qr_code_and_display_json(image_path):
    """
    掃描指定圖片中的QR Code，並將其內容解析為JSON格式顯示。

    Args:
        image_path (str): QR Code圖片的路徑。
    """
    try:
        # 開啟圖片
        img = Image.open(image_path)

        # 掃描圖片中的所有條碼/QR Code
        decoded_objects = decode(img)

        if not decoded_objects:
            print(f"在圖片 '{image_path}' 中找不到任何QR Code。")
            return

        for obj in decoded_objects:
            # 取得解碼後的資料，通常是bytes，需要解碼成字串
            qr_data_raw = obj.data.decode('utf-8')
            print(f"掃描到的原始QR Code內容:\n{qr_data_raw}\n")

            # 將原始字串解析為字典
            # 這裡需要根據原始QR Code內容的格式進行解析
            # 由於我們上次是使用 "鍵: 值" 的格式，這裡我們手動解析
            parsed_data = {}
            lines = qr_data_raw.split('\n')
            for line in lines:
                if ':' in line:
                    key, value = line.split(':', 1) # 只在第一個冒號處分割
                    parsed_data[key.strip()] = value.strip()
            
            # 將字典轉換為JSON格式
            json_output = json.dumps(parsed_data, indent=4, ensure_ascii=False)
            
            print("QR Code內容 (JSON格式):")
            print(json_output)

    except FileNotFoundError:
        print(f"錯誤：找不到圖片檔案 '{image_path}'。請確認路徑是否正確。")
    except Exception as e:
        print(f"發生錯誤：{e}")

# if __name__ == "__main__":
#     # 指定上次生成的QR Code圖片路徑
#     qr_code_image_path = "react_book_info_qrcode.png"
#     scan_qr_code_and_display_json(qr_code_image_path)
    
if __name__ == "__main__":
    book_info = {
        "title": "React 思維進化",
        "author": "周晃安 (Zet)",
        "isbn": "978-626-333-769-5",
        "category": "電腦",
        "status": "可借閱"
    }
    
    generate_book_qrcode(book_info, "react_book_info_qrcode.png")
    
    # 指定上次生成的QR Code圖片路徑
    qr_code_image_path = "react_book_info_qrcode.png"
    scan_qr_code_and_display_json(qr_code_image_path)

    