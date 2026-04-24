import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA5S26jWAQ5HbBT68t8wKXs-q0fNtynxeo",
  authDomain: "foodieai-3222e.firebaseapp.com",
  projectId: "foodieai-3222e",
  storageBucket: "foodieai-3222e.firebasestorage.app",
  messagingSenderId: "180156041664",
  appId: "1:180156041664:web:fe20da82fb219b89b1a025",
  measurementId: "G-1V0HZ91MJQ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
