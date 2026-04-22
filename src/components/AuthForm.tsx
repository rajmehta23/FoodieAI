import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Loader2, LogIn, UserPlus } from 'lucide-react';
import { storageService } from '../services/storageService';
import { User as UserType } from '../types';

interface AuthFormProps {
  onAuthSuccess: (user: UserType) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Simulated password
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Directly process without artificial delay
    // await new Promise(resolve => setTimeout(resolve, 800));

    if (isLogin) {
      const user = storageService.login(email);
      if (user) {
        onAuthSuccess(user);
      } else {
        setError('User not found. Try signing up!');
      }
    } else {
      if (!name || !email) {
        setError('Please fill in all fields');
      } else {
        const user = storageService.signup(name, email);
        onAuthSuccess(user);
      }
    }
    setIsLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto p-8 rounded-[40px] glass dark:glass-dark shadow-2xl"
    >
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="bg-primary-light/20 p-4 rounded-2xl mb-4">
          {isLogin ? <LogIn className="w-8 h-8 text-primary-light" /> : <UserPlus className="w-8 h-8 text-primary-light" />}
        </div>
        <h2 className="text-3xl font-display font-bold">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-slate-500 mt-2">
          {isLogin ? 'Login to access your personalized menu' : 'Join Foodie for a smarter food experience'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence mode="wait">
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative"
            >
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-light/50 transition-all font-medium"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="email" 
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-light/50 transition-all font-medium"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="password" 
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-light/50 transition-all font-medium"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm font-bold text-center px-2">{error}</p>
        )}

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary-light to-primary-dark hover:shadow-xl hover:shadow-primary-light/20 text-white font-bold py-4 rounded-3xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              {isLogin ? 'Login' : 'Sign Up'}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-slate-500 text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary-light font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </motion.div>
  );
};
