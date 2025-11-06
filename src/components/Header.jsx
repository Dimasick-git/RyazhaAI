import { Sparkles, Github, Send } from 'lucide-react'

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-ryaha-bg/80 backdrop-blur-xl border-b border-ryaha-border">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🥛</span>
            <h1 className="text-xl font-bold gradient-text">RYAZHA AI</h1>
          </div>
          
          <nav className="flex items-center gap-4">
            <a 
              href="https://t.me/Ryazhenkabestcfw" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
            >
              <Send size={20} />
              <span className="hidden sm:inline">Telegram</span>
            </a>
            <a 
              href="https://github.com/Dimasick-git/Ryzhenka" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Github size={20} />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <div className="flex items-center gap-2 px-4 py-2 bg-ryaha-card rounded-lg border border-ryaha-border">
              <Sparkles size={16} className="text-indigo-400" />
              <span className="text-sm text-gray-300">Switch AI</span>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
