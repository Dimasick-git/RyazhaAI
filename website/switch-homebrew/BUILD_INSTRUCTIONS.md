# Инструкция по сборке AI Chat для Nintendo Switch

## Предварительные требования

 DevkitPro установлен (см. DEVKITPRO_INSTALL.md)
 Переменные окружения настроены
 Сайт размещен онлайн (Netlify/GitHub Pages)

## Быстрая сборка

### Windows:

1. **Откройте MSYS2:**
 - Пуск → DevkitPro → MSYS2

2. **Перейдите в папку проекта:**
 ```bash
 cd /c/website/switch-homebrew
 ```

3. **Измените URL в коде:**
 ```bash
 nano source/main.c
 # Или откройте в блокноте
 ```
 
 Найдите строку:
 ```c
 const char* url = "https://your-website-url.com/standalone/simple.html";
 ```
 
 Замените на ваш реальный URL.

4. **Скомпилируйте:**
 ```bash
 make
 ```

5. **Результат:**
 ```
 ai-chat.nro - готовый файл!
 ```

### Linux/macOS:

```bash
cd /path/to/website/switch-homebrew

# Измените URL в source/main.c
nano source/main.c

# Скомпилируйте
make

# Готово!
ls -la ai-chat.nro
```

## Настройка проекта

### 1. Изменение названия приложения

Откройте `Makefile`, найдите:
```makefile
TARGET		:=	ai-chat
APP_TITLE	:=	AI Chat
APP_AUTHOR	:=	Your Name
APP_VERSION	:=	1.0.0
```

Измените на свои значения.

### 2. Изменение иконки

Замените `icon.jpg` на свою картинку:
- Размер: 256x256 пикселей
- Формат: JPEG
- Название: `icon.jpg`

### 3. Изменение URL

В файле `source/main.c`:
```c
const char* url = "https://ваш-сайт.com/simple.html";
```

## Процесс компиляции

```bash
make
```

Что происходит:
1. Компиляция `source/main.c` → `main.o`
2. Линковка с libnx
3. Создание ELF файла
4. Конвертация в.nro формат
5. Добавление иконки и метаданных
6. Готовый файл: `ai-chat.nro`

## Очистка проекта

```bash
# Удалить временные файлы
make clean

# Пересобрать с нуля
make clean && make
```

## Тестирование

### На эмуляторе Yuzu:

```bash
# Запустите Yuzu
# File → Open → выберите ai-chat.nro
```

### На реальном Switch:

1. Скопируйте `ai-chat.nro` на SD карту:
 ```
 /switch/ai-chat/ai-chat.nro
 ```

2. Вставьте SD карту в Switch

3. Запустите Homebrew Menu (удерживайте R при запуске игры)

4. Найдите "AI Chat" и запустите

## Возможные проблемы

### Ошибка: "No rule to make target"
```bash
# Убедитесь, что структура папок правильная:
switch-homebrew/
├── Makefile
├── source/
│ └── main.c
└── icon.jpg

# Пересоздайте папки если нужно
mkdir -p source
```

### Ошибка: "undefined reference to"
```bash
# Переустановите libnx
pacman -S libnx
make clean && make
```

### Ошибка: "icon.jpg not found"
```bash
# Создайте любую иконку или используйте дефолтную
cp $DEVKITPRO/libnx/default_icon.jpg icon.jpg
make
```

###.nro файл не запускается на Switch
- Убедитесь, что Switch имеет CFW (Atmosphere)
- Проверьте версию Atmosphere (должна быть актуальная)
- Убедитесь, что файл в правильной папке `/switch/ai-chat/`

## Оптимизация размера

Для уменьшения размера.nro:

В `Makefile` измените:
```makefile
CFLAGS	:=	-g -Wall -O2 -ffunction-sections
```

На:
```makefile
CFLAGS	:=	-Wall -O3 -ffunction-sections -fdata-sections
LDFLAGS += -Wl,--gc-sections
```

Пересоберите:
```bash
make clean && make
```

## Дополнительные возможности

### Добавление RomFS (файлы внутри.nro)

1. Создайте папку `romfs/`:
 ```bash
 mkdir -p romfs
 ```

2. Положите файлы в `romfs/`

3. В `Makefile` раскомментируйте:
 ```makefile
 ROMFS:= romfs
 ```

4. В коде используйте:
 ```c
 FILE* file = fopen("romfs:/file.txt", "r");
 ```

### Добавление звуков/музыки

```bash
# Установите SDL2_mixer
pacman -S switch-sdl2_mixer

# Добавьте в код
#include <SDL2/SDL_mixer.h>
```

## Готовый результат

После успешной компиляции:
```
ai-chat.nro - 500KB-2MB
```

Готово к установке на Switch! 

## Автоматическая сборка

Создайте скрипт `build.sh`:

```bash
#!/bin/bash
echo " Компиляция AI Chat для Switch..."
make clean
make
if [ -f "ai-chat.nro" ]; then
 echo " Успешно! Файл: ai-chat.nro"
 ls -lh ai-chat.nro
else
 echo " Ошибка компиляции"
 exit 1
fi
```

Запуск:
```bash
chmod +x build.sh
./build.sh
```

## Следующие шаги

1. Скомпилировали.nro
2. ⏭ Скопируйте на SD карту Switch
3. ⏭ Запустите на Switch
4. ⏭ Наслаждайтесь AI чатом!
