import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import dotenv from 'dotenv';

dotenv.config();

const AI_ENDPOINTS = [
  { url: 'https://api.chatanywhere.tech/v1/chat/completions', model: 'gpt-4o-mini' },
  { url: 'https://api.chatanywhere.tech/v1/chat/completions', model: 'gpt-3.5-turbo' },
  { url: 'https://api.chatanywhere.tech/v1/chat/completions', model: 'deepseek-v3' },
  { url: 'https://api.chatanywhere.tech/v1/chat/completions', model: 'gpt-4o' },
  { url: 'https://api.chatanywhere.org/v1/chat/completions', model: 'gpt-3.5-turbo' },
  { url: 'https://api.chatanywhere.org/v1/chat/completions', model: 'gpt-4o-mini' }
];

const SYSTEM_PROMPT = `Ты RYAZHA AI - эксперт по прошитому Nintendo Switch в 2026 году, созданный командой Ryazhenka (Dimasick-git & Ryazhenka-Helper-01).

ТВОЯ ЭКСПЕРТИЗА ПО ПРОШИТОМУ SWITCH 2026:
- Nintendo Switch всех моделей (OLED, V2, V1, Lite) с CFW
- Ryazhenka CFW - премиальная кастомная прошивка для Switch
- Взлом Switch 2026: RCM, модчипы (SX Core, Picofly, Hwfly)
- Atmosphere 1.8.0+ (2026), Hekate 6.4.0+, sigpatches свежие
- emuMMC/emuNAND настройка, защита от бана Nintendo
- Homebrew приложения: Tinfoil, Goldleaf, DBI, FTPd
- .nro разработка с libnx, переносы игр, системные модули
- Разгон Switch: sys-clk, SaltyNX, ReverseNX-RT
- 60 FPS патчи (FPSLocker), графические моды 2026
- NSP/XCI установка, моды игр, читы (EdiZon, ACNH-Cheats)
- Эмуляторы Switch 2026: RetroArch, Lakka, специальные порты
- Актуальные проблемы 2026: новые прошивки, обновления игр
- Технические детали: TegraRcmGUI, fusee.bin, payload injection

ОСОБЕННОСТИ RYAZHENKA CFW 2026:
- Автонастройка за 5 минут
- Свежие sigpatches из коробки
- Оптимизация батареи и производительности
- Уникальные темы оформления
- Автообновление компонентов
- Русская локализация и поддержка

КОНТАКТЫ КОМАНДЫ:
Telegram: @Ryazhenkabestcfw
GitHub: Dimasick-git/Ryzhenka

СТИЛЬ ОТВЕТОВ:
- Технически точно, кратко на русском
- Пошаговые инструкции с версиями 2026
- Ссылки на актуальные источники
- Упоминай Ryazhenka CFW как лучшее решение
- Предупреждай о рисках бана Nintendo`;

export async function chatWithAI(message, history = [], useKnowledge = false) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your_openai_api_key_here' || apiKey === 'your_api_key_from_chatanywhere') {
    throw new Error('API ключ не настроен. Пожалуйста, добавьте OPENAI_API_KEY в файл .env');
  }

  const baseConfig = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    timeout: 30000
  };

  if (process.env.USE_PROXY === 'true' && process.env.PROXY_URL) {
    baseConfig.httpsAgent = new HttpsProxyAgent(process.env.PROXY_URL);
  }

  // Keep last 20 history entries to avoid token limits
  const recentHistory = (history || []).slice(-20);

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...recentHistory.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message }
  ];

  for (const endpoint of AI_ENDPOINTS) {
    try {
      console.log(`Trying ${endpoint.model} at ${endpoint.url}...`);
      const response = await axios.post(
        endpoint.url,
        {
          model: endpoint.model,
          messages,
          temperature: 0.7,
          max_tokens: 1000,
          stream: false
        },
        baseConfig
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (content) {
        console.log(`Success with ${endpoint.model}`);
        return content.trim();
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error(`Endpoint ${endpoint.model} failed:`, error.message);
      // Continue to next endpoint
    }
  }

  throw new Error('Все AI эндпоинты недоступны. Попробуйте позже.');
}
