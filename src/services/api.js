import axios from 'axios'

const CHATANYWHERE_KEY = import.meta.env.VITE_CHATANYWHERE_KEY || ''

const AI_ENDPOINTS = [
  // 1. ChatAnywhere GPT-4o-mini (200 запросов/день) - ГЛАВНАЯ!
  {
    name: 'ChatAnywhere-GPT4o-Mini',
    url: 'https://api.chatanywhere.tech/v1/chat/completions',
    key: CHATANYWHERE_KEY,
    model: 'gpt-4o-mini',
    priority: 1
  },
  // 2. ChatAnywhere GPT-3.5-turbo (200 запросов/день)
  {
    name: 'ChatAnywhere-GPT3.5',
    url: 'https://api.chatanywhere.tech/v1/chat/completions',
    key: CHATANYWHERE_KEY,
    model: 'gpt-3.5-turbo',
    priority: 2
  },
  // 3. ChatAnywhere DeepSeek-v3 (30 запросов/день) - ДЛЯ SWITCH!
  {
    name: 'ChatAnywhere-DeepSeek',
    url: 'https://api.chatanywhere.tech/v1/chat/completions',
    key: CHATANYWHERE_KEY,
    model: 'deepseek-v3',
    priority: 3
  },
  // 4. ChatAnywhere GPT-4o (5 запросов/день) - МОЩНАЯ!
  {
    name: 'ChatAnywhere-GPT4o',
    url: 'https://api.chatanywhere.tech/v1/chat/completions',
    key: CHATANYWHERE_KEY,
    model: 'gpt-4o',
    priority: 4
  },
  // 5. ChatAnywhere ORG резервный эндпоинт
  {
    name: 'ChatAnywhere-ORG-Turbo',
    url: 'https://api.chatanywhere.org/v1/chat/completions',
    key: CHATANYWHERE_KEY,
    model: 'gpt-3.5-turbo',
    priority: 5
  },
  // 6. ChatAnywhere ORG GPT-4o-mini
  {
    name: 'ChatAnywhere-ORG-Mini',
    url: 'https://api.chatanywhere.org/v1/chat/completions',
    key: CHATANYWHERE_KEY,
    model: 'gpt-4o-mini',
    priority: 6
  }
]

// Индекс текущего API
let currentAPIIndex = 0

// Fallback ответы если все API не работают
const FALLBACK_RESPONSES = {
  greeting: 'Привет! Я RYAZHA AI - умный помощник для Nintendo Switch CFW!\n\nСоздан командой Ryazhenka (Dimasick-git & Ryazhenka-Helper-01)\nСпециализируюсь на Switch, CFW, homebrew\nЗадавай любые вопросы!\n\nTelegram: @Ryazhenkabestcfw\nGitHub: Dimasick-git/Ryzhenka',
  cfw: 'Для взлома Nintendo Switch 2026:\n\n1. Проверь серийник на уязвимость\n2. Подготовь SD карту (128GB+)\n3. Скачай Ryazhenka CFW\n4. Установи через RCM/ModChip\n\nRyazhenka - лучшая CFW с автонастройкой!\ngithub.com/Dimasick-git/Ryzhenka',
  ryazhenka: 'Ryazhenka CFW - лучшая прошивка для Switch 2026!\n\nОсобенности:\n• Автонастройка за 5 минут\n• Atmosphere 1.8.0+ и Hekate 6.4.0+\n• Свежие sigpatches из коробки\n• Уникальные модули команды\n• Красивые темы и UI\n\nСоздатель: Dimasick-git\nИдея: Ryazhenka-Helper-01\n\nСкачать: github.com/Dimasick-git/Ryzhenka',
  team: 'Команда RYAZHA AI:\n\nDimasick-git - главный разработчик\nRyazhenka-Helper-01 - идейный вдохновитель\n\nСоздатели Ryazhenka CFW для Switch!\n\nСвязь:\nTelegram: @Ryazhenkabestcfw\nGitHub: Dimasick-git/Ryzhenka\n\nСделано для Switch комьюнити!',
  default: 'AI временно перегружен, но скоро вернётся!\n\nПока что могу помочь с базовыми вопросами:\n\nRyazhenka CFW - лучшая прошивка для Switch 2026\nRYAZHA AI - твой умный помощник для CFW\nПомощь с взломом, играми, модами, homebrew\n\nСвязь с командой:\nTelegram: @Ryazhenkabestcfw\nGitHub: Dimasick-git/Ryzhenka\n\nAI перезагружается... попробуй через минуту!'
}


