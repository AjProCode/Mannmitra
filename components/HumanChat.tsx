import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Smile } from 'lucide-react';
import { Message } from '../types';

interface HumanChatProps {
  onClose: () => void;
}

const HumanChat: React.FC<HumanChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'agent',
      text: "Hi there. I'm a volunteer from MannMitra. I'm here to listen without judgement. What's on your mind today?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate human delay and response
    setTimeout(() => {
      const responses = [
        "I hear you. That sounds really heavy to carry alone.",
        "Take your time. I'm just here to listen.",
        "It's completely okay to feel that way given the situation.",
        "How long have you been feeling this pressure?",
        "Sometimes just saying it out loud can help a little. Tell me more if you're comfortable.",
        "You are not alone in this.",
        "I appreciate you sharing that with me."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: randomResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false);
    }, 3000 + Math.random() * 2000); // Random delay between 3-5s
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in border border-stone-100">
      {/* Header */}
      <div className="bg-stone-50 p-4 border-b border-stone-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sage-200 rounded-full flex items-center justify-center text-sage-700">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium text-stone-700">MannMitra Volunteer</h3>
            <p className="text-xs text-stone-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Online
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-sm">
          Leave Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-sage-500 text-white rounded-br-none'
                  : 'bg-white text-stone-700 border border-stone-100 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-stone-100 shadow-sm flex gap-1">
              <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-stone-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 bg-stone-50 border-0 rounded-xl focus:ring-2 focus:ring-sage-200 focus:bg-white transition-all text-stone-700 placeholder:text-stone-400"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-3 bg-stone-800 text-white rounded-xl hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center mt-2">
             <span className="text-[10px] text-stone-400 uppercase tracking-widest">Anonymous & Encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default HumanChat;