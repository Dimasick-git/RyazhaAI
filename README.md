# RyazhaAI

**EN:** AI chat web app + companion Nintendo Switch `.nro` launcher. React/Vite SPA hosted on GitHub Pages, multi-provider AI backend (~12 free APIs with auto-fallback), knowledge-pack tuned for Ryazhenka CFW / Switch homebrew topics. Switch `.nro` opens the web app in the system browser. License: MIT.

---

## Что это

Чат-бот для Ryazhenka CFW комьюнити. Две составляющих:

- **Web SPA** (React 18 + Vite + Tailwind) — основной интерфейс. Хостится на GitHub Pages: https://dimasick-git.github.io/RyazhaAI
- **Switch `.nro`** (`switch-app/`) — нативный лаунчер. При запуске из Homebrew Menu открывает web-версию в системном браузере.

Backend — мультипровайдер: при ошибке/rate-limit одного API автоматически переключается на следующий. Знания сфокусированы на Ryazhenka CFW, разгоне sys-clk / RCU, FPSLocker, установке игр, эмуляторах.

## Стек

- React 18, Vite 5, TailwindCSS 3, lucide-react, axios.
- Switch: C++ + libnx + DevkitPro ARM GCC (`switch-app/Makefile`).
- CI: `.github/workflows/ci-cd.yml` (lint + build + Pages deploy), `release.yml` (artifact bundle + .nro).
- Hosting: GitHub Pages (бесплатно). Опциональный Docker (nginx — см. `Dockerfile`, `nginx.conf`).

## Установка (Switch)

1. Скачать `ryazha-ai.nro` из [Releases](https://github.com/Dimasick-git/RyazhaAI/releases/latest).
2. Положить на SD: `/switch/ryazha-ai/ryazha-ai.nro`.
3. Запустить через Homebrew Menu → автозапуск браузера через 2 секунды.

Требования: Atmosphere/Ryazhenka CFW + Homebrew Menu.

## Установка (web)

Уже задеплоено на https://dimasick-git.github.io/RyazhaAI — открывается в любом браузере.

## Локальный запуск

```sh
npm install
npm run dev      # http://localhost:3000
npm run build    # сборка в dist/
npm run deploy   # деплой на GitHub Pages (или через git push, см. workflow)
```

## Switch .nro сборка

Требуется DevkitPro + libnx. Подробный гайд — `website/switch-homebrew/BUILD_INSTRUCTIONS.md`.

```sh
cd switch-app
make clean
make
# результат: switch-app/ryazha-ai.nro
```

## Docker (опционально)

```sh
docker build -t ryazhaai .
docker run -p 8080:80 ryazhaai
# открыть http://localhost:8080
```

Подробности — `DOCKER-SETUP.md`.

## API ключи

По умолчанию используются бесплатные публичные провайдеры. Свой ключ OpenAI можно положить через UI: иконка настроек → поле API key → сохранить (хранится в `localStorage`). См. `.env.example` для конфигурации сборки.

## Структура

```
src/                  React SPA
switch-app/           .nro builder (libnx)
website/              отдельный standalone-вариант + server proxy
website/switch-homebrew/  гайды по сборке .nro
release/              артефакты упаковки
.github/workflows/    CI/CD
```

## Авторы

Dimasick-git (создатель Ryazhenka CFW), Ryazhenka-Helper-01 (идея).

Telegram: [@Ryazhenkabestcfw](https://t.me/Ryazhenkabestcfw)

## Лицензия

MIT. См. `LICENSE`.
