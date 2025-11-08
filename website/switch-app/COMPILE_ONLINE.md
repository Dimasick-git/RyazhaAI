# Компиляция .nro онлайн через GitHub Actions

Если у вас нет DevkitPro, можно скомпилировать через GitHub бесплатно.

## Шаг 1: Создайте репозиторий на GitHub

1. Зайдите на https://github.com
2. Нажмите "New repository"
3. Название: `ai-chat-switch`
4. Public
5. Create repository

## Шаг 2: Загрузите файлы

Загрузите в репозиторий:
- `Makefile` из `C:\website\switch-homebrew\Makefile`
- `source/main.c` из `C:\website\switch-homebrew\source\main.c`
- `icon.jpg` (любую картинку 256x256)

## Шаг 3: Создайте GitHub Action

Создайте файл `.github/workflows/build.yml`:

```yaml
name: Build Switch Homebrew

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    container:
      image: devkitpro/devkita64:latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build
      run: |
        make
    
    - name: Upload artifact
      uses: actions/upload-artifact@v3
      with:
        name: ai-chat-nro
        path: ai-chat.nro
```

## Шаг 4: Измените URL

В файле `source/main.c` найдите:
```c
const char* url = "https://your-website-url.com/standalone/simple.html";
```

Замените на ваш реальный URL (после размещения на Netlify).

## Шаг 5: Запустите компиляцию

1. Сделайте commit и push
2. Перейдите во вкладку "Actions"
3. Дождитесь завершения (2-3 минуты)
4. Скачайте `ai-chat.nro` из Artifacts

## Шаг 6: Установите на Switch

1. Скопируйте `ai-chat.nro` на SD карту:
   ```
   /switch/ai-chat/ai-chat.nro
   ```
2. Вставьте SD в Switch
3. Запустите Homebrew Menu
4. Найдите "AI Chat" и запустите!

## Готово!

Теперь у вас есть .nro файл без установки DevkitPro!

## Альтернатива: Попросите меня создать репозиторий

Если сложно - скажите, и я создам готовую структуру для копирования.
