import React from 'react';
import { motion } from 'motion/react';
import { Star, Hash, TrendingUp, DollarSign, Heart, ShoppingBag } from 'lucide-react';
import { Dish } from '../types';

interface FoodCardProps {
  dish: Dish;
  recommendationReason?: string;
  badge?: string;
  isFavorite?: boolean;
  onOrder: (dish: Dish) => void;
  onToggleFavorite: (id: string) => void;
  onExplore: (dish: Dish) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ 
  dish, 
  recommendationReason, 
  badge, 
  isFavorite, 
  onOrder,
  onToggleFavorite,
  onExplore
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onClick={() => onExplore(dish)}
      className="group relative flex flex-col gap-3 p-4 rounded-3xl glass dark:glass-dark overflow-hidden cursor-pointer"
    >
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm">
        <img 
          src={dish.image} 
          alt={dish.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        {badge && (
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
            {badge === 'For You' && <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />}
            {badge === 'Matches Spice Preference' && <Hash className="w-3.5 h-3.5 text-primary-light" />}
            {badge === 'Popular in Cuisine' && <TrendingUp className="w-3.5 h-3.5 text-blue-500" />}
            {badge === 'Budget Friendly' && <DollarSign className="w-3.5 h-3.5 text-green-500" />}
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {badge}
            </span>
          </div>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(dish.id);
          }}
          className={`absolute top-3 right-3 p-2 backdrop-blur-md rounded-xl transition-all ${isFavorite ? 'bg-red-500/80 text-white' : 'bg-white/20 hover:bg-white/40 dark:bg-black/20 dark:hover:bg-black/40 text-white'}`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>


      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-lg line-clamp-1">{dish.name}</h3>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-4 h-4 fill-amber-500" />
            <span className="text-sm font-bold">{dish.rating}</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{dish.cuisine} • {dish.category}</p>
        
        {recommendationReason && (
          <div className="mt-1 bg-primary-light/10 dark:bg-primary-light/20 p-2 rounded-lg">
            <p className="text-[10px] text-primary-dark dark:text-primary-light leading-snug font-medium italic">
              "{recommendationReason}"
            </p>
          </div>
        )}

        <div className="mt-2 flex items-center justify-between">
          <span className="text-xl font-display font-bold text-slate-800 dark:text-slate-100">₹{dish.price}</span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onOrder(dish);
            }}
            className="bg-primary-light hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
};
