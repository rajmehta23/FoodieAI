import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag, Trash2, X, Plus, Minus,
  ArrowRight, MapPin, Truck, AlertCircle, Receipt
} from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (dishId: string, delta: number) => void;
  onRemoveItem: (dishId: string) => void;
  onCheckout: () => void;   // opens CheckoutModal
  isProcessing?: boolean;
}

export const Cart: React.FC<CartProps> = ({
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isProcessing = false,
}) => {
  const distance = 4.2;
  const isSurge = useMemo(() => Math.random() > 0.7, []);

  const subtotal   = useMemo(() => items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0), [items]);
  const deliveryFee = items.length > 0 ? Math.round((35 + distance * 5) * (isSurge ? 1.5 : 1)) : 0;
  const platformFee = items.length > 0 ? 9 : 0;
  const gst         = items.length > 0 ? Math.round(subtotal * 0.05) : 0;
  const restaurantCharges = items.length > 0 ? 15 : 0;
  const total = subtotal + deliveryFee + platformFee + gst + restaurantCharges;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-end"
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-md h-full bg-slate-50 dark:bg-slate-950 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-display font-bold">Your Cart</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm text-slate-500">
              <MapPin className="w-4 h-4 text-primary-light shrink-0" />
              <span className="font-medium line-clamp-1">Set delivery address at checkout</span>
              <ArrowRight className="w-4 h-4 ml-auto shrink-0" />
            </div>
          )}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length > 0 ? (
            items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex gap-4 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={item.dish.image} alt={item.dish.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div>
                    <h3 className="font-bold text-sm leading-tight">{item.dish.name}</h3>
                    <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5 tracking-tight">
                      {item.dish.cuisine} · {item.dish.dietary}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 dark:text-white text-sm">₹{item.dish.price * item.quantity}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button onClick={() => onRemoveItem(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
              <ShoppingBag className="w-20 h-20 mb-4" />
              <p className="text-xl font-display font-black">Your bag is empty</p>
              <p className="text-sm mt-2">Add some delicious dishes!</p>
            </div>
          )}
        </div>

        {/* Bill + Checkout */}
        {items.length > 0 && (
          <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="space-y-2 text-sm font-medium">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="w-4 h-4 text-slate-400" />
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Bill Details</h4>
              </div>
              <div className="flex justify-between text-slate-500"><span>Item Total</span><span>₹{subtotal}</span></div>
              <div className="flex justify-between text-slate-500 items-center">
                <div className="flex items-center gap-1.5">
                  <span>Delivery Fee</span>
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase">{distance}km</span>
                </div>
                <span>₹{deliveryFee}</span>
              </div>
              {isSurge && (
                <div className="flex items-center gap-1.5 text-orange-500 text-[10px] font-bold">
                  <AlertCircle className="w-3 h-3" /> Surge pricing — high demand
                </div>
              )}
              <div className="flex justify-between text-slate-500"><span>Platform Fee</span><span>₹{platformFee}</span></div>
              <div className="flex justify-between text-slate-500"><span>GST & Restaurant Charges</span><span>₹{gst + restaurantCharges}</span></div>
            </div>

            <div className="pt-3 border-t-2 border-dashed border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To Pay</p>
                <p className="text-3xl font-display font-black text-slate-900 dark:text-white leading-none">₹{total}</p>
              </div>
              <button
                onClick={onCheckout}
                disabled={isProcessing}
                className="bg-gradient-to-r from-primary-light to-primary-dark text-white font-black px-7 py-4 rounded-2xl flex items-center gap-2 shadow-xl shadow-primary-light/25 hover:shadow-2xl active:scale-95 transition-all text-sm disabled:opacity-50"
              >
                Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400">
              By placing this order, you agree to our Terms of Service.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
