import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, Loader2, Trash2, Copy, Check, Download, RefreshCw, Sparkles, Mic, MicOff, ThumbsUp, ThumbsDown, Share2 } from 'lucide-react'
import { sendMessageStream, sendMessage } from '../services/api'

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

function formatMsgTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

const QUICK_QUESTIONS = [
  '🎮 Как взломать Switch?',
  '📦 Что такое Ryazhenka?',
  '💾 Как установить sigpatches?',
  '🗂️ Что такое emuMMC?',
  '🔧 Как обновить CFW?',
  '🎵 Как установить темы?',
]

// Context-aware follow-up suggestions based on keywords in the last AI reply
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
const STORAGE_KEY = 'ryazha-ai-messages'
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

// Simple markdown renderer
function MessageContent({ text }) {
  const lines = text.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      elements.push(
        <pre key={i} className="bg-black/40 border border-ryaha-border rounded-lg p-3 my-2 overflow-x-auto text-sm font-mono text-emerald-300 whitespace-pre">
          {lang && <div className="text-gray-500 text-xs mb-1">{lang}</div>}
          {codeLines.join('\n')}
        </pre>
      )
      i++
      continue
    }

    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-base font-bold text-white mt-3 mb-1">{renderInline(line.slice(4))}</h3>)
      i++; continue
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-lg font-bold text-white mt-3 mb-1">{renderInline(line.slice(3))}</h2>)
      i++; continue
    }
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-xl font-bold text-white mt-3 mb-1">{renderInline(line.slice(2))}</h1>)
      i++; continue
    }

    if (/^[-*•] /.test(line)) {
      const listItems = []
      while (i < lines.length && /^[-*•] /.test(lines[i])) {
        listItems.push(<li key={i} className="ml-4">{renderInline(lines[i].slice(2))}</li>)
        i++
      }
      elements.push(<ul key={`ul-${i}`} className="list-disc list-inside space-y-0.5 my-1">{listItems}</ul>)
      continue
    }

    if (/^\d+\. /.test(line)) {
      const listItems = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        listItems.push(<li key={i} className="ml-4">{renderInline(lines[i].replace(/^\d+\. /, ''))}</li>)
        i++
      }
      elements.push(<ol key={`ol-${i}`} className="list-decimal list-inside space-y-0.5 my-1">{listItems}</ol>)
      continue
    }

    if (line.trim() === '') {
      elements.push(<div key={i} className="h-1" />)
      i++; continue
    }

    elements.push(<p key={i} className="leading-relaxed">{renderInline(line)}</p>)
    i++
  }

  return <div className="space-y-0.5 text-sm">{elements}</div>
}

const INLINE_REGEX = /(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__)/g

