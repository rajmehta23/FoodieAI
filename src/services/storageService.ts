import { UserProfile, Order, User, CartItem, Dish } from "../types";

const PROFILE_KEY = "foodie_profile";
const ORDERS_KEY = "foodie_orders";
const FAVORITES_KEY = "foodie_favorites";
const USERS_KEY = "foodie_users";
const CURRENT_USER_KEY = "foodie_current_user";
const RECS_CACHE_KEY = "foodie_recs_cache";
const CART_KEY = "foodie_cart";

export const storageService = {
  // Auth
  getUsers(): any[] {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getCurrentUser(): User | null {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  login(email: string): User | null {
    const users = this.getUsers();
    const user = users.find(u => u.email === email);
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  },

  signup(name: string, email: string): User {
    const users = this.getUsers();
    const newUser = { id: Math.random().toString(36).substr(2, 9), name, email };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // Cart
  getCart(): CartItem[] {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveCart(cart: CartItem[]): void {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  },

  addToCart(dish: Dish): void {
    const cart = this.getCart();
    const existing = cart.find(item => item.id === dish.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id: dish.id, dish, quantity: 1 });
    }
    this.saveCart(cart);
  },

  removeFromCart(dishId: string): void {
    let cart = this.getCart();
    cart = cart.filter(item => item.id !== dishId);
    this.saveCart(cart);
  },

  clearCart(): void {
    localStorage.removeItem(CART_KEY);
  },

  // Recommendations Cache
  getRecommendationsCache(): { dishId: string; reason: string; badge: string }[] | null {
    const data = localStorage.getItem(RECS_CACHE_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveRecommendationsCache(recs: { dishId: string; reason: string; badge: string }[]): void {
    localStorage.setItem(RECS_CACHE_KEY, JSON.stringify(recs));
  },

  clearRecommendationsCache(): void {
    localStorage.removeItem(RECS_CACHE_KEY);
  },

  getProfile(): UserProfile | null {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  },

  getOrders(): Order[] {
    const data = localStorage.getItem(ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  addOrder(order: Order): void {
    const orders = this.getOrders();
    orders.unshift(order); // Newest first
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  },

  getFavorites(): string[] {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  },

  toggleFavorite(dishId: string): void {
    const favorites = this.getFavorites();
    const index = favorites.indexOf(dishId);
    if (index === -1) {
      favorites.push(dishId);
    } else {
      favorites.splice(index, 1);
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  },

  clearHistory(): void {
    localStorage.removeItem(ORDERS_KEY);
  }
};

