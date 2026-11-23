'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  Info,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { AirQualityData, ChatMessage, UserProfile } from '@/lib/types';
import { QUICK_PROMPT_CHIPS } from '@/lib/constants';
import { getStoredChatHistory, saveStoredChatHistory } from '@/lib/storage';

interface AskBreatheWiseProps {
  airQuality: AirQualityData;
  profile: UserProfile;
}

export const AskBreatheWise: React.FC<AskBreatheWiseProps> = ({ airQuality, profile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const history = getStoredChatHistory();
    if (history.length > 0) {
      setMessages(history);
    } else {
      // Default welcome greeting
      const initialMessage: ChatMessage = {
        id: 'msg-init',
        role: 'assistant',
        content: `Hello! I'm your **BreatheWise Assistant**. \n\nI'm calibrated to **${airQuality.locationName}** where current AQI is **${airQuality.aqi}** (${airQuality.aqiCategory}, PM2.5: ${airQuality.pm2_5} µg/m³). \n\nAsk me anything about daily routines, outdoor windows, children's safety, or zero-budget indoor improvements!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          'Can my child play outside this evening?',
          'Should I open the windows now?',
          'How can I improve air quality with zero budget?'
        ]
      };
      setMessages([initialMessage]);
      saveStoredChatHistory([initialMessage]);
    }
  }, [airQuality.locationName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query.trim(),
          conversationHistory: newMessages.map(m => ({ role: m.role, content: m.content })),
          airQuality,
          profile
        })
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Here is what we recommend based on current air quality and your family profile.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: data.suggestedActions,
        isFallback: data.isFallback
      };

      const finalMessages = [...newMessages, botMsg];
      setMessages(finalMessages);
      saveStoredChatHistory(finalMessages);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: `Based on current readings in **${airQuality.locationName}** (AQI: ${airQuality.aqi}, PM2.5: ${airQuality.pm2_5} µg/m³), we recommend limiting prolonged outdoor exertion, keeping morning street-facing windows closed, and running kitchen exhaust fans during cooking.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: true
      };
      const finalMessages = [...newMessages, fallbackMsg];
      setMessages(finalMessages);
      saveStoredChatHistory(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem('breathewise_chat_history');
    setMessages([
      {
        id: 'msg-init-reset',
        role: 'assistant',
        content: `Chat history refreshed. How can I help you navigate the air in **${airQuality.locationName}** today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          'Can my child play outside this evening?',
          'Should I open the windows now?'
        ]
      }
    ]);
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6 animate-reveal">
      {/* Editorial Header */}
      <div className="bg-sage rounded-[3rem] p-6 sm:p-8 border border-forest/15 shadow-forest space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-forest text-cream flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-sage" />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl text-forest">
                ASK BREATHEWISE AI
              </h2>
              <span className="text-[10px] font-semibold uppercase tracking-utility text-forest/70 block">
                CONTEXT: {airQuality.locationName} • AQI {airQuality.aqi} • {profile.householdMembers} MEMBERS
              </span>
            </div>
          </div>

          <button
            onClick={handleClearHistory}
            className="text-xs uppercase font-semibold tracking-utility text-forest/60 hover:text-forest flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RESET CHAT</span>
          </button>
        </div>

        {/* Medical & Scientific Disclaimer */}
        <div className="bg-cream/90 p-3.5 rounded-2xl border border-forest/15 flex items-start gap-2.5 text-xs text-forest/80">
          <Info className="w-4 h-4 text-forest shrink-0 mt-0.5" />
          <p>
            <strong>Medical Notice:</strong> BreatheWise provides environmental health awareness and exposure reduction routines, not clinical medical diagnosis. For acute respiratory distress, wheezing, or personal medication adjustments, consult a registered physician immediately.
          </p>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-[3rem] p-4 sm:p-8 border border-forest/15 shadow-forest flex flex-col h-[520px]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-forest text-cream flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4 text-sage" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] rounded-[1.8rem] p-4 sm:p-5 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-forest text-cream rounded-tr-sm'
                    : 'bg-cream/60 border border-forest/15 text-forest rounded-tl-sm'
                }`}>
                  <div className="whitespace-pre-line prose prose-sm max-w-none text-inherit">
                    {msg.content}
                  </div>

                  <div className={`flex items-center justify-between text-[10px] mt-2 pt-1 border-t ${
                    isUser ? 'border-cream/20 text-cream/60' : 'border-forest/10 text-forest/60'
                  }`}>
                    <span>{msg.timestamp}</span>
                    {msg.isFallback && <span>Calibrated Local Response</span>}
                  </div>

                  {/* Suggested Action Chips */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-forest/10 flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(action)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/80 hover:bg-white text-forest border border-forest/20 shadow-xs transition-all text-left"
                        >
                          → {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-olive text-forest flex items-center justify-center shrink-0 mt-1 shadow-sm font-bold text-xs">
                    <User className="w-4 h-4 text-forest" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center text-forest/60 text-xs py-2 pl-3">
              <div className="w-8 h-8 rounded-full bg-forest text-cream flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-sage" />
              </div>
              <div className="bg-cream/60 border border-forest/15 p-3 rounded-2xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-forest animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-forest animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-forest animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-[11px] font-semibold">Consulting environmental model...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="pt-3 pb-2 overflow-x-auto flex gap-1.5 scrollbar-none border-t border-forest/10 -mx-1 px-1">
          {QUICK_PROMPT_CHIPS.slice(0, 4).map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-olive/40 hover:bg-olive text-forest whitespace-nowrap shrink-0 transition-colors border border-forest/10"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="pt-2 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about children, outdoor safety, windows, budget tips..."
            className="flex-1 bg-cream/50 border border-forest/20 rounded-full px-5 py-3 text-sm text-forest placeholder:text-forest/40 focus:outline-none focus:ring-2 focus:ring-forest focus:bg-white transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 rounded-full bg-forest text-cream hover:bg-forest/90 transition-all active:scale-95 disabled:opacity-40 shadow-sm"
            title="Send Message"
          >
            <Send className="w-4 h-4 text-sage" />
          </button>
        </form>
      </div>
    </section>
  );
};
