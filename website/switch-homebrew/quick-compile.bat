@echo off
echo ========================================
echo   Быстрая компиляция AI Chat
echo ========================================
echo.

cd /d C:\website\switch-homebrew

echo Запуск MSYS2 для компиляции...
echo.

C:\devkitPro\msys2\usr\bin\bash.exe -lc "cd /c/website/switch-homebrew && pacman -Sy --noconfirm && pacman -S --noconfirm switch-dev && make clean && make"

echo.
if exist "ai-chat.nro" (
    echo ========================================
    echo   УСПЕХ! Файл создан: ai-chat.nro
    echo ========================================
    echo.
    echo Размер файла:
    dir ai-chat.nro | find "ai-chat.nro"
    echo.
    echo Скопируйте на SD карту Switch в:
    echo /switch/ai-chat/ai-chat.nro
) else (
    echo ========================================
    echo   ОШИБКА! Файл не создан.
    echo ========================================
)
echo.
pause
