FROM node:18-alpine AS build

#設定容器內的工作目錄
WORKDIR /app
#複製package.json
COPY package.json ./
#根據package.json安裝所需套件
RUN npm install
#複製程式碼
COPY . .
#執行React建置命令
RUN npm run build

FROM nginx:alpine
