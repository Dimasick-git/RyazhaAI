@echo off
chcp 65001 > nul
color 0A
cls

echo.
echo     ╔═══════════════════════════════════════════════════════════╗
echo     ║                                                           ║
echo     ║    🥛 RYAZHA AI - ПОЛНЫЙ АВТОДЕПЛОЙ + .NRO! 🚀          ║
echo     ║                                                           ║
echo     ║         Веб-сайт + Switch приложение за раз! ⚡           ║
echo     ║                                                           ║
echo     ╚═══════════════════════════════════════════════════════════╝
echo.
echo.

echo ═══════════════════════════════════════════════════════════
echo ШАГ 1: ДЕПЛОЙ ВЕБ-САЙТА
echo ═══════════════════════════════════════════════════════════
echo.

call DEPLOY_INSTANTLY.bat

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ❌ Деплой сайта не удался!
    echo.
    echo Сначала нужно задеплоить сайт, потом собирать .nro
    echo.
    pause
    exit
)

echo.
echo ═══════════════════════════════════════════════════════════
echo ШАГ 2: ПОЛУЧЕНИЕ URL САЙТА
echo ═══════════════════════════════════════════════════════════
echo.

set /p SITE_URL="📝 Введи URL задеплоенного сайта (например: https://ryazha-ai.netlify.app): "

if "%SITE_URL%"=="" (
    color 0C
    echo.
    echo ❌ URL не введен!
    echo.
    pause
    exit
)

echo.
echo ✅ URL получен: %SITE_URL%
echo.

echo ═══════════════════════════════════════════════════════════
echo ШАГ 3: ОБНОВЛЕНИЕ URL В SWITCH ПРИЛОЖЕНИИ
echo ═══════════════════════════════════════════════════════════
echo.

echo ⏳ Обновляем main.cpp...

REM Создаем временный файл с обновленным URL
powershell -Command "(Get-Content switch-app\source\main.cpp) -replace 'const char\* websiteUrl = \".*\";', 'const char* websiteUrl = \"%SITE_URL%\";' | Set-Content switch-app\source\main.cpp.tmp"

if exist switch-app\source\main.cpp.tmp (
    move /y switch-app\source\main.cpp.tmp switch-app\source\main.cpp >nul
    echo ✅ URL обновлен в main.cpp!
) else (
    color 0E
    echo ⚠️ Не удалось автоматически обновить URL
    echo.
    echo 📝 Обнови вручную:
    echo    1. Открой: switch-app\source\main.cpp
    echo    2. Строка 61: замени URL на %SITE_URL%
    echo    3. Сохрани файл
    echo.
    pause
)

echo.

echo ═══════════════════════════════════════════════════════════
echo ШАГ 4: СБОРКА .NRO ДЛЯ SWITCH
echo ═══════════════════════════════════════════════════════════
echo.

call BUILD_SWITCH.bat

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║              ✅ ВСЁ ГОТОВО! ✅                           ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo 🎉 RYAZHA AI полностью готов!
echo.
echo 🌐 Веб-сайт: %SITE_URL%
echo 🎮 Switch .nro: switch-app\ryazha-ai.nro
echo.
echo 📱 ТЕСТИРОВАНИЕ:
echo    • Веб: открой %SITE_URL% в браузере
echo    • Switch: скопируй ryazha-ai.nro на SD карту
echo.
echo 💜 Made by Dimasick-git ^& Ryazha-Helper-01
echo.
pause
