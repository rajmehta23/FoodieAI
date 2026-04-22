import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, DietaryPreference, SpiceLevel, Cuisine, Allergy } from '../types';
import { X, ChevronRight, ChevronLeft, Save, Info, Heart, ShieldAlert, Wallet, Sparkles } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
  initialProfile: UserProfile | null;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onSave, initialProfile }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>(initialProfile || {
    dietary: DietaryPreference.VEG,
    spice: SpiceLevel.MEDIUM,
    cuisines: [Cuisine.INDIAN],
    allergies: [Allergy.NONE],
    budget: 500
  });

  const totalSteps = 5;

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
    else onSave(profile);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleCuisine = (c: Cuisine) => {
    setProfile(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(c) 
        ? prev.cuisines.filter(i => i !== c) 
        : [...prev.cuisines, c]
    }));
  };

  const toggleAllergy = (a: Allergy) => {
    if (a === Allergy.NONE) {
      setProfile(prev => ({ ...prev, allergies: [Allergy.NONE] }));
      return;
    }
    setProfile(prev => ({
      ...prev,
      allergies: prev.allergies.includes(a)
        ? prev.allergies.filter(i => i !== a)
        : [...prev.allergies.filter(i => i !== Allergy.NONE), a]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden"
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-800 flex">
          {[...Array(totalSteps)].map((_, i) => (
            <div 
              key={i} 
              className={`h-full transition-all duration-500 ${i + 1 <= step ? 'bg-primary-light' : 'bg-transparent'}`}
              style={{ width: `${100 / totalSteps}%` }}
            />
          ))}
        </div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-400"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-10">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <div className="inline-flex p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl mb-2 text-green-500">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-display font-black">Life's a Feast!</h2>
                  <p className="text-slate-500">How do you prefer your main choice?</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {Object.values(DietaryPreference).map(dp => (
                    <button
                      key={dp}
                      onClick={() => setProfile({ ...profile, dietary: dp })}
                      className={`py-8 px-4 rounded-[32px] font-bold transition-all border-2 flex flex-col items-center gap-3 ${profile.dietary === dp ? 'bg-primary-light border-primary-light text-white shadow-xl shadow-primary-light/20 scale-[1.02]' : 'border-slate-100 dark:border-slate-800 hover:border-primary-light/30'}`}
                    >
                      <span className="text-2xl">{dp === 'Veg' ? '🥗' : dp === 'Non-Veg' ? '🍗' : dp === 'Vegan' ? '🌿' : '✨'}</span>
                      {dp}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <div className="inline-flex p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl mb-2 text-red-500">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-display font-black">Level Up Spice</h2>
                  <p className="text-slate-500">How much heat can you handle?</p>
                </div>
                <div className="space-y-3">
                  {Object.values(SpiceLevel).map(sl => (
                    <button
                      key={sl}
                      onClick={() => setProfile({ ...profile, spice: sl })}
                      className={`w-full py-5 px-8 rounded-3xl font-bold transition-all border-2 flex items-center justify-between ${profile.spice === sl ? 'bg-primary-light border-primary-light text-white shadow-xl scale-[1.01]' : 'border-slate-100 dark:border-slate-800 hover:border-primary-light/30'}`}
                    >
                      <span>{sl}</span>
                      <span>{sl === 'Mild' ? '😊' : sl === 'Medium' ? '🌶️' : '🔥'}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                   <div className="inline-flex p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-2 text-blue-500">
                    <Info className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-display font-black">Global Flavors</h2>
                  <p className="text-slate-500">Pick your favorite cuisines (Multiple)</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {Object.values(Cuisine).map(c => (
                    <button
                      key={c}
                      onClick={() => toggleCuisine(c)}
                      className={`px-6 py-3 rounded-2xl font-bold transition-all border-2 ${profile.cuisines.includes(c) ? 'bg-primary-light border-primary-light text-white shadow-lg' : 'border-slate-100 dark:border-slate-800 hover:border-primary-light/30'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                   <div className="inline-flex p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl mb-2 text-amber-500">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-display font-black">Stay Safe!</h2>
                  <p className="text-slate-500">Any allergies we should know about?</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(Allergy).map(a => (
                    <button
                      key={a}
                      onClick={() => toggleAllergy(a)}
                      className={`py-4 rounded-2xl font-bold transition-all border-2 ${profile.allergies.includes(a) ? 'bg-primary-light border-primary-light text-white shadow-lg' : 'border-slate-100 dark:border-slate-800 hover:border-primary-light/30 text-slate-500'}`}
                    >
                      {a === 'None' ? 'No Allergies' : a}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                   <div className="inline-flex p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-2 text-indigo-500">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-display font-black">Plan Your Wallet</h2>
                  <p className="text-slate-500">What's your typical meal budget?</p>
                </div>
                <div className="px-6 py-10 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] text-center border border-slate-100 dark:border-slate-800">
                  <span className="text-4xl font-display font-black text-primary-light">₹{profile.budget}</span>
                  <input 
                    type="range" 
                    min="100" 
                    max="2000" 
                    step="50" 
                    value={profile.budget}
                    onChange={(e) => setProfile({ ...profile, budget: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-light mt-8"
                  />
                  <div className="flex justify-between mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    <span>Pocket Friendly</span>
                    <span>Premium</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between gap-4 mt-12 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={prevStep}
              className={`flex items-center gap-2 font-bold text-slate-400 hover:text-slate-600 transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            <button
              onClick={nextStep}
              className="px-8 py-4 bg-primary-light hover:bg-primary-dark text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary-light/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {step === totalSteps ? (
                <>
                  <Save className="w-5 h-5" />
                  Finish Setup
                </>
              ) : (
                <>
                  Next Step
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
