import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged } from 'firebase/auth';
import confetti from 'canvas-confetti';
import { auth } from './firebase';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FoodCard } from './components/FoodCard';
import { PreferencesForm } from './components/PreferencesForm';
import { DishesSection } from './components/DishesSection';
import { AuthForm } from './components/AuthForm';
import { SurpriseMeResults } from './components/SurpriseMeResults';
import { DishDetailsModal } from './components/DishDetailsModal';
import { OnboardingModal } from './components/OnboardingModal';
import { UserProfile as UserProfileSection } from './components/UserProfile';
import { PartnerDashboard } from './components/PartnerDashboard';
import { storageService } from './services/storageService';
import { getPersonalizedRecommendations, getSurpriseMe } from './services/recommendationService';
import { MENU_DATA } from './constants';
import { UserProfile, Dish, Recommendation, User } from './types';
import { Sparkles, ArrowRight, Loader2, Heart, Trash2 } from 'lucide-react';

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('foodie_theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [activeSection, setActiveSection] = useState('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true); // wait for Firebase to resolve
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [surprisePicks, setSurprisePicks] = useState<{ dishId: string; reason: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [exploredDish, setExploredDish] = useState<Dish | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  // ── Theme ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('foodie_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // ── Firebase Auth Observer ────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const appUser: User = { id: fbUser.uid, email: fbUser.email ?? '', name: fbUser.displayName ?? 'Foodie User' };
        setCurrentUser(appUser);
        // Load cloud data for this user
        const [profile, fetchedFavs] = await Promise.all([
          storageService.getProfile(),
          storageService.getFavorites(),
        ]);
        setUserProfile(profile);
        setFavorites(fetchedFavs);
        if (profile) loadRecommendations(profile);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setFavorites([]);
        setRecommendations([]);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Restore tracker if an order was in-progress
  useEffect(() => {
    if (currentUser && activeSection === 'auth') {
      setActiveSection('home');
    }
  }, [currentUser, activeSection]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const notify = (message: string, duration = 3000) => {
    setNotification({ show: true, message });
    setTimeout(() => setNotification({ show: false, message: '' }), duration);
  };

  // ── Auth ───────────────────────────────────────────────────────────────────
  const handleAuthSuccess = async (user: User) => {
    // onAuthStateChanged will fire and load the data automatically;
    // we just handle the UX transition here.
    const profile = await storageService.getProfile();
    if (!profile) {
      setIsOnboardingOpen(true);
      notify(`Welcome ${user.name}! Let's set your preferences. 🎉`);
    } else {
      setActiveSection('home');
      notify(`Welcome back, ${user.name}! 👋`);
    }
  };

  const handleLogout = async () => {
    await storageService.logout();
    setCurrentUser(null);
    setActiveSection('home');
    notify('Successfully logged out.');
  };

  // ── Recommendations ────────────────────────────────────────────────────────
  const loadRecommendations = async (profile: UserProfile, forceRefresh = false) => {
    const cached = storageService.getRecommendationsCache();
    if (cached && !forceRefresh) {
      const mappedRecs = cached
        .map(r => ({ dish: MENU_DATA.find(d => d.id === r.dishId)!, reason: r.reason, badge: r.badge as any }))
        .filter(r => r.dish !== undefined);
      if (mappedRecs.length > 0) { setRecommendations(mappedRecs as any); return; }
    }
    setIsProcessing(true);
    const recs = await getPersonalizedRecommendations(profile);
    storageService.saveRecommendationsCache(recs);
    const mappedRecs = recs
      .map(r => ({ dish: MENU_DATA.find(d => d.id === r.dishId)!, reason: r.reason, badge: r.badge as any }))
      .filter(r => r.dish !== undefined);
    setRecommendations(mappedRecs);
    setIsProcessing(false);
  };

  // ── Favorites ──────────────────────────────────────────────────────────────
  const handleToggleFavorite = async (dishId: string) => {
    if (!currentUser) {
      setActiveSection('auth');
      notify('Please login to save favorites!');
      return;
    }
    const updated = await storageService.toggleFavorite(dishId);
    setFavorites(updated);
  };

  // ── Profile ────────────────────────────────────────────────────────────────
  const handleSaveProfile = async (profile: UserProfile) => {
    await storageService.saveProfile(profile);
    storageService.clearRecommendationsCache();
    setUserProfile(profile);
    setIsOnboardingOpen(false);
    setActiveSection('home');
    notify('Taste profile updated! Refreshing picks...', 3000);
    loadRecommendations(profile, true);
  };

  // ── Surprise Me ───────────────────────────────────────────────────────────
  const handleSurpriseMe = async () => {
    if (!currentUser) { setActiveSection('auth'); notify('Please login for personalized surprises!'); return; }
    if (!userProfile) { setActiveSection('preferences'); notify('Please set your preferences first!'); return; }
    setIsProcessing(true);
    const picks = await getSurpriseMe(userProfile);
    setSurprisePicks(picks);
    setIsProcessing(false);
  };

  // ── Voice Search ──────────────────────────────────────────────────────────
  const handleVoiceSearch = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { notify('Voice search not supported in this browser.'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      setSearchQuery(event.results[0][0].transcript);
      setActiveSection('home');
    };
    recognition.start();
  }, []);

  const favoriteDishes = useMemo(() => MENU_DATA.filter(d => favorites.includes(d.id)), [favorites]);

  // Show a responsive, minimalist splash screen while Firebase resolves the auth state
  if (authLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#050505] z-[200] p-4">
        {/* Synchronized Expressive Emoji Container */}
        <motion.div 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex flex-col items-center mb-12"
        >
          <div className="relative flex flex-col items-center">
            <motion.span 
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="text-8xl select-none z-10"
            >
              😊
            </motion.span>
            
            <div className="flex justify-center -space-x-2 -mt-4 z-20">
              <motion.span
                animate={{ x: [-5, 2, -5], rotate: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="text-5xl"
              >
                👉
              </motion.span>
              <motion.span
                animate={{ x: [5, -2, 5], rotate: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="text-5xl"
              >
                👈
              </motion.span>
            </div>
          </div>
        </motion.div>

        {/* Notice Text (Optimized for all orientations) */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-display font-black text-slate-800 dark:text-slate-200">
            FoodieAI
          </h1>
          <p className="text-slate-400 dark:text-slate-500 font-bold animate-pulse text-sm uppercase tracking-widest">
            Syncing your account
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isDark={isDark}
        setIsDark={setIsDark}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onVoiceSearch={handleVoiceSearch}
        isListening={isListening}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 pb-20 overflow-x-hidden">
        <AnimatePresence mode="wait">
          {activeSection === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-16"
            >
              <Hero onSurpriseMe={handleSurpriseMe} isLoading={isProcessing} />

              {!currentUser && (
                <div className="glass dark:glass-dark p-8 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border border-primary-light/10">
                  <div>
                    <h3 className="text-2xl font-display font-bold mb-2">Join the Foodie Community</h3>
                    <p className="text-slate-500">Sign up to save favorites, see your history, and get personalized picks.</p>
                  </div>
                  <button
                    onClick={() => setActiveSection('auth')}
                    className="bg-primary-light text-white px-8 py-4 rounded-3xl font-bold flex items-center gap-2 shadow-lg hover:bg-primary-dark transition-all"
                  >
                    Login / Sign Up <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {userProfile && recommendations.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-light/20 p-2 rounded-xl">
                        <Sparkles className="w-6 h-6 text-primary-light" />
                      </div>
                      <h2 className="text-3xl font-display font-bold">Personalized for You</h2>
                    </div>
                    <button
                      onClick={() => loadRecommendations(userProfile, true)}
                      className="text-primary-light hover:text-primary-dark font-bold text-sm flex items-center gap-2 bg-primary-light/5 px-4 py-2 rounded-xl transition-all"
                    >
                      <Sparkles className="w-4 h-4" /> Refresh
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recommendations.map((rec, idx) => (
                      <FoodCard
                        key={idx}
                        dish={rec.dish}
                        recommendationReason={rec.reason}
                        badge={rec.badge}
                        onToggleFavorite={handleToggleFavorite}
                        onExplore={setExploredDish}
                        isFavorite={favorites.includes(rec.dish.id)}
                      />
                    ))}
                  </div>
                </section>
              )}

              <DishesSection
                dishes={MENU_DATA}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onExplore={setExploredDish}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </motion.div>
          )}

          {activeSection === 'auth' && (
            <motion.div key="auth" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="py-12">
              <AuthForm onAuthSuccess={handleAuthSuccess} />
            </motion.div>
          )}

          {activeSection === 'favorites' && currentUser && (
            <motion.div key="favorites" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="py-12">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-4xl font-display font-black">Your Favorites</h2>
                <div className="flex items-center gap-2 text-slate-500 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                  <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                  <span className="font-bold">{favoriteDishes.length} Items</span>
                </div>
              </div>
              {favoriteDishes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {favoriteDishes.map(dish => (
                    <FoodCard key={dish.id} dish={dish} onToggleFavorite={handleToggleFavorite} onExplore={setExploredDish} isFavorite={true} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center opacity-50">
                  <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-full mb-6"><Heart className="w-16 h-16 text-slate-300" /></div>
                  <h3 className="text-2xl font-display font-bold">No favorites yet</h3>
                  <p className="text-slate-500 mt-2 max-w-sm">Tap the heart icon on any dish to save it here for quick access!</p>
                  <button onClick={() => setActiveSection('home')} className="mt-8 bg-primary-light text-white px-8 py-3 rounded-2xl font-bold">Browse Menu</button>
                </div>
              )}
            </motion.div>
          )}

          {activeSection === 'preferences' && currentUser && (
            <motion.div key="preferences" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="py-12">
              <PreferencesForm initialProfile={userProfile} onSave={handleSaveProfile} />
            </motion.div>
          )}

          {activeSection === 'profile' && currentUser && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-12"
            >
              <UserProfileSection 
                currentUser={currentUser}
                profile={userProfile}
                onLogout={handleLogout}
                onEditPreferences={() => setIsOnboardingOpen(true)}
                onViewFavorites={() => setActiveSection('favorites')}
                onNotify={(msg) => notify(msg)}
              />
            </motion.div>
          )}

          {activeSection === 'partner' && currentUser && (
            <motion.div key="partner" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="py-12">
              <PartnerDashboard onBack={() => setActiveSection('home')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Surprise Me */}
      {surprisePicks.length > 0 && (
        <SurpriseMeResults picks={surprisePicks} dishes={MENU_DATA} onClose={() => setSurprisePicks([])} onToggleFavorite={handleToggleFavorite} favorites={favorites} onExplore={setExploredDish} />
      )}

      {/* Dish Details */}
      <AnimatePresence>
        {exploredDish && (
          <DishDetailsModal dish={exploredDish} onClose={() => setExploredDish(null)} onToggleFavorite={handleToggleFavorite} isFavorite={favorites.includes(exploredDish.id)} />
        )}
      </AnimatePresence>

      {/* Onboarding */}
      <AnimatePresence>
        {isOnboardingOpen && (
          <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} onSave={handleSaveProfile} initialProfile={userProfile} />
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[400] px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl shadow-2xl font-bold flex items-center gap-3 backdrop-blur-xl border border-white/20"
          >
            <div className="bg-primary-light p-1.5 rounded-full"><Sparkles className="w-4 h-4 text-white" /></div>
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-50/80 dark:bg-[#050505]/80 backdrop-blur-sm flex flex-col items-center justify-center text-center px-4"
          >
            <div className="relative">
              <Loader2 className="w-16 h-16 text-primary-light animate-spin" />
              <div className="absolute inset-0 bg-primary-light/20 blur-2xl animate-pulse" />
            </div>
            <h3 className="text-2xl font-display font-black mt-8">Foodie AI is thinking...</h3>
            <p className="text-slate-500 mt-2 font-medium max-w-xs">Searching for your perfect match.</p>
            <div className="mt-8 flex gap-2">
              <div className="w-2 h-2 bg-primary-light rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-primary-light rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-primary-light rounded-full animate-bounce" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
