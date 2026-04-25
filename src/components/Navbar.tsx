import React from 'react';
import { User as UserType } from '../types';
import { Search, Heart, User, Sun, Moon, LayoutGrid, Mic, MicOff, LogOut, ArrowLeft, Sparkles, Store } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onVoiceSearch: () => void;
  isListening?: boolean;
  currentUser: UserType | null;
  onLogout: () => void;
  onOpenOnboarding: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  setActiveSection,
  isDark,
  setIsDark,
  searchQuery,
  setSearchQuery,
  onVoiceSearch,
  isListening,
  currentUser,
  onLogout,
  onOpenOnboarding,
}) => {
  return (
    <nav className="sticky top-0 z-50 w-full px-4 py-3">
      <div className="max-w-7xl mx-auto glass dark:glass-dark rounded-2xl flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          {activeSection !== 'home' && (
            <button
              onClick={() => setActiveSection('home')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setActiveSection('home')}
          >
            <div className="bg-gradient-to-br from-primary-light to-primary-dark w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
              <LayoutGrid className="text-white w-6 h-6" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight hidden sm:block">Foodie</span>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative group flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-light transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for your favorite dishes..."
              className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl py-2 pl-10 pr-12 focus:ring-2 focus:ring-primary-light/50 outline-none transition-all"
            />
            <button
              onClick={onVoiceSearch}
              className={`absolute right-2 p-1.5 rounded-lg transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400'}`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">

          {currentUser && (
            <>

              <button
                onClick={onOpenOnboarding}
                className="p-2 rounded-xl transition-all hover:bg-amber-100 dark:hover:bg-amber-900/20 text-amber-500"
                title="Quick Taste Setup"
              >
                <Sparkles className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveSection('favorites')}
                className={`p-2 rounded-xl transition-all ${activeSection === 'favorites' ? 'bg-primary-light text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                title="Favorites"
              >
                <Heart className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveSection('partner')}
                className={`p-2 rounded-xl transition-all ${activeSection === 'partner' ? 'bg-primary-light text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
                title="Partner Hub"
              >
                <Store className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            onClick={() => setActiveSection(currentUser ? 'profile' : 'auth')}
            className={`flex items-center justify-center transition-all ${
              ['profile', 'auth'].includes(activeSection) 
                ? 'bg-primary-light text-white shadow-md ring-2 ring-primary-light/20' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            } rounded-xl overflow-hidden`}
          >
            {currentUser ? (
              <div className={`w-9 h-9 flex items-center justify-center font-black text-xs ${
                activeSection === 'profile' ? 'text-white' : 'bg-primary-light/10 text-primary-light'
              }`}>
                {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
            ) : (
              <div className="p-2">
                <User className="w-5 h-5" />
              </div>
            )}
          </button>
          {currentUser && (
            <button
              onClick={onLogout}
              className="p-2 rounded-xl hover:bg-red-500/10 text-red-500 transition-all font-bold"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-primary-light"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </nav>
  );
};

