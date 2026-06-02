import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, Mic, MicOff } from 'lucide-react'

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

function MessageInput({ input, setInput, isLoading, onSubmit }) {
  const inputRef = useRef(null)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit(input)
    }
  }

  const handleVoiceResult = useCallback((transcript) => {
    setInput((prev) => prev ? `${prev} ${transcript}` : transcript)
    inputRef.current?.focus()
  }, [setInput])

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(input) }}
      className="border-t border-ryaha-border p-4 bg-ryaha-bg"
    >
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
  )
}

export default MessageInput
