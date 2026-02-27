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

// Safety check to prevent Firebase from crashing with "invalid-api-key"
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.apiKey !== "";

if (!isConfigValid) {
  console.warn("Firebase configuration is missing. Authentication will not work until environment variables are set and the app is redeployed.");
}

const app = initializeApp(isConfigValid ? firebaseConfig : { apiKey: "placeholder" });
export const auth = getAuth(app);
