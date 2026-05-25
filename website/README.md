# AI Chat Website с облачным хранилищем

Современный веб-сайт с AI чатом, облачным хранилищем знаний и обходом блокировок API.

## Возможности

- AI чат с поддержкой базы знаний
- Облачное хранилище данных
- HTTPS поддержка
- Обход блокировок API через прокси
- Современный UI с Tailwind CSS
- Быстрая работа на React + Vite

## Установка

1. Установите зависимости:
```bash
npm install
cd client
npm install
cd..
```

2. Настройте `.env` файл:
```env
PORT=3000
OPENAI_API_KEY=ваш_ключ_openai
USE_PROXY=false
PROXY_URL=
```

3. Запустите сервер:
```bash
npm run dev
```

4. В отдельном терминале запустите клиент:
```bash
cd client
npm run dev
```

5. Откройте http://localhost:5173

## Для HTTPS

Используйте ngrok:
```bash
ngrok http 3000
```

## Структура проекта

```
website/
├── server/ # Backend (Express)
│ ├── index.js
│ ├── proxyService.js
│ ├── storageService.js
│ └── data/
└── client/ # Frontend (React)
 └── src/
 ├── App.jsx
 └── components/
```

## API Endpoints

- `POST /api/chat` - Отправить сообщение AI
- `GET /api/knowledge` - Получить базу знаний
- `POST /api/knowledge` - Добавить запись
- `GET /api/health` - Проверка статуса

## Обход блокировок

Настройте прокси в `.env`:
```env
USE_PROXY=true
PROXY_URL=http://your-proxy:port
```
