import { useState, useRef, useEffect, useCallback } from 'react'
import { Bot, Trash2, Download, RefreshCw, Sparkles, Share2, Check, Square } from 'lucide-react'
import { sendMessage as sendAIMessage } from '../services/aiClient'
import MessageList from './chat/MessageList'
import MessageInput from './chat/MessageInput'
import ProviderStatus from './chat/ProviderStatus'

const INITIAL_MESSAGE = {
  id: 'initial',
  role: 'assistant',
  content:
    '👋 Привет! Я RYAZHA AI - умный помощник для Nintendo Switch CFW!\n\n🥛 Создан командой Ryazhenka специально для тебя!\n\n🎮 Могу помочь с:\n• Взломом Switch и установкой CFW\n• Ryazhenka прошивкой и настройкой\n• .nro приложениями и homebrew\n• Sigpatches, emuMMC, любыми Switch темами!\n\n💬 Задавай любые вопросы - отвечу умно и по делу! 🚀\n\n📱 Telegram: @Ryazhenkabestcfw\n🐙 GitHub: Dimasick-git/Ryzhenka',
  ts: null,
}

function genMsgId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

const QUICK_QUESTIONS = [
  '🎮 Как взломать Switch?',
  '📦 Что такое Ryazhenka CFW?',
  '💾 Как установить sigpatches?',
  '🗂️ Что такое emuMMC?',
  '🔧 Как обновить Atmosphere?',
  '🎵 Как настроить RyazhaTune?',
  '🎛️ Как открыть Tesla overlay?',
  '🛡️ Как избежать бана Nintendo?',
  '⚡ Что такое RCU и как его настроить?',
  '📊 Как установить Ryazha-Status-Monitor?',
  '🕹️ Как подключить PS5 контроллер?',
  '🔒 Как залочить FPS в игре?',
]

