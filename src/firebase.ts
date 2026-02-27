import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Helper to get environment variables from any possible source
const getEnv = (key: string): string => {
  // @ts-ignore
  return import.meta.env[key] || (typeof process !== 'undefined' ? process.env[key] : '') || '';
};

const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("VITE_FIREBASE_APP_ID"),
};

// Check for missing keys and log a helpful error
const missingKeys = Object.entries(firebaseConfig)
  .filter(([_, value]) => !value || value === "" || value === "undefined")
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.error(`Firebase configuration is incomplete. Missing keys: ${missingKeys.join(", ")}.`);
  console.error("If you are on Vercel, ensure variables start with VITE_ and you have REDEPLOYED.");
} else {
  // Safe debug log: only shows first 4 chars
  console.log("Firebase config detected. API Key starts with:", firebaseConfig.apiKey?.substring(0, 4));
}

// Only initialize if we have a valid-looking key
const isKeyValid = firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith("AIza");
const dummyConfig = { apiKey: "MISSING", authDomain: "MISSING", projectId: "MISSING" };
const app = initializeApp(isKeyValid ? firebaseConfig : dummyConfig);
export const auth = getAuth(app);
