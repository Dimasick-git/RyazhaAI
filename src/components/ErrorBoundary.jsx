import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[RYAZHA AI] Unhandled render error:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-8">
          <div className="max-w-lg text-center space-y-4">
            <div className="text-5xl">⚠️</div>
            <h1 className="text-2xl font-bold">Что-то пошло не так</h1>
            <p className="text-gray-400 text-sm">
              Произошла непредвиденная ошибка интерфейса. Попробуйте перезагрузить страницу.
            </p>
            <pre className="text-left text-xs text-red-400 bg-gray-900 rounded p-3 overflow-auto max-h-40">
              {this.state.error.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition-colors"
            >
              Перезагрузить
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
