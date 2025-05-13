import cv2
import numpy as np
from segment_anything import SamPredictor, sam_model_registry
import torch

#背景去除
backsub = cv2.createBackgroundSubtractorMOG2(history = 75, varThreshold = 16, detectShadows = False)

# 設定 SimpleBlobDetector 參數
params = cv2.SimpleBlobDetector_Params()
params.filterByArea = True
params.minArea = 400
params.maxArea = 7000
params.filterByCircularity = True
params.minCircularity = 0.6
params.filterByConvexity = False
params.filterByInertia = False
params.filterByColor = True
params.blobColor = 255
    
if __name__ == '__main__':
    #read video
    video = cv2.VideoCapture(r"C:\Users\Yucheng\Desktop\institute\program\topic1\example.mp4")
    if not video.isOpened():
        print('no frame')

    #建立偵測器
    detector = cv2.SimpleBlobDetector_create(params)

    while True:
        ret, frame = video.read()
        
        #if false to read video
        if not ret:
            print('no frame')
            break    
        
        fgMask = backsub.apply(frame)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5,5))
        # fgMask = cv2.morphologyEx(fgMask, cv2.MORPH_OPEN, kernel, iterations=1)
        # fgMask = cv2.morphologyEx(fgMask, cv2.MORPH_CLOSE, kernel, iterations=2)
        
        # 偵測 blobs
        gray = cv2.cvtColor(frame, cv2.COLOR_BGRA2GRAY)
        gray_clean = cv2.bitwise_and(gray, fgMask)
        blur = cv2.GaussianBlur(gray_clean, (7, 7), 1.5)
        threshold = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 17, 2)
        
        #canny
        edges = cv2.Canny(blur, 50, 150, 3)
        
        #blob
        keypoints = detector.detect(threshold)
        # edges_fg = cv2.bitwise_and(edges, fgMask)
        
        # 畫出偵測結果
        drawkeypoints = cv2.drawKeypoints(
            frame, keypoints, None,
            (0, 0, 255),
            cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS
        )

        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        for contour in contours:
            area = cv2.contourArea(contour)
            if 300 < area < 7000:  #控制硬幣大小範圍
                x, y, w, h = cv2.boundingRect(contour)
                center_x, center_y = x + w // 2, y + h // 2

                #繪製框與座標處理
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
                cv2.putText(frame, f"{center_x}, {center_y}", (x, y -10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

        
        cv2.imshow('studio1', drawkeypoints)
        # cv2.imshow('studio2', gray)
        # cv2.imshow('studio3', edges)
        cv2.imshow('studio4', frame)
        
        if cv2.waitKey(1) == ord('q'):
            break
    
video.release()
cv2.destroyAllWindows()
    