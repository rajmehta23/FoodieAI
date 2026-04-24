import React from 'react';
import { Order, Dish } from '../types';
import { CheckCircle2, RefreshCw, Clock, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

interface OrderHistoryProps {
  orders: Order[];
  dishes: Dish[];
  onReorder: (dish: Dish) => void;
  onExplore: (dish: Dish) => void;
}

function formatTimestamp(ts: number): string {
  const now = Date.now();
  const diffMs = now - ts;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const date = new Date(ts);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `Today at ${timeStr}`;
  if (diffDay === 1) return `Yesterday at ${timeStr}`;
  if (diffDay < 7) return `${diffDay} days ago at ${timeStr}`;
  return `${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at ${timeStr}`;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, dishes, onReorder, onExplore }) => {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-full mb-6">
          <ShoppingBag className="w-14 h-14 text-slate-300" />
        </div>
        <h3 className="text-2xl font-display font-bold">No orders yet</h3>
        <p className="text-slate-500 mt-2 max-w-xs">Your delicious order history will appear here. Start exploring the menu!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="grid gap-4">
        {orders.map((order, idx) => {
          const dish = dishes.find(d => d.id === order.dishId);
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-[28px] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-4">
                {/* Dish image + info */}
                <div
                  className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
                  onClick={() => dish && onExplore(dish)}
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-primary-light/10">
                    <img
                      src={dish?.image}
                      alt={order.dishName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const searchUrl = `https://loremflickr.com/800/600/${encodeURIComponent(order.dishName)},food/all`;
                        if (target.src !== searchUrl) {
                          target.src = searchUrl;
                        } else {
                          target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800';
                        }
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-display font-bold text-base leading-tight line-clamp-1">{order.dishName}</h4>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="font-black text-slate-800 dark:text-slate-100 text-sm">₹{order.price}</span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(order.timestamp)}
                      </div>
                    </div>
                    {/* Delivered badge */}
                    <div className="flex items-center gap-1 mt-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 fill-green-100" />
                      <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">Delivered</span>
                    </div>
                  </div>
                </div>

                {/* Reorder button */}
                <button
                  onClick={() => dish && onReorder(dish)}
                  className="shrink-0 flex items-center gap-2 bg-primary-light/10 hover:bg-primary-light hover:text-white text-primary-light px-5 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reorder
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