const FOLLOWUP_RULES = [
  { keywords: ['atmosphere', 'атмосфер'], questions: ['Как обновить Atmosphere?', 'Где скачать sigpatches?', 'Что такое Hekate?'] },
  { keywords: ['hekate', 'хекате'], questions: ['Как создать emuMMC?', 'Как настроить Hekate?', 'Что такое NAND backup?'] },
  { keywords: ['emummc', 'emunand', 'эмунанд'], questions: ['Как перенести игры на emuMMC?', 'Что такое sysMMC?', 'Как обновить emuMMC?'] },
  { keywords: ['sigpatch', 'сигпатч'], questions: ['Как обновить sigpatches?', 'Где взять свежие sigpatches?', 'Почему игры не запускаются?'] },
  { keywords: ['тема', 'theme', 'nxthemes'], questions: ['Где найти темы для Switch?', 'Как установить NXThemes?', 'Как создать свою тему?'] },
  { keywords: ['homebrew', 'хомбрю', '.nro'], questions: ['Какие лучшие homebrew приложения?', 'Как установить .nro?', 'Что такое Tesla overlay?'] },
  { keywords: ['rcm', 'рцм', 'jig'], questions: ['Как войти в RCM?', 'Что такое fusee?', 'Как использовать payload?'] },
  { keywords: ['modchip', 'моддчип', 'picofly'], questions: ['Как установить modchip?', 'Что такое Picofly?', 'Чем отличается modchip от RCM?'] },
  { keywords: ['banning', 'ban', 'бан'], questions: ['Как избежать бана?', 'Что такое 90DNS?', 'Безопасно ли играть онлайн?'] },
  { keywords: ['ryazhenka', 'ряженка'], questions: ['Что нового в Ryazhenka?', 'Как установить Ryazhenka?', 'Что входит в Ryazhenka?'] },
  { keywords: ['tesla', 'overlay', 'ryazhahand', 'оверлей'], questions: ['Как открыть Tesla меню?', 'Как установить Ryazhahand?', 'Какие есть overlay плагины?'] },
  { keywords: ['rcu', 'частот', 'clock', 'клок'], questions: ['Как разогнать Switch?', 'Что такое FPS-aware VRR?', 'Как настроить частоты по играм?'] },
  { keywords: ['fpslocker', 'fps', 'фпс', 'блокировк'], questions: ['Как заблокировать FPS в игре?', 'Какие игры поддерживает FPSLocker?', 'Что такое FPS VRR ladder?'] },
  { keywords: ['ryazhatune', 'tune', 'музык', 'плеер', 'audio'], questions: ['Как добавить музыку в RyazhaTune?', 'Какие форматы поддерживает RyazhaTune?', 'Как создать плейлист?'] },
  { keywords: ['status monitor', 'мониторинг', 'температур', 'нагрев', 'hardware'], questions: ['Как установить Status Monitor?', 'Что нужен SaltyNX?', 'Какие режимы отображения?'] },
  { keywords: ['dbi', 'файловый менеджер', 'file manager'], questions: ['Как установить игры через DBI?', 'Как подключить Switch по USB?', 'Чем DBI лучше Tinfoil?'] },
  { keywords: ['tinfoil', 'goldleaf', 'установ', 'nsp', 'xci', 'nsz'], questions: ['Как установить NSP файл?', 'Чем отличается NSP от XCI?', 'Как использовать Filebrowser в Tinfoil?'] },
  { keywords: ['backup', 'бекап', 'nand backup', 'резервн'], questions: ['Как сделать NAND backup?', 'Зачем нужен бекап?', 'Как восстановить из бекапа?'] },
  { keywords: ['lockpick', 'ключи', 'keys', 'prod.keys'], questions: ['Как сдампить ключи Switch?', 'Для чего нужны prod.keys?', 'Где хранить ключи?'] },
  { keywords: ['mission control', 'контроллер', 'геймпад', 'bluetooth', 'ps4', 'ps5'], questions: ['Как подключить PS4/PS5 контроллер?', 'Какие контроллеры поддерживаются?', 'Как настроить Mission-Control?'] },
  { keywords: ['edizon', 'чит', 'cheat', 'сейв', 'сохранен'], questions: ['Как использовать читкоды?', 'Как редактировать сохранения?', 'Где найти читкоды для игр?'] },
  { keywords: ['fizeau', 'цвет', 'color', 'гамма', 'яркость'], questions: ['Как настроить цвет экрана?', 'Что такое коррекция гаммы?', 'Как убрать синий свет?'] },
  { keywords: ['reversenx', 'dock режим', 'handheld'], questions: ['Как принудительно включить Dock режим?', 'Как повысить производительность?', 'Что такое ReverseNX-RT?'] },
  { keywords: ['saltynx', 'salty', 'syscall'], questions: ['Зачем нужен SaltyNX?', 'Как установить SaltyNX?', 'С какими плагинами работает SaltyNX?'] },
  { keywords: ['aio', 'updater', 'обновлят'], questions: ['Как обновить CFW через AIO?', 'Какие компоненты обновляет AIO?', 'Безопасно ли обновлять через AIO?'] },
  { keywords: ['picofly', 'модчип', 'modchip', 'чип'], questions: ['Как установить Picofly?', 'Какие Switch поддерживает Picofly?', 'Picofly vs RCM — что лучше?'] },
  { keywords: ['90dns', 'dns', 'nintendoservers'], questions: ['Как настроить 90DNS?', 'Что такое DNS-блокировка?', 'Как проверить работу 90DNS?'] },
  { keywords: ['ppsspp', 'psp', 'эмулятор', 'emulator'], questions: ['Как запустить PSP игры на Switch?', 'Какие форматы ROM поддерживает PPSSPP?', 'Как настроить управление в PPSSPP?'] },
  { keywords: ['microsd', 'карта памяти', 'sd card', 'fat32', 'exfat'], questions: ['Как форматировать SD карту?', 'Какой объём SD карты нужен?', 'Какие SD карты подходят для Switch?'] },
  { keywords: ['ovlsysmodules', 'sysmodule', 'сисмодул'], questions: ['Как включить/выключить sysmodule?', 'Какие sysmodules нужны?', 'Почему sysmodule не запускается?'] },
  { keywords: ['switchwave', 'switch wave', 'аудио плагин'], questions: ['Как установить SwitchWave?', 'Какие аудио форматы поддерживает SwitchWave?', 'Как совместить SwitchWave с RyazhaTune?'] },
  { keywords: ['rcu', 'ryazha clock', 'частота', 'разгон', 'vvr'], questions: ['Как настроить профили RCU по играм?', 'Что такое FPS-aware VRR ladder?', 'В чём отличие RCU от sys-clk?'] },
  { keywords: ['ryazha-status', 'status monitor', 'saltynx', 'температур', 'нагрев'], questions: ['Как установить Ryazha-Status-Monitor?', 'Зачем нужен SaltyNX для мониторинга?', 'Как переключить режим отображения (Full/Mini/Micro)?'] },
  { keywords: ['libryazhahand', 'ultrahand', 'tesla lib', 'оверлей библ'], questions: ['В чём отличие libryazhahand от libtesla?', 'Как разработать свой Tesla overlay?', 'Что такое namespace /config/ryazhahand/?'] },
  { keywords: ['nx-ovlloader', 'ovlloader', 'загрузчик оверлей'], questions: ['Как обновить nx-ovlloader?', 'Почему Tesla overlay не открывается?', 'Какие версии nx-ovlloader совместимы?'] },
  { keywords: ['atmosphere-ryz', 'atmosphere ryz', 'ryazha atmosphere', 'preconf'], questions: ['Чем Atmosphere-RYZ отличается от оригинала?', 'Какие настройки pre-configured в Atmosphere-RYZ?', 'Безопасно ли обновлять Atmosphere-RYZ?'] },
  { keywords: ['hekate', 'загрузчик', 'bootloader', 'nyx'], questions: ['Как настроить Hekate bootloader?', 'Как создать emuMMC через Hekate?', 'Что такое Hekate Nyx?'] },
  { keywords: ['ryazha ai', 'ryazhaai', 'ai помощник', '.nro', 'homebrew ai'], questions: ['Как запустить RyazhaAI на Switch?', 'Какие AI модели доступны в RyazhaAI?', 'Как работает оффлайн-режим RyazhaAI?'] },
  { keywords: ['aio', 'aio-switch-updater', 'обновлятор', 'автообновлен'], questions: ['Что обновляет AIO-Switch-Updater?', 'Безопасно ли использовать AIO для обновления?', 'Как добавить свой источник в AIO?'] },
]

