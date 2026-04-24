import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged } from 'firebase/auth';
import confetti from 'canvas-confetti';
import { auth } from './firebase';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FoodCard } from './components/FoodCard';
import { PreferencesForm } from './components/PreferencesForm';
import { OrderHistory } from './components/OrderHistory';
import { DishesSection } from './components/DishesSection';
import { AuthForm } from './components/AuthForm';
import { Cart } from './components/Cart';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTracker } from './components/OrderTracker';
import { SurpriseMeResults } from './components/SurpriseMeResults';
import { DishDetailsModal } from './components/DishDetailsModal';
import { OnboardingModal } from './components/OnboardingModal';
import { UserProfile as UserProfileSection } from './components/UserProfile';
import { storageService, DeliveryAddress, OrderStatus } from './services/storageService';
import { getPersonalizedRecommendations, getSurpriseMe } from './services/recommendationService';
import { MENU_DATA } from './constants';
import { UserProfile, Dish, Recommendation, Order, User, CartItem } from './types';
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>(storageService.getCart());
  const [totalOrdersCount, setTotalOrdersCount] = useState(storageService.getTotalOrdersCount());

  // UI state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Active order tracker
  const [activeOrder, setActiveOrder] = useState<OrderStatus | null>(storageService.getActiveOrderStatus());
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

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
        const [profile, fetchedOrders, fetchedFavs] = await Promise.all([
          storageService.getProfile(),
          storageService.getOrders(),
          storageService.getFavorites(),
        ]);
        setUserProfile(profile);
        setOrders(fetchedOrders);
        setFavorites(fetchedFavs);
        if (profile) loadRecommendations(profile);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setOrders([]);
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

  useEffect(() => {
    const saved = storageService.getActiveOrderStatus();
    if (saved && saved.status !== 'delivered') {
      setActiveOrder(saved);
      setIsTrackerOpen(true);
    }
  }, []);

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
    setCart([]);
    setIsCartOpen(false);
    setIsTrackerOpen(false);
    setActiveSection('home');
    notify('Successfully logged out.');
  };

  // ── Cart ───────────────────────────────────────────────────────────────────
  const handleAddToCart = (dish: Dish) => {
    if (!currentUser) {
      setActiveSection('auth');
      notify('Please login to add to cart!');
      return;
    }
    storageService.addToCart(dish);
    setCart(storageService.getCart());
    notify(`Added ${dish.name} to cart! 🛒`, 1500);
  };

  const handleUpdateCartQuantity = (dishId: string, delta: number) => {
    const currentCart = storageService.getCart();
    const item = currentCart.find(i => i.id === dishId);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) storageService.removeFromCart(dishId);
      else storageService.saveCart(currentCart);
      setCart(storageService.getCart());
    }
  };

  const handleRemoveFromCart = (dishId: string) => {
    storageService.removeFromCart(dishId);
    setCart(storageService.getCart());
  };

  // ── Checkout ───────────────────────────────────────────────────────────────
  const handleOpenCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleConfirmOrder = async (address: DeliveryAddress, _paymentMethod: string) => {
    const currentCart = storageService.getCart();
    if (currentCart.length === 0) return;

    setIsPlacingOrder(true);
    await storageService.saveAddress(address);

    await new Promise(resolve => setTimeout(resolve, 1800));

    const dishNames: string[] = [];
    let totalAmount = 0;
    for (const item of currentCart) {
      const newOrder: Order = {
        id: Math.random().toString(36).substr(2, 9),
        dishId: item.id,
        dishName: item.dish.name,
        price: item.dish.price,
        timestamp: Date.now(),
      };
      await storageService.addOrder(newOrder);
      dishNames.push(`${item.dish.name} × ${item.quantity}`);
      totalAmount += item.dish.price * item.quantity;
    }

    const deliveryFee = 56;
    const platformFee = 9;
    const gst = Math.round(totalAmount * 0.05);
    const restaurantCharges = 15;
    totalAmount += deliveryFee + platformFee + gst + restaurantCharges;

    const estimatedMinutes = Math.floor(Math.random() * 15) + 25;
    const orderStatus: OrderStatus = {
      orderId: Math.random().toString(36).substr(2, 9),
      dishNames,
      totalAmount,
      status: 'confirmed',
      placedAt: Date.now(),
      estimatedMinutes,
      address,
    };

    storageService.setActiveOrderStatus(orderStatus);
    storageService.clearCart();
    setCart([]);
    // Refresh orders from Firestore
    const updatedOrders = await storageService.getOrders();
    setOrders(updatedOrders);
    setTotalOrdersCount(storageService.getTotalOrdersCount());
    setIsPlacingOrder(false);
    setIsCheckoutOpen(false);

    confetti({
      particleCount: 180,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#FF6B35', '#6C63FF', '#FFBD00', '#34D399'],
    });

    setActiveOrder(orderStatus);
    setIsTrackerOpen(true);
  };

  const handleOrderStatusChange = (newStatus: OrderStatus['status']) => {
    storageService.updateActiveOrderStatus(newStatus);
    const updated = storageService.getActiveOrderStatus();
    setActiveOrder(updated);
    if (newStatus === 'delivered') {
      notify('Your order has been delivered! Enjoy 🎉', 5000);
    }
  };

  const handleCloseTracker = () => {
    setIsTrackerOpen(false);
    if (activeOrder?.status === 'delivered') {
      storageService.clearActiveOrderStatus();
      setActiveOrder(null);
    }
  };

  const handleCancelOrder = () => {
    storageService.clearActiveOrderStatus();
    setActiveOrder(null);
    setIsTrackerOpen(false);
    notify('Order cancelled. Refund will be processed in 2–5 business days. 💸', 5000);
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

  // ── Checkout bill ─────────────────────────────────────────────────────────
  const cartBill = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
    const deliveryFee = cart.length > 0 ? 56 : 0;
    const platformFee = cart.length > 0 ? 9 : 0;
    const gst = cart.length > 0 ? Math.round(subtotal * 0.05) : 0;
    const restaurantCharges = cart.length > 0 ? 15 : 0;
    const total = subtotal + deliveryFee + platformFee + gst + restaurantCharges;
    return { subtotal, deliveryFee, platformFee, gst, restaurantCharges, total };
  }, [cart]);

  const favoriteDishes = useMemo(() => MENU_DATA.filter(d => favorites.includes(d.id)), [favorites]);

  // ── Checkout saved address (async load) ───────────────────────────────────
  const [savedAddress, setSavedAddress] = useState<DeliveryAddress | null>(null);
  useEffect(() => {
    if (isCheckoutOpen && currentUser) {
      storageService.getSavedAddress().then(setSavedAddress);
    }
  }, [isCheckoutOpen, currentUser]);

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
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        activeOrderStatus={activeOrder?.status}
        onOpenTracker={() => setIsTrackerOpen(true)}
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
              <Hero onSurpriseMe={handleSurpriseMe} isLoading={isProcessing} totalOrdersCount={totalOrdersCount} />

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
                    <FoodCard key={dish.id} dish={dish} onOrder={handleAddToCart} onToggleFavorite={handleToggleFavorite} onExplore={setExploredDish} isFavorite={true} />
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

          {activeSection === 'history' && currentUser && (
            <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="py-12">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-4xl font-display font-black">Order History</h2>
                {orders.length > 0 && (
                  <button
                    onClick={async () => { await storageService.clearHistory(); setOrders([]); }}
                    className="flex items-center gap-2 text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all font-bold"
                  >
                    <Trash2 className="w-4 h-4" /> Clear History
                  </button>
                )}
              </div>
              <OrderHistory orders={orders} dishes={MENU_DATA} onReorder={handleAddToCart} onExplore={setExploredDish} />
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
                onViewHistory={() => setActiveSection('history')}
                onNotify={(msg) => notify(msg)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Surprise Me */}
      {surprisePicks.length > 0 && (
        <SurpriseMeResults picks={surprisePicks} dishes={MENU_DATA} onClose={() => setSurprisePicks([])} onOrder={handleAddToCart} onToggleFavorite={handleToggleFavorite} favorites={favorites} onExplore={setExploredDish} />
      )}

      {/* Dish Details */}
      <AnimatePresence>
        {exploredDish && (
          <DishDetailsModal dish={exploredDish} onClose={() => setExploredDish(null)} onOrder={dish => { handleAddToCart(dish); setExploredDish(null); }} onToggleFavorite={handleToggleFavorite} isFavorite={favorites.includes(exploredDish.id)} />
        )}
      </AnimatePresence>

      {/* Onboarding */}
      <AnimatePresence>
        {isOnboardingOpen && (
          <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} onSave={handleSaveProfile} initialProfile={userProfile} />
        )}
      </AnimatePresence>

      {/* Cart */}
      <AnimatePresence>
        {isCartOpen && (
          <Cart items={cart} onClose={() => setIsCartOpen(false)} onUpdateQuantity={handleUpdateCartQuantity} onRemoveItem={handleRemoveFromCart} onCheckout={handleOpenCheckout} isProcessing={isPlacingOrder} />
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <CheckoutModal
            items={cart}
            subtotal={cartBill.subtotal}
            deliveryFee={cartBill.deliveryFee}
            gst={cartBill.gst}
            platformFee={cartBill.platformFee}
            total={cartBill.total}
            savedAddress={savedAddress}
            onClose={() => setIsCheckoutOpen(false)}
            onConfirmOrder={handleConfirmOrder}
            isProcessing={isPlacingOrder}
          />
        )}
      </AnimatePresence>

      {/* Order Tracker */}
      <AnimatePresence>
        {isTrackerOpen && activeOrder && (
          <OrderTracker order={activeOrder} onClose={handleCloseTracker} onStatusChange={handleOrderStatusChange} onCancel={handleCancelOrder} />
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
