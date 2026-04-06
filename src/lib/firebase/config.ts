import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBG8dgJM1Ez_G6IWcxyLqAGTgdw1N8DyjQ",
  authDomain: "the-isaander-reader-db.firebaseapp.com",
  projectId: "the-isaander-reader-db",
  storageBucket: "the-isaander-reader-db.firebasestorage.app",
  messagingSenderId: "835859954104",
  appId: "1:835859954104:web:7f8b8777ce76740793f74d",
  measurementId: "G-Q0TQF6J6E3"
};

// Initialize Firebase (check if already initialized to prevent SSR errors)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };