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

// Статические знания о Ryazhenka CFW для оффлайн-режима.
// Данные хранятся в src/data/offline_kb.json — редактируйте там, не здесь.
import OFFLINE_KB from '../data/offline_kb.json'

function getFallbackResponse(message) {
  const lower = message.toLowerCase()

  // Tokenise query into words for partial-word matching
  const queryWords = lower.match(/[a-zа-яё0-9]+/g) || []

  let bestEntry = null
  let bestScore = 0

  for (const entry of OFFLINE_KB) {
    let score = 0
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) {
        // Longer keyword matches are more specific — weight by length
        score += 1 + Math.min(kw.length / 8, 2)
      } else {
        // Partial: reward if any query word starts with the keyword (or vice versa)
        for (const word of queryWords) {
          if (word.length >= 3 && (word.startsWith(kw) || kw.startsWith(word))) {
            score += 0.4
            break
          }
        }
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestEntry = entry
    }
  }

  // Threshold of 1.5 requires at least one solid keyword match (length ≥ 4 scores
  // 1 + 4/8 = 1.5) to avoid returning a wrong "best" answer for vague queries.
  if (bestEntry && bestScore >= 1.5) return bestEntry.answer

  return (
    'Бэкенд RYAZHA AI временно недоступен. ' +
    'Я могу ответить на вопросы об Atmosphere, emuNAND, Tesla overlay, RCU, FPSLocker, установке игр и других Switch CFW темах — просто спросите! ' +
    'Также загляните на GitHub: github.com/Dimasick-git'
  )
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
    return { text: 'Ошибка конфигурации: URL бэкенда не задан (VITE_API_URL не установлен). Обратитесь к администратору.', isOffline: false }
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
    if (data?.response) return { text: data.response, isOffline: false }
    throw new Error('Invalid response format')
  } catch (error) {
    console.error('API call failed:', error.message)
    return { text: getFallbackResponse(message), isOffline: true }
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
