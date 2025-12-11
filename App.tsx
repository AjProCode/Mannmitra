import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Auth from './components/Auth';
import StudentDashboard from './components/StudentDashboard';
import TeamDashboard from './components/TeamDashboard';
import AdminDashboard from './components/AdminDashboard';
import TicketChat from './components/TicketChat';
import AIChat from './components/AIChat';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  // View State: 'auth' | 'dashboard' | 'ticket' | 'ai'
  const [view, setView] = useState('auth');
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setView('auth');
    setActiveTicketId(null);
  };

  const handleOpenTicket = (ticketId: string) => {
    setActiveTicketId(ticketId);
    setView('ticket');
  };

  const handleOpenAI = () => {
    setView('ai');
  };

  const handleBack = () => {
    if (view === 'ticket' || view === 'ai') {
      setView('dashboard');
      setActiveTicketId(null);
    }
  };

  const renderContent = () => {
    if (!user) return <Auth onLogin={handleLogin} />;

    switch (view) {
      case 'dashboard':
        if (user.role === 'student') return <StudentDashboard user={user} onOpenTicket={handleOpenTicket} onOpenAI={handleOpenAI} />;
        if (user.role === 'member') return <TeamDashboard user={user} onOpenTicket={handleOpenTicket} />;
        if (user.role === 'admin') return <AdminDashboard role="admin" />;
        return null;
      case 'ticket':
        return activeTicketId ? <TicketChat user={user} ticketId={activeTicketId} /> : null;
      case 'ai':
        return <AIChat onClose={handleBack} user={user} />;
      default:
        return <div>Unknown View</div>;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 relative overflow-hidden">
        {/* Background blobs for calm vibe */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-sage-200/30 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <Navigation 
        currentUser={user}
        onLogout={handleLogout}
        showBack={view === 'ticket' || view === 'ai'}
        onBack={handleBack}
      />
      
      <main className="container mx-auto pb-12 relative z-10">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;