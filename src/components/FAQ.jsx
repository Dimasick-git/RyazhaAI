import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: "🎮 Как взломать Nintendo Switch?",
      answer: "Для взлома Switch нужно:\n1. Проверить серийный номер на уязвимость (patched/unpatched)\n2. Подготовить SD карту (минимум 32GB, рекомендуется 128GB+)\n3. Скачать Ryazhenka CFW с GitHub\n4. Установить через RCM режим (для unpatched) или ModChip (для patched)\n5. Следовать инструкциям в документации Ryazhenka\n\nПодробнее: github.com/Dimasick-git/Ryzhenka"
    },
    {
      question: "🥛 Что такое Ryazhenka CFW?",
      answer: "Ryazhenka - это лучшая кастомная прошивка для Nintendo Switch, созданная Dimasick-git!\n\nОсновано на Atmosphere с улучшениями:\n✅ Полная автоматизация установки\n✅ Красивые темы и интерфейсы\n✅ Последние версии всех компонентов\n✅ Уникальные модули от команды\n✅ Регулярные обновления\n✅ Поддержка комьюнити\n\nСкачать: github.com/Dimasick-git/Ryzhenka"
    },
    {
      question: "📦 Как установить .nro приложения?",
      answer: "Установка .nro приложений:\n\n1. Скачай .nro файл приложения\n2. Вставь SD карту Switch в компьютер\n3. Создай папку: /switch/название_приложения/\n4. Скопируй .nro файл в эту папку\n5. Верни SD карту в Switch\n6. Запусти через Homebrew Menu (hbmenu)\n\nDля RYAZHA AI:\n/switch/ryazha-ai/ryazha-ai.nro"
    },
    {
      question: "🔓 Можно ли играть онлайн с CFW?",
      answer: "⚠️ ВАЖНО: Игра онлайн с CFW = высокий риск бана!\n\nБезопасные варианты:\n✅ Используй emuMMC (эмунанд) для CFW\n✅ sysMMC оставь чистым для онлайна\n✅ Никогда не запускай пиратские игры онлайн\n✅ Используй Incognito RCM для скрытия серийника\n✅ Блокируй Nintendo серверы через 90DNS\n\nИли:\n❌ Используй Switch только для CFW (офлайн)\n✅ Купи второй Switch для онлайна"
    },
    {
      question: "💾 Какую SD карту выбрать?",
      answer: "Рекомендации по SD карте:\n\n📱 Размер:\n• Минимум: 32GB (только для homebrew)\n• Оптимально: 128GB\n• Рекомендуется: 256GB+\n• Для большой библиотеки: 512GB-1TB\n\n⚡ Скорость:\n• Минимум: Class 10\n• Рекомендуется: UHS-I (U3)\n• Лучше: UHS-II\n\n🏷️ Бренды:\n✅ SanDisk (лучший выбор)\n✅ Samsung EVO\n✅ Kingston Canvas\n❌ Дешевые noname (часто подделки)"
    },
    {
      question: "🎯 Что такое sigpatches?",
      answer: "Sigpatches - это патчи сигнатур для запуска неподписанного контента.\n\n✅ Нужны для:\n• Запуска бэкапов игр (NSP/XCI)\n• Установки модов\n• Работы некоторого homebrew\n\n📥 Где взять:\n• Ryazhenka CFW включает свежие sigpatches\n• Обновляются автоматически\n• Или скачай вручную с GitHub\n\n⚠️ Важно:\n• Всегда используй актуальные патчи\n• Обновляй после обновления прошивки\n• Старые патчи = не запускаются игры"
    },
    {
      question: "🔧 Как обновить Atmosphere/Ryazhenka?",
      answer: "Обновление CFW:\n\n📥 Ryazhenka (рекомендуется):\n1. Скачай последний релиз с GitHub\n2. Распакуй на SD карту (замени файлы)\n3. Перезагрузи Switch\n\n📥 Вручную:\n1. Скачай Atmosphere, Hekate, sigpatches\n2. Распакуй на SD (замени)\n3. Обнови hbmenu и Tesla\n4. Перезагрузи\n\n⚠️ Перед обновлением:\n• Сделай бэкап SD карты\n• Прочитай changelog\n• Убедись в совместимости"
    },
    {
      question: "🎮 Можно ли откатиться на старую версию ОС?",
      answer: "⚠️ НЕЛЬЗЯ откатить системную прошивку!\n\nПочему:\n• Nintendo использует efuses\n• При обновлении сжигаются fuses\n• Откат = бан или брик консоли\n\n✅ Что можно:\n• Остаться на текущей версии\n• Обновиться до более новой\n• Использовать emuMMC на старой версии\n\n💡 Совет:\n• Для CFW часто лучше остаться на старой версии\n• Новые эксплойты могут не работать на новых прошивках"
    },
    {
      question: "🚀 Как запустить RYAZHA AI на Switch?",
      answer: "Запуск RYAZHA AI:\n\n📥 Установка:\n1. Скачай ryazha-ai.nro\n2. Скопируй в /switch/ryazha-ai/\n3. Запусти через Homebrew Menu\n\n🌐 Требования:\n• Подключение к интернету (WiFi)\n• CFW (Ryazhenka/Atmosphere)\n• SD карта с приложением\n\n💡 Что умеет:\n• AI чат прямо на Switch!\n• Помощь по Switch вопросам\n• Открывается в браузере Switch\n• Работает через тачскрин\n\n🔥 Создано командой Ryazhenka специально для вас!"
    },
    {
      question: "📱 Где найти поддержку?",
      answer: "Связь с командой Ryazhenka:\n\n📱 Telegram: @Ryazhenkabestcfw\n• Новости и обновления\n• Помощь от комьюнити\n• Анонсы новых фич\n\n🐙 GitHub: Dimasick-git/Ryzhenka\n• Скачивание CFW\n• Issues для багов\n• Документация\n\n👨‍💻 Команда:\n• Dimasick-git - главный разработчик\n• Ryazha-Helper-01 - идейный вдохновитель\n\nМы всегда рады помочь! 💜"
    }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold gradient-text mb-4">
          ❓ Часто задаваемые вопросы
        </h2>
        <p className="text-gray-400">
          Все что нужно знать о Nintendo Switch CFW и Ryazhenka!
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-ryaha-card rounded-xl border border-ryaha-border overflow-hidden hover:border-indigo-500/50 transition-all"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-ryaha-hover transition-colors"
            >
              <span className="font-semibold text-white text-lg pr-4">
                {faq.question}
              </span>
              {openIndex === index ? (
                <ChevronUp className="flex-shrink-0 text-indigo-400" size={24} />
              ) : (
                <ChevronDown className="flex-shrink-0 text-gray-400" size={24} />
              )}
            </button>
            
            {openIndex === index && (
              <div className="px-6 pb-6">
                <div className="pt-4 border-t border-ryaha-border">
                  <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl border border-ryaha-border p-8 text-center">
        <h3 className="text-2xl font-bold gradient-text mb-4">
          Не нашел ответ?
        </h3>
        <p className="text-gray-300 mb-6">
          Задай вопрос AI помощнику в чате или напиши в Telegram!
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="https://t.me/Ryazhenkabestcfw"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
          >
            📱 Telegram
          </a>
          <a
            href="https://github.com/Dimasick-git/Ryzhenka"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            🐙 GitHub
          </a>
        </div>
      </div>
    </div>
  )
}

export default FAQ
