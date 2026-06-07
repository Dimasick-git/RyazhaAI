import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, copied: false }
  }

  static getDerivedStateFromError(error) {
    return { error, copied: false }
  }

  componentDidCatch(error, info) {
    console.error('[RYAZHA AI] Unhandled render error:', error, info.componentStack)
  }

  handleRecover = () => {
    this.setState({ error: null, copied: false })
  }

  handleCopyError = async () => {
    const { error } = this.state
    const text = `${error?.name}: ${error?.message}\n\n${error?.stack ?? ''}`
    try {
      await navigator.clipboard.writeText(text)
      this.setState({ copied: true })
      setTimeout(() => this.setState({ copied: false }), 2000)
    } catch {
      window.prompt('Скопируйте текст ошибки:', text)
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-8">
          <div className="max-w-lg text-center space-y-4">
            <div className="text-5xl">⚠️</div>
            <h1 className="text-2xl font-bold">Что-то пошло не так</h1>
            <p className="text-gray-400 text-sm">
              Произошла непредвиденная ошибка интерфейса.
            </p>
            <pre className="text-left text-xs text-red-400 bg-gray-900 rounded p-3 overflow-auto max-h-40">
              {this.state.error.message}
            </pre>
            <div className="flex gap-2 justify-center flex-wrap">
              <button
                onClick={this.handleRecover}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-sm font-medium transition-colors"
              >
                Попробовать восстановить
              </button>
              <button
                onClick={this.handleCopyError}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium transition-colors"
              >
                {this.state.copied ? 'Скопировано ✓' : 'Скопировать ошибку'}
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm font-medium transition-colors"
              >
                Перезагрузить страницу
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