/**
 * Системный промпт - делает AI экспертом по прошитому Switch 2026
 * Оптимизирован для DeepSeek V3 - технической модели
 */
const SYSTEM_PROMPT = `Ты RYAZHA AI - эксперт по прошитому Nintendo Switch в 2026 году, созданный командой Ryazhenka (Dimasick-git & Ryazhenka-Helper-01).

ТВОЯ ЭКСПЕРТИЗА ПО ПРОШИТОМУ SWITCH 2026:
- Nintendo Switch всех моделей (OLED, V2, V1, Lite) с CFW
- Ryazhenka CFW - премиальная кастомная прошивка для Switch
- Взлом Switch 2026: RCM, модчипы (SX Core, Picofly, Hwfly)
- Atmosphere 1.8.0+ (2026), Hekate 6.4.0+, sigpatches свежие
- emuMMC/emuNAND настройка, защита от бана Nintendo
- Homebrew приложения: Tinfoil, Goldleaf, DBI, FTPd
- .nro разработка с libnx, переносы игр, системные модули
- Разгон Switch: sys-clk, SaltyNX, ReverseNX-RT
- 60 FPS патчи (FPSLocker), графические моды 2026
- NSP/XCI установка, моды игр, читы (EdiZon, ACNH-Cheats)
- Эмуляторы Switch 2026: RetroArch, Lakka, специальные порты
- Актуальные проблемы 2026: новые прошивки, обновления игр
- Технические детали: TegraRcmGUI, fusee.bin, payload injection

ОСОБЕННОСТИ RYAZHENKA CFW 2026:
- Автонастройка за 5 минут
- Свежие sigpatches из коробки
- Оптимизация батареи и производительности
- Уникальные темы оформления
- Автообновление компонентов
- Русская локализация и поддержка

КОНТАКТЫ КОМАНДЫ:
Telegram: @Ryazhenkabestcfw
GitHub: Dimasick-git/Ryzhenka

СТИЛЬ ОТВЕТОВ:
- Технически точно, кратко на русском
- Пошаговые инструкции с версиями 2026
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
      console.log(`[${i + 1}/${AI_ENDPOINTS.length}] Пробуем ${endpoint.name}...`)
      const response = await queryAI(message, endpoint)
      
      // Успех! Запоминаем этот API для следующего раза
      currentAPIIndex = apiIndex
      console.log(`${endpoint.name} работает!`)
      
      return response
    } catch (error) {
      console.error(`${endpoint.name} ошибка:`, error.message)
      // Автоматически переключаемся на следующий API
      continue
    }
  }
  
  // Если ВСЕ API не работают - используем умные fallback ответы
  console.log('Все API недоступны, используем fallback ответы')
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
 * Универсальный запрос к AI API (С КЛЮЧОМ!)
 */
async function queryAI(message, endpoint) {
  // Стандартный OpenAI-совместимый формат ChatAnywhere
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
      max_tokens: 1000,
      stream: false
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${endpoint.key}`
      },
      timeout: 30000
    }
  )

  // Извлекаем ответ
  if (response.data?.choices?.[0]?.message?.content) {
    return response.data.choices[0].message.content.trim()
  }
  
  throw new Error('Invalid response format')
}


/**
 * Проверка статуса AI API
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
      message: `Работает ${workingAPIs.length} API: ${workingAPIs.join(', ')}`,
      apis: workingAPIs
    }
  }
  
  return { 
    status: 'offline', 
    message: 'Все API недоступны. Используется демо-режим.',
    apis: []
  }
}

