#Этап сборки (Build)
FROM node:20-alpine AS build-env
WORKDIR /app

# Копируем файлы зависимостей и устанавливаем их
COPY package*.json ./
RUN npm install

# Копируем весь остальной код фронтенда
COPY . .

# Собираем оптимизированный production-билд
RUN npm run build

# Этап раздачи (Nginx Runtime)
FROM nginx:alpine

COPY --from=build-env /app/dist /usr/share/nginx/html

RUN echo 'server { \
    listen 5173; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Открываем порт фронтенда
EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
