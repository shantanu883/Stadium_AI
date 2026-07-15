import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatWithGemini } from '../api';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  User, 
  Clock,
  ArrowRight,
  Globe
} from 'lucide-react';
import { GlassCard } from './GlassCard';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface ChatBotProps {
  embeddedMode?: boolean; // if true, fits nice inside small panels; if false, acts as full page
}

export const ChatBot: React.FC<ChatBotProps> = ({ embeddedMode = false }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${user?.name || 'Spectator'}! ⚽ I am StadiumAI, your FIFA World Cup 2026 operations assistant. How can I help you navigate MetLife Stadium today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Speech Recognition Setup (STT)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by your browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Text to Speech (TTS)
  const speakText = (text: string) => {
    if (isMuted) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Clean text of markdown characters before speaking
    const cleanText = text.replace(/[*#_`\-\[\]()]/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    
    // Attempt to pick a premium English voice if available
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural'));
    if (premiumVoice) utterance.voice = premiumVoice;

    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textToSend: string) => {
    const promptText = textToSend.trim();
    if (!promptText) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Call Express Gemini API client
      const responseText = await chatWithGemini(promptText, user?.role || 'fan');
      
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setIsTyping(false);
      setMessages(prev => [...prev, aiMsg]);
      speakText(responseText);
    } catch (error) {
      console.error(error);
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    { label: 'Seat Locator', text: 'Where is my seat?' },
    { label: 'Restrooms', text: 'Find nearest washroom' },
    { label: 'Gate B Route', text: 'Fastest route to Gate B' },
    { label: 'Food Stalls', text: 'Where can I buy food?' },
    { label: 'Translate Help', text: 'Translate this message: I need help' },
  ];

  return (
    <GlassCard hoverEffect={false} className={`flex flex-col h-full ${embeddedMode ? 'max-h-[500px]' : ''}`}>
      {/* Header controls */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-800/60 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-fifa-accent animate-pulse" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">operations AI assistant</h3>
            <p className="text-[10px] text-gray-400">Gemini 1.5 Flash Connected</p>
          </div>
        </div>
        <button
          onClick={() => {
            const nextMute = !isMuted;
            setIsMuted(nextMute);
            if (nextMute) window.speechSynthesis.cancel();
          }}
          className={`p-2 rounded-lg border transition-all ${
            isMuted 
              ? 'border-fifa-neonRed/20 bg-fifa-neonRed/10 text-fifa-neonRed hover:bg-fifa-neonRed/20' 
              : 'border-gray-800 bg-gray-900/40 text-gray-400 hover:text-white'
          }`}
          title={isMuted ? 'Unmute Text-to-Speech' : 'Mute Text-to-Speech'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 min-h-[220px] max-h-[480px]">
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Profile icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${
                isAI 
                  ? 'bg-fifa-accent/10 border-fifa-accent/30 text-fifa-accent' 
                  : 'bg-fifa-neonPurple/10 border-fifa-neonPurple/30 text-fifa-neonPurple'
              }`}>
                {isAI ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Text box */}
              <div>
                <div className={`p-3 rounded-2xl text-sm ${
                  isAI 
                    ? 'bg-gray-800/60 text-gray-100 border border-gray-700/30' 
                    : 'bg-gradient-to-r from-fifa-accent/20 to-fifa-neonPurple/20 text-white border border-fifa-accent/30'
                }`}>
                  <p className="leading-relaxed whitespace-pre-line font-medium">{msg.text}</p>
                </div>
                <div className={`flex items-center gap-1 text-[9px] text-gray-500 mt-1 ${isAI ? 'justify-start' : 'justify-end'}`}>
                  <Clock className="w-2.5 h-2.5" />
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* AI Typing loader */}
        {isTyping && (
          <div className="flex gap-3 max-w-[80%] mr-auto">
            <div className="w-8 h-8 rounded-full bg-fifa-accent/10 border border-fifa-accent/30 text-fifa-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-gray-800/60 p-3.5 rounded-2xl border border-gray-700/30 flex items-center">
              <div className="typing-dots flex gap-1">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick query buttons */}
      {messages.length === 1 && !isTyping && (
        <div className="mb-4">
          <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" /> Quick Operations Queries
          </p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q.text)}
                className="text-xs bg-gray-800/50 hover:bg-fifa-accent/10 border border-gray-700/60 hover:border-fifa-accent/40 text-gray-300 hover:text-fifa-accent px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
              >
                <span>{q.label}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input panel */}
      <div className="flex gap-2 items-center">
        <button
          onClick={handleVoiceInput}
          className={`p-3.5 rounded-xl border transition-all ${
            isListening 
              ? 'border-fifa-neonRed bg-fifa-neonRed/15 text-fifa-neonRed animate-pulse shadow-neon-red' 
              : 'border-gray-800 bg-gray-900/30 text-gray-400 hover:text-white hover:border-gray-700'
          }`}
          title={isListening ? 'Stop listening' : 'Start voice request'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          placeholder={isListening ? "Listening... Speak now." : "Ask StadiumAI... (e.g. 'Where is Block F12?')"}
          className="flex-1 bg-gray-900/30 border border-gray-800 focus:border-fifa-accent focus:outline-none text-sm text-white px-4 py-3 rounded-xl transition-all"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim()}
          className="p-3.5 rounded-xl bg-gradient-fifa hover:opacity-90 text-fifa-dark font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </GlassCard>
  );
};
