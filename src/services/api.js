import axios from 'axios'

// 🔥 ВСЕ МОДЕЛИ CHATANYWHERE + АВТОПЕРЕКЛЮЧЕНИЕ!
// Получи БЕСПЛАТНЫЙ ключ тут: https://api.chatanywhere.tech/v1/oauth/free/render
const AI_ENDPOINTS = [
  // 1. ChatAnywhere GPT-4o-mini (200 запросов/день) - ГЛАВНАЯ!
  {
    name: 'ChatAnywhere-GPT4o-Mini',
    url: 'https://api.chatanywhere.tech/v1/chat/completions',
    key: 'DEMO_KEY', // Замени на свой ключ с https://api.chatanywhere.tech/v1/oauth/free/render
    model: 'gpt-4o-mini',
    priority: 1
  },
  // 2. ChatAnywhere GPT-3.5-turbo (200 запросов/день)
  {
    name: 'ChatAnywhere-GPT3.5',
    url: 'https://api.chatanywhere.tech/v1/chat/completions',
    key: 'DEMO_KEY',
    model: 'gpt-3.5-turbo',
    priority: 2
  },
  // 3. ChatAnywhere DeepSeek-v3 (30 запросов/день) - ДЛЯ SWITCH!
  {
    name: 'ChatAnywhere-DeepSeek',
    url: 'https://api.chatanywhere.tech/v1/chat/completions',
    key: 'DEMO_KEY',
    model: 'deepseek-v3',
    priority: 3
  },
  // 4. ChatAnywhere GPT-4o (5 запросов/день) - МОЩНАЯ!
  {
    name: 'ChatAnywhere-GPT4o',
    url: 'https://api.chatanywhere.tech/v1/chat/completions',
    key: 'DEMO_KEY',
    model: 'gpt-4o',
    priority: 4
  },
  // 5. ChatAnywhere ORG резервный эндпоинт
  {
    name: 'ChatAnywhere-ORG-Turbo',
    url: 'https://api.chatanywhere.org/v1/chat/completions',
    key: 'DEMO_KEY',
    model: 'gpt-3.5-turbo',
    priority: 5
  },
  // 6. ChatAnywhere ORG GPT-4o-mini
  {
    name: 'ChatAnywhere-ORG-Mini',
    url: 'https://api.chatanywhere.org/v1/chat/completions',
    key: 'DEMO_KEY',
    model: 'gpt-4o-mini',
    priority: 6
  }
]

// Индекс текущего API
let currentAPIIndex = 0

// Fallback ответы если все API не работают
const FALLBACK_RESPONSES = {
  greeting: '👋 Привет! Я RYAZHA AI - умный помощник для Nintendo Switch CFW!\n\n🥛 Создан командой Ryazhenka (Dimasick-git & Ryazhenka-Helper-01)\n🎮 Специализируюсь на Switch, CFW, homebrew\n💬 Задавай любые вопросы!\n\n📱 Telegram: @Ryazhenkabestcfw\n🐙 GitHub: Dimasick-git/Ryzhenka',
  cfw: '🔓 Для взлома Nintendo Switch 2025:\n\n1️⃣ Проверь серийник на уязвимость\n2️⃣ Подготовь SD карту (128GB+)\n3️⃣ Скачай Ryazhenka CFW\n4️⃣ Установи через RCM/ModChip\n\n🥛 Ryazhenka - лучшая CFW с автонастройкой!\n📥 github.com/Dimasick-git/Ryzhenka',
  ryazhenka: '🥛 Ryazhenka CFW - лучшая прошивка для Switch 2025!\n\n✨ Особенности:\n• Автонастройка за 5 минут\n• Atmosphere 1.8.0+ и Hekate 6.4.0+\n• Свежие sigpatches из коробки\n• Уникальные модули команды\n• Красивые темы и UI\n\n👨‍💻 Создатель: Dimasick-git\n💡 Идея: Ryazhenka-Helper-01\n\n📥 Скачать: github.com/Dimasick-git/Ryzhenka',
  team: '👥 Команда RYAZHA AI:\n\n👨‍💻 Dimasick-git - главный разработчик\n💡 Ryazhenka-Helper-01 - идейный вдохновитель\n\n🥛 Создатели Ryazhenka CFW для Switch!\n\n📱 Связь:\nTelegram: @Ryazhenkabestcfw\nGitHub: Dimasick-git/Ryzhenka\n\n💜 Сделано с любовью для Switch комьюнити!',
  default: '🎮 AI работает в демо-режиме!\n\n💡 Для полноценной работы нужен БЕСПЛАТНЫЙ ключ ChatAnywhere:\n\n1️⃣ Открой: https://api.chatanywhere.tech/v1/oauth/free/render\n2️⃣ Войди через GitHub\n3️⃣ Получи ключ (200 запросов/день БЕСПЛАТНО!)\n\n✨ С ключом будут работать:\n• GPT-4o-mini (200/день)\n• GPT-3.5-turbo (200/день)\n• DeepSeek-v3 (30/день)\n• GPT-4o (5/день)\n\n📱 Telegram: @Ryazhenkabestcfw\n🐙 GitHub: Dimasick-git/Ryzhenka'
}


/**
 * Системный промпт - делает AI экспертом по прошитому Switch 2025
 * Оптимизирован для DeepSeek V3 - технической модели
 */
