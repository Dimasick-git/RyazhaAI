@echo off
echo ========================================
echo   Исправление блокировки pacman
echo ========================================
echo.

echo Остановка всех процессов MSYS2...
taskkill /F /IM msys2.exe 2>nul
taskkill /F /IM bash.exe 2>nul
taskkill /F /IM pacman.exe 2>nul
timeout /t 2 >nul

echo.
echo Удаление файлов блокировки...
del /F /Q "C:\devkitPro\msys2\var\lib\pacman\db.lck" 2>nul
del /F /Q "C:\devkitPro\msys2\var\cache\pacman\pkg\*.part" 2>nul

echo.
echo [OK] Блокировка снята!
echo.
echo Теперь попробуйте снова установить компоненты.
echo.
pause
