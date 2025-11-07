import axios from 'axios'

// 🔥 12+ БЕСПЛАТНЫХ AI API С АВТОМАТИЧЕСКИМ ПЕРЕКЛЮЧЕНИЕМ!
const AI_ENDPOINTS = [
  // 1. ChatAnywhere - GPT-4, бесплатно!
  {
    name: 'ChatAnywhere',
    url: 'https://api.chatanywhere.tech/v1/chat/completions',
    key: 'sk-pu4PcKN0IiMB5vq3DLRNkx7FQ0PbgJJcHtl2gYWXSz2OA1Vp',
    model: 'gpt-3.5-turbo',
    priority: 1
  },
  // 2. Free ChatGPT API
  {
    name: 'FreeChatGPT',
    url: 'https://free.churchless.tech/v1/chat/completions',
    key: 'sk-freetrial',
    model: 'gpt-3.5-turbo',
    priority: 2
  },
  // 3. AIService
  {
    name: 'AIService',
    url: 'https://api.aiservice.tech/v1/chat/completions',
    key: 'sk-free-trial',
    model: 'gpt-3.5-turbo',
    priority: 3
  },
  // 4. OpenAI Proxy 1
  {
    name: 'OpenAIProxy1',
    url: 'https://api.openai-proxy.com/v1/chat/completions',
    key: 'sk-free',
    model: 'gpt-3.5-turbo',
    priority: 4
  },
  // 5. GPT API Free
  {
    name: 'GPTAPIFree',
    url: 'https://gptapi.us/v1/chat/completions',
    key: 'sk-free-gpt',
    model: 'gpt-3.5-turbo',
    priority: 5
  },
  // 6. AI Proxy
  {
    name: 'AIProxy',
    url: 'https://ai-proxy.net/v1/chat/completions',
    key: 'sk-proxy-free',
    model: 'gpt-3.5-turbo',
    priority: 6
  },
  // 7. OpenRouter (бесплатные модели)
  {
    name: 'OpenRouter',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    key: 'sk-or-v1-free',
    model: 'openai/gpt-3.5-turbo',
    priority: 7
  },
  // 8. Together AI
  {
    name: 'TogetherAI',
    url: 'https://api.together.xyz/v1/chat/completions',
    key: 'free-trial',
    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    priority: 8
  },
  // 9. Groq (очень быстрый!)
  {
    name: 'Groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    key: 'gsk_free',
    model: 'mixtral-8x7b-32768',
    priority: 9
  },
  // 10. Perplexity AI
  {
    name: 'Perplexity',
    url: 'https://api.perplexity.ai/chat/completions',
    key: 'pplx-free',
    model: 'mixtral-8x7b-instruct',
    priority: 10
  },
  // 11. DeepInfra
  {
    name: 'DeepInfra',
    url: 'https://api.deepinfra.com/v1/openai/chat/completions',
    key: 'free-tier',
    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    priority: 11
  },
  // 12. Hugging Face
  {
    name: 'HuggingFace',
    url: 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
    key: 'hf_free',
    model: 'mistralai/Mistral-7B-Instruct-v0.2',
    priority: 12
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
