@echo off
chcp 65001 > nul
color 0B
cls

echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║         🚀 RYAZHA AI - ДЕПЛОЙ НА NETLIFY 🌐             ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo [АВТОМАТИЧЕСКИЙ ДЕПЛОЙ]
echo.

where npm >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo ❌ Node.js не установлен!
    echo.
    echo Запусти сначала: АВТОУСТАНОВКА.bat
    echo.
    pause
    exit
)

echo ✅ Node.js найден
echo.

echo [1/3] Сборка проекта...
echo.

call npm run build
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ❌ Ошибка сборки!
    pause
    exit
)

echo.
echo ✅ Проект собран в папку dist/
echo.

echo [2/3] Установка Netlify CLI...
echo.

where netlify >nul 2>nul
if %errorlevel% neq 0 (
    echo ⏳ Устанавливаем Netlify CLI...
    call npm install -g netlify-cli
)

echo.
echo ✅ Netlify CLI готов
echo.

echo [3/3] Деплой на Netlify...
echo.
echo 🌐 Открываем браузер для авторизации...
echo.

netlify deploy --prod --dir=dist

if %errorlevel% equ 0 (
    echo.
    echo ╔═══════════════════════════════════════════════════════════╗
    echo ║                                                           ║
    echo ║              ✅ ДЕПЛОЙ УСПЕШЕН! ✅                       ║
    echo ║                                                           ║
    echo ╚═══════════════════════════════════════════════════════════╝
    echo.
    echo 🎉 RYAZHA AI задеплоен на Netlify!
    echo.
    echo 📝 Скопируй URL и обнови его в:
    echo    switch-app/source/main.cpp (строка 61)
    echo.
) else (
    echo.
    echo ⚠️ Деплой через CLI не удался
    echo.
    echo 💡 АЛЬТЕРНАТИВА - Drag ^& Drop:
    echo.
    echo 1. Зайди на https://app.netlify.com/drop
    echo 2. Перетащи папку dist/ на страницу
    echo 3. Готово!
    echo.
)

echo.
pause
