import React, { useState } from 'react';
import { User, Shield, GraduationCap } from 'lucide-react';
import { login, signupStudent } from '../services/mockBackend';
import { User as UserType } from '../types';

interface AuthProps {
  onLogin: (user: UserType) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState('10');
  const [username, setUsername] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let user;
      if (mode === 'login') {
        user = await login(identifier, password);
      } else {
        user = await signupStudent(username, grade, password);
      }
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-stone-100">
          <button 
            className={`flex-1 py-4 text-sm font-medium transition-colors ${mode === 'login' ? 'bg-sage-50 text-sage-700 border-b-2 border-sage-500' : 'text-stone-400 hover:text-stone-600'}`}
            onClick={() => setMode('login')}
          >
            Log In
          </button>
          <button 
            className={`flex-1 py-4 text-sm font-medium transition-colors ${mode === 'signup' ? 'bg-sage-50 text-sage-700 border-b-2 border-sage-500' : 'text-stone-400 hover:text-stone-600'}`}
            onClick={() => setMode('signup')}
          >
            Student Sign Up
          </button>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-light text-stone-700 mb-6 text-center">
            {mode === 'login' ? 'Welcome Back' : 'Create Anonymous ID'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'login' ? (
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Username or Email</label>
                <input 
                  type="text" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:ring-2 focus:ring-sage-200 outline-none transition-all"
                  required
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Anonymous Username</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. BlueSkyWalker"
                    className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:ring-2 focus:ring-sage-200 outline-none transition-all"
                    required
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Don't use your real name.</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Grade</label>
                  <select 
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:ring-2 focus:ring-sage-200 outline-none transition-all"
                  >
                    {[5,6,7,8,9,10,11,12].map(g => (
                      <option key={g} value={g}>Class {g}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:ring-2 focus:ring-sage-200 outline-none transition-all"
                required
              />
            </div>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-sage-500 text-white rounded-xl hover:bg-sage-600 transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? 'Processing...' : (mode === 'login' ? 'Enter' : 'Start Journey')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;