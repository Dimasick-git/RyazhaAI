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

// Статические знания о Ryazhenka CFW для оффлайн-режима
const OFFLINE_KB = [
  {
    keywords: ['привет', 'hello', 'hi', 'здравствуй', 'начало'],
    answer: 'Привет! Я RYAZHA AI — ассистент по Nintendo Switch CFW от команды Ryazhenka. Могу помочь с Atmosphere, Tesla overlay, RCU, установкой игр, emuNAND и другими Switch-темами. Что вас интересует?'
  },
  {
    keywords: ['ryazhenka', 'ряженка', 'что это', 'что такое'],
    answer: 'Ryazhenka — команда разработчиков Nintendo Switch CFW инструментов. Основные проекты: RCU (управление частотами CPU/GPU/RAM), Ryazhahand-Overlay (Tesla overlay с LED и аудио), AIO-Switch-Updater, ovlSysmodules, FPSLocker. GitHub: github.com/Dimasick-git'
  },
  {
    keywords: ['rcu', 'частот', 'клок', 'clock', 'cpu', 'gpu', 'ram', 'разгон'],
    answer: 'RCU (Ryazha Clock Utility) — sysmodule + Tesla overlay для управления частотами CPU/GPU/RAM на Nintendo Switch. Поддерживает профили по приложениям и FPS-aware VRR. Устанавливается в /atmosphere/contents/. Управление через Tesla Menu (L+DDOWN+RS).'
  },
  {
    keywords: ['tesla', 'overlay', 'меню', 'ryazhahand', 'ultrahand'],
    answer: 'Tesla Menu — система overlay для Nintendo Switch (открывается L+DDOWN+RS). Ryazhahand-Overlay — форк Ultrahand с поддержкой LED, аудио-паков, PNG-обоев. Файлы хранятся в /config/ryazhahand/. Требует nx-ovlloader.'
  },
  {
    keywords: ['emunand', 'emummc', 'эмунанд', 'эмумс', 'нанд'],
    answer: 'emuNAND (emummc) — эмулированная копия NAND Switch на microSD. Безопасна для использования CFW: если Nintendo заблокирует аккаунт, sysNAND (оригинальная память) останется чистой. Создаётся через Hekate → emuMMC → Create (SD File). Рекомендуется всегда использовать emuNAND для CFW.'
  },
  {
    keywords: ['atmosphere', 'атмосфера', 'cfw', 'прошивк', 'кастом'],
    answer: 'Atmosphere — основная кастомная прошивка для Nintendo Switch от Team Neptune. Устанавливается на microSD поверх официальной прошивки. Обновляйте через AIO-Switch-Updater или вручную с GitHub releases. Всегда обновляйте sigpatches вместе с Atmosphere.'
  },
  {
    keywords: ['sigpatch', 'сигпатч', 'подпись', 'signature'],
    answer: 'Sigpatches — патчи подписи, позволяющие Atmosphere запускать неподписанный homebrew-код и установленные игры. Скачиваются отдельно (обычно с sigmapatches.coomer.party или через AIO-Switch-Updater). Обновляйте при каждом обновлении Atmosphere.'
  },
  {
    keywords: ['hekate', 'хекате', 'boot', 'загрузч'],
    answer: 'Hekate — bootloader для Nintendo Switch. Запускается через Fusée (USB-A to USB-C с RCM jig) или автозапуском. Используется для создания emuNAND, бэкапов NAND, разметки microSD (Hekate → Tools → Partition SD). Файл hekate_ctcaer_X.X.X.bin размещается в корне microSD.'
  },
  {
    keywords: ['ban', 'бан', 'онлайн', 'nintendo', 'нинтендо'],
    answer: 'Для защиты от бана: используйте emuNAND для CFW, sysNAND держите чистым и не ходите онлайн с CFW. Включите 90DNS (DNS-блокировка серверов Nintendo) в emuNAND. Не используйте пиратские игры онлайн. Sys-botbase и читы в онлайне — гарантированный бан.'
  },
  {
    keywords: ['tinfoil', 'goldleaf', 'awoo', 'установ', 'nsp', 'nsz', 'xci'],
    answer: 'Установщики игр: Tinfoil (мощный, поддерживает NSP/NSZ/XCI, прямые URL, Filebrother), Goldleaf (простой, через Quark на ПК), DBI (универсальный менеджер + USB-установка). Форматы: NSP — установка в NAND/SD, XCI — образ картриджа, NSZ — сжатый NSP.'
  },
  {
    keywords: ['fps', 'фпс', 'fpslocker', 'блокировк'],
    answer: 'FPSLocker — overlay для ограничения FPS в играх Switch. Работает через Tesla Menu. Поддерживает патчи для снятия ограничений движка (custom patches). Полезен для равномерного геймплея в играх с нестабильным FPS.'
  },
  {
    keywords: ['aio', 'updater', 'обновл', 'update'],
    answer: 'AIO-Switch-Updater — homebrew для автоматического обновления CFW компонентов: Atmosphere, Hekate, sigpatches, overlay\'s и других. Запускается из hbmenu (Album → R). Умеет скачивать с GitHub releases напрямую на Switch.'
  },
  {
    keywords: ['ryazhatune', 'тюн', 'tune', 'аудио', 'audio', 'звук'],
    answer: 'RyazhaTune — sysmodule от команды Ryazhenka для тонкой настройки аудиосистемы Nintendo Switch. Позволяет менять параметры аудиовыхода и компенсировать задержку. Устанавливается в /atmosphere/contents/ как фоновый сервис.'
  },
  {
    keywords: ['status monitor', 'мониторинг', 'ryazha-status', 'температура', 'нагрев', 'hardware', 'железо'],
    answer: 'Ryazha-Status-Monitor — Tesla overlay для мониторинга железа Switch в реальном времени. Показывает нагрузку на каждое ядро CPU, GPU, RAM, температуру SoC/PCB/корпуса, скорость вентилятора, заряд батареи и FPS. Режимы: Full/Mini/Micro. Зависит от SaltyNX для FPS-данных.'
  },
  {
    keywords: ['mission control', 'контроллер', 'геймпад', 'bluetooth', 'ps4', 'ps5', 'xbox', 'joycon'],
    answer: 'Mission-Control — sysmodule для подключения сторонних Bluetooth-контроллеров к Nintendo Switch (PS4, PS5, Xbox, Pro Controller и другие). Форк команды Ryazhenka с доработками. Устанавливается в /atmosphere/contents/. Не требует патчей прошивки.'
  },
  {
    keywords: ['edizon', 'save', 'чит', 'cheat', 'сейв', 'сохранен'],
    answer: 'EdiZon — редактор сохранений и читкод-менеджер для Nintendo Switch. Форк Ryazhenka с улучшениями. Позволяет редактировать сохранения игр, применять читы (CHEATS/*.txt), делать бэкап сохранений. Запускается из Tesla Menu или hbmenu.'
  },
  {
    keywords: ['fizeau', 'цвет', 'color', 'гамма', 'gamma', 'яркость', 'экран'],
    answer: 'Fizeau — Tesla overlay для коррекции цветопередачи экрана Nintendo Switch. Форк Ryazhenka. Позволяет настраивать гамму, цветовую температуру и применять ночной режим. Управление через Tesla Menu. Настройки сохраняются между перезагрузками.'
  },
  {
    keywords: ['libryazhahand', 'libtesla', 'libultrahand', 'tesla library', 'overlay lib'],
    answer: 'libryazhahand — библиотека для разработки Tesla overlay под Nintendo Switch. Форк libultrahand+libtesla от команды Ryazhenka. Использует namespace /config/ryazhahand/. Основа для Ryazhahand-Overlay, RCU, ovlSysmodules и других overlay-проектов Ryazhenka.'
  },
  {
    keywords: ['ovlsysmodules', 'sysmodule', 'сисмодул', 'фоновый сервис', 'background'],
    answer: 'ovlSysmodules — Tesla overlay для управления sysmodule\'s на Nintendo Switch. Форк Ryazhenka. Позволяет включать/выключать фоновые сервисы (RCU, Mission-Control, SaltyNX и др.) через Tesla Menu без перезагрузки. Управление через /config/ryazhahand/.'
  },
  {
    keywords: ['rcm', 'recovery', 'jig', 'fusee', 'fusée', 'инжект', 'inject', 'payload'],
    answer: 'RCM (Recovery Mode) — режим восстановления Nintendo Switch для запуска кастомных payload\'ов. Активируется замыканием контактов в правом joycon-рельсе (RCM jig) и зажатием Vol+ + Power. Затем подключите USB-C к ПК и используйте TegraRcmGUI или Web Fusée (webrcm.app) для загрузки Hekate.'
  },
  {
    keywords: ['nx-ovlloader', 'ovlloader', 'tesla loader', 'загрузчик оверлея'],
    answer: 'nx-ovlloader — sysmodule-загрузчик Tesla overlay меню для Nintendo Switch. Ryazha-edition форк ppkantorski/nx-ovlloader. Обрабатывает нажатие L+DDOWN+RS для открытия overlay. Устанавливается в /atmosphere/contents/. Требуется для всех Tesla overlay-приложений.'
  },
  {
    keywords: ['lockpick', 'ключи', 'keys', 'prod.keys', 'title.keys', 'дамп ключей'],
    answer: 'Lockpick_RCM — homebrew для дампа ключей шифрования Nintendo Switch (prod.keys, title.keys). Запускается как payload через Hekate или как homebrew. Ключи нужны для конвертации XCI/NSZ, работы эмуляторов (Yuzu/Ryujinx). Храните ключи в безопасности — они уникальны для вашей консоли.'
  },
  {
    keywords: ['90dns', 'dns', 'блокировка', 'nintendoservers', ' nintendoдns'],
    answer: '90DNS — DNS-сервер, блокирующий соединения с серверами Nintendo для защиты от бана в emuNAND. Настройка: WiFi → Изменить DNS → Основной: 207.246.121.77, Дополнительный: 163.172.141.219. Проверить работу: test.90dns.org. Включайте только в emuNAND, в sysNAND лучше не использовать.'
  },
  {
    keywords: ['microsd', 'карта памяти', 'sd card', 'форматировать', 'fat32', 'exfat'],
    answer: 'Для Nintendo Switch рекомендуется microSD от Samsung или SanDisk (не Kingston). Формат: FAT32 или exFAT (exFAT быстрее, но FAT32 надёжнее). Форматировать через Hekate: Tools → Partition SD. Минимум 64GB для emuNAND, рекомендую 256GB+. SDXC карты работают с обоими форматами.'
  },
  {
    keywords: ['ppsspp', 'psp', 'эмулятор', 'emulator', 'playstation portable'],
    answer: 'PPSSPP для Nintendo Switch — перекомпилированный Dimasick-git под HorizonOS 21+. Запускается как homebrew NRO из hbmenu. Поддерживает большинство PSP игр в ISO/CSO форматах. Скачать: github.com/Dimasick-git/PPSSPP. Игры размещайте в /switch/ppsspp/PSP/GAME/.'
  },
  {
    keywords: ['ryazha-cheker', 'cheker', 'checker', 'мониторинг репо', 'мониторинг репозитор', 'github actions monitor', 'уведомлен', 'нотификац'],
    answer: 'Ryazha-cheker — GitHub Actions монитор репозиториев от команды Ryazhenka. Отслеживает коммиты, релизы, PR и workflow-runs и отправляет уведомления в Telegram. Поддерживает --dry-run, --summary, --weekly, --trending режимы, фильтрацию по дате (--since). Настраивается через переменные окружения G_TOKEN, G_USERNAME, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID. GitHub: github.com/Dimasick-git/Ryazha-cheker'
  },
]

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

  // Only use the fallback entry if the match is meaningful (score > 0.5)
  if (bestEntry && bestScore >= 0.5) return bestEntry.answer

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
