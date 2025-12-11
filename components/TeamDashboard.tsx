import React, { useEffect, useState } from 'react';
import { User, Ticket, AvailabilityStatus } from '../types';
import { getTickets, updateAvailability, assignTicket } from '../services/mockBackend';
import { Circle, MessageSquare } from 'lucide-react';

interface TeamDashboardProps {
  user: User;
  onOpenTicket: (ticketId: string) => void;
}

const TeamDashboard: React.FC<TeamDashboardProps> = ({ user, onOpenTicket }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [status, setStatus] = useState<AvailabilityStatus>(user.status || 'Offline');

  const loadData = async () => {
    const data = await getTickets('member', user.id);
    setTickets(data);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  const handleStatusChange = async (newStatus: AvailabilityStatus) => {
    setStatus(newStatus);
    await updateAvailability(user.id, newStatus);
  };

  const handleClaim = async (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await assignTicket(ticketId, user.id);
    loadData();
  };

  const unassignedTickets = tickets.filter(t => !t.assignedTo);
  const myTickets = tickets.filter(t => t.assignedTo === user.id);

  return (
    <div className="max-w-5xl mx-auto p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-light text-stone-800">Volunteer Dashboard</h2>
          <p className="text-stone-500">Welcome, {user.username}</p>
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-stone-100">
          <span className="text-sm font-medium text-stone-600">My Status:</span>
          <select 
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as AvailabilityStatus)}
            className={`text-sm font-medium bg-transparent outline-none cursor-pointer ${
              status === 'Available' ? 'text-green-600' : status === 'Busy' ? 'text-orange-500' : 'text-stone-400'
            }`}
          >
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
            <option value="Offline">Offline</option>
          </select>
          <Circle className={`w-3 h-3 fill-current ${
             status === 'Available' ? 'text-green-500' : status === 'Busy' ? 'text-orange-500' : 'text-stone-300'
          }`} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Unassigned Pool */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden h-fit">
          <div className="p-4 border-b border-stone-100 bg-stone-50/50">
            <h3 className="font-medium text-stone-700 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              New Requests ({unassignedTickets.length})
            </h3>
          </div>
          <div className="divide-y divide-stone-100 max-h-[400px] overflow-y-auto">
            {unassignedTickets.length === 0 ? (
               <div className="p-8 text-center text-stone-400 text-sm">No new requests pending.</div>
            ) : (
              unassignedTickets.map(ticket => (
                <div key={ticket.id} className="p-4 hover:bg-stone-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-stone-700">{ticket.studentName} <span className="font-normal text-stone-400">(Grade {ticket.studentGrade})</span></span>
                    <span className="text-xs text-stone-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-medium text-sage-700 mb-1">{ticket.subject}</h4>
                  <p className="text-sm text-stone-500 line-clamp-2 mb-3">{ticket.messages[0].text}</p>
                  <button 
                    onClick={(e) => handleClaim(ticket.id, e)}
                    className="text-xs px-3 py-1.5 bg-sage-100 text-sage-700 rounded-lg hover:bg-sage-200 font-medium transition-colors"
                  >
                    Accept Request
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Active Chats */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden h-fit">
          <div className="p-4 border-b border-stone-100 bg-stone-50/50">
             <h3 className="font-medium text-stone-700">My Active Conversations</h3>
          </div>
          <div className="divide-y divide-stone-100 max-h-[400px] overflow-y-auto">
            {myTickets.length === 0 ? (
               <div className="p-8 text-center text-stone-400 text-sm">You haven't accepted any chats yet.</div>
            ) : (
              myTickets.map(ticket => (
                <div 
                  key={ticket.id} 
                  onClick={() => onOpenTicket(ticket.id)}
                  className="p-4 hover:bg-stone-50 transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-bold text-stone-700">{ticket.studentName}</span>
                    <span className="text-xs text-stone-400">{new Date(ticket.messages[ticket.messages.length -1].timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                  </div>
                  <h4 className="font-medium text-stone-800 mb-1">{ticket.subject}</h4>
                  <p className="text-sm text-stone-500 line-clamp-1 group-hover:text-sage-600 transition-colors">
                    {ticket.messages[ticket.messages.length - 1].senderId === user.id ? 'You: ' : ''}
                    {ticket.messages[ticket.messages.length - 1].text}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;