function renderInline(text) {
  const parts = []
  const regex = new RegExp(INLINE_REGEX.source, 'g')
  let last = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const token = match[0]
    if (token.startsWith('[')) {
      const labelEnd = token.indexOf(']')
      const label = token.slice(1, labelEnd)
      const url = token.slice(labelEnd + 2, -1)
      parts.push(
        <a key={match.index} href={url} target="_blank" rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors">
          {label}
        </a>
      )
    } else if (token.startsWith('`')) {
      parts.push(<code key={match.index} className="bg-black/40 text-emerald-300 px-1 py-0.5 rounded text-xs font-mono">{token.slice(1, -1)}</code>)
    } else if (token.startsWith('**')) {
      parts.push(<strong key={match.index} className="font-semibold text-white">{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('__')) {
      parts.push(<strong key={match.index} className="font-semibold text-white">{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('*')) {
      parts.push(<em key={match.index} className="italic text-gray-300">{token.slice(1, -1)}</em>)
    }
    last = match.index + token.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length > 0 ? parts : text
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-gray-600 hover:text-gray-300"
      title="Скопировать"
    >
      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
    </button>
  )
}

function ReactionButtons({ msgId, reactions, onReact }) {
  const reaction = reactions[msgId]
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => onReact(msgId, 'up')}
        className={`p-1 rounded transition-colors ${reaction === 'up' ? 'text-green-400' : 'text-gray-600 hover:text-green-400'}`}
        title="Полезно"
      >
        <ThumbsUp size={13} />
      </button>
      <button
        onClick={() => onReact(msgId, 'down')}
        className={`p-1 rounded transition-colors ${reaction === 'down' ? 'text-red-400' : 'text-gray-600 hover:text-red-400'}`}
        title="Не полезно"
      >
        <ThumbsDown size={13} />
      </button>
    </div>
  )
}

function BounceDots() {
  return (
    <div className="flex gap-1.5 items-center py-0.5">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  )
}

function VoiceButton({ onResult, disabled }) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  const supported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  useEffect(() => () => recognitionRef.current?.stop(), [])

  const toggle = useCallback(() => {
    if (!supported) return

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SR()
    rec.lang = 'ru-RU'
    rec.interimResults = false
    rec.maxAlternatives = 1

    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      onResult(transcript)
      setIsListening(false)
    }
    rec.onerror = () => setIsListening(false)
    rec.onend = () => setIsListening(false)

    recognitionRef.current = rec
    rec.start()
    setIsListening(true)
  }, [isListening, onResult, supported])

  if (!supported) return null

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      className={`p-3 rounded-xl transition-all flex-shrink-0 ${
        isListening
          ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
          : 'bg-ryaha-card border border-ryaha-border text-gray-400 hover:text-indigo-400 hover:border-indigo-500/50'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
      title={isListening ? 'Остановить запись' : 'Голосовой ввод'}
    >
      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
    </button>
  )
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

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamText, scrollToBottom])

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
    setMessages([INITIAL_MESSAGE])
    setShowQuickQ(true)
    setFollowups([])
    setReactions({})
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(REACTIONS_KEY)
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

  const submitMessage = useCallback(async (text) => {
    const userMessage = text.trim()
    if (!userMessage || isLoading) return
    if (userMessage.length > MAX_MSG_LENGTH) return

    const history = messages
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
  }, [isLoading, messages, callAI])

  const handleSubmit = (e) => {
    e.preventDefault()
    submitMessage(input)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleVoiceResult = useCallback((transcript) => {
    setInput((prev) => prev ? `${prev} ${transcript}` : transcript)
    inputRef.current?.focus()
  }, [])

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
                Очистить
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="h-[440px] overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 group ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={17} />
              </div>
            )}

            <div className="flex flex-col gap-1 max-w-[82%]">
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                    : 'bg-ryaha-hover border border-ryaha-border text-gray-200'
                }`}
              >
                {message.role === 'assistant' ? (
                  <MessageContent text={message.content} />
                ) : (
                  <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                )}
              </div>
              {message.role === 'assistant' && (
                <div className="flex items-center gap-1 pl-1">
                  <CopyButton text={message.content} />
                  <ReactionButtons msgId={message.id} reactions={reactions} onReact={handleReact} />
                  {message.ts && (
                    <span className="text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity ml-1">{formatMsgTime(message.ts)}</span>
                  )}
                </div>
              )}
              {message.role === 'user' && message.ts && (
                <div className="flex justify-end pr-1">
                  <span className="text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">{formatMsgTime(message.ts)}</span>
                </div>
              )}
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User size={17} />
              </div>
            )}
          </div>
        ))}

        {/* Streaming message */}
        {isLoading && streamText && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot size={17} />
            </div>
            <div className="max-w-[82%] bg-ryaha-hover border border-ryaha-border rounded-2xl px-4 py-3 text-gray-200">
              <MessageContent text={streamText} />
              <span className="inline-block w-1.5 h-4 bg-indigo-400 ml-0.5 animate-pulse align-middle rounded-sm" />
            </div>
          </div>
        )}

        {/* Waiting dots */}
        {isLoading && !streamText && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
              <Bot size={17} />
            </div>
            <div className="bg-ryaha-hover border border-ryaha-border rounded-2xl px-4 py-3">
              <BounceDots />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

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

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-ryaha-border p-4 bg-ryaha-bg">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
              onKeyDown={handleKeyDown}
              placeholder="Задай свой вопрос… (Enter для отправки, Shift+Enter — новая строка)"
              rows={1}
              className="w-full bg-ryaha-card border border-ryaha-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none overflow-hidden text-sm"
              disabled={isLoading}
            />
            {input.length > 1400 && (
              <span className={`absolute bottom-2 right-3 text-xs transition-colors ${
                input.length > 1800 ? 'text-red-400 font-semibold' : 'text-yellow-500'
              }`}>{input.length}/2000</span>
            )}
          </div>
          <VoiceButton onResult={handleVoiceResult} disabled={isLoading} />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl px-5 py-3 font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            <span className="hidden sm:inline text-sm">{isLoading ? 'Думаю…' : 'Отправить'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatInterface
