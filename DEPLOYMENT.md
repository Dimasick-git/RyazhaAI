# 🚀 Руководство по деплою AI RYAHA

Пошаговая инструкция по деплою сайта на бесплатный хостинг

## 📋 Варианты деплоя

### 1. Netlify (Рекомендуется)

**Преимущества:**
- ✅ Полностью бесплатный
- ✅ Автоматический CI/CD из GitHub
- ✅ Поддержка HTTPS из коробки
- ✅ Глобальный CDN

**Шаги:**

1. **Подготовь проект для Git:**
```bash
cd "c:\Users\dimas\OneDrive\Рабочий стол\AI RYAHA"
git init
git add .
git commit -m "🥛 Initial commit - AI RYAHA"
```

2. **Загрузи на GitHub:**
```bash
# Создай репозиторий на github.com
git remote add origin https://github.com/YOUR_USERNAME/ai-ryaha.git
git push -u origin main
```

3. **Деплой на Netlify:**
   - Зайди на [netlify.com](https://netlify.com)
   - Войди через GitHub
   - Нажми "New site from Git"
   - Выбери свой репозиторий
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Нажми "Deploy site"

4. **Получи URL:**
   - Netlify автоматически создаст URL вида `your-site.netlify.app`
   - Можешь настроить custom domain бесплатно

### 2. Vercel

**Преимущества:**
- ✅ Бесплатный план
- ✅ Отличная производительность
- ✅ Простой деплой

**Шаги:**

```bash
# Установи Vercel CLI
npm i -g vercel

# Деплой
cd "c:\Users\dimas\OneDrive\Рабочий стол\AI RYAHA"
vercel

# Следуй инструкциям в терминале
```

### 3. GitHub Pages

**Шаги:**

1. Добавь в `vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/ai-ryaha/', // Название репозитория
  server: {
    port: 3000,
    host: true
  }
})
```

2. Создай `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install and Build
        run: |
          npm install
          npm run build
          
      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@4.1.5
        with:
          branch: gh-pages
          folder: dist
```

## 🔧 Настройка после деплоя

### Обновление URL в .nro приложении

После деплоя обнови URL в Switch приложении:

1. Открой `switch-app/source/main.cpp`
2. Найди:
```cpp
const char* websiteUrl = "http://localhost:3000";
```
3. Замени на твой URL:
```cpp
const char* websiteUrl = "https://your-site.netlify.app";
```
4. Пересобери .nro:
```bash
cd switch-app
make clean
make
```

### Настройка API ключей

После деплоя добавь API ключи через environment variables:

**Netlify:**
1. Site settings → Build & deploy → Environment variables
2. Добавь:
   - `VITE_HF_TOKEN` - Hugging Face токен
   - `VITE_OPENWEATHER_KEY` - OpenWeather ключ

**Vercel:**
```bash
vercel env add VITE_HF_TOKEN
vercel env add VITE_OPENWEATHER_KEY
```

Обнови код для использования env vars:

```javascript
// src/services/api.js
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN
const WEATHER_KEY = import.meta.env.VITE_OPENWEATHER_KEY
```

## 🌐 Кастомный домен

### Netlify:
1. Купи домен (или используй бесплатный на freenom.com)
2. Site settings → Domain management → Add custom domain
3. Настрой DNS записи

### Vercel:
```bash
vercel domains add your-domain.com
```

## 📱 Тестирование

После деплоя протестируй:

1. **Веб-версия:**
   - Открой сайт в браузере
   - Проверь AI чат
   - Проверь мобильную версию

2. **Switch версия:**
   - Скопируй обновленный .nro на Switch
   - Запусти и проверь подключение

## 🐛 Решение проблем

### CORS ошибки
Добавь в `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
```

### API не работает
- Проверь API ключи в environment variables
- Убедись, что используешь HTTPS
- Проверь лимиты API

### Медленная загрузка
- Оптимизируй изображения
- Включи compression
- Используй code splitting

## 📊 Мониторинг

### Netlify Analytics
- Бесплатный план: базовая статистика
- Платный: детальная аналитика

### Google Analytics
Добавь в `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🔄 Автообновления

### Netlify автоматический деплой:
1. Каждый push в main → автодеплой
2. Pull requests → preview deploys
3. Rollback в один клик

### Manual deploy:
```bash
# Netlify
netlify deploy --prod

# Vercel
vercel --prod
```

## 💡 Оптимизация

### Build optimization:
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
})
```

### Lighthouse score:
- Стремись к 90+ по всем метрикам
- Оптимизируй изображения
- Используй lazy loading

## 🎯 Чеклист перед релизом

- [ ] Протестирован в разных браузерах
- [ ] Работает на мобильных устройствах
- [ ] API ключи настроены
- [ ] HTTPS включен
- [ ] Switch приложение обновлено с новым URL
- [ ] README обновлен с финальным URL
- [ ] SEO метатеги добавлены
- [ ] Analytics настроен

---

**🥛 Готово к деплою!** Удачи с AI RYAHA! 🚀
