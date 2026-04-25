import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Zap, Wand2, Truck, Star } from 'lucide-react';

interface HeroProps {
  onSurpriseMe: () => void;
  isLoading: boolean;
}

export const Hero: React.FC<HeroProps> = ({ onSurpriseMe, isLoading }) => {

  return (
    <div className="relative w-full py-12 md:py-20 flex flex-col items-center text-center px-4 overflow-hidden">
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-0 -left-20 w-72 h-72 bg-primary-light/20 blur-[100px] rounded-full" />
      <div className="absolute bottom-0 -right-20 w-72 h-72 bg-accent/20 blur-[100px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10"
      >
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-display font-bold tracking-widest uppercase mb-6">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Smart Menu for Smart Tastes
        </span>
        <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight leading-[0.95] mb-6">
          Every Bite <br />
          <span className="bg-gradient-to-r from-primary-light via-accent to-primary-dark bg-clip-text text-transparent">
            Uniquely Yours
          </span>
        </h1>
        <p className="max-w-xl text-lg text-slate-500 dark:text-slate-400 mb-10 leading-relaxed">
          Foodie analyzes your cravings, past orders, and dietary needs to deliver
          perfect menu recommendations instantly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onSurpriseMe}
            disabled={isLoading}
            className="group relative bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-5 rounded-3xl font-display font-bold text-lg shadow-2xl hover:shadow-primary-light/20 transition-all active:scale-[0.98] overflow-hidden disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-light to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              {isLoading ? 'Finding your match...' : 'Surprise Me!'}
            </span>
          </button>
        </div>
      </motion.div>

      {/* Floating features */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="mt-16 hidden lg:flex gap-8 opacity-60"
      >
        <div className="flex items-center gap-2 px-6 py-3 rounded-2xl glass dark:glass-dark">
          <div className="bg-green-500/20 p-2 rounded-lg"><Zap className="w-4 h-4 text-green-500" /></div>
          <span className="font-bold text-sm">Personalized Menu</span>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 rounded-2xl glass dark:glass-dark">
          <div className="bg-primary-light/20 p-2 rounded-lg"><Truck className="w-4 h-4 text-primary-light" /></div>
          <span className="font-bold text-sm">Compare Platforms</span>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 rounded-2xl glass dark:glass-dark">
          <div className="bg-accent/20 p-2 rounded-lg"><Star className="w-4 h-4 text-accent" /></div>
          <span className="font-bold text-sm">AI Recommendations</span>
        </div>
      </motion.div>
    </div>
  );
};
