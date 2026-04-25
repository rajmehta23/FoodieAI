import React from 'react';
import { motion } from 'motion/react';
import { Star, Heart, ShoppingBag, Flame } from 'lucide-react';
import { Dish, DietaryPreference, SpiceLevel } from '../types';

interface FoodCardProps {
  dish: Dish;
  recommendationReason?: string;
  badge?: string;
  isFavorite?: boolean;
  onToggleFavorite: (id: string) => void;
  onExplore: (dish: Dish) => void;
}

const DIETARY_CONFIG: Record<DietaryPreference, { label: string; color: string; dot: string }> = {
  [DietaryPreference.VEG]:     { label: 'Veg',     color: 'border-green-500',  dot: 'bg-green-500' },
  [DietaryPreference.NON_VEG]: { label: 'Non-Veg', color: 'border-red-500',    dot: 'bg-red-500' },
  [DietaryPreference.VEGAN]:   { label: 'Vegan',   color: 'border-emerald-500', dot: 'bg-emerald-500' },
  [DietaryPreference.JAIN]:    { label: 'Jain',    color: 'border-amber-500',  dot: 'bg-amber-500' },
};

const SPICE_DOTS: Record<SpiceLevel, number> = {
  [SpiceLevel.MILD]:   1,
  [SpiceLevel.MEDIUM]: 2,
  [SpiceLevel.SPICY]:  3,
};

const BADGE_CONFIG: Record<string, { icon: React.ReactNode; bg: string }> = {
  'For You':                  { icon: <Heart className="w-3 h-3 text-red-500 fill-red-500" />,     bg: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  'Matches Spice Preference': { icon: <Flame className="w-3 h-3 text-primary-light" />,            bg: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
  'Popular in Cuisine':       { icon: <Star className="w-3 h-3 text-blue-500 fill-blue-500" />,    bg: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  'Budget Friendly':          { icon: <span className="text-[10px] font-black text-green-600">₹</span>, bg: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
};

export const FoodCard: React.FC<FoodCardProps> = ({
  dish,
  recommendationReason,
  badge,
  isFavorite,
  onToggleFavorite,
  onExplore,
}) => {
  const dietary = DIETARY_CONFIG[dish.dietary];
  const spiceDots = SPICE_DOTS[dish.spice];
  const badgeCfg = badge ? BADGE_CONFIG[badge] : null;

  const getFallbackImage = () => {
    const category = dish.category.toLowerCase();
    if (category.includes('pizza')) return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800';
    if (category.includes('burger') || category.includes('fast food')) return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800';
    if (category.includes('dessert') || category.includes('sweet')) return 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=800';
    if (category.includes('indian')) return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800';
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      onClick={() => onExplore(dish)}
      className="group relative flex flex-col gap-3 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-black/40 overflow-hidden cursor-pointer transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
        <img
          src={dish.image}
          alt={dish.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            const fallback = getFallbackImage();
            if (target.src !== fallback) {
              target.src = fallback;
            }
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* AI Badge */}
        {badge && badgeCfg && (
          <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow ${badgeCfg.bg}`}>
            {badgeCfg.icon}
            {badge}
          </div>
        )}

        {/* Favourite button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(dish.id); }}
          className={`absolute top-3 right-3 p-2 backdrop-blur-md rounded-xl transition-all shadow-md ${
            isFavorite
              ? 'bg-red-500/90 text-white scale-110'
              : 'bg-white/30 hover:bg-white/60 dark:bg-black/30 dark:hover:bg-black/50 text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5">
        {/* Name + Rating */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display font-semibold text-base leading-tight line-clamp-1 flex-1">{dish.name}</h3>
          <div className="flex items-center gap-1 text-amber-500 shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-500" />
            <span className="text-xs font-bold">{dish.rating}</span>
          </div>
        </div>

        {/* Dietary + Spice row */}
        <div className="flex items-center justify-between">
          {/* Veg/Non-Veg indicator (FSSAI style) */}
          <div className={`flex items-center gap-1.5 border-2 ${dietary.color} rounded px-2 py-0.5`}>
            <div className={`w-2 h-2 rounded-full ${dietary.dot}`} />
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{dietary.label}</span>
          </div>

          {/* Spice level dots */}
          <div className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-slate-300" />
            <div className="flex gap-0.5">
              {[1, 2, 3].map((dot) => (
                <div
                  key={dot}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    dot <= spiceDots ? 'bg-primary-light' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400">{dish.cuisine} · {dish.category}</p>

        {/* Recommendation reason */}
        {recommendationReason && (
          <div className="mt-0.5 bg-primary-light/8 dark:bg-primary-light/15 px-3 py-2 rounded-xl border border-primary-light/10">
            <p className="text-[10px] text-primary-dark dark:text-primary-light leading-snug font-medium italic">
              "{recommendationReason}"
            </p>
          </div>
        )}

        <div className="mt-1 flex items-center justify-between">
          <span className="text-lg font-display font-black text-slate-800 dark:text-slate-100">₹{dish.price}</span>
        </div>
      </div>
    </motion.div>
  );
};
