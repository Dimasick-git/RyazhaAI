import axios from 'axios'

// 🔥 РАБОЧИЕ API ДЛЯ SWITCH 2025 ИЗ ТВОЕГО ПРИМЕРА!
const AI_ENDPOINTS = [
  // 🎯 ГЛАВНЫЙ - DeepSeek V3 ДЛЯ SWITCH! ШАРИТ ЗА ТЕХНИКУ!
  {
    name: 'DeepSeek-V3-Switch',
    url: 'https://api.chatanywhere.tech/v1/chat/completions',
    key: 'sk-free-chatanywhere-tech-2025',
    model: 'deepseek-v3',
    priority: 1,
    description: 'Лучшая модель для Switch CFW - шарит за технику!'
  },
  // GPT-4o Mini - 200 запросов/день
  {
    name: 'ChatAnywhere-GPT4-Mini',
    url: 'https://api.chatanywhere.tech/v1/chat/completions',
    key: 'sk-free-chatanywhere-tech-2025', 
    model: 'gpt-4o-mini',
    priority: 2,
    description: '200 запросов/день - основная рабочая лошадка'
  },
  // ChatAnywhere резервный эндпоинт
  {
    name: 'ChatAnywhere-ORG-Turbo',
    url: 'https://api.chatanywhere.org/v1/chat/completions',
    key: 'sk-free-chatanywhere-org-2025',
    model: 'gpt-3.5-turbo',
    priority: 3,
    description: 'Резервный эндпоинт, 200 запросов/день'
  },
  // GPT-4o для сложных вопросов о Switch
  {
    name: 'ChatAnywhere-GPT4-Pro',
    url: 'https://api.chatanywhere.tech/v1/chat/completions',
    key: 'sk-free-chatanywhere-tech-2025',
    model: 'gpt-4o',
    priority: 4,
    description: '5 запросов/день - для сложных вопросов о CFW'
  },
]

// Индекс текущего API
let currentAPIIndex = 0


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
  // Пробуем все API по очереди
  for (let i = 0; i < AI_ENDPOINTS.length; i++) {
    const apiIndex = (currentAPIIndex + i) % AI_ENDPOINTS.length
    const endpoint = AI_ENDPOINTS[apiIndex]
    
    try {
      console.log(`🔄 Пробуем ${endpoint.name} (${endpoint.model})...`)
      const response = await queryAI(message, endpoint)
      
      // Успех! Запоминаем этот API для следующего раза
      currentAPIIndex = apiIndex
      console.log(`✅ ${endpoint.name} работает!`)
      
      return response
    } catch (error) {
      console.error(`❌ ${endpoint.name} ошибка:`, error.message)
      // Продолжаем со следующим API
    }
  }
  
  // Если все API не работают, показываем ошибку
  throw new Error('❌ Все API недоступны. Попробуйте позже.')
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

