import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { chatWithAI } from './proxyService.js';
import { getKnowledge, addKnowledge, searchKnowledge } from './storageService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../client/dist')));

app.post('/api/chat', async (req, res) => {
  try {
    const { message, useKnowledge = true } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let context = '';
    if (useKnowledge) {
      const relevantData = searchKnowledge(message);
      if (relevantData.length > 0) {
        context = '\n\nРелевантная информация из базы знаний:\n' + 
                  relevantData.map(item => `- ${item.content}`).join('\n');
      }
    }

    const fullMessage = message + context;
    const response = await chatWithAI(fullMessage);
    
    res.json({ 
      response,
      usedKnowledge: context.length > 0
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Ошибка при обработке запроса',
      details: error.message 
    });
  }
});

app.get('/api/knowledge', (req, res) => {
  try {
    const knowledge = getKnowledge();
    res.json({ knowledge });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/knowledge', (req, res) => {
  try {
    const { content, category, tags } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const newEntry = addKnowledge(content, category, tags);
    res.json({ success: true, entry: newEntry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    proxy: process.env.USE_PROXY === 'true' ? 'enabled' : 'disabled'
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Proxy: ${process.env.USE_PROXY === 'true' ? 'Enabled' : 'Disabled'}`);
});
