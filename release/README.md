# 🚀 RyazhaAI Release Package

## 📦 Что включено:
- ✅ **Web версия** (dist/) - для GitHub Pages
- ✅ **Switch версия** (RyazhaAI-switch/) - для .nro компиляции
- ✅ **Скрипты сборки** - автоматизация процесса

## 🎮 Как использовать:

### Веб версия:
1. Залей dist/ на GitHub Pages
2. Открой https://dimasick-git.github.io/RyazhaAI

### Switch .nro:
1. Установи devkitPro
2. Запусти: `npm run build-nro`
3. Скопируй RyazhaAI.nro на Switch

### Автоматическая упаковка:
```bash
npm run package
```

## 📁 Структура:
```
release/
├── dist/                    # Веб версия
├── RyazhaAI-switch/         # Switch версия
├── build-nro.sh            # Скрипт сборки .nro
├── build-release.js        # Скрипт сборки релиза
└── README.md               # Этот файл
```

---
🥛 RYAZHA AI - Создано с любовью для Switch комьюнити!
