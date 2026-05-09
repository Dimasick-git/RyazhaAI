import { Github, Send, Heart, Code, Lightbulb } from 'lucide-react'

function Team() {
  const team = [
    {
      name: "Dimasick-git",
      role: "Главный разработчик",
      description: "Создатель Ryazhenka CFW и RYAZHA AI. Основной мейнтейнер проекта, отвечает за разработку и поддержку.",
      github: "Dimasick-git",
      telegram: "Ryazhenkabestcfw",
      avatarUrl: "https://github.com/Dimasick-git.png",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      name: "Ryazhenka-Helper-01",
      role: "Идейный вдохновитель",
      description: "Первый, кто реализовал идею проекта. Помогает с тестированием, идеями и развитием комьюнити.",
      github: "Ryazhenka-Helper-01",
      avatarUrl: "https://github.com/Ryazhenka-Helper-01.png",
      gradient: "from-purple-500 to-pink-500"
    }
  ]

  const contributors = [
    { icon: Code, title: "Open Source", desc: "Весь код открыт и доступен на GitHub" },
    { icon: Heart, title: "Комьюнити", desc: "Создано для и с помощью Switch комьюнити" },
    { icon: Lightbulb, title: "Инновации", desc: "Постоянно добавляем новые фичи" }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold gradient-text mb-6">
          Команда Ryazhenka
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Энтузиасты, создающие лучшую CFW для Nintendo Switch и инструменты для комьюнити!
        </p>
      </div>

      {/* Team Members */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {team.map((member, index) => (
          <div
            key={index}
            className="bg-ryaha-card rounded-2xl border border-ryaha-border p-8 hover:border-indigo-500/50 transition-all group"
          >
            <div className="flex items-start gap-6">
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-r ${member.gradient} p-1 flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <img 
                  src={member.avatarUrl} 
                  alt={member.name}
                  className="w-full h-full rounded-xl object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl">DEV</div>'
                  }}
                />
              </div>
              
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {member.name}
                </h3>
                <p className={`text-sm font-semibold bg-gradient-to-r ${member.gradient} bg-clip-text text-transparent mb-3`}>
                  {member.role}
                </p>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  {member.description}
                </p>
                
                <div className="flex flex-wrap gap-3">
                  {member.github && (
                    <a
                      href={`https://github.com/${member.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-ryaha-hover rounded-lg hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 border border-ryaha-border hover:border-purple-500/50 transition-all"
                    >
                      <Github size={18} />
                      <span className="text-sm">GitHub</span>
                    </a>
                  )}
                  {member.telegram && (
                    <a
                      href={`https://t.me/${member.telegram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-ryaha-hover rounded-lg hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-cyan-500/20 border border-ryaha-border hover:border-blue-500/50 transition-all"
                    >
                      <Send size={18} />
                      <span className="text-sm">Telegram</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Values */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {contributors.map((item, index) => {
          const Icon = item.icon
          return (
            <div
              key={index}
              className="bg-ryaha-card rounded-xl border border-ryaha-border p-6 text-center hover:bg-ryaha-hover transition-all"
            >
              <div className="inline-flex p-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 mb-4">
                <Icon size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-gray-400">
                {item.desc}
              </p>
            </div>
          )
        })}
      </div>

      {/* Projects */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl border border-ryaha-border p-10">
        <h3 className="text-3xl font-bold gradient-text mb-6 text-center">
          Наши проекты
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-ryaha-card rounded-xl p-6 border border-ryaha-border">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">CFW</span>
              <h4 className="text-xl font-bold text-white">Ryazhenka CFW</h4>
            </div>
            <p className="text-gray-300 mb-4">
              Лучшая кастомная прошивка для Nintendo Switch с автоматической настройкой и уникальными модулями.
            </p>
            <div className="flex gap-2">
              <a href="https://github.com/Dimasick-git/Ryzhenka" target="_blank" rel="noopener noreferrer" 
                 className="px-3 py-1 bg-ryaha-bg rounded-lg text-sm hover:bg-ryaha-hover transition-colors">
                GitHub
              </a>
            </div>
          </div>

          <div className="bg-ryaha-card rounded-xl p-6 border border-ryaha-border">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">AI</span>
              <h4 className="text-xl font-bold text-white">RYAZHA AI</h4>
            </div>
            <p className="text-gray-300 mb-4">
              Умный AI помощник для Nintendo Switch с поддержкой .nro и веб-интерфейсом.
            </p>
            <div className="flex gap-2">
              <a href="https://github.com/Dimasick-git/Ryazhenka" target="_blank" rel="noopener noreferrer" 
                 className="px-3 py-1 bg-ryaha-bg rounded-lg text-sm hover:bg-ryaha-hover transition-colors">
                GitHub
              </a>
              <a
                href="https://github.com/Dimasick-git/Ryazhenka"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold"
              >
                <Github size={18} />
                GitHub →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="mt-16 text-center">
        <h3 className="text-3xl font-bold gradient-text mb-6">
          Связаться с нами
        </h3>
        <p className="text-gray-300 mb-8 text-lg">
          Есть вопросы, идеи или хочешь помочь проекту? Пиши нам!
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="https://t.me/Ryazhenkabestcfw"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center gap-3"
          >
            <Send size={24} />
            Telegram Канал
          </a>
          <a
            href="https://github.com/Dimasick-git/Ryzhenka"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-3"
          >
            <Github size={24} />
            GitHub Репозиторий
          </a>
        </div>
      </div>

      {/* Footer message */}
      <div className="mt-16 text-center">
        <p className="text-gray-400 flex items-center justify-center gap-2 text-lg">
          Сделано с <Heart className="text-red-500 fill-red-500 animate-pulse" size={20} /> для Switch комьюнити
        </p>
      </div>
    </div>
  )
}

export default Team
