#!/bin/bash

echo "========================================"
echo "  Установка библиотек для Switch"
echo "========================================"
echo ""

# Проверка DevkitPro
if [ ! -d "/c/devkitPro" ] && [ ! -d "/opt/devkitpro" ]; then
    echo "[ОШИБКА] DevkitPro не найден!"
    exit 1
fi

echo "[OK] DevkitPro найден"
echo ""

# Обновление базы данных
echo "Обновление базы данных пакетов..."
pacman -Sy --noconfirm

# Установка основных библиотек
echo ""
echo "Установка основных библиотек..."
pacman -S --noconfirm --needed \
    switch-dev \
    devkitA64 \
    libnx \
    switch-tools

# Установка дополнительных библиотек
echo ""
echo "Установка дополнительных библиотек..."
pacman -S --noconfirm --needed \
    switch-sdl2 \
    switch-sdl2_gfx \
    switch-sdl2_image \
    switch-sdl2_ttf \
    switch-curl \
    switch-mbedtls \
    switch-freetype \
    switch-libpng \
    switch-libjpeg-turbo \
    switch-zlib \
    switch-bzip2

echo ""
echo "========================================"
echo "  Установка завершена!"
echo "========================================"
echo ""
echo "Теперь можно компилировать проект:"
echo "  cd /c/website/switch-homebrew"
echo "  make"
echo ""
