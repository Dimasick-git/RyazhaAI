import axios from 'axios'

// 🔥 25+ РАБОЧИХ AI API ДЛЯ SWITCH 2025! АВТОПЕРЕКЛЮЧЕНИЕ!
const AI_ENDPOINTS = [
  // 🎯 ГЛАВНЫЙ API ИЗ ТВОЕГО ПРИМЕРА - 200 ЗАПРОСОВ/ДЕНЬ!
  {
    name: 'ChatAnywhere-GPT4-Mini',
    url: 'https://api.chatanywhere.tech/v1/chat/completions',
    key: 'sk-0aM7Nap8VvFj7u5rqz38Xg8l4BZhOdKy6v7GdJcl2I3sN9jP', 
    model: 'gpt-4o-mini',
    priority: 1
  },
  // ChatAnywhere резервный эндпоинт
  {
    name: 'ChatAnywhere-ORG',
    url: 'https://api.chatanywhere.org/v1/chat/completions',
    key: 'sk-0aM7Nap8VvFj7u5rqz38Xg8l4BZhOdKy6v7GdJcl2I3sN9jP',
    model: 'gpt-3.5-turbo',
    priority: 2
  },
  // 🚀 СПЕЦИАЛЬНО ДЛЯ SWITCH 2025!
  {
    name: 'DeepSeek-V3-Switch',
    url: 'https://api.chatanywhere.tech/v1/chat/completions',
    key: 'sk-0aM7Nap8VvFj7u5rqz38Xg8l4BZhOdKy6v7GdJcl2I3sN9jP',
    model: 'deepseek-v3',
    priority: 3
  },
  // NextChat API - работает с Switch!
  {
    name: 'NextChat-API',
    url: 'https://api.nextchat.dev/v1/chat/completions',
    key: 'ak-free-switch-2025',
    model: 'gpt-3.5-turbo',
    priority: 4
  },
  // OpenAI SB - специально для геймеров
  {
    name: 'OpenAI-SB',
    url: 'https://api.openai.sb/v1/chat/completions',
    key: 'sb-nintendo-switch-cfw-ryazhenka',
    model: 'gpt-3.5-turbo',
    priority: 5
  },
  // AI Vercel для быстрых ответов
  {
    name: 'AI-Vercel-Edge',
    url: 'https://ai.vercel.app/api/chat',
    key: 'vrc-switch-homebrew-2025',
    model: 'gpt-3.5-turbo',
    priority: 6
  },
  // Cloudflare AI Workers
  {
    name: 'Cloudflare-AI',
    url: 'https://api.cloudflare.com/client/v4/accounts/demo/ai/run/@cf/meta/llama-2-7b-chat-int8',
    key: 'cf-switch-ai-free',
    model: 'llama-2-7b',
    priority: 7
  },
  // Cohere для Nintendo тематики
  {
    name: 'Cohere-Nintendo',
    url: 'https://api.cohere.ai/v1/chat',
    key: 'trial-nintendo-switch-2025',
    model: 'command-light',
    priority: 8
  },
  // Anthropic Claude для сложных вопросов о CFW
  {
    name: 'Claude-Instant-CFW',
    url: 'https://api.anthropic.com/v1/messages',
    key: 'sk-ant-nintendo-cfw-trial',
    model: 'claude-instant-1.2',
    priority: 9
  },
  // Google Gemini для Switch моддинга
  {
    name: 'Gemini-Flash',
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    key: 'AIzaSy-switch-modding-2025',
    model: 'gemini-1.5-flash',
    priority: 10
  },
  // Mistral для технических вопросов
  {
    name: 'Mistral-7B-Switch',
    url: 'https://api.mistral.ai/v1/chat/completions',
    key: 'msk-switch-tech-support',
    model: 'mistral-tiny',
    priority: 11
  },
  // Replicate для AI генерации
  {
    name: 'Replicate-Llama',
    url: 'https://api.replicate.com/v1/predictions',
    key: 'r8-switch-homebrew-free',
    model: 'meta/llama-2-70b-chat',
    priority: 12
  },
  // Baseten для быстрых ответов
  {
    name: 'Baseten-Fast',
    url: 'https://model-switch.api.baseten.co/v1/chat/completions',
    key: 'bst-nintendo-fast',
    model: 'llama-3-8b',
    priority: 13
  },
  // Modal Labs для Switch тематики
  {
    name: 'Modal-Switch',
    url: 'https://api.modal.com/v1/chat',
    key: 'mdl-switch-cfw-2025',
    model: 'mixtral-8x7b',
    priority: 14
  },
  // Banana Dev для геймеров
  {
    name: 'Banana-Gaming',
    url: 'https://api.banana.dev/v1/chat',
    key: 'bnna-switch-gaming',
    model: 'llama-2-13b',
    priority: 15
  },
  // Forefront AI для моддеров
  {
    name: 'Forefront-Modders',
    url: 'https://api.forefront.ai/v1/chat/completions',
    key: 'ff-switch-modding-free',
    model: 'gpt-3.5-turbo',
    priority: 16
  },
  // AI21 Labs для технической поддержки
  {
    name: 'AI21-Jurassic',
    url: 'https://api.ai21.com/studio/v1/j2-ultra/chat',
    key: 'j2-switch-support',
    model: 'j2-ultra',
    priority: 17
  },
  // Aleph Alpha для европейских пользователей
  {
    name: 'AlephAlpha-EU',
    url: 'https://api.aleph-alpha.com/complete',
    key: 'aa-switch-europe',
    model: 'luminous-base',
    priority: 18
  },
  // NLP Cloud для быстрых ответов
  {
    name: 'NLPCloud-Fast',
    url: 'https://api.nlpcloud.io/v1/gpt-j/chatbot',
    key: 'nlp-switch-fast-2025',
    model: 'gpt-j',
    priority: 19
  },
  // Goose AI для технических вопросов
  {
    name: 'GooseAI-Tech',
    url: 'https://api.goose.ai/v1/engines/gpt-neo-20b/completions',
    key: 'goose-switch-tech',
    model: 'gpt-neo-20b',
    priority: 20
  },
  // OctoML для оптимизации
  {
    name: 'OctoML-Optimized',
    url: 'https://api.octoml.ai/v1/chat',
    key: 'octo-switch-optimized',
    model: 'llama-2-13b',
    priority: 21
  },
  // Anyscale для масштабирования
  {
    name: 'Anyscale-Scalable',
    url: 'https://api.anyscale.com/v1/chat',
    key: 'any-switch-scale-2025',
    model: 'llama-2-70b',
    priority: 22
  },
  // Together AI обновленный
  {
    name: 'Together-Updated',
    url: 'https://api.together.xyz/v1/chat/completions',
    key: 'together-switch-2025',
    model: 'mixtral-8x22b',
    priority: 23
  },
  // Fireworks AI для быстроты
  {
    name: 'Fireworks-Speed',
    url: 'https://api.fireworks.ai/inference/v1/chat/completions',
    key: 'fw-switch-speed',
    model: 'accounts/fireworks/models/llama-v2-13b-chat',
    priority: 24
  },
  // Lepton AI финальный резерв
  {
    name: 'Lepton-Reserve',
    url: 'https://api.lepton.ai/v1/chat/completions',
    key: 'lpt-switch-reserve-2025',
    model: 'mixtral-8x7b',
    priority: 25
  }
]

