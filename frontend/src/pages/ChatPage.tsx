import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Bot,
  User,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { ChatMessage, Citation, ModelStatus } from '../types';
import { CitationCard } from '../components/CitationCard';
import { api } from '../services/api';

interface ChatPageProps {
  modelStatus: ModelStatus | null;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  modelStatus,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        `Welcome to **EstateIQ AI** — your verified real estate intelligence assistant.\n\n` +
        `I am grounded strictly on public data scraped from **https://darglobal.co.uk/** and **https://wasalt.sa/en**.\n\n` +
        `Ask me anything about:\n` +
        `- **DarGlobal Luxury Projects**: AIDA Oman, The Astera, Tierra Viva, DG1, Les Vagues, brand collaborations (Aston Martin, Lamborghini, Pagani, Missoni, Trump).\n` +
        `- **Wasalt Saudi Real Estate**: Verified villas, apartments, lands, and rentals in Riyadh, Jeddah, and Dammam with authentic SAR prices.\n` +
        `- **Cross-Market Comparisons**: Contrasting DarGlobal's international branded residences with Wasalt's Saudi marketplace.\n\n` +
        `*Every response includes verifiable source citations and direct links to the original webpages.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'DarGlobal' | 'Wasalt'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle initial prompt passed from Overview
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const handleSend = async (questionText?: string) => {
    const textToSend = (questionText || input).trim();
    if (!textToSend || isLoading) return;

    setInput('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Build history for context (exclude welcome message)
      const history = messages
        .filter((m) => m.id !== 'welcome-1')
        .slice(-4)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await api.sendChatMessage(textToSend, sourceFilter, history);

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.answer,
        citations: res.citations,
        chunksUsed: res.chunks_used,
        model: res.model,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: res.error || undefined,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Error generating response: ${err.message || 'Unknown network error'}. Please verify backend connection.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: err.message,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: 'Conversation cleared. How can I assist you with DarGlobal developments or Wasalt properties today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const suggestions = [
    'What are the major developments listed by DarGlobal?',
    'What kinds of properties are available on Wasalt?',
    'Which locations are covered by the collected DarGlobal projects?',
    'Compare the property information from DarGlobal and Wasalt.',
    'What amenities are mentioned for the indexed developments?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] max-w-5xl mx-auto py-4">
      {/* Top Filter and Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#0F1A30] border border-[#223354] mb-4">
        {/* Source Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#080E1E] p-1 rounded-xl border border-[#223354]">
          <span className="text-xs text-[#8A99AD] px-2 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#C5A880]" />
            <span>Scope:</span>
          </span>
          {(['all', 'DarGlobal', 'Wasalt'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setSourceFilter(mode)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                sourceFilter === mode
                  ? 'bg-[#C5A880] text-[#080E1E] shadow-sm'
                  : 'text-[#8A99AD] hover:text-white hover:bg-[#152238]'
              }`}
            >
              {mode === 'all' ? 'All Sources' : mode}
            </button>
          ))}
        </div>

        {/* Model Status Pill & Clear */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#152238] border border-[#223354] text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[#8A99AD]">Engine:</span>
            <span className="text-[#DFCAAB] font-mono font-medium truncate max-w-[150px]">
              {modelStatus?.model_name ? modelStatus.model_name.split(':')[0].split('/').pop() : 'Ernie 5.5 Flash'}
            </span>
            <span className="text-emerald-400 text-[10px] uppercase font-bold">Free</span>
          </div>

          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg bg-[#152238] hover:bg-rose-500/20 text-[#8A99AD] hover:text-rose-300 border border-[#223354] transition-all"
            title="Clear Conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1C2844] to-[#0A1224] border border-[#C5A880]/40 flex items-center justify-center shrink-0 shadow-md">
                  <Bot className="w-4 h-4 text-[#C5A880]" />
                </div>
              )}

              <div className={`max-w-[85%] md:max-w-[75%] space-y-2`}>
                {/* Bubble */}
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-[#C5A880] to-[#DFCAAB] text-[#080E1E] font-medium rounded-tr-none shadow-md'
                      : 'bg-[#0F1A30] border border-[#223354] text-[#F9F8F6] rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Content (Markdown simulated formatting) */}
                  <div className="whitespace-pre-wrap space-y-2 prose prose-invert prose-sm max-w-none">
                    {message.content.split('\n\n').map((paragraph: string, pIdx: number) => {
                      if (paragraph.startsWith('# ')) {
                        return <h2 key={pIdx} className="text-lg font-serif font-bold text-[#DFCAAB] mt-2 mb-1">{paragraph.replace('# ', '')}</h2>;
                      }
                      if (paragraph.startsWith('## ')) {
                        return <h3 key={pIdx} className="text-base font-serif font-semibold text-[#DFCAAB] mt-2 mb-1">{paragraph.replace('## ', '')}</h3>;
                      }
                      if (paragraph.startsWith('### ')) {
                        return <h4 key={pIdx} className="text-sm font-semibold text-white mt-1.5">{paragraph.replace('### ', '')}</h4>;
                      }
                      return <p key={pIdx} className="leading-relaxed">{paragraph}</p>;
                    })}
                  </div>

                  {/* Bubble Footer */}
                  <div
                    className={`mt-3 pt-2 border-t flex items-center justify-between text-[11px] ${
                      isUser
                        ? 'border-[#080E1E]/20 text-[#080E1E]/70'
                        : 'border-[#223354]/60 text-[#8A99AD]'
                    }`}
                  >
                    <span>{message.timestamp}</span>

                    {!isUser && (
                      <div className="flex items-center gap-3">
                        {message.chunksUsed !== undefined && message.chunksUsed > 0 && (
                          <span className="text-[10px] text-[#C5A880] font-mono">
                            {message.chunksUsed} evidence chunks
                          </span>
                        )}
                        <button
                          onClick={() => handleCopy(message.id, message.content)}
                          className="hover:text-white transition-colors flex items-center gap-1"
                        >
                          {copiedId === message.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Citations Carousel / Grid */}
                {!isUser && message.citations && message.citations.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C5A880] uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Grounded Source Citations ({message.citations.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {message.citations.map((citation: Citation, citIdx: number) => (
                        <CitationCard key={citIdx} citation={citation} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-[#C5A880] flex items-center justify-center shrink-0 shadow-md">
                  <User className="w-4 h-4 text-[#080E1E]" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex gap-3.5 justify-start">
            <div className="w-8 h-8 rounded-xl bg-[#1C2844] border border-[#C5A880]/40 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-[#C5A880] animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl bg-[#0F1A30] border border-[#223354] rounded-tl-none">
              <div className="flex items-center gap-2 text-xs text-[#8A99AD]">
                <RefreshCw className="w-3.5 h-3.5 text-[#C5A880] animate-spin" />
                <span>Searching FAISS vector index & generating grounded answer...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested chips (when chat has few messages) */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {suggestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-xs px-3 py-1.5 rounded-full bg-[#152238] hover:bg-[#1C2844] text-[#8A99AD] hover:text-[#DFCAAB] border border-[#223354] transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative"
      >
        <div className="flex items-center gap-2 rounded-2xl bg-[#0F1A30] border border-[#223354] focus-within:border-[#C5A880]/60 p-2 shadow-xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask EstateIQ about DarGlobal projects or Wasalt Saudi properties...`}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-[#8A99AD] focus:outline-none"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#DFCAAB] text-[#080E1E] font-semibold hover:from-[#DFCAAB] hover:to-[#C5A880] disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
