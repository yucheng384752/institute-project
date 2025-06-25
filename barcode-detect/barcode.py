import cv2
from pyzbar.pyzbar import decode
import json

def scan_qr_code_from_webcam():
    """
    使用網路攝影機掃描QR Code，並將其內容解析為JSON格式顯示。
    """
    # 嘗試開啟預設的網路攝影機 (通常是0，如果有多個攝影機可以嘗試1, 2等)
    cap = cv2.VideoCapture(0)

    # 檢查攝影機是否成功開啟
    if not cap.isOpened():
        print("錯誤：無法開啟網路攝影機。請確認攝影機已連接且沒有被其他應用程式佔用。")
        return

    print("已開啟網路攝影機。請將QR Code置於攝影機前。")
    print("按下 'q' 鍵可退出。")

    detected_qr_code_data = None # 用於儲存掃描到的QR Code內容

    while True:
        # 逐幀讀取影像
        ret, frame = cap.read()

        if not ret:
            print("無法從攝影機讀取幀。")
            break

        # 將彩色影像轉換為灰度影像，pyzbar在灰度影像上工作得更好
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # 掃描灰度影像中的所有條碼/QR Code
        decoded_objects = decode(gray)

        if decoded_objects:
            for obj in decoded_objects:
                qr_data_raw = obj.data.decode('utf-8')
                
                # 如果是新的或不同的QR Code內容，則處理並顯示
                if qr_data_raw != detected_qr_code_data:
                    detected_qr_code_data = qr_data_raw
                    print(f"\n--- 掃描到新的QR Code ---")
                    print(f"原始QR Code內容:\n{qr_data_raw}\n")

                    # 解析原始字串為字典
                    parsed_data = {}
                    lines = qr_data_raw.split('\n')
                    for line in lines:
                        if ':' in line:
                            key, value = line.split(':', 1)
                            parsed_data[key.strip()] = value.strip()
                    
                    # 將字典轉換為JSON格式
                    # 如果QR Code內容只有ISBN，就直接以ISBN作為值
                    if "ISBN: " in qr_data_raw and len(lines) == 1:
                         isbn_value = qr_data_raw.replace("ISBN: ", "").strip()
                         json_output = json.dumps({"ISBN": isbn_value}, indent=4, ensure_ascii=False)
                    elif parsed_data: # 檢查是否成功解析出鍵值對
                        json_output = json.dumps(parsed_data, indent=4, ensure_ascii=False)
                    else: # 如果無法解析為鍵值對，直接將原始內容作為一個值
                        json_output = json.dumps({"content": qr_data_raw}, indent=4, ensure_ascii=False)

                    print("QR Code內容 (JSON格式):")
                    print(json_output)
                    print("-------------------------\n")

                # 在QR Code周圍繪製邊框 (可選，用於視覺化)
                (x, y, w, h) = obj.rect
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2) # 綠色框

        # 顯示影像幀
        cv2.imshow('QR Code Scanner', frame)

        # 按下 'q' 鍵退出循環
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # 釋放攝影機資源
    cap.release()
    # 關閉所有OpenCV視窗
    cv2.destroyAllWindows()
    print("程式已結束。")

if __name__ == "__main__":
    scan_qr_code_from_webcam()