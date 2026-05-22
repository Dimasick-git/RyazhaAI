import { Brain, Zap, Shield, Globe, Code, Sparkles, MessageSquare, History } from 'lucide-react'

function Features() {
  const features = [
    {
      icon: Brain,
      title: '🤖 Умный AI',
      description: 'Передовые AI модели с пониманием контекста Switch CFW: Atmosphere, Hekate, sigpatches, emuMMC',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Zap,
      title: '⚡ Стриминг ответов',
      description: 'Ответы появляются мгновенно — символ за символом, как в ChatGPT. Никаких долгих ожиданий',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: MessageSquare,
      title: '💬 Markdown в чате',
      description: 'Форматированные ответы с кодом, списками и заголовками — читать удобно на любом устройстве',
      gradient: 'from-pink-500 to-orange-500'
    },
    {
      icon: Globe,
      title: '🌍 Бесплатный',
      description: 'Полностью бесплатный доступ к AI без ограничений, без регистрации и без подписок',
      gradient: 'from-orange-500 to-yellow-500'
    },
    {
      icon: History,
      title: '📝 История чата',
      description: 'Вся переписка сохраняется локально в браузере. Экспорт в .txt одной кнопкой',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Code,
      title: '💻 Open Source',
      description: 'Открытый исходный код на GitHub — как и Ryazhenka CFW. Fork, улучшай, предлагай PR!',
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      icon: Shield,
      title: '🛡️ Приватность',
      description: 'История чата хранится только у тебя в браузере. Мы не логируем разговоры и не продаём данные',
      gradient: 'from-blue-500 to-violet-500'
    },
    {
      icon: Sparkles,
      title: '✨ Быстрые вопросы',
      description: 'Готовые чипы с популярными вопросами о Switch CFW — один клик и AI уже отвечает',
      gradient: 'from-violet-500 to-indigo-500'
    },
  ]

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div
              key={index}
              className="bg-ryaha-card rounded-2xl border border-ryaha-border p-5 hover:bg-ryaha-hover transition-all duration-300 group hover:scale-[1.02] hover:border-indigo-500/30"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
              </div>
              <h3 className="text-base font-bold mb-1.5 text-white">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{feature.description}</p>
            </div>
          )
        })}
      </div>

      {/* Switch .nro banner */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl border border-ryaha-border p-8 text-center">
        <h3 className="text-2xl font-bold mb-3">
          <span className="gradient-text">🎮 Скоро на Nintendo Switch!</span>
        </h3>
        <p className="text-gray-300 mb-2">
          Работаем над <code className="bg-black/30 px-1.5 py-0.5 rounded text-indigo-300 text-sm">.nro</code> приложением — AI прямо с экрана Switch, без ПК
        </p>
        <p className="text-gray-500 text-sm">
          Совместимо с Ryazhenka CFW · Atmosphere · Hekate
        </p>
      </div>
    </div>
  )
}

export default Features
