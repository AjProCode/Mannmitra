import React, { useState, useEffect, useRef } from 'react';
import { User, Ticket } from '../types';
import { getTickets, sendMessage } from '../services/mockBackend';
import { Send, User as UserIcon } from 'lucide-react';

interface TicketChatProps {
  user: User;
  ticketId: string;
}

const TicketChat: React.FC<TicketChatProps> = ({ user, ticketId }) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadTicket = async () => {
    // In a real app we'd get just one, here we filter
    const all = await getTickets(user.role, user.id);
    const found = all.find((t: Ticket) => t.id === ticketId);
    if (found) setTicket(found);
  };

  useEffect(() => {
    loadTicket();
    // Simple polling for "real-time" feel in demo
    const interval = setInterval(loadTicket, 3000);
    return () => clearInterval(interval);
  }, [ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    await sendMessage(ticketId, user.id, user.username, inputText);
    setInputText('');
    loadTicket();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!ticket) return <div className="p-8 text-center">Loading chat...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in border border-stone-100 my-4">
      {/* Header */}
      <div className="bg-stone-50 p-4 border-b border-stone-100">
        <h3 className="font-medium text-stone-700">{ticket.subject}</h3>
        <p className="text-xs text-stone-500">
          Started by {ticket.studentName} (Grade {ticket.studentGrade}) • {new Date(ticket.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50/30">
        {ticket.messages.map((msg) => {
          const isMe = msg.senderId === user.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                 <span className="text-[10px] text-stone-400 mb-1 px-1">
                    {isMe ? 'You' : msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                 </span>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-sage-500 text-white rounded-br-none'
                      : 'bg-white text-stone-700 border border-stone-100 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
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
            placeholder="Type your reply..."
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
      </div>
    </div>
  );
};

export default TicketChat;