# Быстрый старт для Nintendo Switch

## Вариант 1: Без компиляции (ПРОЩЕ)

### Используйте встроенный браузер Switch:

1. **Разместите сайт онлайн:**
 - Зайдите на https://netlify.com/drop
 - Перетащите файл `C:\website\standalone\simple.html`
 - Получите ссылку типа: `https://random-name.netlify.app`

2. **Откройте на Switch:**
 - Зайдите в Настройки Switch → Интернет
 - Выберите вашу WiFi сеть
 - Нажмите "Изменить настройки"
 - Прокрутите вниз до "DNS настройки"
 - Выберите "Вручную"
 - Первичный DNS: `045.055.142.122`
 - Вторичный DNS: `045.055.142.122`
 - Сохраните и подключитесь
 - Откроется браузер - введите ваш URL

## Вариант 2: С компиляцией (для.nro файла)

### Шаг 1: Установите DevkitPro

**Windows:**
```bash
# Скачайте установщик:
https://github.com/devkitPro/installer/releases/latest

# Запустите и выберите:
- devkitA64
- libnx
- switch-tools
```

**Linux:**
```bash
wget https://github.com/devkitPro/pacman/releases/latest/download/devkitpro-pacman.amd64.deb
sudo dpkg -i devkitpro-pacman.amd64.deb
sudo dkp-pacman -S switch-dev
```

### Шаг 2: Настройте переменные окружения

**Windows (PowerShell):**
```powershell
$env:DEVKITPRO = "C:/devkitPro"
$env:DEVKITARM = "C:/devkitPro/devkitARM"
```

**Linux/Mac:**
```bash
export DEVKITPRO=/opt/devkitpro
export DEVKITARM=/opt/devkitpro/devkitARM
```

### Шаг 3: Измените URL в коде

Откройте `C:\website\switch-homebrew\source\main.c`

Найдите строку:
```c
const char* url = "https://your-website-url.com/standalone/simple.html";
```

Замените на ваш реальный URL (после размещения на Netlify/GitHub Pages).

### Шаг 4: Скомпилируйте

```bash
cd C:\website\switch-homebrew
make
```

Получите файл: `ai-chat.nro`

### Шаг 5: Установите на Switch

1. Скопируйте `ai-chat.nro` на SD карту в папку:
 ```
 /switch/ai-chat/ai-chat.nro
 ```

2. Вставьте SD карту в Switch

3. Запустите Homebrew Menu (удерживайте R при запуске игры/альбома)

4. Найдите "AI Chat" и запустите!

## Вариант 3: Самый простой (без CFW)

Если у вас нет кастомной прошивки:

1. **Используйте DNS трюк:**
 - Настройки → Интернет → Настройки подключения
 - Выберите сеть → Изменить настройки
 - DNS: `045.055.142.122`
 - Попробуйте подключиться - откроется браузер

2. **Или используйте игру с браузером:**
 - Некоторые игры имеют встроенный браузер
 - Например, через YouTube в некоторых играх

## Размещение сайта онлайн

### GitHub Pages (бесплатно):
```bash
1. Создайте репозиторий на github.com
2. Загрузите simple.html как index.html
3. Settings → Pages → Enable
4. URL: https://username.github.io/repo-name
```

### Netlify Drop (самое простое):
```bash
1. Откройте https://app.netlify.com/drop
2. Перетащите simple.html
3. Получите мгновенный URL
```

### Vercel:
```bash
1. Зарегистрируйтесь на vercel.com
2. Загрузите проект
3. Получите URL
```

## Проверка работы

1. Откройте URL на компьютере/телефоне
2. Убедитесь, что сайт работает
3. Перейдите в Настройки → добавьте API ключ
4. Протестируйте чат
5. Только после этого используйте на Switch

## Получение API ключа

1. Откройте: https://api.chatanywhere.tech/v1/oauth/free/render
2. Войдите через GitHub
3. Скопируйте ключ (начинается с `sk-`)
4. Вставьте в настройки сайта

## Готово! 

Теперь у вас есть AI чат на Nintendo Switch!
