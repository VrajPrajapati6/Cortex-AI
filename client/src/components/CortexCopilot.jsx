import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, MessageSquare, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config/api.config';

const escapeHtml = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const formatMarkdown = (text) => {
  if (!text) return '';
  
  // Store code blocks temporarily to prevent inner markdown parsing
  const codeBlocks = [];
  let html = text.replace(/```(?:[a-z0-9]+)?\n([\s\S]*?)\n```/gi, (match, code) => {
    codeBlocks.push(code.trim());
    return `___CODE_BLOCK_${codeBlocks.length - 1}___`;
  });

  // 1. Headings: ### Header, ## Header, # Header
  html = html.replace(/^###\s*(.*$)/gim, '<h4 class="font-bold text-xs uppercase tracking-wider text-indigo-400 mt-2.5 mb-1">$1</h4>');
  html = html.replace(/^##\s*(.*$)/gim, '<h3 class="font-bold text-sm text-indigo-300 mt-3 mb-1">$1</h3>');
  html = html.replace(/^#\s*(.*$)/gim, '<h2 class="font-bold text-base text-white mt-3.5 mb-1.5">$1</h2>');

  // 2. Horizontal Rules: --- or ***
  html = html.replace(/^(?:---|[*]{3,})\s*$/gim, '<hr class="border-t border-slate-700/80 my-3"/>');

  // 3. Bold: **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-100">$1</strong>');

  // 3. Inline code: `code`
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    return `<code class="bg-slate-950 px-1.5 py-0.5 rounded font-mono text-[11px] text-indigo-300 border border-slate-700">${escapeHtml(code)}</code>`;
  });

  // 4. Bullet lists: - item or * item
  html = html.replace(/^[*-]\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-200 text-xs">$1</li>');

  // 5. Newlines to <br/>
  html = html.replace(/\n/g, '<br/>');

  // 6. Restore code blocks into dark styled syntax boxes
  html = html.replace(/___CODE_BLOCK_(\d+)___/g, (match, index) => {
    const code = codeBlocks[index] || '';
    return `<pre class="bg-slate-950 p-3 my-2 rounded-lg border border-slate-700/80 font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre leading-normal"><code>${escapeHtml(code)}</code></pre>`;
  });

  return html;
};

export const CortexCopilot = ({ incidentContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: 'Hi! I am Cortex Copilot. I have analyzed the incident. How can I help you remediate this?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          incidentContext
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessages(prev => [...prev, { role: 'model', content: data.data.text }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: 'Sorry, I encountered an error retrieving the runbook.' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', content: 'Connection to RAG service failed.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl shadow-indigo-600/30 transition-all hover:scale-105 z-50 flex items-center justify-center"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-slate-900 rounded-2xl shadow-2xl shadow-black/80 border border-slate-800 flex flex-col z-50 overflow-hidden font-sans backdrop-blur-md">
      {/* Header */}
      <div className="bg-slate-950 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">Cortex Copilot</h3>
            <p className="text-[10px] text-slate-400 font-mono">RAG AI Assistant</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Context Badge */}
      {incidentContext?.rootCauseService && (
        <div className="bg-indigo-950/80 px-4 py-2 text-xs font-semibold border-b border-indigo-800/60 flex items-center text-indigo-300 font-mono">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400"></span>
          </span>
          Context: {incidentContext.rootCauseService}
        </div>
      )}

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/90">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-slate-800/90 border border-slate-700/80 text-slate-100 rounded-bl-none prose prose-sm prose-invert leading-relaxed'
            }`}>
              {msg.role === 'model' ? (
                <div dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2 shadow-sm">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              <span className="text-xs text-slate-400 font-mono font-medium">Copilot is analyzing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 bg-slate-900 border-t border-slate-800">
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 p-1.5 rounded-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about this incident..."
            className="flex-1 bg-transparent text-sm px-3 py-1.5 outline-none text-slate-100 placeholder:text-slate-500 font-mono"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
