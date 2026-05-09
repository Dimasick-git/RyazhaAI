#!/bin/bash
# Скрипт для создания .nro файла

echo "🔨 Building RyazhaAI.nro..."

# Проверяем наличие devkitPro
if [ ! -d "$DEVKITPRO" ]; then
    echo "❌ DEVKITPRO не найден. Установи devkitPro для сборки .nro"
    exit 1
fi

# Компилируем
make -C RyazhaAI-switch

if [ $? -eq 0 ]; then
    echo "✅ RyazhaAI.nro создан успешно!"
    echo "📦 Файл находится в: RyazhaAI-switch/build/RyazhaAI.nro"
else
    echo "❌ Ошибка сборки .nro файла"
    exit 1
fi
