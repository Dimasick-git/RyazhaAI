import { useState, Component } from 'react'
import Header from './components/Header'
import ChatInterface from './components/ChatInterface'
import Features from './components/Features'
import FAQ from './components/FAQ'
import Team from './components/Team'
import Footer from './components/Footer'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ryaha-bg flex items-center justify-center">
          <div className="text-center p-8">
            <p className="text-3xl mb-4">😔</p>
            <p className="text-xl text-red-400 mb-2">Что-то пошло не так</p>
            <p className="text-gray-500 text-sm mb-6">Попробуйте перезагрузить страницу</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const TABS = [
  { id: 'chat', label: 'AI Чат' },
  { id: 'faq', label: 'FAQ Switch' },
  { id: 'features', label: 'Возможности' },
  { id: 'team', label: 'Команда' },
]

function App() {
  const [activeTab, setActiveTab] = useState('chat')

  const tabClass = (id) =>
    `px-6 py-3 rounded-lg font-semibold transition-all ${
      activeTab === id
        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white glow-effect'
        : 'bg-ryaha-card text-gray-400 hover:bg-ryaha-hover'
    }`

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-ryaha-bg">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 pointer-events-none" />

      <Header />

      <main className="relative">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-block mb-6">
              <span className="text-6xl mb-4 inline-block animate-pulse-slow">RYAZHA</span>
            </div>
            <h1 className="text-6xl font-bold mb-6">
              <span className="gradient-text">RYAZHA AI</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Умный AI помощник для Nintendo Switch CFW!
              <br />
              Создан командой Ryazhenka - лучшей прошивки для Switch!
            </p>

            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {TABS.map(({ id, label }) => (
                <button key={id} onClick={() => setActiveTab(id)} className={tabClass(id)}>
                  {label}
                </button>
              ))}
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
    </ErrorBoundary>
  )
}

export default App
