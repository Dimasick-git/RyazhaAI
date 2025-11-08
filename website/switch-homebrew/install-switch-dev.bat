@echo off
echo ========================================
echo   Установка Switch Dev через MSYS2
echo ========================================
echo.

echo Запуск MSYS2 для установки компонентов...
echo.
echo ВАЖНО: Когда появятся вопросы - нажимайте Y и Enter
echo.
pause

C:\devkitPro\msys2\usr\bin\bash.exe -lc "echo 'Y' | pacman-key --init && echo 'Y' | pacman-key --populate msys2 && echo 'Y' | pacman -Syu --noconfirm && echo 'Y' | pacman -S --noconfirm switch-dev devkitA64 libnx switch-tools"

echo.
echo ========================================
echo   Проверка установки...
echo ========================================
echo.

if exist "C:\devkitPro\devkitA64" (
    echo [OK] devkitA64 установлен
) else (
    echo [X] devkitA64 НЕ установлен
)

if exist "C:\devkitPro\libnx" (
    echo [OK] libnx установлен
) else (
    echo [X] libnx НЕ установлен
)

echo.
echo Установка завершена!
echo Теперь можно компилировать проект.
echo.
pause
