@echo off
chcp 65001 > nul
color 0E
cls

echo.
echo     ╔═══════════════════════════════════════════════════════════╗
echo     ║                                                           ║
echo     ║      🚀 АВТОМАТИЧЕСКИЙ ДЕПЛОЙ НА NETLIFY! 🌐            ║
echo     ║                                                           ║
echo     ║           Всё автоматически за 2 минуты! ⚡              ║
echo     ║                                                           ║
echo     ╚═══════════════════════════════════════════════════════════╝
echo.
echo.

REM Проверка Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo ❌ Node.js не установлен!
    echo.
    echo Сначала запусти: ПРОСТО_ЗАПУСТИ_МЕНЯ.bat
    echo.
    pause
    exit
)

echo ✅ Node.js найден
echo.

REM Проверка npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo ❌ npm не найден!
    pause
    exit
)

echo ✅ npm найден
echo.

echo ═══════════════════════════════════════════════════════════
echo [1/4] Установка зависимостей (если нужно)...
echo ═══════════════════════════════════════════════════════════
echo.

if not exist node_modules (
    echo ⏳ Устанавливаем зависимости...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo ❌ Ошибка установки!
        pause
        exit
    )
    echo ✅ Зависимости установлены!
) else (
    echo ✅ Зависимости уже установлены!
)

echo.
echo ═══════════════════════════════════════════════════════════
echo [2/4] Сборка проекта...
echo ═══════════════════════════════════════════════════════════
echo.
echo ⏳ Собираем RYAZHA AI...
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
echo ✅ Проект собран!
echo.

if not exist dist\ (
    color 0C
    echo ❌ Папка dist не создана!
    pause
    exit
)

echo ═══════════════════════════════════════════════════════════
echo [3/4] Установка Netlify CLI (если нужно)...
echo ═══════════════════════════════════════════════════════════
echo.

where netlify >nul 2>nul
if %errorlevel% neq 0 (
    echo ⏳ Устанавливаем Netlify CLI...
    call npm install -g netlify-cli
    echo ✅ Netlify CLI установлен!
) else (
    echo ✅ Netlify CLI уже установлен!
)

echo.
echo ═══════════════════════════════════════════════════════════
echo [4/4] ДЕПЛОЙ НА NETLIFY!
echo ═══════════════════════════════════════════════════════════
echo.
echo 🌐 Сейчас откроется браузер для авторизации в Netlify...
echo.
echo 💡 Инструкция:
echo 1. В браузере нажми "Authorize" для Netlify CLI
echo 2. Вернись в это окно
echo 3. Выбери "Create & configure a new site"
echo 4. Выбери свой team
echo 5. Дай имя сайту (например: ryazha-ai)
echo 6. Готово!
echo.
pause

echo.
echo 🚀 ЗАПУСКАЕМ ДЕПЛОЙ...
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
    echo 📝 ВАЖНО: Скопируй URL из вывода выше!
    echo.
    echo 🎮 СЛЕДУЮЩИЙ ШАГ - Switch приложение:
    echo    1. Открой: switch-app\source\main.cpp
    echo    2. Строка 61: замени localhost на свой URL
    echo    3. Запусти: BUILD_SWITCH.bat
    echo.
) else (
    echo.
    echo ⚠️ Деплой через CLI не удался
    echo.
    echo 💡 АЛЬТЕРНАТИВА - Drag ^& Drop (проще!):
    echo.
    echo 1. Зайди на: https://app.netlify.com/drop
    echo 2. Перетащи папку dist\ на страницу
    echo 3. Получи URL!
    echo 4. Готово! 🎉
    echo.
    echo 📂 Папка dist готова к загрузке!
    echo.
    start https://app.netlify.com/drop
    start explorer dist
)

echo.
pause
