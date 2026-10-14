// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCsk8CR26kKwiyTjqkEaXVwM7Nh4IO2E0Y",
  authDomain: "trend-tech-2-c174c.firebaseapp.com",
  projectId: "trend-tech-2-c174c",
  storageBucket: "trend-tech-2-c174c.firebasestorage.app",
  messagingSenderId: "616952605511",
  appId: "1:616952605511:web:630e57a19bef3d5b63ba62",
  measurementId: "G-6H4789T0EV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Analytics is only available in browser environments
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, analytics };
