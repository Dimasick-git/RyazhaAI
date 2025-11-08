import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'data', 'knowledge.json');

function initDataFile() {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ entries: [] }, null, 2));
  }
}

export function getKnowledge() {
  initDataFile();
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data).entries;
}

export function addKnowledge(content, category = 'general', tags = []) {
  initDataFile();
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  
  const newEntry = {
    id: uuidv4(),
    content,
    category,
    tags: Array.isArray(tags) ? tags : [],
    createdAt: new Date().toISOString()
  };
  
  data.entries.push(newEntry);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  
  return newEntry;
}

export function searchKnowledge(query) {
  const entries = getKnowledge();
  const queryLower = query.toLowerCase();
  
  return entries.filter(entry => {
    const contentMatch = entry.content.toLowerCase().includes(queryLower);
    const categoryMatch = entry.category.toLowerCase().includes(queryLower);
    const tagsMatch = entry.tags.some(tag => 
      tag.toLowerCase().includes(queryLower)
    );
    
    return contentMatch || categoryMatch || tagsMatch;
  }).slice(0, 5);
}
