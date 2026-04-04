// src/firebase/config.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKzGb5_Eglad5UBb5yM3rju29KJOCqLFQ",
  authDomain: "portfolio-3c6cc.firebaseapp.com",
  projectId: "portfolio-3c6cc",
  storageBucket: "portfolio-3c6cc.firebasestorage.app",
  messagingSenderId: "25333237749",
  appId: "1:25333237749:web:4c66ddb7ec748a8a4c82bc",
  measurementId: "G-0GF98BL5M2",
};

// ✅ Initialize Firebase App ONCE
export const app = initializeApp(firebaseConfig);

// ✅ Initialize services AFTER app
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);