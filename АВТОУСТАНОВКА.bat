@echo off
chcp 65001 > nul
color 0A
cls

echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║         🥛 RYAZHA AI v2.0 - АВТОУСТАНОВКА 🎮            ║
echo ║                                                           ║
echo ║         Автоматическая установка и настройка!             ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo [1/5] Проверка Node.js...
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo ❌ Node.js НЕ УСТАНОВЛЕН!
    echo.
    echo 📥 Устанавливаем Node.js автоматически...
    echo.
    echo 🌐 Открываем страницу загрузки...
    start https://nodejs.org
    echo.
    echo ⚠️ ВАЖНО:
    echo 1. Скачай LTS версию Node.js
    echo 2. Запусти установщик
    echo 3. Нажимай "Next" везде
    echo 4. ✅ Убедись что стоит галка "Add to PATH"
    echo 5. Дождись окончания установки
    echo 6. Закрой этот скрипт
    echo 7. Запусти АВТОУСТАНОВКА.bat снова
    echo.
    pause
    exit
)

echo ✅ Node.js установлен!
node --version
npm --version
echo.

echo [2/5] Установка зависимостей...
echo.
echo ⏳ Это займет 1-2 минуты, подожди...
echo.

call npm install
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ❌ Ошибка при установке зависимостей!
    echo.
    echo 🔧 Попробуй вручную:
    echo npm cache clean --force
    echo npm install
    echo.
    pause
    exit
)

echo.
echo ✅ Зависимости установлены!
echo.

echo [3/5] Настройка API ключей...
echo.

if not exist .env.local (
    echo 📝 Создаем .env.local...
    copy .env.template .env.local >nul
    echo ✅ Файл .env.local создан!
    echo.
    echo ⚠️ ВАЖНО: Добавь свои API ключи в .env.local
    echo.
    echo 🔑 Hugging Face Token (для AI):
    echo 1. Зайди на https://huggingface.co
    echo 2. Sign up (бесплатно)
    echo 3. Settings → Access Tokens → New token
    echo 4. Скопируй токен
    echo 5. Открой .env.local
    echo 6. Вставь после VITE_HF_TOKEN=
    echo.
    echo 💡 Без токена работает демо-режим (тоже норм!)
    echo.
    pause
) else (
    echo ✅ Файл .env.local уже существует!
    echo.
)

echo [4/5] Сборка проекта...
echo.
call npm run build
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ❌ Ошибка при сборке!
    pause
    exit
)

echo.
echo ✅ Проект собран!
echo.

echo [5/5] Подготовка к деплою...
echo.

if exist dist\ (
    echo ✅ Папка dist/ готова к деплою!
    echo.
    echo 📊 Размер сборки:
    dir dist /s
    echo.
) else (
    echo ❌ Папка dist/ не создана!
)

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║              ✅ УСТАНОВКА ЗАВЕРШЕНА! ✅                  ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo 🚀 ЧТО ДАЛЬШЕ?
echo.
echo 1️⃣ ЛОКАЛЬНЫЙ ЗАПУСК:
echo    npm run dev
echo    Открой: http://localhost:3000
echo.
echo 2️⃣ ДЕПЛОЙ НА NETLIFY:
echo    • Зайди на netlify.com
echo    • Drag ^& drop папку dist/
echo    • Готово!
echo.
echo 3️⃣ НАСТРОЙ API (опционально):
echo    • Открой .env.local
echo    • Добавь Hugging Face токен
echo    • npm run build (пересобери)
echo.
echo 📱 Telegram: @Ryazhenkabestcfw
echo 🐙 GitHub: Dimasick-git/Ryzhenka
echo.
echo 🥛 RYAZHA AI v2.0 готов к использованию!
echo.
pause
