import cv2
import numpy

#建立背景建模(MOG2)
backsub = cv2.createBackgroundSubtractorMOG2(history = 100, varThreshold = 50, detectShadows = False)

cap = cv2.VideoCapture("topic1\example.mp4")

while True:
    #讀取影片
    ret, frame = cap.read()
    if not ret:
        print("no frame")
        break

    #背景建模應用
    fgMask = backsub.apply(frame)

    #灰階
    # gray = cv2.cvtColor(fgMask, cv2.COLOR_BGR2GRAY)

    #使用高斯模糊，降低雜訊
    blur = cv2.GaussianBlur(fgMask, (25, 25), 0)

    #高斯平均值二值化
    blur = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 21, 2)

    #找輪廓
    contours, hierarchy = cv2.findContours(blur, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)  #contours , hierarchy 為cv2.findContours() 的回傳值，contours(list of points)，hierarchy(階層資訊)

    for contour in contours:
        area = cv2.contourArea(contour)
        if 300 < area < 5000:  #控制硬幣大小範圍
            x, y, w, h = cv2.boundingRect(contour)
            center_x, center_y = x + w // 2, y + h // 2

            #繪製框與座標處理
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
            cv2.putText(frame, f"{center_x}, {center_y}", (x, y -10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

    cv2.imshow('studio1', frame)
    if cv2.waitKey(1) == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

#參考資料
#https://steam.oxxostudio.tw/category/python/
#https://ithelp.ithome.com.tw/articles/10346521
#https://steam.oxxostudio.tw/category/python/ai/ai-multi-tracker.html
#https://medium.com/@usengjake/%E7%B0%A1%E6%98%93%E9%9B%B6%E9%8C%A2%E5%88%86%E9%A1%9E%E7%A8%8B%E5%BC%8F-8c8e014b80de
#https://blog.csdn.net/qq_42451251/article/details/108056501
#https://github.com/facebookresearch/segment-anything?tab=readme-ov-file
#https://www.youtube.com/watch?v=XZ3PNnA9NbU