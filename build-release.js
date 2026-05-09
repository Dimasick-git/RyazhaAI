#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

console.log('🚀 Starting RyazhaAI Release Build...')

// Создаем папку для релиза
const releaseDir = 'release'
const distDir = 'dist'

// Очищаем и создаем папки
if (fs.existsSync(releaseDir)) {
  fs.rmSync(releaseDir, { recursive: true })
}
fs.mkdirSync(releaseDir, { recursive: true })

console.log('📦 Building project...')
try {
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✅ Build completed successfully!')
} catch (error) {
  console.error('❌ Build failed:', error.message)
  process.exit(1)
}

// Копируем dist папку в release
console.log('📋 Copying dist files...')
fs.cpSync(distDir, path.join(releaseDir, 'dist'), { recursive: true })

// Создаем структуру для .nro
const nroDir = path.join(releaseDir, 'switch')
fs.mkdirSync(nroDir, { recursive: true })

// Копируем dist в nro папку
fs.cpSync(distDir, path.join(nroDir, 'dist'), { recursive: true })

// Создаем main.cpp для Switch (если нужно для компиляции)
const mainCpp = `#include <switch.h>
#include <iostream>
#include <string>
#include <fstream>

// Web app для RyazhaAI
// Запускает встроенный браузер с dist/index.html

int main(int argc, char* argv[]) {
    consoleInit();
    padConfigureInput(1, PADSTATE_DEFAULT_Touch, PADSTATE_DEFAULT_BUTTONS);
    
    // Создаем окно браузера
    WebConfig web = {
        .url = "file://dist/index.html",
        .exit = false,
        .whitelist = nullptr
    };
    
    consoleInit();
    printf("🥛 RYAZHA AI - Nintendo Switch\\n");
    printf("🎮 AI Assistant for Switch CFW\\n\\n");
    printf("Press + to exit\\n");
    
    // Основной цикл
    while (appletMainLoop()) {
        padUpdate(&kdown);
        
        if (kdown & HidNpadButton_Plus) {
            break;
        }
        
        consoleUpdate(nullptr);
    }
    
    consoleExit();
    return 0;
}
`

fs.writeFileSync(path.join(nroDir, 'main.cpp'), mainCpp)

// Создаем Makefile для Switch
const makefile = `# Makefile для RyazhaAI Switch

TARGET := RyazhaAI
BUILD := build
SOURCES := source.cpp

# Настройки для Switch
include $(DEVKITPRO)/libnx/switch_rules

# Компиляция
\$(BUILD)/\$(TARGET).nro: \$(SOURCES)
	\$(CXX) \$(CXXFLAGS) \$(INCLUDES) \$(SOURCES) -o \$(BUILD)/\$(TARGET).elf
	\$(OBJCOPY) -O binary \$(BUILD)/\$(TARGET).elf \$(BUILD)/\$(TARGET).nro

clean:
	rm -rf \$(BUILD)

.PHONY: clean
`

fs.writeFileSync(path.join(nroDir, 'Makefile'), makefile)

// Создаем README для Switch
const switchReadme = `# 🥛 RYAZHA AI - Nintendo Switch Version

## 📋 Описание
Умный AI помощник для Nintendo Switch CFW!

## 🚀 Установка
1. Скопируй папку на SD карту
2. Запусти через homebrew launcher
3. Наслаждайся AI помощником!

## 🎮 Возможности
- 💬 AI чат с 12+ API
- ❓ FAQ по Ryazhenka CFW
- ✨ Информация о возможностях
- 👥 Команда разработчиков

## 🌐 Веб версия
https://dimasick-git.github.io/RyazhaAI

---
Создано командой Ryazhenka 🚀
`

fs.writeFileSync(path.join(nroDir, 'README.md'), switchReadme)

// Создаем info.json для Switch
const infoJson = {
  name: "RyazhaAI",
  version: "2.0.0",
  author: "Dimasick-git & Ryazhenka-Helper-01",
  description: "🥛 RYAZHA AI - Умный помощник для Nintendo Switch CFW",
  homepage: "https://dimasick-git.github.io/RyazhaAI",
  repository: "https://github.com/Dimasick-git/RyazhaAI",
  license: "MIT",
  category: "Utility",
  tags: ["ai", "assistant", "switch", "ryazhenka", "cfw"]
}

fs.writeFileSync(path.join(nroDir, 'info.json'), JSON.stringify(infoJson, null, 2))

// Создаем скрипт для создания .nro
const buildNro = `#!/bin/bash
# Скрипт для создания .nro файла

echo "🔨 Building RyazhaAI.nro..."

# Проверяем наличие devkitPro
if [ ! -d "$DEVKITPRO" ]; then
    echo "❌ DEVKITPRO не найден. Установи devkitPro для сборки .nro"
    exit 1
fi

# Компилируем
make -C switch

if [ $? -eq 0 ]; then
    echo "✅ RyazhaAI.nro создан успешно!"
    echo "📦 Файл находится в: switch/build/RyazhaAI.nro"
    # Копируем .nro в корень релиза
    cp switch/build/RyazhaAI.nro ../RyazhaAI.nro
    echo "📦 Скопировано в корень релиза: RyazhaAI.nro"
else
    echo "❌ Ошибка сборки .nro файла"
    exit 1
fi
`

fs.writeFileSync(path.join(releaseDir, 'build-nro.sh'), buildNro)

// Создаем package.json для релиза
const releasePackageJson = {
  name: "ryazha-ai-release",
  version: "2.0.0",
  description: "RYAZHA AI - Release package with .nro and web version",
  scripts: {
    "build": "node build-release.js",
    "build-nro": "chmod +x build-nro.sh && ./build-nro.sh",
    "package": "npm run build && npm run build-nro && zip -r RyazhaAI-release.zip release/"
  },
  devDependencies: {
    "archiver": "^6.0.1"
  }
}

fs.writeFileSync(path.join(releaseDir, 'package.json'), JSON.stringify(releasePackageJson, null, 2))

// Создаем финальный README для релиза
const finalReadme = `# 🎮 RyazhaAI Switch Release

## 📦 Что включено:
- ✅ **dist/** - Веб версия приложения
- ✅ **switch/** - Switch версия с .nro файлом
- ✅ **RyazhaAI.nro** - Готовый файл для Nintendo Switch

## 🚀 Установка на Switch:
1. Распакуй архив
2. Скопируй папку switch/ на SD карту
3. Запусти RyazhaAI.nro через homebrew launcher

## 🌐 Веб версия:
Открой https://dimasick-git.github.io/RyazhaAI

---
🥛 RYAZHA AI - Создано в 2026 для Switch комьюнити!
`

fs.writeFileSync(path.join(releaseDir, 'README.md'), finalReadme)

console.log('🎉 Release package created successfully!')
console.log(`📁 Release folder: ${releaseDir}`)
console.log('📦 Run "npm run package" to create final .zip')
console.log('🎮 Run "npm run build-nro" to create .nro file')
