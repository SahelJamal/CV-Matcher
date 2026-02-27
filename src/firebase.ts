import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check for missing keys and log a helpful error
const missingKeys = Object.entries(firebaseConfig)
  .filter(([_, value]) => !value || value === "")
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.error(`Firebase configuration is incomplete. Missing keys: ${missingKeys.join(", ")}. 
  Please ensure these are set in your environment variables (e.g. Vercel Dashboard) and that you have REDEPLOYED.`);
}

// Only initialize if we have at least an API key to avoid the "invalid-api-key" crash
const app = initializeApp(firebaseConfig.apiKey ? firebaseConfig : { apiKey: "REQUIRED_KEY_MISSING" });
export const auth = getAuth(app);
