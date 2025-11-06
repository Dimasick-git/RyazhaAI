import { Brain, Zap, Shield, Globe, Code, Sparkles } from 'lucide-react'

function Features() {
  const features = [
    {
      icon: Brain,
      title: '🤖 Умный AI',
      description: 'Использую передовые бесплатные AI модели для ответов на твои вопросы',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Zap,
      title: '⚡ Быстрый',
      description: 'Молниеносные ответы благодаря оптимизированной архитектуре',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: '🛡️ Безопасный',
      description: 'Конфиденциальность твоих данных - наш приоритет',
      gradient: 'from-pink-500 to-orange-500'
    },
    {
      icon: Globe,
      title: '🌍 Бесплатный',
      description: 'Полностью бесплатный доступ к AI возможностям без ограничений',
      gradient: 'from-orange-500 to-yellow-500'
    },
    {
      icon: Code,
      title: '💻 Open Source',
      description: 'Открытый исходный код, как и Ryazhenka - лучшая прошивка для Switch!',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Sparkles,
      title: '✨ Современный',
      description: 'Красивый интерфейс в стиле DeepSeek с градиентами и анимациями',
      gradient: 'from-cyan-500 to-blue-500'
    }
  ]

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => {
        const Icon = feature.icon
        return (
          <div
            key={index}
            className="bg-ryaha-card rounded-2xl border border-ryaha-border p-6 hover:bg-ryaha-hover transition-all duration-300 group hover:scale-105"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <Icon size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
            <p className="text-gray-400 leading-relaxed">{feature.description}</p>
          </div>
        )
      })}

      {/* Special Card for Nintendo Switch */}
      <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl border border-ryaha-border p-8 text-center">
        <h3 className="text-3xl font-bold mb-4">
          <span className="gradient-text">🎮 Скоро на Nintendo Switch!</span>
        </h3>
        <p className="text-gray-300 text-lg mb-4">
          Работаем над .nro приложением для доступа к AI RYAHA прямо с твоего взломанного Switch!
        </p>
        <p className="text-gray-400">
          Совместимо с Ryazhenka CFW и другими прошивками на базе Atmosphere
        </p>
      </div>
    </div>
  )
}

export default Features
