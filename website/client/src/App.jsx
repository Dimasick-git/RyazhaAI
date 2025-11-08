import React, { useState } from 'react';
import Chat from './components/Chat';
import DataUpload from './components/DataUpload';
import { Database, MessageSquare, Shield } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="glass rounded-2xl p-6 mb-6 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">AI Chat</h1>
                <p className="text-white/80 text-sm">Облачное хранилище знаний</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-lg">
              <Shield className="w-5 h-5 text-green-300" />
              <span className="text-green-100 text-sm font-medium">Защищенное соединение</span>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-2 mb-6 shadow-xl">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                activeTab === 'chat'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              Чат
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                activeTab === 'data'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Database className="w-5 h-5" />
              База знаний
            </button>
          </div>
        </div>

        <div className="glass rounded-2xl shadow-2xl overflow-hidden">
          {activeTab === 'chat' ? <Chat /> : <DataUpload />}
        </div>
      </div>
    </div>
  );
}

export default App;
