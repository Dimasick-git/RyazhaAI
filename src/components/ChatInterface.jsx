import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { sendMessage } from '../services/api'

function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Привет! Я RYAZHA AI - умный помощник для Nintendo Switch CFW!\n\n⚡ Работаю на БЕСПЛАТНОМ БЕЗЛИМИТНОМ Cody API!\n🥛 Создан командой Ryazhenka специально для тебя!\n\n🎮 Могу помочь с:\n• Взломом Switch и установкой CFW\n• Ryazhenka прошивкой и настройкой\n• .nro приложениями и homebrew\n• Sigpatches, emuMMC, любыми Switch темами!\n\n💬 Задавай любые вопросы - отвечу умно и по делу! 🚀\n\n📱 Telegram: @Ryazhenkabestcfw\n🐙 GitHub: Dimasick-git/Ryzhenka'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await sendMessage(userMessage)
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '😔 Извини, произошла ошибка при обработке запроса. Попробуй еще раз!' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-ryaha-card rounded-2xl border border-ryaha-border overflow-hidden glow-effect">
      {/* Chat Messages */}
      <div className="h-[500px] overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Bot size={18} />
              </div>
            )}
            
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : 'bg-ryaha-hover border border-ryaha-border text-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <User size={18} />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div className="bg-ryaha-hover border border-ryaha-border rounded-2xl px-4 py-3">
              <Loader2 className="animate-spin text-indigo-400" size={20} />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="border-t border-ryaha-border p-4 bg-ryaha-bg">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Задай свой вопрос..."
            className="flex-1 bg-ryaha-card border border-ryaha-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl px-6 py-3 font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={18} />
            <span className="hidden sm:inline">Отправить</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatInterface
