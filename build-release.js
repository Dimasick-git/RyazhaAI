#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

console.log(' Starting RyazhaAI Release Build...')

// Создаем папку для релиза
const releaseDir = 'release'
const distDir = 'dist'

// Очищаем и создаем папки
if (fs.existsSync(releaseDir)) {
 fs.rmSync(releaseDir, { recursive: true })
}
fs.mkdirSync(releaseDir, { recursive: true })

console.log(' Building project...')
try {
 execSync('npm run build', { stdio: 'inherit' })
 console.log(' Build completed successfully!')
} catch (error) {
 console.error(' Build failed:', error.message)
 process.exit(1)
}

// Копируем dist папку в release
console.log(' Copying dist files...')
fs.cpSync(distDir, path.join(releaseDir, 'dist'), { recursive: true })

// Создаем структуру для.nro
const nroDir = path.join(releaseDir, 'switch')
fs.mkdirSync(nroDir, { recursive: true })

// Копируем dist в nro папку
fs.cpSync(distDir, path.join(nroDir, 'dist'), { recursive: true })

// Создаем main.cpp для Switch (если нужно для компиляции)
const mainCpp = `#include <string.h>
#include <stdio.h>
#include <stdlib.h>

#include <switch.h>

// RYAZHA AI .nro — открывает веб-апплет со страницей AI на GitHub Pages

int main(int argc, char* argv[])
{
    socketInitializeDefault();
    nxlinkStdio();
    consoleInit(NULL);

    // Новый API libnx (>= 4.x): PadState вместо deprecated hidScanInput/hidKeysDown
    PadState pad;
    padConfigureInput(1, HidNpadStyleSet_NpadStandard);
    padInitializeDefault(&pad);

    printf("\\x1b[2J\\x1b[1;1H");

    printf("\\x1b[36m");
    printf("    +---------------------------------------+\\n");
    printf("    |                                       |\\n");
    printf("    |      RYAZHA AI for Switch             |\\n");
    printf("    |                                       |\\n");
    printf("    |  Умный помощник для Nintendo Switch!  |\\n");
    printf("    |                                       |\\n");
    printf("    +---------------------------------------+\\n");
    printf("\\x1b[0m\\n");

    printf("\\x1b[32m");
    printf("  Возможности:\\n");
    printf("     - AI помощник для Switch CFW\\n");
    printf("     - Ответы на вопросы о Ryazhenka\\n");
    printf("     - FAQ и помощь по взлому\\n");
    printf("\\x1b[0m\\n");

    printf("\\x1b[33m");
    printf("  Требования:\\n");
    printf("     - WiFi подключение\\n");
    printf("     - Ryazhenka CFW или Atmosphere\\n");
    printf("     - Homebrew Menu (hbmenu)\\n");
    printf("\\x1b[0m\\n");

    printf("\\x1b[35m");
    printf("  Управление:\\n");
    printf("     [A] - Открыть RYAZHA AI в браузере\\n");
    printf("     [+] - Выход\\n");
    printf("\\x1b[0m\\n");

    printf("\\x1b[90m");
    printf("  Создано командой Ryazhenka\\n");
    printf("  Dimasick-git & Ryazhenka-Helper-01\\n");
    printf("  v2.1.0 | github.com/Dimasick-git/RyazhaAI\\n");
    printf("\\x1b[0m\\n");

    const char* websiteUrl = "https://dimasick-git.github.io/RyazhaAI";

    printf("\\n\\x1b[37m  Нажми [A] для запуска...\\x1b[0m\\n");

    while (appletMainLoop())
    {
        padUpdate(&pad);
        u64 kDown = padGetButtonsDown(&pad);

        if (kDown & HidNpadButton_A)
        {
            printf("\\n\\x1b[36m  Запуск RYAZHA AI...\\x1b[0m\\n");
            printf("\\x1b[33m  Открываем браузер Switch...\\x1b[0m\\n\\n");

            WebCommonConfig config;
            WebCommonReply reply;

            Result rc = webPageCreate(&config, websiteUrl);

            if (R_SUCCEEDED(rc))
            {
                webConfigSetWhitelist(&config, "^https?://");
                webConfigSetFooter(&config, true);
                webConfigSetPointer(&config, true);
                webConfigSetKeyRepeatFrame(&config, 4, 8);

                printf("\\x1b[32m  Загрузка интерфейса...\\x1b[0m\\n");
                printf("\\x1b[90m  URL: %s\\x1b[0m\\n\\n", websiteUrl);

                rc = webConfigShow(&config, &reply);

                if (R_SUCCEEDED(rc)) {
                    printf("\\x1b[32m  Веб-апплет закрыт\\x1b[0m\\n");
                } else {
                    printf("\\x1b[31m  Ошибка показа веб-страницы: 0x%x\\x1b[0m\\n", rc);
                }
            }
            else
            {
                printf("\\x1b[31m  Ошибка создания веб-апплета: 0x%x\\x1b[0m\\n", rc);
                printf("\\x1b[33m  Проверь подключение к интернету!\\x1b[0m\\n");
            }

            printf("\\n\\x1b[37m  Нажми [A] для повтора или [+] для выхода\\x1b[0m\\n");
        }

        if (kDown & HidNpadButton_Plus)
            break;

        consoleUpdate(NULL);
    }

    printf("\\n\\x1b[36m  До встречи в RYAZHA AI!\\x1b[0m\\n");
    printf("\\x1b[35m  Спасибо что используешь Ryazhenka!\\x1b[0m\\n");
    consoleUpdate(NULL);

    consoleExit(NULL);
    socketExit();

    return 0;
}
`

fs.writeFileSync(path.join(nroDir, 'main.cpp'), mainCpp)

// Создаем Makefile для Switch
const makefile = `# Makefile для RyazhaAI Switch

TARGET:= RyazhaAI
BUILD:= build
SOURCES:= source.cpp

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
const switchReadme = `# RYAZHA AI - Nintendo Switch Version

## Описание
Умный AI помощник для Nintendo Switch CFW!

## Установка
1. Скопируй папку на SD карту
2. Запусти через homebrew launcher
3. Наслаждайся AI помощником!

## Возможности
- AI чат с 12+ API
- FAQ по Ryazhenka CFW
- Информация о возможностях
- Команда разработчиков

## Веб версия
https://dimasick-git.github.io/RyazhaAI

---
Создано командой Ryazhenka 
`

fs.writeFileSync(path.join(nroDir, 'README.md'), switchReadme)

// Создаем info.json для Switch
const infoJson = {
 name: "RyazhaAI",
 version: "2.0.0",
 author: "Dimasick-git & Ryazhenka-Helper-01",
 description: " RYAZHA AI - Умный помощник для Nintendo Switch CFW",
 homepage: "https://dimasick-git.github.io/RyazhaAI",
 repository: "https://github.com/Dimasick-git/RyazhaAI",
 license: "MIT",
 category: "Utility",
 tags: ["ai", "assistant", "switch", "ryazhenka", "cfw"]
}

fs.writeFileSync(path.join(nroDir, 'info.json'), JSON.stringify(infoJson, null, 2))

// Создаем скрипт для создания.nro
const buildNro = `#!/bin/bash
# Скрипт для создания.nro файла

echo " Building RyazhaAI.nro..."

# Проверяем наличие devkitPro
if [! -d "$DEVKITPRO" ]; then
 echo " DEVKITPRO не найден. Установи devkitPro для сборки.nro"
 exit 1
fi

# Компилируем
make -C switch

if [ $? -eq 0 ]; then
 echo " RyazhaAI.nro создан успешно!"
 echo " Файл находится в: switch/build/RyazhaAI.nro"
 # Копируем.nro в корень релиза
 cp switch/build/RyazhaAI.nro../RyazhaAI.nro
 echo " Скопировано в корень релиза: RyazhaAI.nro"
else
 echo " Ошибка сборки.nro файла"
 exit 1
fi
`

fs.writeFileSync(path.join(releaseDir, 'build-nro.sh'), buildNro)

// Создаем package.json для релиза
const releasePackageJson = {
 name: "ryazha-ai-release",
 version: "2.0.0",
 description: "RYAZHA AI - Release package with.nro and web version",
 scripts: {
 "build": "node build-release.js",
 "build-nro": "chmod +x build-nro.sh &&./build-nro.sh",
 "package": "npm run build && npm run build-nro && zip -r RyazhaAI-release.zip release/"
 },
 devDependencies: {
 "archiver": "^6.0.1"
 }
}

fs.writeFileSync(path.join(releaseDir, 'package.json'), JSON.stringify(releasePackageJson, null, 2))

// Создаем финальный README для релиза
const finalReadme = `# RyazhaAI Switch Release

## Что включено:
- **dist/** - Веб версия приложения
- **switch/** - Switch версия с.nro файлом
- **RyazhaAI.nro** - Готовый файл для Nintendo Switch

## Установка на Switch:
1. Распакуй архив
2. Скопируй папку switch/ на SD карту
3. Запусти RyazhaAI.nro через homebrew launcher

## Веб версия:
Открой https://dimasick-git.github.io/RyazhaAI

---
 RYAZHA AI - Создано в 2026 для Switch комьюнити!
`

fs.writeFileSync(path.join(releaseDir, 'README.md'), finalReadme)

// Автоматически запускаем сборку.nro если есть devkitPro
console.log(' Starting.nro compilation...')
try {
 // Проверяем наличие devkitPro
 const devkitProCheck = process.env.DEVKITPRO || '/opt/devkitpro'
 if (fs.existsSync(devkitProCheck)) {
 console.log(' Found devkitPro, building.nro...')

 // Выполняем сборку.nro
 execSync('chmod +x build-nro.sh &&./build-nro.sh', {
 cwd: releaseDir,
 stdio: 'inherit'
 })

 console.log('.nro build completed successfully!')
 } else {
 console.log(' devkitPro not found, skipping.nro build')
 console.log(' Install devkitPro to build.nro automatically')
 }
} catch (error) {
 console.log('.nro build failed:', error.message)
 console.log('You can build.nro manually with: npm run build-nro')
}

console.log(' Release package created successfully!')
console.log(` Release folder: ${releaseDir}`)
console.log(' Run "npm run package" to create final.zip')
