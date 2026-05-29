import axios from 'axios'

// Determine the base URL for API calls.
// In dev, Vite proxies /api → http://localhost:3001/api
// In prod, VITE_API_URL must point to the deployed backend.
const getAPIBase = () => {
  if (import.meta.env.PROD) {
    if (!import.meta.env.VITE_API_URL) {
      return null // signals "not configured"
    }
    return import.meta.env.VITE_API_URL
  }
  return '' // relative URL — Vite proxy handles it in dev
}

// Fallback ответы если все API не работают
const FALLBACK_RESPONSES = {
  greeting: 'Привет! Я RYAZHA AI - умный помощник для Nintendo Switch CFW!\n\nСоздан командой Ryazhenka (Dimasick-git & Ryazhenka-Helper-01)\nСпециализируюсь на Switch, CFW, homebrew\nЗадавай любые вопросы!\n\nTelegram: @Ryazhenkabestcfw\nGitHub: Dimasick-git/Ryzhenka',
  cfw: 'Для взлома Nintendo Switch 2026:\n\n1. Проверь серийник на уязвимость\n2. Подготовь SD карту (128GB+)\n3. Скачай Ryazhenka CFW\n4. Установи через RCM/ModChip\n\nRyazhenka - лучшая CFW с автонастройкой!\ngithub.com/Dimasick-git/Ryzhenka',
  ryazhenka: 'Ryazhenka CFW - лучшая прошивка для Switch 2026!\n\nОсобенности:\n• Автонастройка за 5 минут\n• Atmosphere 1.8.0+ и Hekate 6.4.0+\n• Свежие sigpatches из коробки\n• Уникальные модули команды\n• Красивые темы и UI\n\nСоздатель: Dimasick-git\nИдея: Ryazhenka-Helper-01\n\nСкачать: github.com/Dimasick-git/Ryzhenka',
  team: 'Команда RYAZHA AI:\n\nDimasick-git - главный разработчик\nRyazhenka-Helper-01 - идейный вдохновитель\n\nСоздатели Ryazhenka CFW для Switch!\n\nСвязь:\nTelegram: @Ryazhenkabestcfw\nGitHub: Dimasick-git/Ryzhenka\n\nСделано для Switch комьюнити!',
  default: 'AI временно перегружен, но скоро вернётся!\n\nПока что могу помочь с базовыми вопросами:\n\nRyazhenka CFW - лучшая прошивка для Switch 2026\nRYAZHA AI - твой умный помощник для CFW\nПомощь с взломом, играми, модами, homebrew\n\nСвязь с командой:\nTelegram: @Ryazhenkabestcfw\nGitHub: Dimasick-git/Ryzhenka\n\nAI перезагружается... попробуй через минуту!'
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

export async function sendMessage(message, history = []) {
  const apiBase = getAPIBase()

  if (import.meta.env.PROD && apiBase === null) {
    return 'Ошибка конфигурации: URL бэкенда не задан (VITE_API_URL не установлен). Обратитесь к администратору.'
  }

  try {
    const response = await axios.post(
      `${apiBase}/api/chat`,
      { message, history },
      { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
    )

    if (response.data?.response) return response.data.response
    throw new Error('Invalid response format')
  } catch (error) {
    console.error('API call failed:', error.message)
    return getFallbackResponse(message)
  }
}

/**
 * Streaming version — calls onChunk(text) for each text piece as it arrives.
 * Throws on error so caller can fall back to sendMessage().
 */
export async function sendMessageStream(message, history = [], onChunk) {
  const apiBase = getAPIBase()

  if (import.meta.env.PROD && apiBase === null) {
    throw new Error('URL бэкенда не настроен (VITE_API_URL)')
  }

  const response = await fetch(`${apiBase}/api/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${response.status}`)
  }

  if (!response.body) throw new Error('Streaming not supported by browser')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''

  const processLine = (line) => {
    if (!line.startsWith('data: ')) return false
    const raw = line.slice(6).trim()
    if (!raw) return false
    try {
      const data = JSON.parse(raw)
      if (data.chunk) onChunk(data.chunk)
      if (data.done) return true
      if (data.error) throw new Error(data.error)
    } catch (e) {
      if (e.message && !e.message.includes('JSON')) throw e
    }
    return false
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buf += decoder.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop()

    for (const line of lines) {
      if (processLine(line)) return
    }
  }

  // Flush decoder and process any remaining buffered data
  buf += decoder.decode()
  if (buf) processLine(buf)
}

export async function checkAPIStatus() {
  const apiBase = getAPIBase()

  if (import.meta.env.PROD && apiBase === null) {
    return { status: 'offline', message: 'URL бэкенда не настроен (VITE_API_URL).', apis: [] }
  }

  try {
    const response = await axios.get(`${apiBase}/api/health`, { timeout: 5000 })
    if (response.data?.status === 'ok') {
      return {
        status: 'online',
        message: 'Бэкенд доступен',
        streaming: response.data.streaming === true,
        apis: ['backend'],
      }
    }
  } catch {
    // fall through
  }

  return { status: 'offline', message: 'Бэкенд недоступен. Используется демо-режим.', apis: [] }
}
