// Determine the base URL for API calls.
// In dev, Vite proxies /api → http://localhost:3001/api
// In prod, VITE_API_URL must point to the deployed backend.
//
// Note: any module-level mutable state here (e.g. a cached last-working index)
// would not be safe under concurrent server-side usage. This is intentionally
// acceptable because this file runs exclusively in a single-user SPA context
// where there is only one JS execution thread (the browser event loop).
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
  greeting: 'ИИ-ассистент временно недоступен. Попробуйте позже.',
  cfw: 'ИИ-ассистент временно недоступен. Попробуйте позже.',
  ryazhenka: 'ИИ-ассистент временно недоступен. Попробуйте позже.',
  team: 'ИИ-ассистент временно недоступен. Попробуйте позже.',
  default: 'ИИ-ассистент временно недоступен. Попробуйте позже.'
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

async function _fetchWithTimeout(url, options, timeoutMs = 30000) {
  const controller = new AbortController()
  const timerId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    return response
  } finally {
    clearTimeout(timerId)
  }
}

async function _retryFetch(url, options, { retries = 2, timeoutMs = 30000 } = {}) {
  let lastError
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, Math.min(1000 * 2 ** (attempt - 1), 8000)))
      }
      const response = await _fetchWithTimeout(url, options, timeoutMs)
      return response
    } catch (err) {
      lastError = err
      if (err.name === 'AbortError') break // timeout — don't retry
    }
  }
  throw lastError
}

export async function sendMessage(message, history = [], model) {
  const apiBase = getAPIBase()

  if (import.meta.env.PROD && apiBase === null) {
    return 'Ошибка конфигурации: URL бэкенда не задан (VITE_API_URL не установлен). Обратитесь к администратору.'
  }

  try {
    const body = { message, history }
    if (model) body.model = model
    const response = await _retryFetch(`${apiBase}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (data?.response) return data.response
    throw new Error('Invalid response format')
  } catch (error) {
    console.error('API call failed:', error.message)
    return getFallbackResponse(message)
  }
}

/**
 * Streaming version — calls onChunk(text) for each text piece as it arrives.
 * Returns a cancel() function; call it to abort the stream early.
 * Throws on error so caller can fall back to sendMessage().
 *
 * @returns {{ cancel: () => void, promise: Promise<void> }}
 */
export function sendMessageStream(message, history = [], onChunk, timeoutMs = 30000, model) {
  const apiBase = getAPIBase()

  if (import.meta.env.PROD && apiBase === null) {
    const err = new Error('URL бэкенда не настроен (VITE_API_URL)')
    return { cancel: () => {}, promise: Promise.reject(err) }
  }

  const controller = new AbortController()
  const cancel = () => controller.abort()

  const promise = (async () => {
    const timerId = setTimeout(() => controller.abort(), timeoutMs)
    const streamBody = { message, history }
    if (model) streamBody.model = model
    let response
    try {
      response = await fetch(`${apiBase}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(streamBody),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timerId)
    }

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

    try {
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
    } catch (e) {
      // AbortError means the caller cancelled — not a real error
      if (e.name === 'AbortError') return
      throw e
    }
  })()

  return { cancel, promise }
}

let _statusCache = null
let _statusCacheTs = 0
const STATUS_CACHE_TTL = 30_000 // recheck every 30 seconds

export async function checkAPIStatus() {
  const apiBase = getAPIBase()

  if (import.meta.env.PROD && apiBase === null) {
    return { status: 'offline', message: 'URL бэкенда не настроен (VITE_API_URL).', apis: [] }
  }

  const now = Date.now()
  if (_statusCache && now - _statusCacheTs < STATUS_CACHE_TTL) {
    return _statusCache
  }

  let result
  try {
    const controller = new AbortController()
    const timerId = setTimeout(() => controller.abort(), 5000)
    const response = await fetch(`${apiBase}/api/health`, { signal: controller.signal })
    clearTimeout(timerId)
    if (response.ok) {
      const data = await response.json()
      if (data?.status === 'ok') {
        result = {
          status: 'online',
          message: 'Бэкенд доступен',
          streaming: data.streaming === true,
          apis: ['backend'],
        }
      }
    }
  } catch {
    // fall through
  }

  result ??= { status: 'offline', message: 'Бэкенд недоступен. Используется демо-режим.', apis: [] }
  _statusCache = result
  _statusCacheTs = now
  return result
}
