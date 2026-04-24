import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Clock, Flame, Info, CheckCircle2, ShoppingBag, Heart, ChevronRight, ShieldAlert, ExternalLink } from 'lucide-react';
import { Dish } from '../types';

interface DishDetailsModalProps {
  dish: Dish | null;
  onClose: () => void;
  onOrder: (dish: Dish) => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
}

export const DishDetailsModal: React.FC<DishDetailsModalProps> = ({
  dish,
  onClose,
  onOrder,
  onToggleFavorite,
  isFavorite
}) => {
  if (!dish) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
      />
      
      <motion.div
        layoutId={`dish-card-${dish.id}`}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh] no-scrollbar"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 left-6 z-10 px-4 py-2 bg-white/20 dark:bg-black/20 backdrop-blur-xl rounded-full text-white hover:bg-white/40 transition-all flex items-center gap-2 font-bold text-sm"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
          Back
        </button>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 bg-white/20 dark:bg-black/20 backdrop-blur-xl rounded-full text-white hover:bg-white/40 transition-all"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="relative h-72 sm:h-96">
          <img 
            src={dish.image} 
            alt={dish.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const category = dish.category.toLowerCase();
              let fallback = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800';
              
              if (category.includes('pizza')) fallback = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800';
              else if (category.includes('burger') || category.includes('fast food')) fallback = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800';
              else if (category.includes('dessert') || category.includes('sweet')) fallback = 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=800';
              else if (category.includes('indian')) fallback = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800';
              
              if (target.src !== fallback) target.src = fallback;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent" />
          
          <div className="absolute bottom-8 left-8 right-8">
             <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-primary-light text-white text-[10px] font-bold rounded-full uppercase tracking-wider">{dish.cuisine}</span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-wider border border-white/20">{dish.category}</span>
             </div>
             <h2 className="text-4xl font-display font-black text-slate-900 dark:text-white leading-tight">{dish.name}</h2>
          </div>
        </div>

        <div className="p-8 sm:p-10 space-y-10">
          <div className="flex flex-wrap items-center gap-8 border-b border-slate-100 dark:border-slate-800 pb-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rating</span>
              <div className="flex items-center gap-1.5 text-amber-500">
                <Star className="w-5 h-5 fill-amber-500" />
                <span className="text-xl font-bold">{dish.rating}</span>
                <span className="text-slate-400 text-sm font-medium">(250+ reviews)</span>
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price</span>
              <span className="text-3xl font-display font-black text-slate-900 dark:text-white">₹{dish.price}</span>
            </div>

            {dish.prepTime && (
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time</span>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Clock className="w-5 h-5" />
                  <span className="text-lg font-bold">{dish.prepTime}</span>
                </div>
              </div>
            )}

            {dish.calories && (
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Energy</span>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Flame className="w-5 h-5" />
                  <span className="text-lg font-bold">{dish.calories} kcal</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Info className="w-5 h-5 text-primary-light" />
                <h3 className="font-display font-bold text-xl">Description</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {dish.description} Our chefs use only the freshest, locally sourced ingredients to ensure every bite is a celebration of flavor and health.
              </p>

              <div className="pt-4 space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Flame className={`w-5 h-5 ${dish.spice === 'Spicy' ? 'text-red-500' : dish.spice === 'Medium' ? 'text-amber-500' : 'text-green-500'}`} />
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Spice Level</span>
                  </div>
                  <span className={`font-black uppercase text-xs px-3 py-1 rounded-full ${dish.spice === 'Spicy' ? 'bg-red-500/10 text-red-500' : dish.spice === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'}`}>
                    {dish.spice}
                  </span>
                </div>

                {dish.allergies && dish.allergies.length > 0 && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldAlert className="w-5 h-5 text-red-500" />
                      <span className="text-sm font-bold text-red-500 uppercase tracking-wider">Allergy Information</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {dish.allergies.map(a => (
                        <span key={a} className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter">
                          Contains {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {dish.ingredients && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <ShoppingBag className="w-5 h-5 text-accent" />
                  <h3 className="font-display font-bold text-xl">Key Ingredients</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {dish.ingredients.map(ing => (
                    <div key={ing} className="flex items-center gap-2 text-slate-500 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      {ing}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dish.platforms && dish.platforms.length > 0 && (
              <div className="col-span-1 md:col-span-2 space-y-4 pt-4">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <ExternalLink className="w-5 h-5 text-blue-500" />
                  <h3 className="font-display font-bold text-xl">Compare Prices</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {dish.platforms.map(platform => (
                    <a 
                      key={platform.name}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
                    >
                      <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {platform.name}
                      </span>
                      <span className="font-black text-slate-900 dark:text-white">
                        ₹{platform.price}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
            <button 
              onClick={() => onOrder(dish)}
              className="w-full sm:flex-1 bg-gradient-to-r from-primary-light to-primary-dark text-white font-bold py-5 rounded-[24px] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary-light/20"
            >
              <ShoppingBag className="w-5 h-5" />
              Add to Cart • ₹{dish.price}
            </button>
            <button 
              onClick={() => onToggleFavorite(dish.id)}
              className={`w-full sm:w-auto px-8 py-5 rounded-[24px] font-bold border-2 transition-all flex items-center justify-center gap-2 ${isFavorite ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-red-500/30'}`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'Favorited' : 'Save'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
