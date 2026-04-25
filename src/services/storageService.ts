import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithPopup,
  UserCredential,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";
import { UserProfile, User, Dish } from "../types";

// ── Local-only keys (ephemeral / session data) ──────────────────────────────
const RECS_CACHE_KEY = "foodie_recs_cache";
const THEME_KEY = "foodie_theme";

// ── Helper: map Firebase user → our User type ─────────────────────────────
function toAppUser(fbUser: { uid: string; email: string | null; displayName: string | null }): User {
  return {
    id: fbUser.uid,
    email: fbUser.email ?? "",
    name: fbUser.displayName ?? "Foodie User",
  };
}

export interface DeliveryAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  pincode: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// storageService
// ─────────────────────────────────────────────────────────────────────────────
export const storageService = {
  // ── Auth ─────────────────────────────────────────────────────────────────

  getCurrentUser(): User | null {
    const fbUser = auth.currentUser;
    return fbUser ? toAppUser(fbUser) : null;
  },

  async login(email: string, password: string): Promise<{ user: User } | { error: string }> {
    try {
      const cred: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: toAppUser(cred.user) };
    } catch (err: any) {
      return { error: err?.code ?? 'auth/unknown' };
    }
  },

  async signup(name: string, email: string, password: string): Promise<{ user: User } | { error: string }> {
    try {
      const cred: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        email,
        createdAt: serverTimestamp(),
        favorites: [],
        address: null,
      });
      return { user: toAppUser({ ...cred.user, displayName: name }) };
    } catch (err: any) {
      return { error: err?.code ?? 'auth/unknown' };
    }
  },

  async loginWithGoogle(): Promise<{ user: User } | { error: string }> {
    try {
      const cred: UserCredential = await signInWithPopup(auth, googleProvider);
      const fbUser = cred.user;
      const userRef = doc(db, "users", fbUser.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          name: fbUser.displayName ?? "Foodie User",
          email: fbUser.email ?? "",
          createdAt: serverTimestamp(),
          favorites: [],
          address: null,
        });
      }
      return { user: toAppUser(fbUser) };
    } catch (err: any) {
      return { error: err?.code ?? 'auth/unknown' };
    }
  },

  async updateUserName(newName: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await updateProfile(user, { displayName: newName });
      await updateDoc(doc(db, "users", user.uid), { name: newName });
    } catch (err) {
      console.error("Error updating name:", err);
      throw err;
    }
  },

  async logout(): Promise<void> {
    await signOut(auth);
    localStorage.removeItem(RECS_CACHE_KEY);
  },

  // ── Firestore: Profile ───────────────────────────────────────────────────

  async getProfile(): Promise<UserProfile | null> {
    const uid = auth.currentUser?.uid;
    if (!uid) return null;
    try {
      const snap = await getDoc(doc(db, "users", uid));
      const data = snap.data();
      return data?.profile ?? null;
    } catch {
      return null;
    }
  },

  async saveProfile(profile: UserProfile): Promise<void> {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await updateDoc(doc(db, "users", uid), { profile });
  },

  // ── Firestore: Address ───────────────────────────────────────────────────

  async getSavedAddress(): Promise<DeliveryAddress | null> {
    const uid = auth.currentUser?.uid;
    if (!uid) return null;
    try {
      const snap = await getDoc(doc(db, "users", uid));
      return snap.data()?.address ?? null;
    } catch {
      return null;
    }
  },

  async saveAddress(address: DeliveryAddress): Promise<void> {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await updateDoc(doc(db, "users", uid), { address });
  },

  // ── Firestore: Favorites ─────────────────────────────────────────────────

  async getFavorites(): Promise<string[]> {
    const uid = auth.currentUser?.uid;
    if (!uid) return [];
    try {
      const snap = await getDoc(doc(db, "users", uid));
      return snap.data()?.favorites ?? [];
    } catch {
      return [];
    }
  },

  async toggleFavorite(dishId: string): Promise<string[]> {
    const uid = auth.currentUser?.uid;
    if (!uid) return [];
    const favorites = await this.getFavorites();
    const idx = favorites.indexOf(dishId);
    if (idx === -1) favorites.push(dishId);
    else favorites.splice(idx, 1);
    await updateDoc(doc(db, "users", uid), { favorites });
    return favorites;
  },

  // ── localStorage: Recommendations Cache (session) ─────────────────────────

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

  // ── localStorage: Theme ───────────────────────────────────────────────────
  getTheme(): "dark" | "light" | null {
    return (localStorage.getItem(THEME_KEY) as "dark" | "light") ?? null;
  },
  saveTheme(theme: "dark" | "light"): void {
    localStorage.setItem(THEME_KEY, theme);
  },

  // ── Geolocation ──────────────────────────────────────────────────────────
  async reverseGeocode(lat: number, lon: number): Promise<Partial<DeliveryAddress>> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
      );
      const data = await response.json();
      const addr = data.address;

      return {
        street: addr.road || addr.suburb || addr.neighbourhood || "",
        city: addr.city || addr.town || addr.village || addr.state_district || "",
        pincode: addr.postcode || "",
      };
    } catch (err) {
      console.error("Reverse geocode failed:", err);
      return {};
    }
  },
};
