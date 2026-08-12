import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_BASE_URL = (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
const OPENROUTER_URL = `${OPENROUTER_BASE_URL}/chat/completions`;
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'openrouter/free';
const FALLBACK_MODEL = 'openrouter/free';
const ALLOWED_MODELS = new Set([
  'openrouter/free',
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'openai/gpt-oss-20b:free',
  'google/gemma-4-26b-a4b-it:free',
]);

const SYSTEM_PROMPT = `Ты RYAZHA AI — технический помощник по Nintendo Switch и CFW. Отвечай на русском, кратко, точно и пошагово. Не выдумывай версии, ссылки или состояние проектов. При вопросах о рисках бана, взломе или модификации консоли сначала объясняй риски и меры предосторожности. Используй только проверяемую техническую информацию.`;

const ALLOWED_ROLES = new Set(['user', 'assistant']);
const MAX_CONTENT_LEN = 1000;

function getApiKey() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.startsWith('your_')) {
    throw new Error('OPENROUTER_API_KEY не настроен. Добавьте свой ключ OpenRouter в переменные окружения сервера.');
  }
  return apiKey;
}

function getModel(modelOverride) {
  if (modelOverride && ALLOWED_MODELS.has(modelOverride)) return modelOverride;
  return DEFAULT_MODEL;
}

function buildMessages(message, history, context = '') {
  const recentHistory = (history || [])
    .slice(-20)
    .filter((item) => item && ALLOWED_ROLES.has(item.role) && typeof item.content === 'string')
    .map((item) => ({ role: item.role, content: item.content.slice(0, MAX_CONTENT_LEN) }));
  const system = context
    ? `${SYSTEM_PROMPT}\n\nРелевантная информация из базы знаний:\n${context.slice(0, 6000)}`
    : SYSTEM_PROMPT;
  return [{ role: 'system', content: system }, ...recentHistory, { role: 'user', content: message.slice(0, MAX_CONTENT_LEN) }];
}

function buildConfig(stream, signal) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getApiKey()}`,
      'HTTP-Referer': process.env.PUBLIC_APP_URL || 'https://dimasick-git.github.io/RyazhaAI/',
      'X-OpenRouter-Title': 'RYAZHA AI',
    },
    timeout: stream ? 60000 : 30000,
    signal,
  };
  if (stream) config.responseType = 'stream';
  if (process.env.USE_PROXY === 'true' && process.env.PROXY_URL) {
    config.httpsAgent = new HttpsProxyAgent(process.env.PROXY_URL);
  }
  return config;
}

function buildPayload(message, history, context, stream, modelOverride) {
  return {
    model: getModel(modelOverride),
    messages: buildMessages(message, history, context),
    temperature: 0.4,
    max_tokens: 2048,
    stream,
  };
}

async function requestCompletion(message, history, context, modelOverride, stream = false, signal = undefined) {
  const payload = buildPayload(message, history, context, stream, modelOverride);
  try {
    return await axios.post(OPENROUTER_URL, payload, buildConfig(stream, signal));
  } catch (error) {
    // A temporarily unavailable pinned free model must not make the chat unavailable.
    if (payload.model !== FALLBACK_MODEL && error.response?.status >= 400) {
      return axios.post(OPENROUTER_URL, { ...payload, model: FALLBACK_MODEL }, buildConfig(stream, signal));
    }
    throw error;
  }
}

export async function chatWithAI(message, history = [], context = '', modelOverride) {
  const response = await requestCompletion(message, history, context, modelOverride);
  const text = response.data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('OpenRouter вернул пустой ответ.');
  return text;
}

export async function chatWithAIStream(message, history = [], onChunk, context = '', signal = null, modelOverride) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  try {
    const response = await requestCompletion(message, history, context, modelOverride, true, controller.signal);
    let fullContent = '';
    let buffer = '';
    await new Promise((resolve, reject) => {
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
          if (!raw || raw === '[DONE]') continue;
          try {
            const event = JSON.parse(raw);
            const text = event.choices?.[0]?.delta?.content || '';
            if (text) {
              fullContent += text;
              onChunk(text);
            }
          } catch {
            // Ignore non-data SSE frames.
          }
        }
      });
      response.data.on('end', () => resolve());
      response.data.on('error', reject);
    });
    if (!fullContent) throw new Error('OpenRouter вернул пустой streaming-ответ.');
    return fullContent;
  } finally {
    signal?.removeEventListener('abort', abort);
  }
}
