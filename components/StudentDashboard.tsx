import React, { useEffect, useState } from 'react';
import { User, Ticket } from '../types';
import { createTicket, getTickets } from '../services/mockBackend';
import { MessageCircle, Zap, Plus, Clock } from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  onOpenTicket: (ticketId: string) => void;
  onOpenAI: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onOpenTicket, onOpenAI }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMsg, setNewMsg] = useState('');

  const loadTickets = async () => {
    const data = await getTickets('student', user.id);
    setTickets(data);
  };

  useEffect(() => {
    loadTickets();
  }, [user.id]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMsg.trim()) return;
    
    await createTicket(user, newSubject, newMsg);
    setShowNewTicket(false);
    setNewSubject('');
    setNewMsg('');
    loadTickets();
  };

  return (
    <div className="max-w-5xl mx-auto p-6 animate-fade-in">
      <header className="mb-8">
        <h2 className="text-3xl font-light text-stone-800">Hello, {user.username}</h2>
        <p className="text-stone-500 mt-2">How are you feeling today?</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Quick Actions */}
        <button 
          onClick={onOpenAI}
          className="group flex items-center p-6 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl shadow-sm hover:shadow-md transition-all text-left"
        >
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-4 group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-medium text-stone-700">Talk to AI Therapist</h3>
            <p className="text-sm text-stone-500">Available instantly 24/7</p>
          </div>
        </button>

        <button 
          onClick={() => setShowNewTicket(true)}
          className="group flex items-center p-6 bg-gradient-to-br from-sage-50 to-white border border-sage-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left"
        >
          <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center text-sage-600 mr-4 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-medium text-stone-700">Message the Team</h3>
            <p className="text-sm text-stone-500">Volunteers respond on their own time</p>
          </div>
        </button>
      </div>

      {showNewTicket && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-stone-100 mb-8 animate-fade-in">
          <h3 className="text-lg font-medium text-stone-700 mb-4">Start a new conversation</h3>
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <input 
              type="text" 
              placeholder="What's on your mind? (Subject)"
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:ring-2 focus:ring-sage-200 outline-none"
              required
            />
            <textarea 
              placeholder="Describe what you're going through..."
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:ring-2 focus:ring-sage-200 outline-none h-32"
              required
            />
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setShowNewTicket(false)} 
                className="px-4 py-2 text-stone-500 hover:text-stone-700"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-sage-500 text-white rounded-lg hover:bg-sage-600"
              >
                Send Request
              </button>
            </div>
          </form>
        </div>
      )}

      <h3 className="text-xl font-light text-stone-700 mb-4">Your Conversations</h3>
      <div className="grid gap-4">
        {tickets.length === 0 ? (
          <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-100 border-dashed text-stone-400">
            No conversations yet. Start one above.
          </div>
        ) : (
          tickets.map(ticket => (
            <div 
              key={ticket.id} 
              onClick={() => onOpenTicket(ticket.id)}
              className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex justify-between items-center"
            >
              <div>
                <h4 className="font-medium text-stone-700">{ticket.subject}</h4>
                <p className="text-sm text-stone-400 mt-1 line-clamp-1">
                  {ticket.messages[ticket.messages.length - 1].text}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                    {ticket.status}
                  </span>
                  <span className="text-xs text-stone-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex -space-x-2">
                 {/* Visual indicator of participants */}
                 <div className="w-8 h-8 rounded-full bg-sage-200 border-2 border-white flex items-center justify-center text-xs text-sage-700">You</div>
                 {ticket.assignedTo && <div className="w-8 h-8 rounded-full bg-blue-200 border-2 border-white flex items-center justify-center text-xs text-blue-700">M</div>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;