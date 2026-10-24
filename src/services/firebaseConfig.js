import { initializeApp, getApps } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  writeBatch 
} from "firebase/firestore";

// User's Firebase Project Configuration
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyB9SeiQSQRk4RNBsxeQZaIlXZqqpwWWrTU",
  authDomain: "quiz-jose-92227.firebaseapp.com",
  projectId: "quiz-jose-92227",
  storageBucket: "quiz-jose-92227.firebasestorage.app",
  messagingSenderId: "706893820702",
  appId: "1:706893820702:web:68811ae054ff24de73cf0f",
  measurementId: "G-EYQ6V2BVYS"
};

const STORAGE_KEY = "quiz_firebase_config";

export function getSavedFirebaseConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.apiKey) return parsed;
    }
  } catch (e) {
    console.error("Error loading saved firebase config", e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.location.reload();
    return true;
  } catch (e) {
    console.error("Error saving firebase config", e);
    return false;
  }
}

let app = null;
let db = null;
let isFirebaseActive = false;

export function initFirebase() {
  const config = getSavedFirebaseConfig();
  if (config && config.projectId && config.apiKey) {
    try {
      if (!getApps().length) {
        app = initializeApp(config);
      } else {
        app = getApps()[0];
      }
      db = getFirestore(app);
      isFirebaseActive = true;
      console.log("Firebase Firestore connected successfully for project:", config.projectId);
      return { app, db, isFirebaseActive: true };
    } catch (err) {
      console.warn("Firebase initialization warning (falling back to offline multi-tab sync):", err);
      isFirebaseActive = false;
    }
  }
  return { app: null, db: null, isFirebaseActive: false };
}

const initResult = initFirebase();
app = initResult.app;
db = initResult.db;
isFirebaseActive = initResult.isFirebaseActive;

export { app, db, isFirebaseActive };
