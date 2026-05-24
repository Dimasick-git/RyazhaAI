import { Heart, Github, Send } from 'lucide-react'

function Footer() {
  return (
    <footer className="relative border-t border-ryaha-border bg-ryaha-bg/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <span>Сделано с</span>
            <Heart size={16} className="text-red-500 fill-red-500 animate-pulse" />
            <span>для комьюнити Ryazhenka</span>
          </div>
          
          <div className="flex items-center gap-6">
            <a
              href="https://t.me/Ryazhenkabestcfw"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
            >
              <Send size={18} />
              <span>Telegram</span>
            </a>
            <a
              href="https://github.com/Dimasick-git/Ryzhenka"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Github size={18} />
              <span>GitHub</span>
            </a>
            <span className="text-gray-500">v2.1.0</span>
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>🎮 RYAZHA AI - Умный помощник для Nintendo Switch CFW</p>
          <p className="mt-2">Создано командой Ryazhenka | Dimasick-git & Ryazhenka-Helper-01</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
