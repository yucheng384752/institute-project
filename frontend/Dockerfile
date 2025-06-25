# 第一階段：構建 React 應用
FROM node:22-alpine AS build

# 設定容器內的工作目錄
WORKDIR /app
# 複製 package.json 和 package-lock.json (如果有的話，確保依賴一致性)
COPY package.json ./
# 根據 package.json 安裝所需套件
RUN npm install
# 複製程式碼
COPY . .
# 執行 React 建置命令，生成靜態檔案
RUN npm run build

# 第二階段：使用 Nginx 提供靜態檔案
FROM nginx:alpine

# 從 build 階段複製 React 應用建置後的靜態檔案到 Nginx 的預設網頁根目錄
# /app/build 是 npm run build 預設生成的靜態檔案目錄
COPY --from=build /app/build /usr/share/nginx/html

# 複製你的自定義 Nginx 配置檔案
# 假設你的 nginx.conf 放在 frontend 資料夾內
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口，因為 Nginx 監聽 80 端口
EXPOSE 80

# 啟動 Nginx 伺服器
CMD ["nginx", "-g", "daemon off;"]