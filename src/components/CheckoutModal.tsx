import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, MapPin, Phone, User, ArrowRight, ArrowLeft,
  CreditCard, Wallet, Banknote, CheckCircle2, Loader2, Home, Navigation
} from 'lucide-react';
import { CartItem } from '../types';
import { DeliveryAddress, storageService } from '../services/storageService';

interface CheckoutModalProps {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  gst: number;
  platformFee: number;
  total: number;
  savedAddress: DeliveryAddress | null;
  onClose: () => void;
  onConfirmOrder: (address: DeliveryAddress, paymentMethod: string) => void;
  isProcessing: boolean;
}

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI / Google Pay', icon: <Wallet className="w-5 h-5" />, detail: 'Pay instantly with any UPI app' },
  { id: 'card', label: 'Credit / Debit Card', icon: <CreditCard className="w-5 h-5" />, detail: 'Visa, Mastercard, RuPay' },
  { id: 'cod', label: 'Cash on Delivery', icon: <Banknote className="w-5 h-5" />, detail: 'Pay when your order arrives' },
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  items,
  subtotal,
  deliveryFee,
  gst,
  platformFee,
  total,
  savedAddress,
  onClose,
  onConfirmOrder,
  isProcessing,
}) => {
  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [address, setAddress] = useState<DeliveryAddress>(
    savedAddress ?? { name: '', phone: '', street: '', city: '', pincode: '' }
  );
  const [errors, setErrors] = useState<Partial<DeliveryAddress>>({});
  const [isLocating, setIsLocating] = useState(false);

  const handleUseLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const geoAddr = await storageService.reverseGeocode(latitude, longitude);
        
        setAddress(prev => ({
          ...prev,
          street: geoAddr.street || prev.street,
          city: geoAddr.city || prev.city,
          pincode: geoAddr.pincode || prev.pincode,
        }));
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Could not get your location. Please check permissions.');
        setIsLocating(false);
      }
    );
  };

  const validateAddress = () => {
    const newErrors: Partial<DeliveryAddress> = {};
    if (!address.name.trim())    newErrors.name    = 'Required';
    if (!address.phone.match(/^\d{10}$/)) newErrors.phone = '10-digit number required';
    if (!address.street.trim())  newErrors.street  = 'Required';
    if (!address.city.trim())    newErrors.city    = 'Required';
    if (!address.pincode.match(/^\d{6}$/)) newErrors.pincode = '6-digit pincode required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateAddress()) setStep('payment');
  };

  const handleConfirm = () => {
    onConfirmOrder(address, paymentMethod);
  };

  const field = (
    key: keyof DeliveryAddress,
    label: string,
    placeholder: string,
    type = 'text',
    icon?: React.ReactNode
  ) => (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input
          type={type}
          value={address[key]}
          onChange={e => setAddress(prev => ({ ...prev, [key]: e.target.value }))}
          placeholder={placeholder}
          className={`w-full bg-slate-50 dark:bg-slate-800 border-2 rounded-2xl py-3 ${icon ? 'pl-10' : 'pl-4'} pr-4 font-medium outline-none transition-all focus:border-primary-light ${
            errors[key] ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
          }`}
        />
      </div>
      {errors[key] && <p className="text-red-500 text-xs mt-1 font-bold">{errors[key]}</p>}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {step === 'payment' && (
                <button onClick={() => setStep('address')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-xl font-display font-bold">
                {step === 'address' ? '📍 Delivery Address' : '💳 Payment'}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {['address', 'payment'].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${step === s || (s === 'address') ? 'text-primary-light' : 'text-slate-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${
                    step === s ? 'bg-primary-light text-white' :
                    (i === 0 && step === 'payment') ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {i === 0 && step === 'payment' ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  {s === 'address' ? 'Address' : 'Payment'}
                </div>
                {i < 1 && <div className={`flex-1 h-0.5 rounded-full transition-colors ${step === 'payment' ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {step === 'address' ? (
              <motion.div
                key="address"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Delivery Details</p>
                  <button 
                    type="button"
                    onClick={handleUseLocation}
                    disabled={isLocating}
                    className="flex items-center gap-1.5 text-primary-light text-xs font-bold bg-primary-light/5 px-3 py-1.5 rounded-xl hover:bg-primary-light/10 transition-all disabled:opacity-50"
                  >
                    {isLocating ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Navigation className="w-3 h-3" />
                    )}
                    {isLocating ? 'Locating...' : 'Use Current Location'}
                  </button>
                </div>
                {field('name', 'Full Name', 'Recipient name', 'text', <User className="w-4 h-4" />)}
                {field('phone', 'Phone Number', '10-digit mobile number', 'tel', <Phone className="w-4 h-4" />)}
                {field('street', 'Street Address', 'Flat / Building / Street', 'text', <Home className="w-4 h-4" />)}
                <div className="grid grid-cols-2 gap-3">
                  {field('city', 'City', 'e.g. Mumbai')}
                  {field('pincode', 'Pincode', '6-digit pincode')}
                </div>

                {/* Order summary mini */}
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Order Summary</p>
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm font-medium">
                      <span className="text-slate-600 dark:text-slate-300">{item.dish.name} × {item.quantity}</span>
                      <span>₹{item.dish.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-black">
                    <span>Total</span>
                    <span className="text-primary-light">₹{total.toFixed(0)}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Delivery address confirmation */}
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                  <MapPin className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Delivering to</p>
                    <p className="text-sm font-medium mt-0.5">{address.name} · {address.phone}</p>
                    <p className="text-sm text-slate-500">{address.street}, {address.city} – {address.pincode}</p>
                  </div>
                </div>

                {/* Payment options */}
                <div className="space-y-3">
                  {PAYMENT_METHODS.map(pm => (
                    <button
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        paymentMethod === pm.id
                          ? 'border-primary-light bg-primary-light/5'
                          : 'border-slate-200 dark:border-slate-700 hover:border-primary-light/40'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${paymentMethod === pm.id ? 'bg-primary-light text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                        {pm.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{pm.label}</p>
                        <p className="text-xs text-slate-500">{pm.detail}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 transition-colors ${paymentMethod === pm.id ? 'border-primary-light bg-primary-light' : 'border-slate-300'}`}>
                        {paymentMethod === pm.id && <div className="w-full h-full rounded-full bg-white scale-50" />}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Bill details */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2 text-sm">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Bill Details</p>
                  <div className="flex justify-between text-slate-500"><span>Item Total</span><span>₹{subtotal}</span></div>
                  <div className="flex justify-between text-slate-500"><span>Delivery Fee</span><span>₹{deliveryFee.toFixed(0)}</span></div>
                  <div className="flex justify-between text-slate-500"><span>Platform Fee</span><span>₹{platformFee}</span></div>
                  <div className="flex justify-between text-slate-500"><span>GST (5%)</span><span>₹{gst.toFixed(0)}</span></div>
                  <div className="flex justify-between font-black pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>To Pay</span>
                    <span className="text-primary-light text-lg">₹{total.toFixed(0)}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer CTA */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={step === 'address' ? handleNextStep : handleConfirm}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-primary-light to-primary-dark text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary-light/25 hover:shadow-2xl hover:shadow-primary-light/30 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {isProcessing ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing Order...</>
            ) : step === 'address' ? (
              <>Proceed to Payment <ArrowRight className="w-5 h-5" /></>
            ) : (
              <>Place Order · ₹{total.toFixed(0)} <CheckCircle2 className="w-5 h-5" /></>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
