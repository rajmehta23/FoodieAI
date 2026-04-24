import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storageService';
import { User as UserType } from '../types';

interface AuthFormProps {
  onAuthSuccess: (user: UserType) => void;
}

// Google "G" logo as inline SVG
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const firebaseErrorMessage = (code: string): string => {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential': return 'Invalid email or password. Please try again.';
      case 'auth/email-already-in-use': return 'An account with this email already exists. Try logging in!';
      case 'auth/weak-password': return 'Password is too weak. Use at least 6 characters.';
      case 'auth/invalid-email': return 'Please enter a valid email address.';
      case 'auth/popup-blocked': return 'Popup was blocked by your browser. Please allow popups for this site and try again.';
      case 'auth/popup-closed-by-user': return 'Sign-in was cancelled. Please try again.';
      case 'auth/operation-not-allowed': return 'Google Sign-In is not enabled in Firebase Console yet. Go to Authentication → Sign-in method → Google → Enable.';
      case 'auth/configuration-not-found': return 'Firebase Authentication not set up yet. Go to Firebase Console → Authentication → Get Started, then enable Email/Password and Google providers.';
      case 'auth/network-request-failed': return 'Network error. Check your internet connection and try again.';
      default: return `Sign-in failed (${code}). Please try again.`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!isLogin && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setIsLoading(true);

    if (isLogin) {
      const result = await storageService.login(email, password);
      if ('user' in result) {
        onAuthSuccess(result.user);
      } else {
        setError(firebaseErrorMessage(result.error));
      }
    } else {
      const result = await storageService.signup(name.trim(), email, password);
      if ('user' in result) {
        onAuthSuccess(result.user);
      } else {
        setError(firebaseErrorMessage(result.error));
      }
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);
    const result = await storageService.loginWithGoogle();
    if ('user' in result) {
      onAuthSuccess(result.user);
    } else {
      setError(firebaseErrorMessage(result.error));
    }
    setIsGoogleLoading(false);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto p-8 rounded-[40px] glass dark:glass-dark shadow-2xl border border-slate-200/30 dark:border-white/10"
    >
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="bg-gradient-to-br from-primary-light/20 to-accent/20 p-4 rounded-2xl mb-4">
          {isLogin ? <LogIn className="w-8 h-8 text-primary-light" /> : <UserPlus className="w-8 h-8 text-primary-light" />}
        </div>
        <h2 className="text-3xl font-display font-bold">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-slate-500 mt-2 text-sm">
          {isLogin ? 'Login to access your personalized menu' : 'Join Foodie for a smarter food experience'}
        </p>
      </div>

      {/* Google Sign-In */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isLoading}
        className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-200 font-semibold py-3.5 rounded-2xl transition-all shadow-sm mb-5 disabled:opacity-50"
      >
        {isGoogleLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">or</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence mode="wait">
          {!isLogin && (
            <motion.div
              key="name-field"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative overflow-hidden"
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
            required
            className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-light/50 transition-all font-medium"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl py-4 pl-12 pr-12 outline-none focus:ring-2 focus:ring-primary-light/50 transition-all font-medium"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {!isLogin && (
            <motion.div
              key="confirm-field"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative overflow-hidden"
            >
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-light/50 transition-all font-medium"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium px-4 py-3 rounded-2xl border border-red-200 dark:border-red-800"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={isLoading || isGoogleLoading}
          className="w-full bg-gradient-to-r from-primary-light to-primary-dark hover:shadow-xl hover:shadow-primary-light/20 text-white font-bold py-4 rounded-3xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> {isLogin ? 'Verifying...' : 'Creating account...'}</>
          ) : (
            <>{isLogin ? 'Login' : 'Sign Up'} <ArrowRight className="w-5 h-5" /></>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-slate-500 text-sm">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={switchMode}
            className="text-primary-light font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </motion.div>
  );
};
