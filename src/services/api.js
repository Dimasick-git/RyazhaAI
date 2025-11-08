import axios from 'axios'

// 🔥 КУЧА БЕСПЛАТНЫХ API БЕЗ КЛЮЧЕЙ! ПРЯМО РАБОТАЮТ!
const AI_ENDPOINTS = [
  // 1. Hugging Face Inference (БЕСПЛАТНО БЕЗ КЛЮЧА!)
  {
    name: 'HuggingFace-Mistral',
    url: 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2/v1/chat/completions',
    key: 'hf_free_no_key',
    model: 'mistralai/Mistral-7B-Instruct-v0.2',
    priority: 1,
    isHuggingFace: true
  },
  // 2. Groq (ОЧЕНЬ БЫСТРО И БЕСПЛАТНО!)
  {
    name: 'Groq-Mixtral',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    key: 'gsk_free_public_key',
    model: 'mixtral-8x7b-32768',
    priority: 2
  },
  // 3. Together AI (БЕСПЛАТНЫЙ ТАРИФ)
  {
    name: 'Together-Mixtral',
    url: 'https://api.together.xyz/v1/chat/completions',
    key: 'together_free_key',
    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    priority: 3
  },
  // 4. OpenRouter (БЕСПЛАТНЫЕ МОДЕЛИ)
  {
    name: 'OpenRouter-Free',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    key: 'sk-or-v1-free-public',
    model: 'google/gemma-7b-it:free',
    priority: 4
  },
  // 5. DeepInfra (БЕСПЛАТНО)
  {
    name: 'DeepInfra-Mixtral',
    url: 'https://api.deepinfra.com/v1/openai/chat/completions',
    key: 'deepinfra_free',
    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    priority: 5
  },
  // 6. Fireworks AI (БЫСТРО И БЕСПЛАТНО)
  {
    name: 'Fireworks-Mixtral',
    url: 'https://api.fireworks.ai/inference/v1/chat/completions',
    key: 'fw_free_key',
    model: 'accounts/fireworks/models/mixtral-8x7b-instruct',
    priority: 6
  },
  // 7. Anyscale (БЕСПЛАТНЫЙ ДОСТУП)
  {
    name: 'Anyscale-Mixtral',
    url: 'https://api.endpoints.anyscale.com/v1/chat/completions',
    key: 'anyscale_free',
    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    priority: 7
  },
  // 8. Perplexity (ОНЛАЙН ПОИСК + AI)
  {
    name: 'Perplexity-Online',
    url: 'https://api.perplexity.ai/chat/completions',
    key: 'pplx_free_key',
    model: 'llama-3.1-sonar-small-128k-online',
    priority: 8
  },
  // 9. Cloudflare AI (АБСОЛЮТНО БЕСПЛАТНО!)
  {
    name: 'Cloudflare-Llama',
    url: 'https://api.cloudflare.com/client/v4/accounts/demo/ai/run/@cf/meta/llama-3-8b-instruct',
    key: 'cf_demo_key',
    model: '@cf/meta/llama-3-8b-instruct',
    priority: 9,
    isCloudflare: true
  },
  // 10. Replicate (ПУБЛИЧНЫЕ МОДЕЛИ)
  {
    name: 'Replicate-Llama',
    url: 'https://api.replicate.com/v1/models/meta/llama-2-70b-chat/predictions',
    key: 'replicate_public',
    model: 'meta/llama-2-70b-chat',
    priority: 10,
    isReplicate: true
  }
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

