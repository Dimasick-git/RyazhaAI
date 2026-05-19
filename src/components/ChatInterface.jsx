import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, Loader2, Trash2, Copy, Check } from 'lucide-react'
import { sendMessageStream, sendMessage } from '../services/api'

const INITIAL_MESSAGE = {
  role: 'assistant',
  content:
    '👋 Привет! Я RYAZHA AI - умный помощник для Nintendo Switch CFW!\n\n🥛 Создан командой Ryazhenka специально для тебя!\n\n🎮 Могу помочь с:\n• Взломом Switch и установкой CFW\n• Ryazhenka прошивкой и настройкой\n• .nro приложениями и homebrew\n• Sigpatches, emuMMC, любыми Switch темами!\n\n💬 Задавай любые вопросы - отвечу умно и по делу! 🚀\n\n📱 Telegram: @Ryazhenkabestcfw\n🐙 GitHub: Dimasick-git/Ryzhenka',
}

const STORAGE_KEY = 'ryazha-ai-messages'

function loadMessages() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // corrupted storage — ignore
  }
  return [INITIAL_MESSAGE]
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available
    }
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

function ChatInterface() {
  const [messages, setMessages] = useState(loadMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamText, setStreamText] = useState('')

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamText, scrollToBottom])

  // Persist conversation to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {
      // storage quota exceeded — ignore
    }
  }, [messages])

  const clearHistory = () => {
    setMessages([INITIAL_MESSAGE])
    localStorage.removeItem(STORAGE_KEY)
    inputRef.current?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    const history = messages
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)
    setStreamText('')

    try {
      let full = ''
      await sendMessageStream(userMessage, history, (chunk) => {
        full += chunk
        setStreamText(full)
      })
      setMessages((prev) => [...prev, { role: 'assistant', content: full }])
    } catch {
      // streaming failed — fall back to regular request
      try {
        const response = await sendMessage(userMessage, history)
        setMessages((prev) => [...prev, { role: 'assistant', content: response }])
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: '😔 Извини, произошла ошибка. Попробуй ещё раз!' },
        ])
      }
    } finally {
      setIsLoading(false)
      setStreamText('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const msgCount = messages.length - 1

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
        {msgCount > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
            title="Очистить историю"
          >
            <Trash2 size={13} />
            Очистить
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="h-[460px] overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 group ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={17} />
              </div>
            )}

            <div className="flex flex-col gap-1 max-w-[80%]">
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                    : 'bg-ryaha-hover border border-ryaha-border text-gray-200'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              </div>
              {message.role === 'assistant' && (
                <div className="flex items-center pl-1">
                  <CopyButton text={message.content} />
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

        {/* Streaming message (text arriving chunk by chunk) */}
        {isLoading && streamText && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot size={17} />
            </div>
            <div className="max-w-[80%] bg-ryaha-hover border border-ryaha-border rounded-2xl px-4 py-3 text-gray-200">
              <p className="whitespace-pre-wrap break-words">
                {streamText}
                <span className="inline-block w-1.5 h-4 bg-indigo-400 ml-0.5 animate-pulse align-middle rounded-sm" />
              </p>
            </div>
          </div>
        )}

        {/* Bouncing dots while waiting for first chunk */}
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

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-ryaha-border p-4 bg-ryaha-bg">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Задай свой вопрос… (Enter для отправки)"
            className="flex-1 bg-ryaha-card border border-ryaha-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl px-6 py-3 font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            <span className="hidden sm:inline">{isLoading ? 'Думаю…' : 'Отправить'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatInterface
