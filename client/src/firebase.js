// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "trend-tech-2-c174c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "trend-tech-2-c174c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "trend-tech-2-c174c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "616952605511",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:616952605511:web:630e57a19bef3d5b63ba62",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-6H4789T0EV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Analytics is only available in browser environments
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch {
    // Analytics optional in non-standard environments
  }
}

export { app, analytics };