const SYSTEM_PROMPT = `Ты RYAZHA AI - эксперт по прошитому Nintendo Switch в 2025 году, созданный командой Ryazhenka (Dimasick-git & Ryazhenka-Helper-01).

🎮 ТВОЯ ЭКСПЕРТИЗА ПО ПРОШИТОМУ SWITCH 2025:
- Nintendo Switch всех моделей (OLED, V2, V1, Lite) с CFW
- Ryazhenka CFW - премиальная кастомная прошивка для Switch
- Взлом Switch 2025: RCM, модчипы (SX Core, Picofly, Hwfly)
- Atmosphere 1.8.0+ (2025), Hekate 6.4.0+, sigpatches свежие
- emuMMC/emuNAND настройка, защита от бана Nintendo
- Homebrew приложения: Tinfoil, Goldleaf, DBI, FTPd
- .nro разработка с libnx, переносы игр, системные модули
- Разгон Switch: sys-clk, SaltyNX, ReverseNX-RT
- 60 FPS патчи (FPSLocker), графические моды 2025
- NSP/XCI установка, моды игр, читы (EdiZon, ACNH-Cheats)
- Эмуляторы Switch 2025: RetroArch, Lakka, специальные порты
- Актуальные проблемы 2025: новые прошивки, обновления игр
- Технические детали: TegraRcmGUI, fusee.bin, payload injection

🔥 ОСОБЕННОСТИ RYAZHENKA CFW 2025:
- Автонастройка за 5 минут
- Свежие sigpatches из коробки
- Оптимизация батареи и производительности
- Уникальные темы оформления
- Автообновление компонентов
- Русская локализация и поддержка

📱 КОНТАКТЫ КОМАНДЫ:
Telegram: @Ryazhenkabestcfw
GitHub: Dimasick-git/Ryzhenka

✨ СТИЛЬ ОТВЕТОВ:
- Технически точно, кратко на русском
- Эмодзи для структуры
- Пошаговые инструкции с версиями 2025
- Ссылки на актуальные источники
- Упоминай Ryazhenka CFW как лучшее решение
- Предупреждай о рисках бана Nintendo`

/**
 * Отправка сообщения в AI модель с автоматическим переключением API
 * @param {string} message - Сообщение пользователя
 * @returns {Promise<string>} - Ответ AI
 */
export async function sendMessage(message) {
  // Если нет API, сразу используем fallback
  if (AI_ENDPOINTS.length === 0) {
    return getFallbackResponse(message)
  }
  
  // Пробуем все API по очереди С АВТОПЕРЕКЛЮЧЕНИЕМ
  for (let i = 0; i < AI_ENDPOINTS.length; i++) {
    const apiIndex = (currentAPIIndex + i) % AI_ENDPOINTS.length
    const endpoint = AI_ENDPOINTS[apiIndex]
    
    try {
      console.log(`🔄 [${i + 1}/${AI_ENDPOINTS.length}] Пробуем ${endpoint.name}...`)
      const response = await queryAI(message, endpoint)
      
      // Успех! Запоминаем этот API для следующего раза
      currentAPIIndex = apiIndex
      console.log(`✅ ${endpoint.name} работает!`)
      
      return response
    } catch (error) {
      console.error(`❌ ${endpoint.name} ошибка:`, error.message)
      // Автоматически переключаемся на следующий API
      continue
    }
  }
  
  // Если ВСЕ API не работают - используем умные fallback ответы
  console.log('⚠️ Все API недоступны, используем fallback ответы')
  return getFallbackResponse(message)
}

// Умные fallback ответы по ключевым словам
function getFallbackResponse(message) {
  const lower = message.toLowerCase()
  
  if (lower.includes('привет') || lower.includes('hello') || lower.includes('hi')) {
    return FALLBACK_RESPONSES.greeting
  }
  if (lower.includes('cfw') || lower.includes('взлом') || lower.includes('прошивк')) {
    return FALLBACK_RESPONSES.cfw
  }
  if (lower.includes('ryazhenka') || lower.includes('ряженка')) {
    return FALLBACK_RESPONSES.ryazhenka
  }
  if (lower.includes('команда') || lower.includes('кто') || lower.includes('автор')) {
    return FALLBACK_RESPONSES.team
  }
  
  return FALLBACK_RESPONSES.default
}

/**
 * 🚀 Универсальный запрос к AI API (БЕЗ АВТОРИЗАЦИИ!)
 */
async function queryAI(message, endpoint) {
  // Для Hugging Face используем упрощённый формат
  if (endpoint.isHuggingFace) {
    const response = await axios.post(
      endpoint.url,
      {
        inputs: message,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          return_full_text: false
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )
    
    if (response.data?.[0]?.generated_text) {
      return response.data[0].generated_text.trim()
    }
  }
  
  // Для Cloudflare Workers AI
  if (endpoint.isCloudflare) {
    const response = await axios.post(
      endpoint.url,
      {
        messages: [{ role: 'user', content: message }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    )
    
    if (response.data?.result?.response) {
      return response.data.result.response.trim()
    }
  }
  
  // Стандартный OpenAI-совместимый формат (без ключа)
  const response = await axios.post(
    endpoint.url,
    {
      model: endpoint.model,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
      stream: false
    },
    {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    }
  )

  // Извлекаем ответ
  if (response.data?.choices?.[0]?.message?.content) {
    return response.data.choices[0].message.content.trim()
  }
  
  throw new Error('Invalid response format')
}


/**
 * 🔍 Проверка статуса AI API
 */
export async function checkAPIStatus() {
  const workingAPIs = []
  
  for (const endpoint of AI_ENDPOINTS.slice(0, 3)) {
    try {
      await queryAI('test', endpoint)
      workingAPIs.push(endpoint.name)
    } catch (error) {
      // API не работает
    }
  }
  
  if (workingAPIs.length > 0) {
    return { 
      status: 'online', 
      message: `✅ Работает ${workingAPIs.length} API: ${workingAPIs.join(', ')}`,
      apis: workingAPIs
    }
  }
  
  return { 
    status: 'offline', 
    message: '⚠️ Все API недоступны. Используется демо-режим.',
    apis: []
  }
}

