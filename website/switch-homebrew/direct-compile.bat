@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   Прямая компиляция (БЕЗ pacman)
echo ========================================
echo.

REM Установка переменных окружения
set "DEVKITPRO=C:/devkitPro"
set "DEVKITARM=C:/devkitPro/devkitARM"
set "DEVKITPPC=C:/devkitPro/devkitPPC"
set "PATH=C:\devkitPro\msys2\usr\bin;C:\devkitPro\devkitA64\bin;C:\devkitPro\tools\bin;%PATH%"

echo [1/5] Проверка DevkitPro...
if not exist "C:\devkitPro\devkitA64\bin\aarch64-none-elf-gcc.exe" (
    echo [ОШИБКА] DevkitA64 не найден!
    pause
    exit /b 1
)
echo [OK] DevkitA64 найден

echo.
echo [2/5] Проверка libnx...
if not exist "C:\devkitPro\libnx" (
    echo [ОШИБКА] libnx не найден!
    echo Попробуйте переустановить DevkitPro с компонентом libnx
    pause
    exit /b 1
)
echo [OK] libnx найден

echo.
echo [3/5] Очистка предыдущей сборки...
cd /d C:\website\switch-homebrew
if exist "build" rd /s /q build
if exist "ai-chat.nro" del ai-chat.nro
if exist "ai-chat.elf" del ai-chat.elf
if exist "ai-chat.nacp" del ai-chat.nacp
echo [OK] Очистка завершена

echo.
echo [4/5] Запуск компиляции через make...
C:\devkitPro\msys2\usr\bin\bash.exe -lc "export DEVKITPRO=/c/devkitPro && export DEVKITARM=/c/devkitPro/devkitARM && export DEVKITPPC=/c/devkitPro/devkitPPC && cd /c/website/switch-homebrew && make 2>&1"

echo.
echo [5/5] Проверка результата...
if exist "ai-chat.nro" (
    echo.
    echo ========================================
    echo   ✓ УСПЕХ! Файл создан!
    echo ========================================
    echo.
    echo Файл: ai-chat.nro
    for %%A in (ai-chat.nro) do echo Размер: %%~zA байт
    echo.
    echo Следующий шаг:
    echo 1. Скопируйте ai-chat.nro на SD карту Switch
    echo 2. Путь на SD: /switch/ai-chat/ai-chat.nro
    echo 3. Запустите через Homebrew Menu
    echo.
) else (
    echo.
    echo ========================================
    echo   ✗ ОШИБКА! Файл не создан
    echo ========================================
    echo.
    echo Возможные причины:
    echo - libnx не установлен полностью
    echo - Отсутствуют необходимые библиотеки
    echo.
    echo Попробуйте переустановить DevkitPro:
    echo https://github.com/devkitPro/installer/releases
    echo.
)

pause
