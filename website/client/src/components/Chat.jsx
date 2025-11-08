import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, Loader2 } from 'lucide-react';

function Chat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Привет! Я AI ассистент с доступом к базе знаний. Задайте мне любой вопрос!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await axios.post('/api/chat', {
        message: userMessage,
        useKnowledge: true
      });

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.data.response,
          usedKnowledge: response.data.usedKnowledge
        }
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Ошибка: ${error.response?.data?.error || error.message}. Проверьте настройки API ключа в .env файле.`,
          error: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : message.error
                  ? 'bg-red-500/20 text-red-100'
                  : 'bg-white/90 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.usedKnowledge && (
                <p className="text-xs mt-2 opacity-70">📚 Использована база знаний</p>
              )}
            </div>
            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white/90 rounded-2xl px-4 py-3">
              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-6 border-t border-white/10">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Введите сообщение..."
            disabled={loading}
            className="flex-1 bg-white/90 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 py-3 font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chat;
