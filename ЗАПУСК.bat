@echo off
chcp 65001 > nul
color 0A
cls

echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║         🥛 RYAZHA AI v2.0 - ЗАПУСК 🎮                   ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
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
echo 🚀 Запускаем dev сервер...
echo.
echo 💡 Сервер запустится на http://localhost:3000
echo.
echo ⚠️ Не закрывай это окно пока пользуешься сайтом!
echo.
echo Нажми Ctrl+C чтобы остановить сервер
echo.
echo ───────────────────────────────────────────────────────────
echo.

call npm run dev

pause
