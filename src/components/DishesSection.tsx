import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FoodCard } from './FoodCard';
import { Dish, DietaryPreference, Cuisine } from '../types';
import { ShoppingBag, Search, SlidersHorizontal, ChevronRight, X } from 'lucide-react';

interface DishesSectionProps {
  dishes: Dish[];
  favorites: string[];
  onOrder: (dish: Dish) => void;
  onToggleFavorite: (dishId: string) => void;
  onExplore: (dish: Dish) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const DishesSection: React.FC<DishesSectionProps> = ({
  dishes,
  favorites,
  onOrder,
  onToggleFavorite,
  onExplore,
  searchQuery,
  setSearchQuery
}) => {
  const [dietaryFilter, setDietaryFilter] = useState<DietaryPreference | 'All'>('All');
  const [cuisineFilter, setCuisineFilter] = useState<Cuisine | 'All'>('All');
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [showFilters, setShowFilters] = useState(false);

  const filteredDishes = useMemo(() => {
    let result = dishes.filter(dish => 
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (dietaryFilter !== 'All') {
      result = result.filter(d => d.dietary === dietaryFilter);
    }

    if (cuisineFilter !== 'All') {
      result = result.filter(d => d.cuisine === cuisineFilter);
    }

    if (priceSort === 'asc') {
      result = result.sort((a, b) => a.price - b.price);
    } else if (priceSort === 'desc') {
      result = result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [dishes, searchQuery, dietaryFilter, cuisineFilter, priceSort]);

  const categories = ['All', ...Object.values(Cuisine)];

  return (
    <section className="py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-display font-black tracking-tight">Our Curated Menu</h2>
          <p className="text-slate-500 font-medium">Explore over {dishes.length} hand-crafted dishes chosen for quality and taste.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all border-2 ${showFilters ? 'bg-slate-900 text-white border-slate-900' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/50 hover:border-primary-light/50'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            { (dietaryFilter !== 'All' || cuisineFilter !== 'All' || priceSort !== 'none') && (
               <span className="w-2 h-2 bg-primary-light rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Category Chips - Quick Access */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCuisineFilter(cat as any)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2 ${cuisineFilter === cat ? 'bg-primary-light border-primary-light text-white shadow-lg' : 'bg-white dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-primary-light/30'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass dark:glass-dark p-6 rounded-[32px] grid grid-cols-1 sm:grid-cols-3 gap-6 border border-slate-100 dark:border-slate-800">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Dietary Preference</label>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setDietaryFilter('All')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${dietaryFilter === 'All' ? 'bg-primary-light text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    All
                  </button>
                  {Object.values(DietaryPreference).map(v => (
                    <button 
                      key={v}
                      onClick={() => setDietaryFilter(v)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${dietaryFilter === v ? 'bg-primary-light text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Cuisine Type</label>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setCuisineFilter('All')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${cuisineFilter === 'All' ? 'bg-primary-light text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    All
                  </button>
                  {Object.values(Cuisine).map(v => (
                    <button 
                      key={v}
                      onClick={() => setCuisineFilter(v)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${cuisineFilter === v ? 'bg-primary-light text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Sort by Price</label>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setPriceSort('none')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${priceSort === 'none' ? 'bg-primary-light text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    None
                  </button>
                  <button 
                    onClick={() => setPriceSort('asc')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${priceSort === 'asc' ? 'bg-primary-light text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    Low to High
                  </button>
                  <button 
                    onClick={() => setPriceSort('desc')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${priceSort === 'desc' ? 'bg-primary-light text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    High to Low
                  </button>
                </div>
              </div>

              <div className="col-span-full pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button 
                    onClick={() => { setDietaryFilter('All'); setCuisineFilter('All'); setPriceSort('none'); }}
                    className="text-xs font-bold text-red-500 hover:underline"
                  >
                    Reset all filters
                  </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredDishes.length > 0 ? (
            filteredDishes.map((dish) => (
              <motion.div
                key={dish.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <FoodCard 
                  dish={dish} 
                  onOrder={onOrder} 
                  onToggleFavorite={onToggleFavorite}
                  onExplore={onExplore}
                  isFavorite={favorites.includes(dish.id)}
                />
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-32 text-center"
            >
                <div className="inline-flex items-center justify-center p-8 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
                  <Search className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-2xl font-display font-bold">No results found</h3>
                <p className="text-slate-500 mt-2 max-w-xs mx-auto">We couldn't find any dishes matching your current filters. Try adjusting them!</p>
                <button 
                  onClick={() => { setDietaryFilter('All'); setCuisineFilter('All'); setSearchQuery(''); }}
                  className="mt-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95"
                >
                  Clear all search & filters
                </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
