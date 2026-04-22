import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FoodCard } from './components/FoodCard';
import { PreferencesForm } from './components/PreferencesForm';
import { OrderHistory } from './components/OrderHistory';
import { DishesSection } from './components/DishesSection';
import { AuthForm } from './components/AuthForm';
import { Cart } from './components/Cart';
import { SurpriseMeResults } from './components/SurpriseMeResults';
import { DishDetailsModal } from './components/DishDetailsModal';
import { storageService } from './services/storageService';
import { getPersonalizedRecommendations, getSurpriseMe } from './services/geminiService';
import { MENU_DATA } from './constants';
import { UserProfile, Dish, Recommendation, Order, DietaryPreference, Cuisine, SpiceLevel, User, CartItem } from './types';
import { Sparkles, ShoppingBag, ArrowRight, Loader2, Search, Filter, Trash2, Heart, User as UserIcon } from 'lucide-react';

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('foodie_theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [activeSection, setActiveSection] = useState('home');
  const [currentUser, setCurrentUser] = useState<User | null>(storageService.getCurrentUser());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(storageService.getProfile());
  const [orders, setOrders] = useState<Order[]>(storageService.getOrders());
  const [favorites, setFavorites] = useState<string[]>(storageService.getFavorites());
  const [cart, setCart] = useState<CartItem[]>(storageService.getCart());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [surprisePicks, setSurprisePicks] = useState<{ dishId: string; reason: string }[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [exploredDish, setExploredDish] = useState<Dish | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showNotification, setShowNotification] = useState<{ show: boolean, message: string }>({ show: false, message: '' });

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('foodie_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    if (userProfile) {
      loadRecommendations(userProfile);
    }
  }, [userProfile]);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    const profile = storageService.getProfile();
    setUserProfile(profile);
    
    if (!profile) {
      setActiveSection('preferences');
      setShowNotification({ show: true, message: `Welcome ${user.name}! Let's set your preferences.` });
    } else {
      setActiveSection('home');
      setShowNotification({ show: true, message: `Welcome back, ${user.name}! 👋` });
    }
    setTimeout(() => setShowNotification({ show: false, message: '' }), 3000);
  };

  const handleLogout = () => {
    storageService.logout();
    setCurrentUser(null);
    setCart([]);
    setIsCartOpen(false);
    setActiveSection('home');
    setShowNotification({ show: true, message: 'Successfully logged out.' });
    setTimeout(() => setShowNotification({ show: false, message: '' }), 3000);
  };

  const handleAddToCart = (dish: Dish) => {
    if (!currentUser) {
      setActiveSection('auth');
      setShowNotification({ show: true, message: 'Please login to add to cart!' });
      setTimeout(() => setShowNotification({ show: false, message: '' }), 3000);
      return;
    }
    storageService.addToCart(dish);
    setCart(storageService.getCart());
    setShowNotification({ show: true, message: `Added ${dish.name} to cart!` });
    setTimeout(() => setShowNotification({ show: false, message: '' }), 1500);
  };

  const handleUpdateCartQuantity = (dishId: string, delta: number) => {
    const currentCart = storageService.getCart();
    const item = currentCart.find(i => i.id === dishId);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        storageService.removeFromCart(dishId);
      } else {
        storageService.saveCart(currentCart);
      }
      setCart(storageService.getCart());
    }
  };

  const handleRemoveFromCart = (dishId: string) => {
    storageService.removeFromCart(dishId);
    setCart(storageService.getCart());
  };

  const handleCheckout = async () => {
    const currentCart = storageService.getCart();
    if (currentCart.length === 0) return;

    setIsPlacingOrder(true);
    // Simulate secure payment & restaurant confirmation
    await new Promise(resolve => setTimeout(resolve, 2000));

    currentCart.forEach(item => {
      const newOrder: Order = {
        id: Math.random().toString(36).substr(2, 9),
        dishId: item.id,
        dishName: item.dish.name,
        price: item.dish.price,
        timestamp: Date.now()
      };
      storageService.addOrder(newOrder);
    });

    storageService.clearCart();
    setCart([]);
    setOrders(storageService.getOrders());
    setIsCartOpen(false);
    setIsPlacingOrder(false);
    
    // Fun confetti on checkout
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF6B35', '#6C63FF', '#FFBD00']
    });

    setShowNotification({ show: true, message: 'Order Confirmed! 🛵 Delivering in 35 mins' });
    setTimeout(() => setShowNotification({ show: false, message: '' }), 5000);
  };

  const loadRecommendations = async (profile: UserProfile, forceRefresh = false) => {
    // Try to load from cache first
    const cached = storageService.getRecommendationsCache();
    if (cached && !forceRefresh) {
      const mappedRecs = cached.map(r => ({
        dish: MENU_DATA.find(d => d.id === r.dishId)!,
        reason: r.reason,
        badge: r.badge as any
      })).filter(r => r.dish !== undefined);
      
      if (mappedRecs.length > 0) {
        setRecommendations(mappedRecs as any);
        return;
      }
    }

    setIsAiLoading(true);
    const recs = await getPersonalizedRecommendations(profile);
    storageService.saveRecommendationsCache(recs);
    
    const mappedRecs = recs.map(r => ({
      dish: MENU_DATA.find(d => d.id === r.dishId)!,
      reason: r.reason,
      badge: r.badge as any
    })).filter(r => r.dish !== undefined);
    
    setRecommendations(mappedRecs);
    setIsAiLoading(false);
  };

  const handleOrder = (dish: Dish) => {
    if (!currentUser) {
      setActiveSection('auth');
      setShowNotification({ show: true, message: 'Please login to place an order!' });
      setTimeout(() => setShowNotification({ show: false, message: '' }), 3000);
      return;
    }
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      dishId: dish.id,
      dishName: dish.name,
      price: dish.price,
      timestamp: Date.now()
    };
    storageService.addOrder(newOrder);
    const updatedOrders = storageService.getOrders();
    setOrders(updatedOrders);
    
    // Fun confetti on order
    if (updatedOrders.length === 1) {
       confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF6B35', '#6C63FF', '#FFBD00']
       });
    } else {
       confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#FF6B35', '#6C63FF']
       });
    }

    setShowNotification({ show: true, message: `Successfully ordered ${dish.name}! 🚀` });
    setTimeout(() => setShowNotification({ show: false, message: '' }), 3000);
  };

  const handleToggleFavorite = (dishId: string) => {
    if (!currentUser) {
      setActiveSection('auth');
      setShowNotification({ show: true, message: 'Please login to save favorites!' });
      setTimeout(() => setShowNotification({ show: false, message: '' }), 3000);
      return;
    }
    storageService.toggleFavorite(dishId);
    setFavorites(storageService.getFavorites());
  };

  const handleSurpriseMe = async () => {
    if (!currentUser) {
      setActiveSection('auth');
      setShowNotification({ show: true, message: 'Please login for personalized surprises!' });
      setTimeout(() => setShowNotification({ show: false, message: '' }), 3000);
      return;
    }
    if (!userProfile) {
      setActiveSection('preferences');
      setShowNotification({ show: true, message: 'Please set your preferences first!' });
      setTimeout(() => setShowNotification({ show: false, message: '' }), 3000);
      return;
    }
    setIsAiLoading(true);
    const picks = await getSurpriseMe(userProfile);
    setSurprisePicks(picks);
    setIsAiLoading(false);
  };

  const handleVoiceSearch = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setShowNotification({ show: true, message: 'Voice search not supported in this browser.' });
      setTimeout(() => setShowNotification({ show: false, message: '' }), 3000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setActiveSection('home');
    };

    recognition.start();
  }, []);

  const favoriteDishes = useMemo(() => {
    return MENU_DATA.filter(d => favorites.includes(d.id));
  }, [favorites]);

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
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
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
              <Hero onSurpriseMe={handleSurpriseMe} isLoading={isAiLoading} />

              {!currentUser && (
                <div className="glass dark:glass-dark p-8 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border border-primary-light/10">
                  <div>
                    <h3 className="text-2xl font-display font-bold mb-2">Join the Foodie Community</h3>
                    <p className="text-slate-500">Sign up to save favorites, see your history, and get personalized picks.</p>
                  </div>
                  <button 
                    onClick={() => setActiveSection('auth')}
                    className="bg-primary-light text-white px-8 py-4 rounded-3xl font-bold flex items-center gap-2"
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
                      <Sparkles className="w-4 h-4" /> Refresh Suggestions
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recommendations.map((rec, idx) => (
                      <FoodCard 
                        key={idx} 
                        dish={rec.dish} 
                        recommendationReason={rec.reason} 
                        badge={rec.badge}
                        onOrder={handleAddToCart}
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
                onOrder={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                onExplore={setExploredDish}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </motion.div>
          )}

          {activeSection === 'auth' && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-12"
            >
              <AuthForm onAuthSuccess={handleAuthSuccess} />
            </motion.div>
          )}

          {activeSection === 'favorites' && currentUser && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-12"
            >
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-4xl font-display font-black">Your Favorites</h2>
                <div className="flex items-center gap-2 text-slate-500 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                  <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                  <span className="font-bold">{favoriteDishes.length} Items</span>
                </div>
              </div>
              
              {favoriteDishes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {favoriteDishes.map((dish) => (
                    <FoodCard 
                      key={dish.id} 
                      dish={dish} 
                      onOrder={handleAddToCart} 
                      onToggleFavorite={handleToggleFavorite}
                      onExplore={setExploredDish}
                      isFavorite={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center opacity-50">
                  <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-full mb-6">
                    <Heart className="w-16 h-16 text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-display font-bold">No favorites yet</h3>
                  <p className="text-slate-500 mt-2 max-w-sm">Tap the heart icon on any dish to save it here for quick access!</p>
                  <button 
                    onClick={() => setActiveSection('home')}
                    className="mt-8 bg-primary-light text-white px-8 py-3 rounded-2xl font-bold"
                  >
                    Browse Menu
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeSection === 'preferences' && currentUser && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-12"
            >
              <PreferencesForm 
                initialProfile={userProfile} 
                onSave={(p) => {
                  storageService.saveProfile(p);
                  storageService.clearRecommendationsCache();
                  setUserProfile(p);
                  setActiveSection('home');
                  setShowNotification({ show: true, message: 'Taste profile updated!' });
                  setTimeout(() => setShowNotification({ show: false, message: '' }), 3000);
                }} 
              />
            </motion.div>
          )}

          {activeSection === 'history' && currentUser && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-12"
            >
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-4xl font-display font-black">Order History</h2>
                <button 
                  onClick={() => { storageService.clearHistory(); setOrders([]); }}
                  className="flex items-center gap-2 text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all font-bold"
                >
                  <Trash2 className="w-4 h-4" /> Clear History
                </button>
              </div>
              <OrderHistory 
                orders={orders} 
                dishes={MENU_DATA} 
                onReorder={handleAddToCart} 
                onExplore={setExploredDish}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Surprise Modal */}
      {surprisePicks.length > 0 && (
        <SurpriseMeResults 
          picks={surprisePicks} 
          dishes={MENU_DATA} 
          onClose={() => setSurprisePicks([])}
          onOrder={handleAddToCart}
          onToggleFavorite={handleToggleFavorite}
          favorites={favorites}
          onExplore={setExploredDish}
        />
      )}

      {/* Dish Details Modal */}
      <AnimatePresence>
        {exploredDish && (
          <DishDetailsModal 
            dish={exploredDish}
            onClose={() => setExploredDish(null)}
            onOrder={(dish) => {
              handleAddToCart(dish);
              setExploredDish(null);
            }}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={favorites.includes(exploredDish.id)}
          />
        )}
      </AnimatePresence>

      {/* Cart Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <Cart 
            items={cart}
            onClose={() => setIsCartOpen(false)}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveFromCart}
            onCheckout={handleCheckout}
            isProcessing={isPlacingOrder}
          />
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {showNotification.show && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl shadow-2xl font-bold flex items-center gap-3 backdrop-blur-xl border border-white/20"
          >
            <div className="bg-primary-light p-1.5 rounded-full">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            {showNotification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Screen */}
      <AnimatePresence>
        {isAiLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-50/80 dark:bg-[#050505]/80 backdrop-blur-sm flex flex-col items-center justify-center text-center px-4"
          >
            <div className="relative">
              <Loader2 className="w-16 h-16 text-primary-light animate-spin" />
              <div className="absolute inset-0 bg-primary-light/20 blur-2xl animate-pulse" />
            </div>
            <h3 className="text-2xl font-display font-black mt-8">Foodie is thinking...</h3>
            <p className="text-slate-500 mt-2 font-medium max-w-xs">We are analyzing thousands of flavor combinations to find your perfect match.</p>
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


