@echo off
echo ========================================
echo   Автоматическая компиляция AI Chat
echo ========================================
echo.

cd /d C:\website\switch-homebrew

echo Инициализация ключей pacman...
C:\devkitPro\msys2\usr\bin\bash.exe -lc "pacman-key --init && pacman-key --populate msys2 && pacman-key --refresh-keys"

echo.
echo Установка библиотек...
echo Y | C:\devkitPro\msys2\usr\bin\bash.exe -lc "pacman -Sy"
echo Y | C:\devkitPro\msys2\usr\bin\bash.exe -lc "pacman -S switch-dev"

echo.
echo Компиляция проекта...
C:\devkitPro\msys2\usr\bin\bash.exe -lc "cd /c/website/switch-homebrew && make clean && make"

echo.
if exist "ai-chat.nro" (
    echo ========================================
    echo   УСПЕХ! ai-chat.nro создан!
    echo ========================================
    dir ai-chat.nro
) else (
    echo ========================================
    echo   ОШИБКА компиляции
    echo ========================================
)
pause
