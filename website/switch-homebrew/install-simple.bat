@echo off
echo ========================================
echo   Простая установка Switch Dev
echo ========================================
echo.

echo Шаг 1: Инициализация ключей...
C:\devkitPro\msys2\usr\bin\bash.exe -lc "pacman-key --init"

echo.
echo Шаг 2: Заполнение ключей...
C:\devkitPro\msys2\usr\bin\bash.exe -lc "pacman-key --populate msys2"

echo.
echo Шаг 3: Обновление базы данных...
C:\devkitPro\msys2\usr\bin\bash.exe -lc "yes | pacman -Sy"

echo.
echo Шаг 4: Установка Switch Development...
C:\devkitPro\msys2\usr\bin\bash.exe -lc "yes | pacman -S --needed switch-dev"

echo.
echo ========================================
echo   Проверка установки
echo ========================================
echo.

if exist "C:\devkitPro\devkitA64\bin\aarch64-none-elf-gcc.exe" (
    echo [OK] devkitA64 установлен успешно!
) else (
    echo [X] devkitA64 не найден
)

if exist "C:\devkitPro\libnx\include\switch.h" (
    echo [OK] libnx установлен успешно!
) else (
    echo [X] libnx не найден
)

echo.
if exist "C:\devkitPro\devkitA64\bin\aarch64-none-elf-gcc.exe" (
    echo ========================================
    echo   ГОТОВО! Можно компилировать!
    echo ========================================
    echo.
    echo Запустите: direct-compile.bat
) else (
    echo ========================================
    echo   Ошибка установки
    echo ========================================
    echo.
    echo Попробуйте установить вручную через MSYS2
)
echo.
pause
