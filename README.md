# libraryManageSystem
![homepage](https://github.com/user-attachments/assets/17979578-f4db-4e28-9938-f89dd81ca497)
## Install
backend：
> asgiref==3.8.1
> Django==5.2.3
> django-cors-headers==4.7.0
> numpy==2.3.1
> opencv-python==4.11.0.86
> pyzbar==0.1.9
> sqlparse==0.5.3
> tzdata==2025.2
> gunicorn==22.0.0
frontend：
```javascript
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/dom": "^10.4.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^13.5.0",
    "http-proxy-middleware": "^3.0.5",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "proxy": "http://127.0.0.1:8000/", 
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.0.0"
  }
}

```
## Usage

## Contributing

## Request
> djagno後端
- [x] 1. 發Get的請求取得回應 (內部虛擬機自己發給自己)
- [x] 2. 發Get的請求取得回應 (從外部實體機器到內部虛擬機)(port-forwarding)
- [x] 3. 發Post的請求新增資料庫裡的資料 (Django Model、Template、View)(Django預設資料庫SQLite)
- [x] 4. 發Update和Delete的請求，更新或刪除資料庫裡的資料
- [x] 5. 將攝影機所擷取的畫面，顯示在djagno自帶的前端網頁 (攝影機串流)
- [ ] 6. 將攝影機所擷取的畫面，執行簡單的影像辨識，顯示在djagno自帶的前端網頁 (轉灰階即可)
> react前端
- [x] 7. 在前端建立基本元件(輸入框、下拉選單、按鈕)，向後端要資料
- [x] 8. 在前端建立基本元件(輸入框、下拉選單、按鈕)，變更資料庫裡的資料
> docker
- [ ] 9.  打包django後端與react前端的環境，打包成docker image (docker build)
- [ ] 10. 透過djanog後端與react前端的docker image，執行程式 (docker run)(container)
- [ ] 11. 掛載資料夾到container裡，避免重要資料在container重啟後消失 (volume)
