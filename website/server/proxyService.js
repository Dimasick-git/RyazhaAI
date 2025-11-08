import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.chatanywhere.tech';
const API_ENDPOINTS = [
  `${API_BASE_URL}/v1/chat/completions`,
  'https://api.chatanywhere.org/v1/chat/completions'
];

export async function chatWithAI(message, retryCount = 0) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey === 'your_openai_api_key_here' || apiKey === 'your_api_key_from_chatanywhere') {
    return 'Пожалуйста, получите бесплатный API ключ на https://api.chatanywhere.tech/v1/oauth/free/render и добавьте его в файл .env';
  }

  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    timeout: 30000
  };

  if (process.env.USE_PROXY === 'true' && process.env.PROXY_URL) {
    config.httpsAgent = new HttpsProxyAgent(process.env.PROXY_URL);
  }

  const data = {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Ты полезный AI ассистент. Отвечай на основе предоставленной информации из базы знаний, если она доступна.'
      },
      {
        role: 'user',
        content: message
      }
    ],
    temperature: 0.7,
    max_tokens: 1000,
    stream: false
  };

  const endpoint = API_ENDPOINTS[retryCount % API_ENDPOINTS.length];

  try {
    const response = await axios.post(endpoint, data, config);
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(`Ошибка API (попытка ${retryCount + 1}):`, error.message);

    if (retryCount < API_ENDPOINTS.length - 1) {
      console.log(`Переключение на резервный эндпоинт...`);
      return chatWithAI(message, retryCount + 1);
    }

    if (error.response?.status === 401) {
      throw new Error('Неверный API ключ. Проверьте настройки в .env файле.');
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      throw new Error('Не удалось подключиться к API. Попробуйте настроить прокси в .env файле.');
    } else {
      throw new Error(`Ошибка API: ${error.message}`);
    }
  }
}
