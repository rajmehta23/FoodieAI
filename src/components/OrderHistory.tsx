import React from 'react';
import { Order, Dish } from '../types';
import { Clock, RefreshCw, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface OrderHistoryProps {
  orders: Order[];
  dishes: Dish[];
  onReorder: (dish: Dish) => void;
  onExplore: (dish: Dish) => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, dishes, onReorder, onExplore }) => {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
          <Clock className="w-12 h-12 text-slate-300" />
        </div>
        <h3 className="text-xl font-display font-bold">No orders yet</h3>
        <p className="text-slate-500 mt-2">Your delicious history will appear here!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h2 className="text-3xl font-display font-bold mb-8">Recent Orders</h2>
      <div className="grid gap-4">
        {orders.map((order, idx) => {
          const dish = dishes.find(d => d.id === order.dishId);
          return (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => dish && onExplore(dish)}
              className="glass dark:glass-dark p-6 rounded-[32px] flex items-center justify-between group hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border-2 border-primary-light/20">
                  <img 
                    src={dish?.image} 
                    alt={order.dishName} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg">{order.dishName}</h4>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span className="font-bold text-slate-800 dark:text-slate-100">₹{order.price}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(order.timestamp).toLocaleDateString()} at {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  dish && onReorder(dish);
                }}
                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-primary-light hover:text-white px-6 py-3 rounded-2xl font-bold transition-all group-hover:scale-105"
              >
                <RefreshCw className="w-4 h-4" />
                Reorder
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
