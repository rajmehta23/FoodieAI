import React, { useState } from 'react';
import { UserProfile, DietaryPreference, SpiceLevel, Cuisine, Allergy } from '../types';
import { Save, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface PreferencesFormProps {
  initialProfile: UserProfile | null;
  onSave: (profile: UserProfile) => void;
}

export const PreferencesForm: React.FC<PreferencesFormProps> = ({ initialProfile, onSave }) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile || {
    dietary: DietaryPreference.VEG,
    spice: SpiceLevel.MEDIUM,
    cuisines: [Cuisine.INDIAN],
    allergies: [Allergy.NONE],
    budget: 500
  });

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

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto p-8 rounded-[40px] glass dark:glass-dark shadow-2xl"
    >
      <div className="flex flex-col items-center mb-8 text-center">
        <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
          Personalize Your Taste
        </h2>
        <p className="text-slate-500 mt-2">Help Foodie know what you love</p>
      </div>

      <div className="space-y-8">
        <section>
          <label className="block text-sm font-semibold mb-4 text-slate-600 dark:text-slate-400 uppercase tracking-widest">Dietary Preference</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.values(DietaryPreference).map(dp => (
              <button
                key={dp}
                onClick={() => setProfile(prev => ({ ...prev, dietary: dp }))}
                className={`py-3 px-1 rounded-2xl font-bold transition-all border-2 ${profile.dietary === dp ? 'bg-primary-light border-primary-light text-white shadow-lg' : 'border-slate-200 dark:border-slate-800 hover:border-primary-light/50'}`}
              >
                {dp}
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className="block text-sm font-semibold mb-4 text-slate-600 dark:text-slate-400 uppercase tracking-widest">Spice Level</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.values(SpiceLevel).map(sl => (
              <button
                key={sl}
                onClick={() => setProfile(prev => ({ ...prev, spice: sl }))}
                className={`py-3 rounded-2xl font-bold transition-all border-2 ${profile.spice === sl ? 'bg-primary-light border-primary-light text-white shadow-lg' : 'border-slate-200 dark:border-slate-800 hover:border-primary-light/50'}`}
              >
                {sl}
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className="block text-sm font-semibold mb-4 text-slate-600 dark:text-slate-400 uppercase tracking-widest">Favorite Cuisines</label>
          <div className="flex flex-wrap gap-3">
            {Object.values(Cuisine).map(c => (
              <button
                key={c}
                onClick={() => toggleCuisine(c)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border-2 ${profile.cuisines.includes(c) ? 'bg-primary-light border-primary-light text-white shadow-lg' : 'border-slate-200 dark:border-slate-800 hover:border-primary-light/50'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className="block text-sm font-semibold mb-4 text-slate-600 dark:text-slate-400 uppercase tracking-widest">Allergies</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.values(Allergy).map(a => (
              <button
                key={a}
                onClick={() => toggleAllergy(a)}
                className={`py-3 rounded-2xl font-bold transition-all border-2 ${profile.allergies.includes(a) ? 'bg-primary-light border-primary-light text-white shadow-lg' : 'border-slate-200 dark:border-slate-800 hover:border-primary-light/50'}`}
              >
                {a}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-end mb-4">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Daily Budget</label>
            <span className="text-2xl font-display font-bold text-primary-light">₹{profile.budget}</span>
          </div>
          <input 
            type="range" 
            min="100" 
            max="2000" 
            step="50" 
            value={profile.budget}
            onChange={(e) => setProfile(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-light"
          />
        </section>

        <button 
          onClick={() => onSave(profile)}
          className="w-full bg-gradient-to-r from-primary-light to-primary-dark hover:shadow-xl hover:shadow-primary-light/20 text-white font-bold py-4 rounded-3xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <Save className="w-5 h-5" />
          Save Preferences
        </button>
      </div>
    </motion.div>
  );
};
