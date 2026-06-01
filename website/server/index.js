import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { chatWithAI, chatWithAIStream } from './proxyService.js';
import { getKnowledge, addKnowledge, searchKnowledge } from './storageService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ── Rate limiter: 15 requests per minute per IP ─────────────────
const rateLimitMap = new Map();

function isRateLimited(ip) {
 const now = Date.now();
 const windowMs = 60_000;
 const maxReqs = 15;

 const prev = (rateLimitMap.get(ip) || []).filter(ts => now - ts < windowMs);
 if (prev.length >= maxReqs) {
 rateLimitMap.set(ip, prev);
 return true;
 }
 prev.push(now);
 rateLimitMap.set(ip, prev);
 return false;
}

// Clean up stale rate-limit entries every 5 minutes
setInterval(() => {
 const cutoff = Date.now() - 60_000;
 for (const [ip, times] of rateLimitMap.entries()) {
 const fresh = times.filter(ts => ts > cutoff);
 if (fresh.length === 0) rateLimitMap.delete(ip);
 else rateLimitMap.set(ip, fresh);
 }
}, 5 * 60_000);

// ── Middleware & Input validation ────────────────────────────────
const MAX_MESSAGE_LEN = 2000;
const MAX_HISTORY_LEN = 20;
const MAX_HISTORY_CONTENT_LEN = 1000;

function validateInput(message, history) {
 if (!message || typeof message !== 'string') {
 return 'Message is required';
 }
 if (message.length > MAX_MESSAGE_LEN) {
 return `Сообщение слишком длинное (максимум ${MAX_MESSAGE_LEN} символов)`;
 }
 if (history && !Array.isArray(history)) {
 return 'History must be an array';
 }
 if (history && history.length > MAX_HISTORY_LEN) {
 return `История слишком длинная (максимум ${MAX_HISTORY_LEN} сообщений)`;
 }
 return null;
}

const _defaultOrigins = ['https://dimasick-git.github.io', 'http://localhost:3000', 'http://localhost:5173'];
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
  : _defaultOrigins;

app.set('trust proxy', 1);
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, '../client/dist')));

// ── Helper: build knowledge context ─────────────────────────────
function getKnowledgeContext(message) {
 try {
 const relevant = searchKnowledge(message);
 if (relevant.length > 0) {
 return '\n\nРелевантная информация из базы знаний:\n' +
 relevant.map(item => `- ${item.content}`).join('\n');
 }
 } catch {
 // storageService not critical
 }
 return '';
}

// ── POST /api/chat (non-streaming, legacy) ───────────────────────
app.post('/api/chat', async (req, res) => {
 const ip = req.ip || req.socket?.remoteAddress || 'unknown';
 if (isRateLimited(ip)) {
 return res.status(429).json({ error: 'Слишком много запросов. Подождите минуту.' });
 }

 try {
 const { message, history = [], useKnowledge = true } = req.body;

 const validationError = validateInput(message, history);
 if (validationError) {
 return res.status(400).json({ error: validationError });
 }

 const context = useKnowledge ? getKnowledgeContext(message) : '';
 const response = await chatWithAI(message, history, context);

 res.json({ response, usedKnowledge: context.length > 0 });
 } catch (error) {
 console.error('Chat error:', error);
 res.status(500).json({ error: 'Ошибка при обработке запроса', details: error.message });
 }
});

// ── POST /api/chat/stream (SSE streaming) ───────────────────────
app.post('/api/chat/stream', async (req, res) => {
 const ip = req.ip || req.socket?.remoteAddress || 'unknown';

 if (isRateLimited(ip)) {
 return res.status(429).json({ error: 'Слишком много запросов. Подождите минуту.' });
 }

 const { message, history = [], useKnowledge = true } = req.body;

 const validationError = validateInput(message, history);
 if (validationError) {
 return res.status(400).json({ error: validationError });
 }

 res.setHeader('Content-Type', 'text/event-stream');
 res.setHeader('Cache-Control', 'no-cache');
 res.setHeader('Connection', 'keep-alive');
 res.setHeader('X-Accel-Buffering', 'no');
 res.flushHeaders();

 const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

 try {
 const context = useKnowledge ? getKnowledgeContext(message) : '';
 await chatWithAIStream(message, history, (chunk) => send({ chunk }), context);
 send({ done: true });
 } catch (error) {
 send({ error: error.message });
 }

 res.end();
});

// ── Knowledge API ────────────────────────────────────────────────
app.get('/api/knowledge', (req, res) => {
 try {
 res.json({ knowledge: getKnowledge() });
 } catch (error) {
 res.status(500).json({ error: error.message });
 }
});

app.post('/api/knowledge', (req, res) => {
 const knowledgeKey = process.env.KNOWLEDGE_API_KEY;
 if (knowledgeKey) {
   const provided = req.headers['x-api-key'];
   if (!provided || provided !== knowledgeKey) {
     return res.status(401).json({ error: 'Unauthorized' });
   }
 }
 try {
 const { content, category, tags } = req.body;
 if (!content) return res.status(400).json({ error: 'Content is required' });
 res.json({ success: true, entry: addKnowledge(content, category, tags) });
 } catch (error) {
 res.status(500).json({ error: error.message });
 }
});

// ── Health check ─────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
 res.json({
 status: 'ok',
 timestamp: new Date().toISOString(),
 proxy: process.env.USE_PROXY === 'true' ? 'enabled' : 'disabled',
 streaming: true,
 });
});

// ── SPA fallback ─────────────────────────────────────────────────
app.get('*', (_req, res) => {
 res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
 console.log(` Server running on http://localhost:${PORT}`);
 console.log(` Proxy: ${process.env.USE_PROXY === 'true' ? 'Enabled' : 'Disabled'}`);
 console.log(` Streaming: enabled`);
});