function getFollowupSuggestions(text) {
  if (!text) return []
  const lower = text.toLowerCase()
  for (const rule of FOLLOWUP_RULES) {
    if (rule.keywords.some((k) => lower.includes(k))) {
      return rule.questions
    }
  }
  return []
}

const MAX_MSG_LENGTH = 2000
const MAX_HISTORY_FOR_AI = 20
const STORAGE_KEY = 'ryazha_chat_history'
const REACTIONS_KEY = 'ryazha-ai-reactions'

function loadMessages() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0)
        return parsed.map((m, i) => ({ id: m.id ?? (i === 0 ? 'initial' : `legacy_${i}`), ...m }))
    }
  } catch {
    // corrupted storage — ignore
  }
  return [INITIAL_MESSAGE]
}

function loadReactions() {
  try {
    const saved = localStorage.getItem(REACTIONS_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return {}
}

function ShareButton({ messages }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const text = messages
      .map((m) => `[${m.role === 'user' ? 'Вы' : 'RYAZHA AI'}]\n${m.content}`)
      .join('\n\n---\n\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Скопируйте текст чата:', text)
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-400 transition-colors px-2 py-1 rounded-lg hover:bg-blue-500/10"
      title="Скопировать чат"
      aria-label="Скопировать чат"
    >
      {copied ? <Check size={13} className="text-green-400" /> : <Share2 size={13} />}
    </button>
  )
}

const MODEL_OPTIONS = [
  { id: 'gpt-4o-mini',              label: 'GPT-4o Mini',         group: 'OpenAI' },
  { id: 'gpt-4o',                   label: 'GPT-4o',              group: 'OpenAI' },
  { id: 'o4-mini',                  label: 'o4-mini (reasoning)', group: 'OpenAI' },
  { id: 'deepseek-v3',              label: 'DeepSeek V3',         group: 'DeepSeek' },
  { id: 'deepseek-r1',              label: 'DeepSeek R1',         group: 'DeepSeek' },
  { id: 'gemini-2.0-flash',         label: 'Gemini 2.0 Flash',    group: 'Google' },
  { id: 'gemini-2.5-pro',           label: 'Gemini 2.5 Pro',      group: 'Google' },
  { id: 'claude-haiku-4-5-20251001',label: 'Claude Haiku 4.5',    group: 'Anthropic' },
  { id: 'claude-sonnet-4-6',        label: 'Claude Sonnet 4.6',   group: 'Anthropic' },
  { id: 'claude-opus-4-8',          label: 'Claude Opus 4.8',     group: 'Anthropic' },
  { id: 'claude-fable-5',           label: 'Claude Fable 5',      group: 'Anthropic' },
]

function ChatInterface() {
  const [messages, setMessages] = useState(loadMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [showQuickQ, setShowQuickQ] = useState(true)
  const [reactions, setReactions] = useState(loadReactions)
  const [followups, setFollowups] = useState([])
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0].id)

  const inputRef = useRef(null)
  const messagesRef = useRef(messages)
  const cancelStreamRef = useRef(null)
  useEffect(() => { messagesRef.current = messages }, [messages])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-100)))
    } catch {}
  }, [messages])

  useEffect(() => {
    try {
      localStorage.setItem(REACTIONS_KEY, JSON.stringify(reactions))
    } catch {}
  }, [reactions])

  const handleReact = useCallback((msgId, type) => {
    setReactions((prev) => {
      const next = { ...prev }
      if (next[msgId] === type) {
        delete next[msgId]
      } else {
        next[msgId] = type
      }
      return next
    })
  }, [])

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(REACTIONS_KEY)
    setMessages([INITIAL_MESSAGE])
    setShowQuickQ(true)
    setFollowups([])
    setReactions({})
    inputRef.current?.focus()
  }

  const exportChat = () => {
    const date = new Date().toISOString().slice(0, 10)
    const exportData = {
      exported_at: new Date().toISOString(),
      model: selectedModel,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        ts: m.ts ? new Date(m.ts).toISOString() : null,
      })),
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ryazha-ai-chat-${date}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  const stopGeneration = useCallback(() => {
    cancelStreamRef.current?.()
    cancelStreamRef.current = null
  }, [])

  const callAI = useCallback(async (userMessage, history) => {
    let accumulated = ''
    const { cancel, promise } = sendAIMessage(
      userMessage,
      history,
      selectedModel,
      (chunk) => {
        accumulated += chunk
        setStreamText(accumulated)
      },
    )
    cancelStreamRef.current = cancel
    try {
      const result = await promise
      cancelStreamRef.current = null
      return result
    } catch {
      cancelStreamRef.current = null
      if (accumulated) return { text: accumulated, isOffline: false }
      throw new Error('AI request failed')
    }
  }, [selectedModel])

  const regenerateLast = useCallback(async () => {
    if (isLoading) return
    const msgs = messagesRef.current
    const lastUserIdx = [...msgs].reverse().findIndex((m) => m.role === 'user')
    if (lastUserIdx === -1) return
    const idx = msgs.length - 1 - lastUserIdx
    const userMessage = msgs[idx].content
    const history = msgs.slice(0, idx).slice(-MAX_HISTORY_FOR_AI)

    setMessages((prev) => prev.slice(0, idx + 1))
    setIsLoading(true)
    setStreamText('')
    setFollowups([])

    try {
      const result = await callAI(userMessage, history)
      setMessages((prev) => [...prev, { id: genMsgId(), role: 'assistant', content: result.text, isOffline: result.isOffline, ts: Date.now() }])
      setFollowups(getFollowupSuggestions(result.text))
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: genMsgId(), role: 'assistant', content: '😔 Извини, произошла ошибка. Попробуй ещё раз!', ts: Date.now() },
      ])
    } finally {
      setIsLoading(false)
      setStreamText('')
    }
  }, [isLoading, callAI])

  const submitMessage = useCallback(async (text) => {
    const userMessage = text.trim()
    if (!userMessage || isLoading) return
    if (userMessage.length > MAX_MSG_LENGTH) return

    const history = messagesRef.current.slice(-MAX_HISTORY_FOR_AI)
    setInput('')
    setShowQuickQ(false)
    setFollowups([])
    setMessages((prev) => [...prev, { id: genMsgId(), role: 'user', content: userMessage, ts: Date.now() }])
    setIsLoading(true)
    setStreamText('')

    try {
      const result = await callAI(userMessage, history)
      setMessages((prev) => [...prev, { id: genMsgId(), role: 'assistant', content: result.text, isOffline: result.isOffline, ts: Date.now() }])
      setFollowups(getFollowupSuggestions(result.text))
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: genMsgId(), role: 'assistant', content: '😔 Извини, произошла ошибка. Попробуй ещё раз!', ts: Date.now() },
      ])
    } finally {
      setIsLoading(false)
      setStreamText('')
    }
  }, [isLoading, callAI])

  const msgCount = messages.length - 1
  const hasAssistantAfterUser = messages.length >= 2 && messages[messages.length - 1]?.role === 'assistant'

  return (
    <div className="bg-ryaha-card rounded-2xl border border-ryaha-border overflow-hidden glow-effect">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-ryaha-border bg-ryaha-bg">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Bot size={15} className="text-indigo-400" />
          <span>RYAZHA AI</span>
          {msgCount > 0 && (
            <span className="text-xs text-gray-600">· {msgCount} сообщ.</span>
          )}
          <ProviderStatus />
        </div>
        <div className="flex items-center gap-1">
          {isLoading && (
            <button
              onClick={stopGeneration}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10 border border-red-500/30"
              title="Остановить генерацию"
              aria-label="Остановить генерацию"
            >
              <Square size={11} className="fill-red-400" />
              <span>Стоп</span>
            </button>
          )}
          {hasAssistantAfterUser && !isLoading && (
            <button
              onClick={regenerateLast}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-400 transition-colors px-2 py-1 rounded-lg hover:bg-indigo-500/10"
              title="Сгенерировать ответ заново"
              aria-label="Сгенерировать ответ заново"
            >
              <RefreshCw size={13} />
            </button>
          )}
          {msgCount > 0 && (
            <>
              <ShareButton messages={messages} />
              <button
                onClick={exportChat}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-400 transition-colors px-2 py-1 rounded-lg hover:bg-green-500/10"
                title="Экспортировать чат"
                aria-label="Экспортировать чат"
              >
                <Download size={13} />
              </button>
              <button
                onClick={clearHistory}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
                title="Очистить историю"
                aria-label="Очистить историю"
              >
                <Trash2 size={13} />
                🗑️ Очистить
              </button>
            </>
          )}
        </div>
      </div>

      <MessageList
        messages={messages}
        isLoading={isLoading}
        streamText={streamText}
        reactions={reactions}
        onReact={handleReact}
      />

      {/* Follow-up suggestions after AI reply */}
      {!isLoading && followups.length > 0 && (
        <div className="px-6 pb-3 border-t border-ryaha-border/50 pt-3">
          <div className="flex items-center gap-1.5 mb-2 text-xs text-gray-500">
            <Sparkles size={11} className="text-indigo-400" />
            <span>Продолжить разговор:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {followups.map((q) => (
              <button
                key={q}
                onClick={() => submitMessage(q)}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 rounded-full bg-ryaha-hover border border-indigo-500/30 text-indigo-300 hover:border-indigo-500/70 hover:bg-indigo-500/10 transition-all disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick question chips (initial state) */}
      {showQuickQ && msgCount === 0 && (
        <div className="px-6 pb-3 border-t border-ryaha-border/50 pt-3">
          <div className="flex items-center gap-1.5 mb-2 text-xs text-gray-500">
            <Sparkles size={11} />
            <span>Быстрые вопросы</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => submitMessage(q)}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 rounded-full bg-ryaha-hover border border-ryaha-border text-gray-300 hover:border-indigo-500/50 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Model selector */}
      <div className="px-4 pt-2 pb-1 border-t border-ryaha-border/50 bg-ryaha-bg flex flex-wrap items-center gap-2">
        <span id="model-label" className="text-xs text-gray-500">Модель:</span>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={isLoading}
          aria-labelledby="model-label"
          className="text-xs bg-ryaha-card text-gray-300 border border-ryaha-border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
        >
          {Object.entries(
            MODEL_OPTIONS.reduce((acc, m) => {
              (acc[m.group] = acc[m.group] || []).push(m)
              return acc
            }, {})
          ).map(([group, models]) => (
            <optgroup key={group} label={group}>
              {models.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <span className="text-xs text-gray-600 ml-auto">
          {messages.length > MAX_HISTORY_FOR_AI + 1 && `· Отправляется ${MAX_HISTORY_FOR_AI} последних сообщений`}
        </span>
      </div>

      <MessageInput
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        onSubmit={submitMessage}
      />
    </div>
  )
}

export default ChatInterface
