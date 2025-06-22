import cv2
import numpy as np

backsub = cv2.createBackgroundSubtractorMOG2(history = 100, varThreshold = 50, detectShadows = False)

if __name__ == '__main__':
    
    #影片讀取
    video = cv2.VideoCapture(r"C:\Users\Yucheng\Desktop\institute\program\topic1\example.mp4")
    if not video.isOpened():
        print('no frame')
        
    #輸出影片參數設定
    fps = video.get(cv2.CAP_PROP_FPS)
    width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fourcc =  cv2.VideoWriter_fourcc(*('mp4v'))
    out = cv2.VideoWriter('output.mp4', fourcc, fps, (width, height))
    
    while True:
        ret, frame = video.read()
        
        #讀取失敗時
        if not ret:
            print('no frame')
            break    
        
        #背景消除
        fgMask = backsub.apply(frame)
        
        #灰階
        gray = cv2.cvtColor(frame, cv2.COLOR_BGRA2GRAY)
        
        #高斯模糊
        blur = cv2.GaussianBlur(gray, (9,9), 2)     
         
        #二值化
        threshold = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 17, 2)
        
        #HoughCircles 參數設定
        circles = cv2.HoughCircles(
            blur,
            cv2.HOUGH_GRADIENT,
            dp=1.2,
            minDist=50,
            param1=100,
            param2=40,
            minRadius=22,
            maxRadius=60
        )

        #偵測到圓形時繪製座標框與標記座標
        if circles is not None:
            circles = circles.round().astype(int)[0]
            for x, y, r in circles:
                cv2.rectangle(frame, (x -r , y - r), (x + r, y + r), (0, 0, 255), 2)
                cv2.putText(frame, f"{x}, {y}", (x - 50, y - 40), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

        
        cv2.imshow('studio1', frame)
        
        out.write(frame)
        
        if cv2.waitKey(1) == ord('q'):
            break
    
video.release()
out.release()
cv2.destroyAllWindows()
    