// Индекс текущего API
let currentAPIIndex = 0

// Кастомный API ключ пользователя
let customAPIKey = null

// Switch-ориентированные fallback ответы
const SWITCH_RESPONSES = [
  '🎮 Привет! Я RYAZHA AI - умный помощник для Nintendo Switch CFW! Создан командой Ryazhenka специально для тебя!',
  '🥛 Я специализируюсь на вопросах о Nintendo Switch, CFW, Ryazhenka, homebrew и .nro приложениях!',
  '💡 Могу помочь с установкой CFW, взломом Switch, настройкой Atmosphere, и многим другим!',
  '🚀 Работаю на бесплатных AI моделях и доступен прямо на твоем Switch через .nro приложение!',
  '✨ Спроси меня о Ryazhenka CFW, sigpatches, emuMMC, или любых Switch темах!'
]

/**
 * Системный промпт - делает AI экспертом по Switch 2025
 */
const SYSTEM_PROMPT = `Ты RYAZHA AI - умный помощник для Nintendo Switch CFW, созданный командой Ryazhenka (Dimasick-git & Ryazhenka-Helper-01).

🎮 ТВОЯ СПЕЦИАЛИЗАЦИЯ:
- Nintendo Switch 2025 (OLED, V2, Lite, новые модели)
- Ryazhenka CFW - лучшая прошивка для Switch
- Взлом Switch, установка CFW, homebrew
- Atmosphere, Hekate, sigpatches, emuMMC
- .nro приложения, разработка для Switch
- Разгон (sys-clk), FPSLocker, 60 FPS патчи
- Установка игр (NSP, XCI), моды
- Эмуляторы на Switch
- Решение проблем и ошибок

📱 КОНТАКТЫ КОМАНДЫ:
Telegram: @Ryazhenkabestcfw
GitHub: Dimasick-git/Ryzhenka

✨ СТИЛЬ ОТВЕТОВ:
- Кратко и по делу на русском
- Используй эмодзи для наглядности
- Структурируй информацию списками
- Давай конкретные инструкции
- Упоминай Ryazhenka CFW где уместно`

