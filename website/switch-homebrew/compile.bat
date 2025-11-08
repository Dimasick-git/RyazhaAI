@echo off
echo ========================================
echo   Компиляция AI Chat для Switch
echo ========================================
echo.

REM Проверка DevkitPro
if not exist "C:\devkitPro\msys2\msys2_shell.cmd" (
    echo [ОШИБКА] DevkitPro MSYS2 не найден!
    echo Установите DevkitPro сначала.
    pause
    exit /b 1
)

echo Запуск компиляции через MSYS2...
echo.

REM Запуск MSYS2 с командой компиляции
C:\devkitPro\msys2\msys2_shell.cmd -mingw64 -defterm -no-start -here -c "cd /c/website/switch-homebrew && bash install-libs.sh && make"

echo.
echo ========================================
if exist "ai-chat.nro" (
    echo   Компиляция успешна!
    echo   Файл: ai-chat.nro
    echo.
    echo   Скопируйте на SD карту Switch:
    echo   /switch/ai-chat/ai-chat.nro
) else (
    echo   Ошибка компиляции!
    echo   Проверьте логи выше.
)
echo ========================================
echo.
pause
