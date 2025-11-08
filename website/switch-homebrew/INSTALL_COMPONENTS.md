# Установка недостающих компонентов DevkitPro

## Проблема
DevkitPro установлен, но отсутствуют компоненты для Switch разработки.

## Решение 1: Через установщик (РЕКОМЕНДУЕТСЯ)

1. **Запустите установщик:**
   ```
   C:\devkitPro\devkitProUpdater-3.0.3.exe
   ```

2. **Выберите компоненты:**
   - ✅ **Switch Development** (главное!)
   - ✅ **devkitA64**
   - ✅ **libnx**
   - ✅ **switch-tools**

3. **Нажмите "Install/Update"**

4. **Дождитесь завершения** (~5-10 минут)

## Решение 2: Через MSYS2 pacman (если установщик не работает)

1. **Откройте MSYS2:**
   - Пуск → DevkitPro → MSYS2

2. **Выполните команды:**
   ```bash
   # Обновите ключи (если спросит - нажмите Y)
   pacman-key --init
   pacman-key --populate msys2
   
   # Обновите базу
   pacman -Syu
   
   # Установите компоненты Switch
   pacman -S switch-dev
   ```

## Решение 3: Ручная загрузка (если ничего не работает)

1. **Скачайте пакеты вручную:**
   - devkitA64: https://wii.leseratte10.de/devkitPro/devkitA64/
   - libnx: https://wii.leseratte10.de/devkitPro/libnx/

2. **Распакуйте в:**
   ```
   C:\devkitPro\devkitA64\
   C:\devkitPro\libnx\
   ```

## Проверка установки

После установки проверьте:

```bash
# В MSYS2 или PowerShell:
dir C:\devkitPro\devkitA64
dir C:\devkitPro\libnx
```

Должны увидеть папки с файлами.

## После установки

Запустите компиляцию:
```
C:\website\switch-homebrew\direct-compile.bat
```

Или в MSYS2:
```bash
cd /c/website/switch-homebrew
make
```
