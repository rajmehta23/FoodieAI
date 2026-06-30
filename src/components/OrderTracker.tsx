import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ChefHat, Truck, PartyPopper, MapPin, Clock, X, AlertTriangle } from 'lucide-react';
import { OrderStatus } from '../services/storageService';

interface OrderTrackerProps {
  order: OrderStatus;
  onClose: () => void;
  onStatusChange: (status: OrderStatus['status']) => void;
  onCancel: () => void;
}

const STEPS: { key: OrderStatus['status']; label: string; sublabel: string; icon: React.ReactNode; color: string }[] = [
  {
    key: 'confirmed',
    label: 'Order Confirmed',
    sublabel: 'Your order has been received!',
    icon: <CheckCircle2 className="w-6 h-6" />,
    color: 'text-green-500 bg-green-100 dark:bg-green-900/30',
  },
  {
    key: 'preparing',
    label: 'Preparing Your Order',
    sublabel: 'Our chefs are working on your meal',
    icon: <ChefHat className="w-6 h-6" />,
    color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
  },
  {
    key: 'out_for_delivery',
    label: 'Out for Delivery',
    sublabel: 'Your rider is on the way!',
    icon: <Truck className="w-6 h-6" />,
    color: 'text-primary-light bg-orange-100 dark:bg-orange-900/30',
  },
  {
    key: 'delivered',
    label: 'Delivered!',
    sublabel: 'Enjoy your meal 🎉',
    icon: <PartyPopper className="w-6 h-6" />,
    color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
  },
];

const STATUS_DURATIONS: Record<OrderStatus['status'], number> = {
  confirmed:        4000,
  preparing:        10000,
  out_for_delivery: 12000,
  delivered:        0,
};

const STATUS_ORDER: OrderStatus['status'][] = ['confirmed', 'preparing', 'out_for_delivery', 'delivered'];

export const OrderTracker: React.FC<OrderTrackerProps> = ({ order, onClose, onStatusChange, onCancel }) => {
  const currentIdx = STATUS_ORDER.indexOf(order.status);
  const [elapsed, setElapsed] = useState(0);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canCancel = order.status === 'confirmed' || order.status === 'preparing';

  // Auto-advance statuses
  useEffect(() => {
    if (order.status === 'delivered') return;
    const duration = STATUS_DURATIONS[order.status];
    timerRef.current = setTimeout(() => {
      const nextIdx = currentIdx + 1;
      if (nextIdx < STATUS_ORDER.length) {
        onStatusChange(STATUS_ORDER[nextIdx]);
      }
    }, duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [order.status]);

  // Elapsed time counter
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - order.placedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [order.placedAt]);

  const formatElapsed = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const etaRemaining = Math.max(0, order.estimatedMinutes * 60 - elapsed);
  const etaMins = Math.ceil(etaRemaining / 60);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* ── Tracker Card ── */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="relative bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden"
      >
        {/* Header gradient */}
        <div className={`relative p-8 pb-6 ${order.status === 'delivered' ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gradient-to-br from-primary-light to-primary-dark'} text-white overflow-hidden`}>
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />

          {/* Close (top-right only) */}
          {order.status !== 'delivered' && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all z-10"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Status icon + title */}
          <AnimatePresence mode="wait">
            <motion.div
              key={order.status}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative z-10"
            >
              <motion.div
                animate={order.status !== 'delivered'
                  ? { rotate: order.status === 'out_for_delivery' ? [0, -10, 10, -10, 0] : 0 }
                  : { scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
                className="text-5xl mb-3"
              >
                {order.status === 'confirmed' && '✅'}
                {order.status === 'preparing' && '👨‍🍳'}
                {order.status === 'out_for_delivery' && '🛵'}
                {order.status === 'delivered' && '🎉'}
              </motion.div>
              <h2 className="text-2xl font-display font-black">{STEPS[currentIdx].label}</h2>
              <p className="text-white/80 mt-1 text-sm">{STEPS[currentIdx].sublabel}</p>
            </motion.div>
          </AnimatePresence>

          {/* ETA row */}
          {order.status !== 'delivered' && (
            <div className="relative z-10 mt-4 flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-2xl">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-bold">ETA: ~{etaMins} min{etaMins !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-2xl">
                <span className="text-sm font-bold">⏱ {formatElapsed(elapsed)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Progress steps */}
        <div className="p-6 space-y-1">
          {STEPS.map((step, idx) => {
            const isDone    = idx < currentIdx;
            const isActive  = idx === currentIdx;
            const isPending = idx > currentIdx;
            return (
              <div key={step.key} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={isActive && order.status !== 'delivered' ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      isDone   ? 'bg-green-500 text-white' :
                      isActive ? step.color :
                      'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : step.icon}
                  </motion.div>
                  {idx < STEPS.length - 1 && (
                    <div className={`w-0.5 h-8 mt-1 rounded-full transition-colors duration-500 ${isDone ? 'bg-green-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  )}
                </div>
                <div className={`pt-1.5 transition-opacity duration-500 ${isPending ? 'opacity-30' : ''}`}>
                  <p className={`font-bold text-sm ${isActive ? 'text-slate-900 dark:text-white' : ''}`}>{step.label}</p>
                  {isActive && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-slate-500 mt-0.5">
                      {step.sublabel}
                    </motion.p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Delivery address */}
        <div className="mx-6 mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-start gap-3">
          <MapPin className="w-4 h-4 text-primary-light mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Delivering to</p>
            <p className="text-sm font-medium mt-0.5">{order.address.name}</p>
            <p className="text-xs text-slate-500">{order.address.street}, {order.address.city} – {order.address.pincode}</p>
          </div>
        </div>

        {/* Order items */}
        <div className="mx-6 space-y-1">
          {order.dishNames.map((name, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="text-primary-light">•</span>
              <span className="font-medium">{name}</span>
            </div>
          ))}
          <p className="text-xs font-black text-slate-400 mt-1">Total: ₹{order.totalAmount.toFixed(0)}</p>
        </div>

        {/* ── Footer ── */}
        <div className="p-6 pb-6 mt-4">
          {order.status === 'delivered' ? (
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white font-black py-4 rounded-2xl shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all"
            >
              Rate Your Experience ⭐
            </button>
          ) : canCancel ? (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="w-full py-3.5 rounded-2xl border-2 border-red-200 dark:border-red-800 text-red-500 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel Order
            </button>
          ) : (
            <p className="text-center text-xs text-slate-400 font-medium">
              🛵 Order is out for delivery — cancellation no longer possible
            </p>
          )}
        </div>
      </motion.div>

      {/* ── Cancel Confirmation — floats as a dialog over the card ── */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center p-6"
          >
            {/* dim the tracker card behind */}
            <div
              className="absolute inset-0 bg-black/50 rounded-[40px]"
              onClick={() => setShowCancelConfirm(false)}
            />

            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 22, stiffness: 320 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              {/* icon */}
              <div className="flex items-center justify-center w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>

              <h3 className="text-center font-display font-black text-lg text-slate-900 dark:text-white mb-1">
                Cancel this order?
              </h3>
              <p className="text-center text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                {order.status === 'confirmed'
                  ? "Your order hasn't started yet. You'll get a full refund in 2–3 business days."
                  : 'Our chefs have already started. A small cancellation fee may apply. Refund in 3–5 days.'}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                >
                  Keep Order
                </button>
                <button
                  onClick={onCancel}
                  className="flex-1 py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black text-sm shadow-lg shadow-red-500/30 transition-all active:scale-95"
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
