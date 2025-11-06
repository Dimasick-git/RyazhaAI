import { useState } from 'react'
import Header from './components/Header'
import ChatInterface from './components/ChatInterface'
import Features from './components/Features'
import FAQ from './components/FAQ'
import Team from './components/Team'
import Footer from './components/Footer'

function App() {
  const [activeTab, setActiveTab] = useState('chat')

  return (
    <div className="min-h-screen bg-ryaha-bg">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 pointer-events-none" />
      
      <Header />
      
      <main className="relative">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-block mb-6">
              <span className="text-6xl mb-4 inline-block animate-pulse-slow">🥛</span>
            </div>
            <h1 className="text-6xl font-bold mb-6">
              <span className="gradient-text">RYAZHA AI</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Умный AI помощник для Nintendo Switch CFW! 🎮
              <br />
              Создан командой Ryazhenka - лучшей прошивки для Switch! 🚀
            </p>
            
            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'chat'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white glow-effect'
                    : 'bg-ryaha-card text-gray-400 hover:bg-ryaha-hover'
                }`}
              >
                💬 AI Чат
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'faq'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white glow-effect'
                    : 'bg-ryaha-card text-gray-400 hover:bg-ryaha-hover'
                }`}
              >
                ❓ FAQ Switch
              </button>
              <button
                onClick={() => setActiveTab('features')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'features'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white glow-effect'
                    : 'bg-ryaha-card text-gray-400 hover:bg-ryaha-hover'
                }`}
              >
                ✨ Возможности
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'team'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white glow-effect'
                    : 'bg-ryaha-card text-gray-400 hover:bg-ryaha-hover'
                }`}
              >
                👥 Команда
              </button>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'chat' && <ChatInterface />}
            {activeTab === 'faq' && <FAQ />}
            {activeTab === 'features' && <Features />}
            {activeTab === 'team' && <Team />}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default App
