import React from 'react';
import { Heart, Shield, LogOut, ArrowLeft, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface NavigationProps {
  currentUser: User | null;
  onLogout: () => void;
  showBack: boolean;
  onBack: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentUser, onLogout, showBack, onBack }) => {
  return (
    <nav className="w-full py-4 px-6 md:px-12 flex justify-between items-center bg-stone-50/80 backdrop-blur-sm sticky top-0 z-50 border-b border-stone-100 h-20">
      <div className="flex items-center gap-4">
        {showBack && (
          <button 
            onClick={onBack}
            className="p-2 rounded-full hover:bg-stone-200 transition-colors text-stone-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        
        <div className="flex items-center gap-2 select-none">
          <Heart className="w-8 h-8 text-sage-500 fill-sage-100" />
          <h1 className="text-2xl font-light tracking-wide text-stone-700 hidden md:block">MannMitra</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {currentUser ? (
           <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-stone-700">{currentUser.username}</span>
                <span className="text-xs text-stone-400 capitalize">{currentUser.role === 'student' ? `Grade ${currentUser.grade}` : currentUser.role}</span>
             </div>
             <div className="w-8 h-8 bg-sage-200 rounded-full flex items-center justify-center text-sage-700">
                <UserIcon className="w-4 h-4" />
             </div>
             <button 
               onClick={onLogout}
               className="p-2 text-stone-400 hover:text-red-400 transition-colors"
               title="Sign Out"
             >
               <LogOut className="w-5 h-5" />
             </button>
           </div>
        ) : (
          <span className="text-sm text-stone-400 italic">Safe • Anonymous</span>
        )}
      </div>
    </nav>
  );
};

export default Navigation;