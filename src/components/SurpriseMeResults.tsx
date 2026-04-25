import React from 'react';
import { motion } from 'motion/react';
import { Dish } from '../types';
import { X, Sparkles } from 'lucide-react';
import { FoodCard } from './FoodCard';

interface SurpriseMeResultsProps {
  picks: { dishId: string; reason: string }[];
  dishes: Dish[];
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  favorites: string[];
  onExplore: (dish: Dish) => void;
}

export const SurpriseMeResults: React.FC<SurpriseMeResultsProps> = ({ 
  picks, 
  dishes, 
  onClose, 
  onToggleFavorite,
  favorites,
  onExplore
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-5xl glass dark:glass-dark rounded-[40px] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <button 
          onClick={onClose}
          className="sticky float-right p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:rotate-90 transition-all z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-full mb-4">
            <Sparkles className="w-10 h-10 text-amber-500 animate-pulse" />
          </div>
          <h2 className="text-4xl font-display font-black">Your Surprise Menu</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-lg">
            We've hand-picked these exclusive dishes specifically for your taste profile. Explore something new today!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {picks.map((pick, idx) => {
            const dish = dishes.find(d => d.id === pick.dishId);
            if (!dish) return null;
            return (
              <motion.div 
                key={pick.dishId}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col gap-4"
              >
                <div className="bg-primary-light/10 dark:bg-primary-light/20 p-4 rounded-2xl border border-primary-light/20 relative">
                  <div className="absolute -top-3 -left-2 bg-primary-light text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">OUR RECOMMENDATION</div>
                  <p className="text-sm font-medium text-primary-dark dark:text-primary-light italic leading-relaxed">
                    "{pick.reason}"
                  </p>
                </div>
                <FoodCard 
                  dish={dish} 
                  onToggleFavorite={onToggleFavorite}
                  onExplore={onExplore}
                  isFavorite={favorites.includes(dish.id)}
                />
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};
