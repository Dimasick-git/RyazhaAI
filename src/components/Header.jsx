import { useState, useEffect } from 'react'
import { Sparkles, Github, Send, Wifi, WifiOff } from 'lucide-react'
import { checkAPIStatus } from '../services/api'

function StatusDot({ status }) {
  if (status === 'checking') {
    return <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
  }
  if (status === 'online') {
    return <span className="w-2 h-2 rounded-full bg-green-400" />
  }
  return <span className="w-2 h-2 rounded-full bg-red-400" />
}

function Header() {
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    let mounted = true
    checkAPIStatus().then((res) => {
      if (mounted) setApiStatus(res.status)
    })
    const timer = setInterval(() => {
      checkAPIStatus().then((res) => {
        if (mounted) setApiStatus(res.status)
      })
    }, 60_000)
    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [])

  const statusLabel = {
    checking: 'Проверка…',
    online: 'Онлайн',
    offline: 'Демо',
  }[apiStatus] ?? 'Демо'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-ryaha-bg/80 backdrop-blur-xl border-b border-ryaha-border">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">🥛</span>
            <h1 className="text-xl font-bold gradient-text">RYAZHA AI</h1>
          </div>

          <nav className="flex items-center gap-3">
            {/* API status badge */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-ryaha-card rounded-lg border border-ryaha-border text-xs text-gray-400"
              title={apiStatus === 'online' ? 'Бэкенд доступен' : 'Работает в демо-режиме'}
            >
              <StatusDot status={apiStatus} />
              <span>{statusLabel}</span>
            </div>

            <a
              href="https://t.me/Ryazhenkabestcfw"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-ryaha-card"
            >
              <Send size={18} />
              <span className="hidden sm:inline text-sm">Telegram</span>
            </a>
            <a
              href="https://github.com/Dimasick-git/Ryzhenka"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-ryaha-card"
            >
              <Github size={18} />
              <span className="hidden sm:inline text-sm">GitHub</span>
            </a>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-ryaha-card rounded-lg border border-ryaha-border">
              <Sparkles size={14} className="text-indigo-400" />
              <span className="text-xs text-gray-300">Switch AI</span>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
