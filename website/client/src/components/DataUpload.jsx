import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Tag, Folder, Calendar } from 'lucide-react';

function DataUpload() {
  const [knowledge, setKnowledge] = useState([]);
  const [newEntry, setNewEntry] = useState({
    content: '',
    category: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    try {
      const response = await axios.get('/api/knowledge');
      setKnowledge(response.data.knowledge);
    } catch (error) {
      console.error('Error loading knowledge:', error);
    }
  };

  const addEntry = async (e) => {
    e.preventDefault();
    if (!newEntry.content.trim()) return;

    setLoading(true);
    try {
      const tags = newEntry.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);

      await axios.post('/api/knowledge', {
        content: newEntry.content,
        category: newEntry.category || 'general',
        tags
      });

      setNewEntry({ content: '', category: '', tags: '' });
      loadKnowledge();
    } catch (error) {
      console.error('Error adding entry:', error);
      alert('Ошибка при добавлении записи');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">База знаний</h2>

      <form onSubmit={addEntry} className="bg-white/10 rounded-xl p-4 mb-6">
        <div className="space-y-3">
          <textarea
            value={newEntry.content}
            onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
            placeholder="Введите информацию для базы знаний..."
            className="w-full bg-white/90 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
            disabled={loading}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={newEntry.category}
              onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
              placeholder="Категория (например: продукты, услуги)"
              className="bg-white/90 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
            <input
              type="text"
              value={newEntry.tags}
              onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value })}
              placeholder="Теги через запятую"
              className="bg-white/90 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !newEntry.content.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg px-4 py-3 font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Добавить запись
          </button>
        </div>
      </form>

      <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide">
        {knowledge.length === 0 ? (
          <div className="text-center text-white/60 py-8">
            <p>База знаний пуста. Добавьте первую запись!</p>
          </div>
        ) : (
          knowledge.map((entry) => (
            <div
              key={entry.id}
              className="bg-white/90 rounded-xl p-4 hover:shadow-lg transition-all"
            >
              <p className="text-gray-800 mb-3">{entry.content}</p>
              <div className="flex flex-wrap gap-2 text-sm">
                {entry.category && (
                  <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                    <Folder className="w-4 h-4" />
                    {entry.category}
                  </span>
                )}
                {entry.tags && entry.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1 bg-pink-100 text-pink-700 px-3 py-1 rounded-full"
                  >
                    <Tag className="w-4 h-4" />
                    {tag}
                  </span>
                ))}
                <span className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full ml-auto">
                  <Calendar className="w-4 h-4" />
                  {new Date(entry.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DataUpload;
