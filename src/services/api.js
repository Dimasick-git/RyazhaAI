import axios from 'axios'

// ⚡ БЕСПЛАТНОЕ БЕЗЛИМИТНОЕ API - CODY API
const CODY_API = {
  baseURL: 'https://cody.su/api/v1',
  getKeyURL: 'https://cody.su/api/v1/get_api_key',
  model: 'gpt-4.1', // Лучшая модель, бесплатно!
}

// Кэш для API ключа Cody
let codyApiKey = null

// Запасные API endpoints (если нужны)
const FALLBACK_ENDPOINTS = {
  huggingface: 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
}

// Switch-ориентированные fallback ответы
const SWITCH_RESPONSES = [
  '🎮 Привет! Я RYAZHA AI - умный помощник для Nintendo Switch CFW! Создан командой Ryazhenka специально для тебя!',
  '🥛 Я специализируюсь на вопросах о Nintendo Switch, CFW, Ryazhenka, homebrew и .nro приложениях!',
  '💡 Могу помочь с установкой CFW, взломом Switch, настройкой Atmosphere, и многим другим!',
  '🚀 Работаю на бесплатных AI моделях и доступен прямо на твоем Switch через .nro приложение!',
  '✨ Спроси меня о Ryazhenka CFW, sigpatches, emuMMC, или любых Switch темах!'
]

/**
 * Отправка сообщения в AI модель
 * @param {string} message - Сообщение пользователя
 * @returns {Promise<string>} - Ответ AI
 */
export async function sendMessage(message) {
  try {
    // 🚀 Используем бесплатное безлимитное Cody API!
    const response = await queryCodyAPI(message)
    return response
  } catch (error) {
    console.error('Cody API Error:', error)
    
    // Fallback на умные Switch-ответы
    return getFallbackResponse(message)
  }
}

/**
 * 🔑 Получение или обновление Cody API ключа
 */
async function getCodyApiKey() {
  // Если ключ уже есть в кэше, используем его
  if (codyApiKey) {
    return codyApiKey
  }
  
  try {
    // Получаем новый бесплатный ключ
    const response = await axios.post(CODY_API.getKeyURL, {}, {
      timeout: 10000
    })
    
    // Ключ приходит в виде простого текста
    codyApiKey = response.data.trim()
    console.log('✅ Cody API ключ получен!')
    return codyApiKey
  } catch (error) {
    console.error('Ошибка получения Cody API ключа:', error)
    throw error
  }
}

/**
 * 🚀 Запрос к бесплатному безлимитному Cody API
 */
async function queryCodyAPI(message) {
  try {
    // Получаем API ключ (автоматически, бесплатно!)
    const apiKey = await getCodyApiKey()
    
    // Формируем запрос в OpenAI-совместимом формате
    const response = await axios.post(
      `${CODY_API.baseURL}/chat/completions`,
      {
        model: CODY_API.model,
        messages: [
          {
            role: 'system',
            content: 'Ты умный помощник для Nintendo Switch CFW. Отвечай кратко и по делу на русском языке. Специализируешься на взломе Switch, Ryazhenka CFW, homebrew, .nro приложениях.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 30000
      }
    )

    // Извлекаем ответ
    if (response.data?.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content.trim()
    }
    
    throw new Error('Invalid response format')
  } catch (error) {
    console.error('Cody API query error:', error)
    
    // Если ключ устарел, сбрасываем кэш и пробуем еще раз
    if (error.response?.status === 401 && codyApiKey) {
      console.log('🔄 Обновляем Cody API ключ...')
      codyApiKey = null
      return queryCodyAPI(message) // Рекурсивный вызов с новым ключом
    }
    
    throw error
  }
}

/**
 * 🔍 Проверка статуса Cody API
 */
export async function checkCodyAPIStatus() {
  try {
    await getCodyApiKey()
    return { 
      status: 'online', 
      message: '✅ Cody API работает! Бесплатно и безлимитно!',
      api: 'Cody API v1',
      model: CODY_API.model
    }
  } catch (error) {
    return { 
      status: 'offline', 
      message: '❌ Cody API недоступен. Используется демо-режим.',
      error: error.message
    }
  }
}

/**
 * Умные Switch-ориентированные fallback ответы
 */
function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase()
  
  // Приветствия
  if (lowerMessage.includes('привет') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return '👋 Привет! Я RYAZHA AI - умный помощник для Nintendo Switch CFW!\n\n🥛 Создан командой Ryazhenka (Dimasick-git & Ryazha-Helper-01)\n🎮 Специализируюсь на Switch, CFW, homebrew\n💬 Задавай любые вопросы!\n\n📱 Telegram: @Ryazhenkabestcfw\n🐙 GitHub: Dimasick-git/Ryzhenka'
  }
  
  // Вопросы о взломе/CFW
  if (lowerMessage.includes('взлом') || lowerMessage.includes('cfw') || lowerMessage.includes('прошивк') || lowerMessage.includes('hack')) {
    return '🔓 Для взлома Nintendo Switch:\n\n1️⃣ Проверь серийник на уязвимость\n2️⃣ Подготовь SD карту (128GB+)\n3️⃣ Скачай Ryazhenka CFW\n4️⃣ Установи через RCM/ModChip\n\n🥛 Ryazhenka - лучшая CFW с автонастройкой!\n📥 github.com/Dimasick-git/Ryzhenka\n\n💬 FAQ есть на сайте в разделе "FAQ Switch"!'
  }
  
  // Вопросы о Ryazhenka
  if (lowerMessage.includes('ryazhenka') || lowerMessage.includes('ряженка') || lowerMessage.includes('ryazha')) {
    return '🥛 Ryazhenka CFW - лучшая прошивка для Switch!\n\n✨ Особенности:\n• Автоматическая настройка за 5 минут\n• Последние версии Atmosphere + Hekate\n• Свежие sigpatches из коробки\n• Уникальные модули команды\n• Красивые темы и UI\n\n👨‍💻 Создатель: Dimasick-git\n💡 Идея: Ryazha-Helper-01\n\n📥 Скачать: github.com/Dimasick-git/Ryzhenka'
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
    return '👥 Команда RYAZHA AI:\n\n👨‍💻 Dimasick-git - главный разработчик\n💡 Ryazha-Helper-01 - идейный вдохновитель\n\n🥛 Создатели Ryazhenka CFW для Switch!\n\n📱 Связь:\nTelegram: @Ryazhenkabestcfw\nGitHub: Dimasick-git/Ryzhenka\n\n💜 Сделано с любовью для Switch комьюнити!'
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

/**
 * Проверка статуса API
 */
export async function checkAPIStatus() {
  try {
    const response = await axios.get(API_ENDPOINTS.huggingface, {
      timeout: 5000
    })
    return { status: 'online', message: 'API работает!' }
  } catch (error) {
    return { status: 'offline', message: 'Используется демо-режим' }
  }
}
