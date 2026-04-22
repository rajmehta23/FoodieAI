import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Trash2, X, Plus, Minus, CreditCard, ArrowRight, MapPin, Truck, AlertCircle, Receipt } from 'lucide-react';
import { CartItem, Dish } from '../types';

interface CartProps {
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (dishId: string, delta: number) => void;
  onRemoveItem: (dishId: string) => void;
  onCheckout: () => void;
  isProcessing?: boolean;
}

export const Cart: React.FC<CartProps> = ({ 
  items, 
  onClose, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout,
  isProcessing = false
}) => {
  // Simulate Address and Distance
  const currentAddress = "Green Valley Apartments, Block C, Mumbai";
  const distance = 4.2; // Simulated distance in KM
  const isSurge = Math.random() > 0.7; // Random surge for realism
  
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0), [items]);
  
  // Calculations
  const deliveryBase = 35;
  const deliveryFee = items.length > 0 ? (deliveryBase + (distance * 5)) * (isSurge ? 1.5 : 1) : 0;
  const platformFee = items.length > 0 ? 9 : 0;
  const gst = items.length > 0 ? subtotal * 0.05 : 0; // 5% GST
  const restaurantCharges = items.length > 0 ? 15 : 0; // Fixed pakaging/service
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
        <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-display font-bold">Checkout</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-primary-light/5 dark:bg-primary-light/10 rounded-2xl border border-primary-light/10">
            <MapPin className="w-5 h-5 text-primary-light mt-0.5" />
            <div>
              <p className="text-xs font-bold text-primary-light uppercase tracking-wider">Delivering to</p>
              <p className="text-sm font-medium leading-tight mt-0.5">{currentAddress}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length > 0 ? (
            items.map((item) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
              >
                <div className="w-20 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={item.dish.image} alt={item.dish.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-bold text-sm">{item.dish.name}</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-black mt-0.5 tracking-tighter">
                      {item.dish.cuisine} • {item.dish.dietary}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 dark:text-white">₹{item.dish.price}</span>
                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                      >
                        <Plus className="w-3 h-3" />
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
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="w-4 h-4 text-slate-400" />
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Bill Details</h4>
              </div>
              
              <div className="space-y-2 text-sm font-medium">
                <div className="flex justify-between text-slate-500">
                  <span>Item Total</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-500 items-center">
                  <div className="flex items-center gap-1.5">
                    <span>Delivery Fee</span>
                    <Truck className="w-3.5 h-3.5" />
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase">{distance}km</span>
                  </div>
                  <span>₹{deliveryFee.toFixed(0)}</span>
                </div>
                {isSurge && (
                  <div className="flex items-center gap-2 text-orange-500 text-[10px] font-bold">
                    <AlertCircle className="w-3 h-3" /> Surge fee applied due to high demand
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Platform Fee</span>
                  <span>₹{platformFee}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GST & Restaurant Charges</span>
                  <span>₹{(gst + restaurantCharges).toFixed(0)}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t-2 border-dashed border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To Pay</p>
                  <p className="text-3xl font-display font-black text-slate-900 dark:text-white leading-none">₹{total.toFixed(0)}</p>
                </div>
                <button 
                  onClick={onCheckout}
                  disabled={isProcessing}
                  className="bg-primary-light hover:bg-primary-dark text-white font-black px-8 py-5 rounded-[24px] flex items-center gap-3 shadow-2xl shadow-primary-light/30 active:scale-95 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-bounce">
                        <Truck className="w-5 h-5" />
                      </div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Confirm Order
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <p className="text-[10px] text-center text-slate-400 font-medium">
              By placing this order, you agree to our Terms of Service.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
