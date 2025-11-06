@echo off
chcp 65001 > nul
color 0B
cls

echo.
echo     ╔═══════════════════════════════════════════════════════════╗
echo     ║                                                           ║
echo     ║      🎮 СБОРКА .NRO ДЛЯ NINTENDO SWITCH! 🥛             ║
echo     ║                                                           ║
echo     ║         Автоматическая сборка приложения! ⚡              ║
echo     ║                                                           ║
echo     ╚═══════════════════════════════════════════════════════════╝
echo.
echo.

echo ═══════════════════════════════════════════════════════════
echo [1/3] Проверка DevkitPro...
echo ═══════════════════════════════════════════════════════════
echo.

REM Проверка DevkitPro
if not defined DEVKITPRO (
    color 0C
    echo ❌ DevkitPro НЕ УСТАНОВЛЕН!
    echo.
    echo 📥 Как установить DevkitPro:
    echo.
    echo 1. Зайди на: https://github.com/devkitPro/installer/releases
    echo 2. Скачай devkitProUpdater-X.X.X.exe
    echo 3. Запусти установщик
    echo 4. Выбери "Nintendo Switch Development"
    echo 5. Дождись окончания установки
    echo 6. Перезапусти этот скрипт
    echo.
    echo 🌐 Открываю страницу загрузки...
    start https://github.com/devkitPro/installer/releases
    echo.
    pause
    exit
)

echo ✅ DevkitPro найден: %DEVKITPRO%
echo.

REM Проверка make
where make >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo ❌ make не найден!
    echo.
    echo DevkitPro установлен, но make не в PATH.
    echo Попробуй перезапустить компьютер.
    echo.
    pause
    exit
)

echo ✅ make найден
echo.

echo ═══════════════════════════════════════════════════════════
echo [2/3] Переход в папку switch-app...
echo ═══════════════════════════════════════════════════════════
echo.

cd switch-app
if %errorlevel% neq 0 (
    color 0C
    echo ❌ Папка switch-app не найдена!
    pause
    exit
)

echo ✅ В папке switch-app
echo.

echo ═══════════════════════════════════════════════════════════
echo [3/3] СБОРКА .NRO!
echo ═══════════════════════════════════════════════════════════
echo.
echo ⏳ Собираем ryazha-ai.nro...
echo.
echo 💡 Это может занять 1-2 минуты...
echo.

REM Очистка старой сборки
if exist build (
    echo 🧹 Очищаем старую сборку...
    make clean >nul 2>&1
)

echo 🔨 Компилируем...
echo.

make

if %errorlevel% equ 0 (
    echo.
    echo ╔═══════════════════════════════════════════════════════════╗
    echo ║                                                           ║
    echo ║              ✅ СБОРКА УСПЕШНА! ✅                       ║
    echo ║                                                           ║
    echo ╚═══════════════════════════════════════════════════════════╝
    echo.
    
    if exist ryazha-ai.nro (
        echo 🎉 Файл ryazha-ai.nro создан!
        echo.
        echo 📊 Информация о файле:
        dir ryazha-ai.nro | find "ryazha-ai.nro"
        echo.
        echo ═══════════════════════════════════════════════════════════
        echo 📱 УСТАНОВКА НА NINTENDO SWITCH:
        echo ═══════════════════════════════════════════════════════════
        echo.
        echo 1. Вставь SD карту Switch в компьютер
        echo 2. Создай папку: /switch/ryazha-ai/
        echo 3. Скопируй ryazha-ai.nro в эту папку
        echo 4. Безопасно извлеки SD карту
        echo 5. Вставь в Switch
        echo 6. Запусти Homebrew Menu
        echo 7. Найди "RYAZHA AI" в списке
        echo 8. Запусти приложение!
        echo.
        echo 💡 Убедись что в main.cpp указан правильный URL сайта!
        echo.
        echo 🌐 Открываю папку с файлом...
        start explorer .
    ) else (
        color 0C
        echo ❌ Файл ryazha-ai.nro не создан!
        echo.
        echo Проверь ошибки выше.
    )
) else (
    color 0C
    echo.
    echo ❌ ОШИБКА СБОРКИ!
    echo.
    echo 🔍 Возможные причины:
    echo    • DevkitPro установлен неполностью
    echo    • Отсутствует libnx
    echo    • Ошибки в коде
    echo.
    echo 💡 Попробуй:
    echo    1. Переустановить DevkitPro
    echo    2. Выбрать "Nintendo Switch Development"
    echo    3. Перезапустить компьютер
    echo    4. Запустить этот скрипт снова
    echo.
)

cd..
echo.
pause
