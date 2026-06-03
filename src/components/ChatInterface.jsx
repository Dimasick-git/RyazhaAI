import { useState, useRef, useEffect, useCallback } from 'react'
import { Bot, Trash2, Download, RefreshCw, Sparkles, Share2, Check } from 'lucide-react'
import { sendMessageStream, sendMessage } from '../services/api'
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
  '📦 Что такое Ryazhenka?',
  '💾 Как установить sigpatches?',
  '🗂️ Что такое emuMMC?',
  '🔧 Как обновить CFW?',
  '🎵 Как установить темы?',
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
    } catch {}
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-400 transition-colors px-2 py-1 rounded-lg hover:bg-blue-500/10"
      title="Скопировать чат"
    >
      {copied ? <Check size={13} className="text-green-400" /> : <Share2 size={13} />}
    </button>
  )
}

function ChatInterface() {
  const [messages, setMessages] = useState(loadMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [showQuickQ, setShowQuickQ] = useState(true)
  const [reactions, setReactions] = useState(loadReactions)
  const [followups, setFollowups] = useState([])

  const inputRef = useRef(null)
  const messagesRef = useRef(messages)
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
    const text = messages
      .map((m) => `[${m.role === 'user' ? 'Вы' : 'RYAZHA AI'}]\n${m.content}`)
      .join('\n\n---\n\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ryazha-ai-chat-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const callAI = useCallback(async (userMessage, history) => {
    let full = ''
    try {
      await sendMessageStream(userMessage, history, (chunk) => {
        full += chunk
        setStreamText(full)
      })
      return full
    } catch {
      if (full) return full
      return await sendMessage(userMessage, history)
    }
  }, [])

  const regenerateLast = async () => {
    if (isLoading) return
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === 'user')
    if (lastUserIdx === -1) return
    const idx = messages.length - 1 - lastUserIdx
    const userMessage = messages[idx].content
    const history = messages.slice(0, idx)

    setMessages(messages.slice(0, idx + 1))
    setIsLoading(true)
    setStreamText('')
    setFollowups([])

    try {
      const response = await callAI(userMessage, history)
      setMessages((prev) => [...prev, { id: genMsgId(), role: 'assistant', content: response, ts: Date.now() }])
      setFollowups(getFollowupSuggestions(response))
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: genMsgId(), role: 'assistant', content: '😔 Извини, произошла ошибка. Попробуй ещё раз!', ts: Date.now() },
      ])
    } finally {
      setIsLoading(false)
      setStreamText('')
    }
  }

  const submitMessage = useCallback(async (text) => {
    const userMessage = text.trim()
    if (!userMessage || isLoading) return
    if (userMessage.length > MAX_MSG_LENGTH) return

    const history = messagesRef.current
    setInput('')
    setShowQuickQ(false)
    setFollowups([])
    setMessages((prev) => [...prev, { id: genMsgId(), role: 'user', content: userMessage, ts: Date.now() }])
    setIsLoading(true)
    setStreamText('')

    try {
      const response = await callAI(userMessage, history)
      setMessages((prev) => [...prev, { id: genMsgId(), role: 'assistant', content: response, ts: Date.now() }])
      setFollowups(getFollowupSuggestions(response))
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
          {hasAssistantAfterUser && !isLoading && (
            <button
              onClick={regenerateLast}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-400 transition-colors px-2 py-1 rounded-lg hover:bg-indigo-500/10"
              title="Сгенерировать ответ заново"
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
              >
                <Download size={13} />
              </button>
              <button
                onClick={clearHistory}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
                title="Очистить историю"
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
