// src/services/firebase.js
// Firebase init for Vite + React + Firestore (works locally and on Vercel)

import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, setLogLevel } from "firebase/firestore";
import { getAnalytics, isSupported as analyticsIsSupported } from "firebase/analytics";

// ---- Read config from Vite env (set these in .env and in Vercel Project Settings) ----
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // optional
};

// Friendly debug so you can verify the project your build is using
console.log("Using Firebase config:", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket,
});
if (!firebaseConfig.projectId) {
  console.error("❌ Missing Firebase env vars. Add VITE_FIREBASE_* to .env and Vercel.");
}

// Avoid re-init during HMR/fast refresh
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firestore (force long-polling to play nice with some networks/VPNs)
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});

// Verbose logs in dev are handy; comment out if noisy
if (import.meta.env.DEV) setLogLevel("debug");

// Optional: Google Analytics (only runs in browser and if measurementId exists)
export let analytics;
if (typeof window !== "undefined" && firebaseConfig.measurementId) {
  try {
    analyticsIsSupported().then((ok) => {
      if (ok) {
        analytics = getAnalytics(app);
      }
    });
  } catch (err) {
    console.warn("Analytics not initialized:", err?.message || err);
  }
}
