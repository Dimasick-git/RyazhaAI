import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'data', 'knowledge.json');

function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE);
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
}

async function readData() {
  ensureDataDir();
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return { entries: [] };
    }
    throw err;
  }
}

async function writeData(data) {
  ensureDataDir();
  const tmp = DATA_FILE + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, DATA_FILE);
}

export async function getKnowledge() {
  const data = await readData();
  return data.entries;
}

export async function addKnowledge(content, category = 'general', tags = []) {
  const data = await readData();

  const newEntry = {
    id: uuidv4(),
    content,
    category: String(category).slice(0, 100),
    tags: Array.isArray(tags) ? tags.map(t => String(t).slice(0, 50)) : [],
    createdAt: new Date().toISOString(),
  };

  data.entries.push(newEntry);
  await writeData(data);
  return newEntry;
}

export async function searchKnowledge(query) {
  const entries = await getKnowledge();
  const queryLower = query.toLowerCase();

  return entries
    .filter(entry => {
      const contentMatch = entry.content.toLowerCase().includes(queryLower);
      const categoryMatch = entry.category.toLowerCase().includes(queryLower);
      const tagsMatch = entry.tags.some(tag => tag.toLowerCase().includes(queryLower));
      return contentMatch || categoryMatch || tagsMatch;
    })
    .slice(0, 5);
}
