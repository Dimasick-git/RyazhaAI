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
  { url: 'https://api.chatanywhere.org/v1/chat/completions', model: 'gpt-4o-mini' },
];

// Remember the last working endpoint index to try it first next time,
// avoiding unnecessary failures when earlier endpoints are down.
let _lastWorkingIdx = 0;

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

function buildRequestBody(endpoint, messages, stream) {
  return {
    model: endpoint.model,
    messages,
    temperature: 0.7,
    max_tokens: 2048,
    stream,
  };
}

function buildConfig(apiKey, stream) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    timeout: stream ? 60000 : 30000,
  };

  if (stream) {
    config.responseType = 'stream';
  }

  if (process.env.USE_PROXY === 'true' && process.env.PROXY_URL) {
    config.httpsAgent = new HttpsProxyAgent(process.env.PROXY_URL);
  }

  return config;
}

function getValidatedApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here' || apiKey === 'your_api_key_from_chatanywhere') {
    throw new Error('API ключ не настроен. Пожалуйста, добавьте OPENAI_API_KEY в файл .env');
  }
  return apiKey;
}

const ALLOWED_ROLES = new Set(['user', 'assistant']);
const MAX_CONTENT_LEN = 1000;

function buildMessages(message, history, context = '') {
  const recentHistory = (history || [])
    .slice(-20)
    .filter(m => m && ALLOWED_ROLES.has(m.role) && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, MAX_CONTENT_LEN) }));
  const systemContent = context
    ? `${SYSTEM_PROMPT}\n\nРелевантная информация из базы знаний:\n${context}`
    : SYSTEM_PROMPT;
  return [
    { role: 'system', content: systemContent },
    ...recentHistory,
    { role: 'user', content: message },
  ];
}

function* _endpointOrder() {
  const n = AI_ENDPOINTS.length;
  for (let i = 0; i < n; i++) {
    yield (_lastWorkingIdx + i) % n;
  }
}

export async function chatWithAI(message, history = [], context = '') {
  const apiKey = getValidatedApiKey();
  const messages = buildMessages(message, history, context);

  for (const idx of _endpointOrder()) {
    const endpoint = AI_ENDPOINTS[idx];
    try {
      console.debug(`Trying ${endpoint.model}...`);
      const response = await axios.post(
        endpoint.url,
        buildRequestBody(endpoint, messages, false),
        buildConfig(apiKey, false)
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (content) {
        _lastWorkingIdx = idx;
        console.log(`AI response via ${endpoint.model}`);
        return content.trim();
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.warn(`Endpoint ${endpoint.model} failed:`, error.message);
    }
  }

  throw new Error('Все AI эндпоинты недоступны. Попробуйте позже.');
}

export async function chatWithAIStream(message, history = [], onChunk, context = '') {
  const apiKey = getValidatedApiKey();
  const messages = buildMessages(message, history, context);

  for (const idx of _endpointOrder()) {
    const endpoint = AI_ENDPOINTS[idx];
    try {
      console.debug(`[stream] Trying ${endpoint.model}...`);
      const response = await axios.post(
        endpoint.url,
        buildRequestBody(endpoint, messages, true),
        buildConfig(apiKey, true)
      );

      let fullContent = '';
      let buffer = '';

      await new Promise((resolve, reject) => {
        response.data.on('data', (chunk) => {
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop();

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (raw === '[DONE]') continue;

            try {
              const json = JSON.parse(raw);
              const text = json.choices?.[0]?.delta?.content || '';
              if (text) {
                fullContent += text;
                onChunk(text);
              }
            } catch {
              // skip malformed SSE chunks
            }
          }
        });

        response.data.on('end', resolve);
        response.data.on('error', (err) => {
          response.data.destroy();
          reject(err);
        });
      });

      if (fullContent) {
        _lastWorkingIdx = idx;
        console.log(`[stream] AI response via ${endpoint.model}`);
        return fullContent;
      }

      throw new Error('Empty stream response');
    } catch (error) {
      console.warn(`[stream] Endpoint ${endpoint.model} failed:`, error.message);
    }
  }

  throw new Error('Все AI эндпоинты недоступны. Попробуйте позже.');
}
