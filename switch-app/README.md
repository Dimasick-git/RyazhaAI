# AI RYAHA - Nintendo Switch Application

.nro приложение для доступа к AI RYAHA прямо с Nintendo Switch!

## Возможности

- Запуск AI RYAHA прямо с Switch
- Использует встроенный веб-апплет для отображения
- Красивый UI в стиле Ryazhenka
- Поддержка тачскрина и контроллера

## Требования

### Для использования:
- Nintendo Switch с кастомной прошивкой (Ryazhenka, Atmosphere, и т.д.)
- Подключение к интернету
- Рабочий сервер AI RYAHA (локальный или задеплоенный)

### Для сборки:
- [DevkitPro](https://devkitpro.org/) с установленным libnx
- Make
- Git

## Сборка

### Windows

```batch
# Установи DevkitPro
# Скачай с https://github.com/devkitPro/installer/releases

# Установи переменную окружения
set DEVKITPRO=C:/devkitPro

# Собери.nro
cd switch-app
make
```

### Linux / macOS

```bash
# Установи DevkitPro
# https://devkitpro.org/wiki/Getting_Started

# Установи переменную окружения
export DEVKITPRO=/opt/devkitpro

# Собери.nro
cd switch-app
make
```

После успешной сборки получишь файл `ai-ryaha.nro`

## Установка на Switch

1. Скопируй `ai-ryaha.nro` на SD карту Switch
2. Положи в папку `/switch/ai-ryaha/`
3. Запусти через Homebrew Menu (hbmenu)

## Настройка URL

По умолчанию приложение подключается к `http://localhost:3000`

Чтобы изменить URL на задеплоенный сайт:

1. Открой `source/main.cpp`
2. Найди строку:
```cpp
const char* websiteUrl = "http://localhost:3000";
```
3. Замени на свой URL:
```cpp
const char* websiteUrl = "https://your-ai-ryaha-site.com";
```
4. Пересобери проект

## Использование

1. Запусти приложение через Homebrew Menu
2. Нажми **[A]** для открытия AI RYAHA в браузере
3. Используй тачскрин или стики для навигации
4. Общайся с AI прямо с Switch!
5. Нажми **[+]** для выхода

## Структура проекта

```
switch-app/
├── source/
│ └── main.cpp # Основной код приложения
├── include/ # Заголовочные файлы (если нужны)
├── romfs/ # Встроенные ресурсы (если нужны)
├── Makefile # Конфигурация сборки
├── ai-ryaha.json # Метаданные приложения
└── README.md # Этот файл
```

## Устранение проблем

### Ошибка при сборке
- Убедись, что DevkitPro установлен правильно
- Проверь переменную окружения `DEVKITPRO`
- Обнови DevkitPro до последней версии

### Приложение не запускается
- Проверь, что Switch на кастомной прошивке
- Убедись, что файл `.nro` в папке `/switch/`
- Попробуй запустить через Homebrew Menu

### Не открывается сайт
- Проверь подключение Switch к интернету
- Убедись, что сервер AI RYAHA запущен и доступен
- Проверь правильность URL в коде

### Веб-апплет вылетает
- Некоторые сайты могут быть несовместимы с веб-апплетом Switch
- Попробуй упростить веб-интерфейс
- Проверь консольные логи

## Советы

- Используй Wi-Fi для лучшей скорости
- Для локальной разработки настрой локальный сервер
- Задеплой сайт на Netlify/Vercel для постоянного доступа
- Можно добавить иконку приложения (256x256 JPG)

## Вклад в проект

Нашел баг или хочешь улучшить код?
- Открой Issue
- Сделай Pull Request
- Предложи идеи

## Лицензия

MIT License - используй свободно!

## Благодарности

- DevkitPro team за инструменты
- Ryazhenka community за поддержку
- Nintendo Switch homebrew developers

---

** AI RYAHA for Switch v1.0.0**

Made with for Ryazhenka community
