// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZd1eAzmfReRJfbQeQGupjXB0nfFWHOi4",
  authDomain: "prodiny-b31b9.firebaseapp.com",
  projectId: "prodiny-b31b9",
  storageBucket: "prodiny-b31b9.firebasestorage.app",
  messagingSenderId: "221067696458",
  appId: "1:221067696458:web:d2571feb9684da2ed709b3",
  measurementId: "G-S497M26R3C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;
