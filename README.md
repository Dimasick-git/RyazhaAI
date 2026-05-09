# 🥛 RYAZHA AI v2.0.0 - Умный помощник для Nintendo Switch

[![GitHub stars](https://img.shields.io/github/stars/Dimasick-git?style=social)](https://github.com/Dimasick-git)
[![GitHub followers](https://img.shields.io/github/followers/Dimasick-git?style=social)](https://github.com/Dimasick-git)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📊 Статистика репозитория

![Views](https://komarev.com/ghpvc/?username=Dimasick-git&repo=RyazhaAI&style=flat-square)
![Downloads](https://img.shields.io/github/downloads/Dimasick-git/RyazhaAI/total?style=flat-square)

> Современный AI чат-бот с 12+ бесплатными API, созданный командой [Ryazhenka](https://github.com/Dimasick-git/Ryzhenka) специально для Nintendo Switch CFW комьюнити!

## 🌐 Демо

**Попробуй прямо сейчас:**
https://dimasick-git.github.io/RyazhaAI

## 📱 Switch приложение

**Скачай .nro файл:**
[Releases](https://github.com/Dimasick-git/RyazhaAI/releases/latest)

## ✨ Возможности

### 🌐 Веб-версия:
- **12+ бесплатных AI API** с автоматическим переключением
- **GPT-4 модель** через ChatAnywhere
- **Настройки API ключа** - используй свой OpenAI ключ
- **FAQ раздел** с популярными вопросами
- **Космический дизайн** с анимациями
- **Адаптивный** для всех устройств

### 🎮 Switch приложение (.nro):
- **Автоматический запуск** браузера через 2 секунды
- **Красивая иконка** 256x256 для HBmenu
- **Автор указан:** Dimasick-git
- **Ссылки** на GitHub и Telegram
- **Поддержка геймпада** и тач-скрина

### 🧠 Знания AI:
- **Ryazhenka CFW** - детальная информация
- **Все проекты Dimasick-git** с GitHub
- **Nintendo Switch 2026** - актуальная информация
- **Разгон и оптимизация** - sys-clk, ReverseNX
- **FPSLocker и 60 FPS** патчи
- **Установка игр** - NSP, XCI
- **Homebrew и эмуляторы**

## 🚀 Установка Switch приложения

1. Скачай `ryazha-ai.nro` из [Releases](https://github.com/Dimasick-git/RyazhaAI/releases/latest)
2. Скопируй на SD карту: `/switch/ryazha-ai/ryazha-ai.nro`
3. Вставь SD в Switch
4. Запусти Homebrew Menu
5. Найди "RYAZHA AI" 🥛
6. Запусти приложение!
7. Через 2 секунды откроется сайт автоматически!

## 💻 Разработка

### Установка зависимостей

```bash
npm install
```

### Запуск в режиме разработки

```bash
npm run dev
```

Сайт будет доступен на `http://localhost:3000`

### Сборка для GitHub Pages

```bash
npm run build
```

### Деплой на GitHub Pages

```bash
npm run deploy
```

Или просто `git push` - GitHub Actions автоматически задеплоит!

## ⚙️ Настройка API ключа

По умолчанию используются бесплатные API, но ты можешь добавить свой OpenAI ключ:

1. Открой сайт
2. Нажми на иконку настроек ⚙️
3. Введи свой API ключ
4. Сохрани

Ключ сохраняется в localStorage браузера.

## 🔧 Сборка Switch приложения

### Требования:
- DevkitPro с установленным libnx
- Nintendo Switch с CFW (Ryazhenka/Atmosphere)

### Сборка:

```bash
cd switch-app
make clean
make
```

Готовый `ryazha-ai.nro` появится в папке `switch-app/`

### Быстрая сборка (Windows):

```bash
BUILD_SWITCH.bat
```

## 📁 Структура проекта

```
AI RYAHA/
├── src/
│   ├── components/      # React компоненты
│   │   ├── Header.jsx
│   │   ├── ChatInterface.jsx
│   │   ├── Features.jsx
│   │   └── Footer.jsx
│   ├── services/        # API сервисы
│   │   └── api.js
│   ├── App.jsx          # Главный компонент
│   ├── main.jsx         # Точка входа
│   └── index.css        # Стили
├── switch-app/          # .nro приложение для Switch
├── package.json
└── README.md
```

## 🛠️ Технологии

**Веб:**
- React 18 + Vite
- TailwindCSS
- Axios для API
- Lucide Icons

**Switch:**
- C++ с libnx
- DevkitPro ARM GCC
- WebCommonConfig для браузера
- PadState для контроллера

**Хостинг:**
- GitHub Pages (бесплатно!)
- GitHub Actions для CI/CD

## 👥 Команда

**Создано командой Ryazhenka CFW:**

- 👨‍💻 **Dimasick-git** - главный разработчик, создатель Ryazhenka CFW
- 💡 **Ryazhenka-Helper-01** - идейный вдохновитель, первый реализовал идею

📱 **Telegram:** [@Ryazhenkabestcfw](https://t.me/Ryazhenkabestcfw)  
🐙 **GitHub:** [Dimasick-git/Ryzhenka](https://github.com/Dimasick-git/Ryzhenka)

## 🔗 Ссылки

🌐 **Сайт:** https://dimasick-git.github.io/RyazhaAI  
📱 **GitHub:** https://github.com/Dimasick-git/RyazhaAI  
🎉 **Релизы:** https://github.com/Dimasick-git/RyazhaAI/releases  
📱 **Telegram:** [@Ryazhenkabestcfw](https://t.me/Ryazhenkabestcfw)  
🥛 **Ryazhenka CFW:** [github.com/Dimasick-git/Ryzhenka](https://github.com/Dimasick-git/Ryzhenka)

## 🤝 Помощь проекту

Этот проект создан для комьюнити Ryazhenka CFW!

- ⭐ Поставь звезду репозиторию
- 🐛 Сообщи о багах
- 💡 Предложи новые фичи
- 🔧 Помоги с кодом

## 📝 Changelog

### v2.0.0 (07.11.2025)
- 🎉 Первый официальный релиз!
- ✨ Космический дизайн интерфейса
- 🔥 12+ бесплатных AI API
- 🧠 Эксперт по Switch 2025
- ⚙️ Настройки API ключа
- 🎮 Switch .nro приложение
- 🚀 Автозапуск браузера
- 🖼️ Иконка для HBmenu
- 🌐 GitHub Pages хостинг
- 💰 Полностью бесплатно!

## ⚖️ Лицензия

MIT License - используй свободно!

## 👨‍💻 Автор

**Dimasick-git**

🌐 GitHub: [Dimasick-git](https://github.com/Dimasick-git)  
📱 Telegram: [@Ryazhenkabestcfw](https://t.me/Ryazhenkabestcfw)  
💎 Boosty: [boosty.to/dimasick-git](https://boosty.to/dimasick-git)

---

**🥛 RYAZHA AI v2.0.0** - Умный помощник для Nintendo Switch CFW!

Made with 💜 for Ryazhenka community by Dimasick-git
