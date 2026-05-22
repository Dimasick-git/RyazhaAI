import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import dotenv from 'dotenv';

dotenv.config();

// ── Anthropic SDK (optional – only loaded when ANTHROPIC_API_KEY is set) ──────
let anthropic = null;
if (process.env.ANTHROPIC_API_KEY) {
  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    console.log('[Claude] Anthropic SDK loaded — Claude is primary provider');
  } catch {
    console.warn('[Claude] @anthropic-ai/sdk not installed, falling back to ChatAnywhere');
  }
}

// ── ChatAnywhere fallback endpoints (OpenAI-compatible) ────────────────────────
const OPENAI_ENDPOINTS = [
  { url: 'https://api.chatanywhere.tech/v1/chat/completions', model: 'gpt-4o-mini' },
  { url: 'https://api.chatanywhere.tech/v1/chat/completions', model: 'deepseek-v3' },
  { url: 'https://api.chatanywhere.tech/v1/chat/completions', model: 'gpt-4o' },
  { url: 'https://api.chatanywhere.tech/v1/chat/completions', model: 'gpt-3.5-turbo' },
  { url: 'https://api.chatanywhere.org/v1/chat/completions', model: 'gpt-4o-mini' },
  { url: 'https://api.chatanywhere.org/v1/chat/completions', model: 'gpt-3.5-turbo' },
];

// ── System prompt ──────────────────────────────────────────────────────────────
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

const ALLOWED_ROLES = new Set(['user', 'assistant']);
const MAX_CONTENT_LEN = 1000;
const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';

// ── Message builders ───────────────────────────────────────────────────────────
function sanitizeHistory(history) {
  return (history || [])
    .slice(-20)
    .filter(m => m && ALLOWED_ROLES.has(m.role) && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, MAX_CONTENT_LEN) }));
}

function buildOpenAIMessages(message, history) {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    ...sanitizeHistory(history),
    { role: 'user', content: message },
  ];
}

// ── Proxy config helper ────────────────────────────────────────────────────────
function proxyAgent() {
  if (process.env.USE_PROXY === 'true' && process.env.PROXY_URL) {
    return new HttpsProxyAgent(process.env.PROXY_URL);
  }
  return null;
}

function getOpenAIKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.startsWith('your_')) {
    throw new Error('OPENAI_API_KEY не настроен. Добавьте ключ ChatAnywhere в файл .env');
  }
  return key;
}

// ── Anthropic (Claude) non-streaming ──────────────────────────────────────────
async function chatWithClaude(message, history) {
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      ...sanitizeHistory(history),
      { role: 'user', content: message },
    ],
  });
  const text = response.content?.[0]?.text;
  if (!text) throw new Error('Empty Claude response');
  return text.trim();
}

// ── Anthropic (Claude) streaming ──────────────────────────────────────────────
async function chatWithClaudeStream(message, history, onChunk) {
  const stream = anthropic.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      ...sanitizeHistory(history),
      { role: 'user', content: message },
    ],
  });

  let fullContent = '';
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
      const text = event.delta.text;
      fullContent += text;
      onChunk(text);
    }
  }

  if (!fullContent) throw new Error('Empty Claude stream response');
  return fullContent;
}

// ── ChatAnywhere (OpenAI-compat) non-streaming ─────────────────────────────────
async function chatWithOpenAI(message, history) {
  const apiKey = getOpenAIKey();
  const messages = buildOpenAIMessages(message, history);
  const agent = proxyAgent();

  for (const endpoint of OPENAI_ENDPOINTS) {
    try {
      console.log(`[OpenAI] Trying ${endpoint.model} at ${endpoint.url}...`);
      const response = await axios.post(
        endpoint.url,
        { model: endpoint.model, messages, temperature: 0.7, max_tokens: 1000 },
        {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          timeout: 30000,
          ...(agent ? { httpsAgent: agent } : {}),
        }
      );
      const content = response.data?.choices?.[0]?.message?.content;
      if (content) {
        console.log(`[OpenAI] Success with ${endpoint.model}`);
        return content.trim();
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error(`[OpenAI] ${endpoint.model} failed:`, error.message);
    }
  }
  throw new Error('Все AI эндпоинты недоступны. Попробуйте позже.');
}

// ── ChatAnywhere (OpenAI-compat) streaming ─────────────────────────────────────
async function chatWithOpenAIStream(message, history, onChunk) {
  const apiKey = getOpenAIKey();
  const messages = buildOpenAIMessages(message, history);
  const agent = proxyAgent();

  for (const endpoint of OPENAI_ENDPOINTS) {
    try {
      console.log(`[OpenAI stream] Trying ${endpoint.model}...`);
      const response = await axios.post(
        endpoint.url,
        { model: endpoint.model, messages, temperature: 0.7, max_tokens: 1000, stream: true },
        {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          timeout: 60000,
          responseType: 'stream',
          ...(agent ? { httpsAgent: agent } : {}),
        }
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
        response.data.on('error', reject);
      });

      if (fullContent) {
        console.log(`[OpenAI stream] Success with ${endpoint.model}`);
        return fullContent;
      }
      throw new Error('Empty stream response');
    } catch (error) {
      console.error(`[OpenAI stream] ${endpoint.model} failed:`, error.message);
    }
  }
  throw new Error('Все AI эндпоинты недоступны. Попробуйте позже.');
}

// ── Public API ─────────────────────────────────────────────────────────────────
export async function chatWithAI(message, history = []) {
  if (anthropic) {
    try {
      console.log('[Claude] Using Anthropic Claude...');
      return await chatWithClaude(message, history);
    } catch (error) {
      console.error('[Claude] Failed, falling back to ChatAnywhere:', error.message);
    }
  }
  return chatWithOpenAI(message, history);
}

export async function chatWithAIStream(message, history = [], onChunk) {
  if (anthropic) {
    try {
      console.log('[Claude stream] Using Anthropic Claude...');
      return await chatWithClaudeStream(message, history, onChunk);
    } catch (error) {
      console.error('[Claude stream] Failed, falling back to ChatAnywhere:', error.message);
    }
  }
  return chatWithOpenAIStream(message, history, onChunk);
}
