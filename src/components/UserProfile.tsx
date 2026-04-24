import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, Mail, MapPin, Sparkles, LogOut, ChevronRight, 
  Settings, Heart, History, Trash2, Edit3, Check, X,
  Navigation, Map
} from 'lucide-react';
import { storageService, DeliveryAddress } from '../services/storageService';
import { User as UserType, UserProfile as UserProfileType } from '../types';

interface UserProfileProps {
  currentUser: UserType | null;
  profile: UserProfileType | null;
  onLogout: () => void;
  onEditPreferences: () => void;
  onViewFavorites: () => void;
  onViewHistory: () => void;
  onNotify: (message: string) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  currentUser,
  profile,
  onLogout,
  onEditPreferences,
  onViewFavorites,
  onViewHistory,
  onNotify
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(currentUser?.name || '');
  const [isSavingName, setIsSavingName] = useState(false);
  
  const [address, setAddress] = useState<DeliveryAddress | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const loadAddress = async () => {
      const saved = await storageService.getSavedAddress();
      setAddress(saved);
      setIsLoadingAddress(false);
    };
    loadAddress();
  }, []);

  const handleUpdateName = async () => {
    if (!newName.trim() || newName === currentUser?.name) {
      setIsEditingName(false);
      return;
    }

    setIsSavingName(true);
    try {
      await storageService.updateUserName(newName.trim());
      onNotify('Name updated successfully! ✨');
      setIsEditingName(false);
    } catch (err) {
      onNotify('Failed to update name. ❌');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleUseLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      onNotify('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const geoAddr = await storageService.reverseGeocode(latitude, longitude);
        
        const newAddress: DeliveryAddress = {
          name: currentUser?.name || '',
          phone: address?.phone || '',
          street: geoAddr.street || '',
          city: geoAddr.city || '',
          pincode: geoAddr.pincode || '',
        };
        
        await storageService.saveAddress(newAddress);
        setAddress(newAddress);
        onNotify('Location updated! 📍');
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        onNotify('Could not get your location. Please check permissions.');
        setIsLocating(false);
      }
    );
  };

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Profile Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass dark:glass-dark p-8 rounded-[40px] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light/10 blur-[80px] -mr-32 -mt-32 rounded-full" />
        
        <div className="relative">
          <div className="w-32 h-32 rounded-[32px] bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center text-white text-4xl font-display font-black shadow-2xl shadow-primary-light/30">
            {initials}
          </div>
          <button 
            className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 text-primary-light hover:scale-110 transition-transform"
            title="Edit Photo"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input 
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 font-display font-bold text-2xl outline-none focus:ring-2 focus:ring-primary-light/50"
                  autoFocus
                />
                <button 
                  onClick={handleUpdateName}
                  disabled={isSavingName}
                  className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all disabled:opacity-50"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setIsEditingName(false)}
                  className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center md:justify-start gap-3">
                <h2 className="text-4xl font-display font-black tracking-tight">{currentUser?.name}</h2>
                <button 
                  onClick={() => setIsEditingName(true)}
                  className="p-2 text-slate-400 hover:text-primary-light transition-colors"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center md:justify-start gap-2 font-medium">
            <Mail className="w-4 h-4" /> {currentUser?.email}
          </p>
          <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
            <span className="bg-primary-light/10 text-primary-light px-4 py-2 rounded-full text-xs font-bold border border-primary-light/10">
              Elite Foodie
            </span>
            <span className="bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-2 rounded-full text-xs font-bold border border-green-500/10">
              Active Member
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Taste Profile Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass dark:glass-dark p-8 rounded-[40px] flex flex-col h-full border border-primary-light/5"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl text-amber-500">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold">Taste Profile</h3>
            </div>
            <button 
              onClick={onEditPreferences}
              className="text-primary-light hover:underline text-sm font-bold flex items-center gap-1"
            >
              Update <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {profile ? (
            <div className="space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dietary</p>
                  <p className="font-bold text-sm">{profile.dietary}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Spice Level</p>
                  <p className="font-bold text-sm">{profile.spice}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Favorite Cuisines</p>
                <div className="flex flex-wrap gap-2">
                  {profile.cuisines.map(c => (
                    <span key={c} className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price Preference</p>
                <div className="flex items-center gap-2">
                  <span className="font-bold">₹{profile.budget}</span>
                  <span className="text-slate-400 text-xs">per meal avg.</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50">
              <Settings className="w-12 h-12 mb-4 text-slate-300" />
              <p className="font-medium">No preferences set yet</p>
              <button 
                onClick={onEditPreferences}
                className="mt-4 bg-primary-light text-white px-6 py-2 rounded-xl text-sm font-bold"
              >
                Set Up Now
              </button>
            </div>
          )}
        </motion.div>

        {/* Saved Address Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass dark:glass-dark p-8 rounded-[40px] flex flex-col h-full border border-primary-light/5"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl text-blue-500">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold">Saved Address</h3>
            </div>
            <button 
              onClick={handleUseLocation}
              disabled={isLocating}
              className="flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-blue-500/20 transition-all disabled:opacity-50"
            >
              {isLocating ? (
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Navigation className="w-3 h-3" />
              )}
              {isLocating ? 'Locating...' : 'Auto-fill'}
            </button>
          </div>

          {isLoadingAddress ? (
            <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-light/20 border-t-primary-light rounded-full animate-spin" /></div>
          ) : address ? (
            <div className="space-y-6 flex-1">
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border-2 border-slate-100 dark:border-white/5">
                <p className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-2">
                  <Map className="w-3 h-3" /> Primary Home
                </p>
                <p className="font-bold text-lg leading-tight">{address.street}</p>
                <p className="text-slate-500 font-medium mt-1">{address.city}, {address.pincode}</p>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5 flex items-center gap-3 text-sm">
                   <span className="font-bold">{address.phone}</span>
                   <span className="text-slate-300">|</span>
                   <span className="text-slate-400">{address.name}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 italic">This address will be auto-filled during checkout.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50">
              <MapPin className="w-12 h-12 mb-4 text-slate-300" />
              <p className="font-medium">No saved address found</p>
              <button 
                onClick={handleUseLocation}
                className="mt-4 text-primary-light font-bold text-sm"
              >
                Set Current Location
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Stats & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={onViewFavorites}
          className="glass dark:glass-dark p-6 rounded-[32px] flex items-center gap-4 hover:scale-[1.02] transition-transform text-left border border-white/10"
        >
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-2xl">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saved</p>
            <p className="font-bold text-lg">Favorites</p>
          </div>
        </button>

        <button 
          onClick={onViewHistory}
          className="glass dark:glass-dark p-6 rounded-[32px] flex items-center gap-4 hover:scale-[1.02] transition-transform text-left border border-white/10"
        >
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 rounded-2xl">
            <History className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Journal</p>
            <p className="font-bold text-lg">Order History</p>
          </div>
        </button>

        <button 
          onClick={onLogout}
          className="glass dark:glass-dark p-6 rounded-[32px] flex items-center gap-4 hover:scale-[1.02] transition-transform text-left border border-white/10 group"
        >
          <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-red-500/10 group-hover:text-red-500 transition-colors rounded-2xl">
            <LogOut className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session</p>
            <p className="font-bold text-lg group-hover:text-red-500 transition-colors">Sign Out</p>
          </div>
        </button>
      </div>
    </div>
  );
};
