# Dockerfile
FROM node:18

# Устанавливаем рабочую директорию
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем файлы приложения
COPY . .

# Указываем порт приложения
EXPOSE 3000

# Команда запуска приложения
CMD ["node", "bot.js"]