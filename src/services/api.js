import axios from 'axios'

const getAPIBase = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL ?? null
  }
  return ''
}

const FALLBACK_RESPONSES = {
  greeting: 'Привет! Я RYAZHA AI — умный помощник для Nintendo Switch CFW!\n\nСоздан командой Ryazhenka (Dimasick-git & Ryazhenka-Helper-01)\nСпециализируюсь на Switch, CFW и homebrew.\nЗадавай любые вопросы!\n\nTelegram: @Ryazhenkabestcfw\nGitHub: Dimasick-git/Ryzhenka',
  cfw: 'Для взлома Nintendo Switch 2026:\n\n1. Проверь серийник на уязвимость\n2. Подготовь SD карту (128GB+)\n3. Скачай Ryazhenka CFW\n4. Установи через RCM/ModChip\n\nRyazhenka — лучшая CFW с автонастройкой!\ngithub.com/Dimasick-git/Ryzhenka',
  ryazhenka: 'Ryazhenka CFW — лучшая прошивка для Switch 2026!\n\nОсобенности:\n• Автонастройка за 5 минут\n• Atmosphere 1.8.0+ и Hekate 6.4.0+\n• Свежие sigpatches из коробки\n• Уникальные модули команды\n• Красивые темы и UI\n\nСоздатель: Dimasick-git\nИдея: Ryazhenka-Helper-01\n\nСкачать: github.com/Dimasick-git/Ryzhenka',
  team: 'Команда RYAZHA AI:\n\nDimasick-git — главный разработчик\nRyazhenka-Helper-01 — идейный вдохновитель\n\nСоздатели Ryazhenka CFW для Switch!\n\nСвязь:\nTelegram: @Ryazhenkabestcfw\nGitHub: Dimasick-git/Ryzhenka',
  default: 'AI временно перегружен, но скоро вернётся!\n\nRyazhenka CFW — лучшая прошивка для Switch 2026\nRYAZHA AI — умный помощник для CFW\n\nСвязь с командой:\nTelegram: @Ryazhenkabestcfw\nGitHub: Dimasick-git/Ryzhenka',
}

function getFallbackResponse(message) {
  const lower = message.toLowerCase()
  if (lower.includes('привет') || lower.includes('hello') || lower.includes('hi')) return FALLBACK_RESPONSES.greeting
  if (lower.includes('cfw') || lower.includes('взлом') || lower.includes('прошивк')) return FALLBACK_RESPONSES.cfw
  if (lower.includes('ryazhenka') || lower.includes('ряженка')) return FALLBACK_RESPONSES.ryazhenka
  if (lower.includes('команда') || lower.includes('кто') || lower.includes('автор')) return FALLBACK_RESPONSES.team
  return FALLBACK_RESPONSES.default
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function withRetry(fn, attempts = 2, baseDelay = 800) {
  let lastError
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (i < attempts - 1) await sleep(baseDelay * Math.pow(2, i))
    }
  }
  throw lastError
}

export async function sendMessage(message, history = []) {
  const apiBase = getAPIBase()
  if (import.meta.env.PROD && apiBase === null) {
    return 'Ошибка конфигурации: URL бэкенда не задан (VITE_API_URL). Обратитесь к администратору.'
  }

  try {
    const response = await withRetry(() =>
      axios.post(
        `${apiBase}/api/chat`,
        { message, history },
        { headers: { 'Content-Type': 'application/json' }, timeout: 30_000 },
      )
    )
    if (response.data?.response) return response.data.response
    throw new Error('Invalid response format')
  } catch (error) {
    const status = error.response?.status
    if (status === 429) {
      console.warn('Rate limited by backend, using fallback')
    } else if (status >= 500) {
      console.warn('Backend server error:', status)
    } else {
      console.error('API call failed:', error.message)
    }
    return getFallbackResponse(message)
  }
}

export async function sendMessageStream(message, history = [], onChunk) {
  const apiBase = getAPIBase()
  if (import.meta.env.PROD && apiBase === null) {
    throw new Error('URL бэкенда не настроен (VITE_API_URL)')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 45_000)

  let response
  try {
    response = await fetch(`${apiBase}/api/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${response.status}`)
  }
  if (!response.body) throw new Error('Streaming not supported by browser')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buf += decoder.decode(value, { stream: true })
      const lines = buf.split('\n')
      buf = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const raw = line.slice(6).trim()
        if (!raw) continue
        try {
          const data = JSON.parse(raw)
          if (data.chunk) onChunk(data.chunk)
          if (data.done) return
          if (data.error) throw new Error(data.error)
        } catch (e) {
          if (e.message && !e.message.includes('JSON')) throw e
        }
      }
    }
  } finally {
    reader.cancel().catch(() => {})
  }
}

export async function checkAPIStatus() {
  const apiBase = getAPIBase()
  if (import.meta.env.PROD && apiBase === null) {
    return { status: 'offline', message: 'URL бэкенда не настроен (VITE_API_URL).', apis: [] }
  }

  try {
    const response = await axios.get(`${apiBase}/api/health`, { timeout: 5_000 })
    if (response.data?.status === 'ok') {
      return {
        status: 'online',
        message: 'Бэкенд доступен',
        streaming: response.data.streaming === true,
        apis: ['backend'],
      }
    }
  } catch { /* fall through */ }

  return { status: 'offline', message: 'Бэкенд недоступен. Используется демо-режим.', apis: [] }
}
