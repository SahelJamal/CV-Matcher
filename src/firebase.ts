import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Check for missing keys and log a helpful error
const missingKeys = Object.entries(firebaseConfig)
  .filter(([_, value]) => !value || value === "")
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.error(`Firebase configuration is incomplete. Missing keys: ${missingKeys.join(", ")}.`);
  console.error("IMPORTANT: If you just added these variables to Vercel, you MUST trigger a NEW DEPLOYMENT (Redeploy) for them to take effect.");
}

// Only initialize if we have at least an API key to avoid the "invalid-api-key" crash
const app = initializeApp(firebaseConfig.apiKey ? firebaseConfig : { apiKey: "REQUIRED_KEY_MISSING" });
export const auth = getAuth(app);
