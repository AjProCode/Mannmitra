import React, { useEffect, useState } from 'react';
import { Users, MessageSquare, Shield, Trash2, Plus } from 'lucide-react';
import { Role, User } from '../types';
import { getStats, getTeamMembers, addTeamMember, deleteTeamMember } from '../services/mockBackend';

interface AdminDashboardProps {
  role: Role;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ role }) => {
  const [stats, setStats] = useState({ totalStudents: 0, activeTickets: 0, membersOnline: 0 });
  const [members, setMembers] = useState<User[]>([]);
  const [newMember, setNewMember] = useState({ name: '', email: '', password: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const refresh = async () => {
    setStats(await getStats());
    setMembers(await getTeamMembers());
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTeamMember(newMember.name, newMember.email, newMember.password);
      setShowAddForm(false);
      setNewMember({ name: '', email: '', password: '' });
      refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error adding member');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      await deleteTeamMember(id);
      refresh();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-light text-stone-800">Administrator Console</h2>
        <p className="text-stone-500 mt-2">Manage team members and view platform statistics.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { icon: Users, label: 'Registered Students', value: stats.totalStudents, color: 'bg-blue-50 text-blue-600' },
          { icon: MessageSquare, label: 'Active Conversations', value: stats.activeTickets, color: 'bg-sage-100 text-sage-700' },
          { icon: Shield, label: 'Volunteers Online', value: stats.membersOnline, color: 'bg-orange-50 text-orange-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-700">{stat.value}</div>
              <div className="text-sm text-stone-400">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Team Management */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex justify-between items-center">
          <h3 className="font-medium text-stone-700">Team Members</h3>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        </div>

        {showAddForm && (
          <div className="p-6 bg-stone-50 border-b border-stone-100">
            <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-xs font-medium text-stone-500">Name</label>
                <input 
                  type="text" 
                  value={newMember.name} 
                  onChange={e => setNewMember({...newMember, name: e.target.value})}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-200" required 
                />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500">Email</label>
                <input 
                  type="email" 
                  value={newMember.email} 
                  onChange={e => setNewMember({...newMember, email: e.target.value})}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-200" required 
                />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500">Password</label>
                <input 
                  type="password" 
                  value={newMember.password} 
                  onChange={e => setNewMember({...newMember, password: e.target.value})}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-200" required 
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-sage-500 text-white rounded-lg hover:bg-sage-600">
                Save
              </button>
            </form>
          </div>
        )}

        <div className="divide-y divide-stone-100">
          {members.length === 0 ? (
             <div className="p-8 text-center text-stone-400">No team members found. Add one above.</div>
          ) : (
            members.map((member) => (
              <div key={member.id} className="p-6 flex items-center justify-between hover:bg-stone-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center text-sage-600 font-bold">
                    {member.username.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-stone-700">{member.username}</p>
                    <p className="text-sm text-stone-400">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${member.status === 'Available' ? 'bg-green-500' : member.status === 'Busy' ? 'bg-orange-500' : 'bg-stone-300'}`}></div>
                      <span className="text-sm text-stone-500">{member.status || 'Offline'}</span>
                   </div>
                   <button 
                    onClick={() => handleDelete(member.id)}
                    className="p-2 text-stone-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="mt-4 text-center text-xs text-stone-400">
         * Admins have full control over team composition but cannot view the contents of private conversations.
      </div>
    </div>
  );
};

export default AdminDashboard;