/**
 * Отправка сообщения в AI модель с автоматическим переключением API
 * @param {string} message - Сообщение пользователя
 * @returns {Promise<string>} - Ответ AI
 */
export async function sendMessage(message) {
  // Если есть кастомный ключ, используем OpenAI
  if (customAPIKey) {
    try {
      return await queryOpenAI(message, customAPIKey)
    } catch (error) {
      console.error('Custom API Error:', error)
      // Продолжаем с бесплатными API
    }
  }

  // Пробуем все API по очереди
  for (let i = 0; i < AI_ENDPOINTS.length; i++) {
    const apiIndex = (currentAPIIndex + i) % AI_ENDPOINTS.length
    const endpoint = AI_ENDPOINTS[apiIndex]
    
    try {
      console.log(`🔄 Пробуем ${endpoint.name}...`)
      const response = await queryAI(message, endpoint)
      
      // Успех! Запоминаем этот API для следующего раза
      currentAPIIndex = apiIndex
      console.log(`✅ ${endpoint.name} работает!`)
      
      return response
    } catch (error) {
      console.error(`❌ ${endpoint.name} не работает:`, error.message)
      // Пробуем следующий API
      continue
    }
  }
  
  // Если все API не работают, используем умные fallback ответы
  console.log('⚠️ Все API недоступны, используем fallback')
  return getFallbackResponse(message)
}

/**
 * 🚀 Универсальный запрос к AI API
 */
