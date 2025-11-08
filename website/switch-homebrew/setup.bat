@echo off
echo ========================================
echo   AI Chat Switch - Автоматическая настройка
echo ========================================
echo.

REM Проверка установки DevkitPro
if not exist "C:\devkitPro" (
    echo [ОШИБКА] DevkitPro не найден!
    echo Установите DevkitPro из: https://github.com/devkitPro/installer/releases
    pause
    exit /b 1
)

echo [OK] DevkitPro найден: C:\devkitPro
echo.

REM Настройка переменных окружения
echo Настройка переменных окружения...
setx DEVKITPRO "C:\devkitPro"
setx DEVKITARM "C:\devkitPro\devkitARM"
setx DEVKITPPC "C:\devkitPro\devkitPPC"

echo [OK] Переменные окружения настроены
echo.

REM Добавление в PATH
echo Добавление в PATH...
set "NEW_PATH=C:\devkitPro\msys2\usr\bin;C:\devkitPro\tools\bin"
for /f "skip=2 tokens=3*" %%a in ('reg query HKCU\Environment /v PATH') do set "CURRENT_PATH=%%a %%b"
setx PATH "%NEW_PATH%;%CURRENT_PATH%"

echo [OK] PATH обновлен
echo.

echo ========================================
echo   Установка завершена!
echo ========================================
echo.
echo Следующие шаги:
echo 1. Перезапустите VS Code
echo 2. Откройте MSYS2: Пуск -^> DevkitPro -^> MSYS2
echo 3. Выполните: cd /c/website/switch-homebrew
echo 4. Выполните: pacman -S switch-dev
echo 5. Выполните: make
echo.
pause
