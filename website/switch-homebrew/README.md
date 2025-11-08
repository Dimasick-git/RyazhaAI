# AI Chat для Nintendo Switch

Homebrew приложение для запуска AI чата на Nintendo Switch.

## Требования

1. **Nintendo Switch с кастомной прошивкой (CFW)**
   - Atmosphere
   - Hekate
   - Или другой CFW

2. **DevkitPro для компиляции**
   - Скачайте: https://github.com/devkitPro/installer/releases
   - Установите devkitA64 и libnx

## Компиляция

### Windows:
```bash
# Установите DevkitPro
# Откройте msys2 терминал из DevkitPro

cd C:/website/switch-homebrew
make
```

### Linux/Mac:
```bash
export DEVKITPRO=/opt/devkitpro
export DEVKITARM=/opt/devkitpro/devkitARM
export DEVKITPPC=/opt/devkitpro/devkitPPC

cd /path/to/switch-homebrew
make
```

## Установка на Switch

1. Скомпилируйте проект (получите `ai-chat.nro`)
2. Скопируйте `ai-chat.nro` на SD карту Switch в папку:
   ```
   /switch/ai-chat/ai-chat.nro
   ```
3. Вставьте SD карту в Switch
4. Запустите Homebrew Menu (hbmenu)
5. Найдите "AI Chat" и запустите

## Настройка URL

Откройте `source/main.c` и измените строку:
```c
const char* url = "https://your-website-url.com/standalone/simple.html";
```

На ваш реальный URL, где размещен сайт.

## Варианты размещения сайта:

### 1. GitHub Pages (бесплатно):
```bash
# Создайте репозиторий на GitHub
# Загрузите файл simple.html
# Включите GitHub Pages в настройках
# URL будет: https://username.github.io/repo-name/simple.html
```

### 2. Netlify (бесплатно):
- Перетащите `simple.html` на https://app.netlify.com/drop
- Получите URL типа: https://random-name.netlify.app/simple.html

### 3. Vercel (бесплатно):
- Загрузите через https://vercel.com
- Получите URL

### 4. Локальный сервер (для тестов):
```bash
# Запустите простой HTTP сервер
python -m http.server 8000
# URL: http://192.168.x.x:8000/simple.html
```

## Иконка

Замените `icon.jpg` на вашу иконку 256x256 пикселей в формате JPEG.

## Структура проекта

```
switch-homebrew/
├── Makefile          # Файл сборки
├── source/
│   └── main.c        # Исходный код
├── icon.jpg          # Иконка приложения
└── README.md         # Эта инструкция
```

## Troubleshooting

### Ошибка компиляции:
- Убедитесь, что DevkitPro установлен правильно
- Проверьте переменные окружения DEVKITPRO

### Приложение не запускается:
- Убедитесь, что Switch имеет CFW
- Проверьте, что файл в правильной папке
- Убедитесь, что у вас последняя версия Atmosphere

### Браузер не открывается:
- Проверьте URL в коде
- Убедитесь, что сайт доступен
- Switch должен быть подключен к интернету

## Альтернатива без компиляции

Если у вас нет возможности скомпилировать:

1. Используйте готовый браузер для Switch (например, NX-Shell)
2. Или создайте простой форвардер через nxlink
3. Или используйте встроенный браузер Switch через DNS redirect

## Лицензия

MIT License - используйте свободно!
