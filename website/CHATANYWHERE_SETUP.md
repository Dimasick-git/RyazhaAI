# Настройка ChatAnywhere API

## Шаг 1: Получите бесплатный API ключ

1. Перейдите: https://api.chatanywhere.tech/v1/oauth/free/render
2. Войдите через GitHub аккаунт
3. Получите свой бесплатный API ключ

## Шаг 2: Настройте.env файл

Откройте `C:\website\.env` и вставьте ваш ключ:

```env
PORT=3000
OPENAI_API_KEY=sk-ваш_ключ_от_chatanywhere
API_BASE_URL=https://api.chatanywhere.tech
USE_PROXY=false
```

## Шаг 3: Запустите проект

```bash
# Установите Node.js с https://nodejs.org/

# Установите зависимости
cd C:\website
npm install
cd client
npm install
cd..

# Запустите backend (терминал 1)
npm run dev

# Запустите frontend (терминал 2)
cd client
npm run dev
```

## Бесплатные лимиты:

- **gpt-4o-mini**: 200 запросов/день
- **gpt-3.5-turbo**: 200 запросов/день
- **deepseek-v3**: 30 запросов/день
- **gpt-4o**: 5 запросов/день

## Преимущества:

- Работает без VPN в России
- Быстрый китайский прокси
- Приватность гарантирована
- Полностью бесплатно для личного использования

## Проверка статуса:

https://status.chatanywhere.tech/

## Проверка баланса:

https://api.chatanywhere.tech/
