import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';
import { HttpsProxyAgent } from 'https-proxy-agent';
import dotenv from 'dotenv';

dotenv.config();

const AI_ENDPOINTS = [
  { url: 'https://api.chatanywhere.tech/v1/chat/completions', model: 'gpt-4o-mini' },
  { url: 'https://api.chatanywhere.tech/v1/chat/completions', model: 'deepseek-v3' },
  { url: 'https://api.chatanywhere.tech/v1/chat/completions', model: 'gpt-4o' },
  { url: 'https://api.chatanywhere.org/v1/chat/completions', model: 'gpt-4o-mini' },
  { url: 'https://api.chatanywhere.org/v1/chat/completions', model: 'deepseek-v3' },
  { url: 'https://api.chatanywhere.org/v1/chat/completions', model: 'gpt-4o' },
];

// Remember the last working endpoint index to try it first next time,
// avoiding unnecessary failures when earlier endpoints are down.
// Stored on an object so concurrent async callbacks share a single
// reference and reads/writes are always consistent within Node's
// single-threaded event loop (no interleaving within a sync expression).
const _proxyState = { lastWorkingIdx: 0 };

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

const CLAUDE_MODELS = new Set(['claude-haiku-4-5-20251001', 'claude-haiku-4-5', 'claude-sonnet-4-6', 'claude-opus-4-8']);
const ALLOWED_MODELS = new Set(['gpt-4o-mini', 'gpt-4o', 'deepseek-v3', 'deepseek-r1', ...CLAUDE_MODELS]);

function buildRequestBody(endpoint, messages, stream, modelOverride) {
  const model = (modelOverride && ALLOWED_MODELS.has(modelOverride)) ? modelOverride : endpoint.model;
  return {
    model,
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
    yield (_proxyState.lastWorkingIdx + i) % n;
  }
}

function buildAnthropicMessages(message, history) {
  return [
    ...(history || [])
      .slice(-20)
      .filter(m => m && ALLOWED_ROLES.has(m.role) && typeof m.content === 'string')
      .map(m => ({ role: m.role, content: m.content.slice(0, MAX_CONTENT_LEN) })),
    { role: 'user', content: message },
  ];
}

async function chatWithClaudeAI(message, history, context, model) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY не настроен. Добавьте ключ в .env для использования Claude моделей.');

  const client = new Anthropic({ apiKey });
  const systemContent = context ? `${SYSTEM_PROMPT}\n\n${context}` : SYSTEM_PROMPT;

  const response = await client.messages.create({
    model,
    max_tokens: 2048,
    system: systemContent,
    messages: buildAnthropicMessages(message, history),
  });

  const text = response.content[0]?.text?.trim();
  if (!text) throw new Error('Пустой ответ от Claude');
  return text;
}

async function chatWithClaudeAIStream(message, history, onChunk, context, signal, model) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY не настроен. Добавьте ключ в .env для использования Claude моделей.');

  const client = new Anthropic({ apiKey });
  const systemContent = context ? `${SYSTEM_PROMPT}\n\n${context}` : SYSTEM_PROMPT;

  const stream = client.messages.stream({
    model,
    max_tokens: 2048,
    system: systemContent,
    messages: buildAnthropicMessages(message, history),
  });

  if (signal) {
    signal.addEventListener('abort', () => stream.abort(), { once: true });
  }

  let fullContent = '';
  for await (const event of stream) {
    if (signal?.aborted) break;
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      const text = event.delta.text;
      fullContent += text;
      onChunk(text);
    }
  }

  if (!fullContent) throw new Error('Пустой стриминг-ответ от Claude');
  return fullContent;
}

export async function chatWithAI(message, history = [], context = '', modelOverride) {
  if (modelOverride && CLAUDE_MODELS.has(modelOverride)) {
    return chatWithClaudeAI(message, history, context, modelOverride);
  }

  const apiKey = getValidatedApiKey();
  const messages = buildMessages(message, history, context);

  for (const idx of _endpointOrder()) {
    const endpoint = AI_ENDPOINTS[idx];
    try {
      console.debug(`Trying ${endpoint.model}...`);
      const response = await axios.post(
        endpoint.url,
        buildRequestBody(endpoint, messages, false, modelOverride),
        buildConfig(apiKey, false)
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (content) {
        _proxyState.lastWorkingIdx = idx;
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

export async function chatWithAIStream(message, history = [], onChunk, context = '', signal = null, modelOverride) {
  if (modelOverride && CLAUDE_MODELS.has(modelOverride)) {
    return chatWithClaudeAIStream(message, history, onChunk, context, signal, modelOverride);
  }

  const apiKey = getValidatedApiKey();
  const messages = buildMessages(message, history, context);

  for (const idx of _endpointOrder()) {
    if (signal?.aborted) break;
    const endpoint = AI_ENDPOINTS[idx];
    try {
      console.debug(`[stream] Trying ${endpoint.model}...`);
      const ac = new AbortController();
      if (signal) {
        signal.addEventListener('abort', () => ac.abort(), { once: true });
      }

      const config = buildConfig(apiKey, true);
      config.signal = ac.signal;

      const response = await axios.post(
        endpoint.url,
        buildRequestBody(endpoint, messages, true, modelOverride),
        config
      );

      let fullContent = '';
      let buffer = '';

      await new Promise((resolve, reject) => {
        if (signal?.aborted) {
          response.data.destroy();
          return reject(Object.assign(new Error('client disconnected'), { name: 'AbortError' }));
        }

        const onAbort = () => {
          response.data.destroy();
          reject(Object.assign(new Error('client disconnected'), { name: 'AbortError' }));
        };
        signal?.addEventListener('abort', onAbort, { once: true });

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

        response.data.on('end', () => {
          signal?.removeEventListener('abort', onAbort);
          resolve();
        });
        response.data.on('error', (err) => {
          signal?.removeEventListener('abort', onAbort);
          response.data.destroy();
          reject(err);
        });
      });

      if (fullContent) {
        _proxyState.lastWorkingIdx = idx;
        console.log(`[stream] AI response via ${endpoint.model}`);
        return fullContent;
      }

      throw new Error('Empty stream response');
    } catch (error) {
      if (error.name === 'AbortError' || error.name === 'CanceledError') throw error;
      console.warn(`[stream] Endpoint ${endpoint.model} failed:`, error.message);
    }
  }

  throw new Error('Все AI эндпоинты недоступны. Попробуйте позже.');
}
