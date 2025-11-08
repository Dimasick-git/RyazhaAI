# Установка DevkitPro и компиляция .nro для Nintendo Switch

## Шаг 1: Установка DevkitPro

### Windows:

1. **Скачайте установщик:**
   - https://github.com/devkitPro/installer/releases/latest
   - Файл: `devkitProUpdater-X.X.X.exe`

2. **Запустите установщик:**
   - Выберите компоненты:
     - ✅ `Switch Development`
     - ✅ `devkitA64`
     - ✅ `libnx`
     - ✅ `switch-tools`
     - ✅ `switch-examples`

3. **Путь установки (по умолчанию):**
   ```
   C:\devkitPro\
   ```

4. **Дождитесь завершения установки** (5-10 минут)

### Linux (Ubuntu/Debian):

```bash
# Скачайте пакет
wget https://github.com/devkitPro/pacman/releases/latest/download/devkitpro-pacman.amd64.deb

# Установите
sudo dpkg -i devkitpro-pacman.amd64.deb

# Обновите репозитории
sudo dkp-pacman -Sy

# Установите Switch development tools
sudo dkp-pacman -S switch-dev

# Установите дополнительные библиотеки
sudo dkp-pacman -S switch-sdl2 switch-sdl2_gfx switch-sdl2_image switch-sdl2_ttf switch-freetype switch-libpng switch-libjpeg-turbo
```

### macOS:

```bash
# Установите Homebrew (если еще нет)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Добавьте tap DevkitPro
brew tap devkitpro/devkitpro

# Установите devkitPro
brew install devkitpro-pacman

# Установите Switch tools
sudo dkp-pacman -S switch-dev
```

## Шаг 2: Настройка переменных окружения

### Windows:

Установщик должен настроить автоматически. Проверьте:

```powershell
# Откройте PowerShell и проверьте:
$env:DEVKITPRO
# Должно показать: C:\devkitPro

$env:DEVKITARM
# Должно показать: C:\devkitPro\devkitARM
```

Если не настроено, добавьте вручную:
1. Правой кнопкой на "Этот компьютер" → Свойства
2. Дополнительные параметры системы
3. Переменные среды
4. Создайте новые системные переменные:
   - `DEVKITPRO` = `C:\devkitPro`
   - `DEVKITARM` = `C:\devkitPro\devkitARM`
   - `DEVKITPPC` = `C:\devkitPro\devkitPPC`

5. Добавьте в PATH:
   - `C:\devkitPro\msys2\usr\bin`
   - `C:\devkitPro\tools\bin`

### Linux/macOS:

Добавьте в `~/.bashrc` или `~/.zshrc`:

```bash
export DEVKITPRO=/opt/devkitpro
export DEVKITARM=/opt/devkitpro/devkitARM
export DEVKITPPC=/opt/devkitpro/devkitPPC
export PATH=$DEVKITPRO/tools/bin:$PATH
```

Примените изменения:
```bash
source ~/.bashrc
```

## Шаг 3: Установка дополнительных библиотек

### Откройте MSYS2 терминал (Windows):

Пуск → DevkitPro → MSYS2

### Или обычный терминал (Linux/macOS)

### Установите основные библиотеки:

```bash
# Обновите базу данных пакетов
pacman -Sy

# Основные библиотеки для Switch
pacman -S switch-dev

# SDL2 (для графики)
pacman -S switch-sdl2 switch-sdl2_gfx switch-sdl2_image switch-sdl2_ttf switch-sdl2_mixer

# Графические библиотеки
pacman -S switch-mesa switch-libdrm_nouveau switch-glad switch-glm

# Сетевые библиотеки
pacman -S switch-curl switch-mbedtls switch-nghttp2 switch-libssh2

# Мультимедиа
pacman -S switch-ffmpeg switch-libvorbis switch-libogg switch-libopus switch-mpg123

# Шрифты и изображения
pacman -S switch-freetype switch-libpng switch-libjpeg-turbo switch-bzip2 switch-zlib

# JSON и XML
pacman -S switch-jansson switch-libxml2

# Утилиты
pacman -S switch-pkg-config switch-cmake
```

## Шаг 4: Установка libtesla (для оверлеев)

```bash
# Клонируйте libtesla
cd /tmp
git clone https://github.com/WerWolv/libtesla.git
cd libtesla

# Установите
make install
```

## Шаг 5: Проверка установки

```bash
# Проверьте версии
arm-none-eabi-gcc --version
make --version

# Должны увидеть версии компиляторов
```

## Шаг 6: Компиляция вашего проекта

```bash
# Перейдите в папку проекта
cd C:/website/switch-homebrew

# Или в Linux/macOS:
cd /path/to/website/switch-homebrew

# Скомпилируйте
make

# Если успешно, получите:
# ai-chat.nro
```

## Шаг 7: Очистка (если нужно пересобрать)

```bash
make clean
make
```

## Возможные ошибки и решения

### Ошибка: "make: command not found"
```bash
# Windows: Убедитесь, что запускаете из MSYS2
# Linux: sudo apt install build-essential
```

### Ошибка: "arm-none-eabi-gcc: command not found"
```bash
# Переустановите devkitA64
pacman -S devkitA64
```

### Ошибка: "libnx not found"
```bash
# Установите libnx
pacman -S libnx switch-tools
```

### Ошибка при компиляции
```bash
# Очистите и пересоберите
make clean
rm -rf build
make
```

## Полный список полезных библиотек

```bash
# Все сразу (опционально)
pacman -S \
  switch-dev \
  switch-sdl2 \
  switch-sdl2_gfx \
  switch-sdl2_image \
  switch-sdl2_ttf \
  switch-sdl2_mixer \
  switch-curl \
  switch-mbedtls \
  switch-freetype \
  switch-libpng \
  switch-libjpeg-turbo \
  switch-zlib \
  switch-bzip2 \
  switch-jansson \
  switch-ffmpeg
```

## Структура проекта после установки

```
C:\devkitPro\
├── devkitA64\          # ARM64 компилятор
├── libnx\              # Nintendo Switch библиотека
├── portlibs\           # Портированные библиотеки
│   └── switch\
├── tools\              # Утилиты
└── msys2\              # MSYS2 окружение (Windows)
```

## Готово!

Теперь можно компилировать .nro файлы для Nintendo Switch!

## Следующий шаг

1. Откройте `C:\website\switch-homebrew\source\main.c`
2. Измените URL на ваш реальный (после размещения на Netlify)
3. Запустите `make`
4. Получите `ai-chat.nro`
5. Скопируйте на SD карту Switch в `/switch/ai-chat/`