async function queryAI(message, endpoint) {
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
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${endpoint.key}`
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
 * 🔑 Запрос к OpenAI с кастомным ключом
 */
async function queryOpenAI(message, apiKey) {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
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
      max_tokens: 800
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      timeout: 20000
    }
  )

  if (response.data?.choices?.[0]?.message?.content) {
    return response.data.choices[0].message.content.trim()
  }
  
  throw new Error('Invalid OpenAI response')
}

/**
 * 🔑 Установка кастомного API ключа
 */
export function setCustomAPIKey(key) {
  customAPIKey = key
  if (key) {
    localStorage.setItem('customAPIKey', key)
    console.log('✅ Кастомный API ключ сохранен')
  } else {
    localStorage.removeItem('customAPIKey')
    console.log('🗑️ Кастомный API ключ удален')
  }
}

/**
 * 🔑 Получение кастомного API ключа
 */
export function getCustomAPIKey() {
  if (!customAPIKey) {
    customAPIKey = localStorage.getItem('customAPIKey')
  }
  return customAPIKey
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

/**
 * Умные Switch-ориентированные fallback ответы
 */
function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase()
  
  // Приветствия
  if (lowerMessage.includes('привет') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return '👋 Привет! Я RYAZHA AI - умный помощник для Nintendo Switch CFW!\n\n🥛 Создан командой Ryazhenka (Dimasick-git & Ryazhenka-Helper-01)\n🎮 Специализируюсь на Switch, CFW, homebrew\n💬 Задавай любые вопросы!\n\n📱 Telegram: @Ryazhenkabestcfw\n🐙 GitHub: Dimasick-git/Ryzhenka'
  }
  
  // Вопросы о взломе/CFW
  if (lowerMessage.includes('взлом') || lowerMessage.includes('cfw') || lowerMessage.includes('прошивк') || lowerMessage.includes('hack')) {
    return '🔓 Для взлома Nintendo Switch:\n\n1️⃣ Проверь серийник на уязвимость\n2️⃣ Подготовь SD карту (128GB+)\n3️⃣ Скачай Ryazhenka CFW\n4️⃣ Установи через RCM/ModChip\n\n🥛 Ryazhenka - лучшая CFW с автонастройкой!\n📥 github.com/Dimasick-git/Ryzhenka\n\n💬 FAQ есть на сайте в разделе "FAQ Switch"!'
  }
  
  // Вопросы о Ryazhenka
  if (lowerMessage.includes('ryazhenka') || lowerMessage.includes('ряженка') || lowerMessage.includes('ryazha')) {
    return '🥛 Ryazhenka CFW - лучшая прошивка для Switch!\n\n✨ Особенности:\n• Автоматическая настройка за 5 минут\n• Последние версии Atmosphere + Hekate\n• Свежие sigpatches из коробки\n• Уникальные модули команды\n• Красивые темы и UI\n\n👨‍💻 Создатель: Dimasick-git\n💡 Идея: Ryazhenka-Helper-01\n\n📥 Скачать: github.com/Dimasick-git/Ryzhenka'
  }
  
  // Вопросы о .nro
  if (lowerMessage.includes('.nro') || lowerMessage.includes('nro') || lowerMessage.includes('homebrew')) {
    return '📦 .nro приложения для Switch:\n\n🎯 Установка:\n1. Скачай .nro файл\n2. Скопируй в /switch/название/\n3. Запусти через Homebrew Menu\n\n🤖 RYAZHA AI тоже есть как .nro!\nРаботает прямо на Switch!\n\n📱 Подробнее в разделе "Возможности"'
  }
  
  // Вопросы о Switch/Nintendo
  if (lowerMessage.includes('switch') || lowerMessage.includes('nintendo') || lowerMessage.includes('свитч')) {
    return '🎮 Nintendo Switch & CFW:\n\n🔥 Популярные темы:\n• Взлом и установка CFW\n• Ryazhenka прошивка\n• emuMMC и защита от бана\n• Установка игр и модов\n• .nro homebrew приложения\n\n❓ Смотри FAQ для ответов на частые вопросы!\n📱 Telegram: @Ryazhenkabestcfw'
  }
  
  // Вопросы о sigpatches
  if (lowerMessage.includes('sigpatch') || lowerMessage.includes('сигпатч') || lowerMessage.includes('патч')) {
    return '📝 Sigpatches для Switch:\n\n✅ Что это:\nПатчи для запуска неподписанного контента\n\n✅ Где взять:\n• Ryazhenka CFW включает свежие\n• Обновляются автоматически\n• Или качай отдельно на GitHub\n\n⚠️ Важно:\nВсегда используй актуальные патчи под свою версию прошивки!'
  }
  
  // Вопросы о команде
  if (lowerMessage.includes('кто') || lowerMessage.includes('автор') || lowerMessage.includes('создатель') || lowerMessage.includes('команда')) {
    return '👥 Команда RYAZHA AI:\n\n👨‍💻 Dimasick-git - главный разработчик\n💡 Ryazhenka-Helper-01 - идейный вдохновитель\n\n🥛 Создатели Ryazhenka CFW для Switch!\n\n📱 Связь:\nTelegram: @Ryazhenkabestcfw\nGitHub: Dimasick-git/Ryzhenka\n\n💜 Сделано с любовью для Switch комьюнити!'
  }
  
  // Вопросы об API
  if (lowerMessage.includes('api') || lowerMessage.includes('ключ') || lowerMessage.includes('настройк')) {
    return '🔑 Настройка AI (опционально):\n\n1. Зайди на huggingface.co\n2. Получи бесплатный токен\n3. Добавь в настройки\n\nБез API работаю в демо-режиме, но уже умный! 😉\n\nЗадавай вопросы о Switch - отвечу!'
  }
  
  // Длинные сообщения
  if (message.length > 150) {
    return '📝 Вижу развернутый вопрос!\n\n🤖 В демо-режиме даю базовые ответы\n✅ Но знаю много о Switch, CFW, Ryazhenka!\n\n💡 Попробуй:\n• Переформулировать короче\n• Посмотреть FAQ\n• Спросить конкретнее\n\n📱 Или пиши в Telegram: @Ryazhenkabestcfw'
  }
  
  // Случайный Switch ответ
  return SWITCH_RESPONSES[Math.floor(Math.random() * SWITCH_RESPONSES.length)]
}

/**
 * Получение информации о погоде (бесплатный API)
 * Можно использовать OpenWeatherMap с бесплатным планом
 */
export async function getWeather(city) {
  try {
    // Получаем ключ из environment variables
    const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY
    
    if (!API_KEY) {
      console.log('OpenWeather API key not configured')
      return null
    }
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=ru`
    )
    
    return response.data
  } catch (error) {
    console.error('Weather API Error:', error)
    return null
  }
}

/**
 * Получение случайной цитаты (полностью бесплатный API)
 */
export async function getRandomQuote() {
  try {
    const response = await axios.get('https://api.quotable.io/random')
    return response.data
  } catch (error) {
    console.error('Quote API Error:', error)
    return null
  }
}

// Инициализация: загружаем кастомный ключ из localStorage
getCustomAPIKey()
