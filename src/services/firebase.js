// src/services/firebase.js
// Single source of truth for Firebase initialization (Vite + React)

console.log("Using Firebase config:", {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
});
if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) {
  console.error("❌ Firebase env vars missing at build time.");
}


import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeFirestore,
  setLogLevel,
} from "firebase/firestore";

// --- ENV CONFIG (Vite requires VITE_ prefixes) ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Log once so you can verify you’re pointing at the right project
// (Remove this line if you don’t want console output.)
console.log("Using Firebase config:", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
});

// Avoid re-initializing during hot reloads
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Force long-polling to avoid VPN/Ad-block/corporate proxy issues.
// Harmless on normal networks.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});

// Verbose Firestore logs in the console (helpful while debugging)
// Comment this out when you’re done.
setLogLevel("debug");
