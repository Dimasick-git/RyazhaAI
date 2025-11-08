#!/bin/bash

echo "========================================"
echo "  Минимальная компиляция"
echo "========================================"
echo ""

# Установка переменных
export DEVKITPRO=/c/devkitPro
export DEVKITARM=/c/devkitPro/devkitARM
export DEVKITPPC=/c/devkitPro/devkitPPC
export PATH=$DEVKITPRO/devkitA64/bin:$DEVKITPRO/tools/bin:$PATH

cd /c/website/switch-homebrew

echo "[1/4] Создание папки build..."
mkdir -p build

echo "[2/4] Компиляция main.c..."
aarch64-none-elf-gcc -MMD -MP -MF build/main.d \
    -g -Wall -O2 -ffunction-sections \
    -march=armv8-a+crc+crypto -mtune=cortex-a57 -mtp=soft -fPIE \
    -I$DEVKITPRO/libnx/include \
    -I$DEVKITPRO/portlibs/switch/include \
    -D__SWITCH__ \
    -c source/main.c -o build/main.o

if [ $? -ne 0 ]; then
    echo "[ОШИБКА] Компиляция не удалась"
    exit 1
fi

echo "[3/4] Линковка..."
aarch64-none-elf-gcc -specs=$DEVKITPRO/libnx/switch.specs \
    -g -march=armv8-a+crc+crypto -mtune=cortex-a57 -mtp=soft -fPIE \
    -Wl,-Map,ai-chat.map \
    build/main.o \
    -L$DEVKITPRO/libnx/lib \
    -L$DEVKITPRO/portlibs/switch/lib \
    -lnx \
    -o ai-chat.elf

if [ $? -ne 0 ]; then
    echo "[ОШИБКА] Линковка не удалась"
    exit 1
fi

echo "[4/4] Создание .nro файла..."
elf2nro ai-chat.elf ai-chat.nro \
    --nacp=ai-chat.nacp \
    --icon=icon.jpg

if [ -f "ai-chat.nro" ]; then
    echo ""
    echo "========================================"
    echo "  ✓ УСПЕХ!"
    echo "========================================"
    echo ""
    ls -lh ai-chat.nro
    echo ""
else
    echo ""
    echo "========================================"
    echo "  ✗ ОШИБКА создания .nro"
    echo "========================================"
fi
