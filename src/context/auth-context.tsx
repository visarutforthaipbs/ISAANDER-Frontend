"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

type FbModules = {
  auth: import("firebase/auth").Auth;
  googleProvider: import("firebase/auth").GoogleAuthProvider;
  db: import("firebase/firestore").Firestore;
  onAuthStateChanged: typeof import("firebase/auth").onAuthStateChanged;
  signInWithPopup: typeof import("firebase/auth").signInWithPopup;
  firebaseSignOut: typeof import("firebase/auth").signOut;
  doc: typeof import("firebase/firestore").doc;
  getDoc: typeof import("firebase/firestore").getDoc;
  setDoc: typeof import("firebase/firestore").setDoc;
  serverTimestamp: typeof import("firebase/firestore").serverTimestamp;
};

// Dynamic imports — Firebase modules are NOT in the initial JS bundle.
// They load asynchronously on mount, saving ~200 KiB from the critical path.
async function loadFirebaseModules(): Promise<FbModules> {
  const [configModule, authModule, firestoreModule] = await Promise.all([
    import("@/lib/firebase/config"),
    import("firebase/auth"),
    import("firebase/firestore"),
  ]);
  return {
    auth: configModule.auth,
    googleProvider: configModule.googleProvider,
    db: configModule.db,
    onAuthStateChanged: authModule.onAuthStateChanged,
    signInWithPopup: authModule.signInWithPopup,
    firebaseSignOut: authModule.signOut,
    doc: firestoreModule.doc,
    getDoc: firestoreModule.getDoc,
    setDoc: firestoreModule.setDoc,
    serverTimestamp: firestoreModule.serverTimestamp,
  };
}

// Our custom User type combined with Firebase User
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  profileComplete: boolean;
  role: "reader" | "writer";
  bio?: string;
  phone?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => void;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: () => {},
  logOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  // Holds the loaded Firebase modules so signInWithGoogle can call
  // signInWithPopup SYNCHRONOUSLY inside the click handler — no await
  // before it — which is required for browsers to treat it as a user gesture.
  const fbRef = useRef<FbModules | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Safety timeout: if Firebase never responds within 6s, unblock the UI
    const timeout = setTimeout(() => setLoading(false), 6000);

    loadFirebaseModules()
      .then((fb) => {
        // Cache for synchronous use in signInWithGoogle
        fbRef.current = fb;

        unsubscribe = fb.onAuthStateChanged(fb.auth, async (firebaseUser) => {
          clearTimeout(timeout);
          if (firebaseUser) {
            // Build a minimal profile from Firebase Auth as a guaranteed fallback
            const fallbackProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              profileComplete: false,
              role: "reader",
            };

            try {
              const userRef = fb.doc(fb.db, "users", firebaseUser.uid);
              const userSnap = await fb.getDoc(userRef);

              if (userSnap.exists()) {
                setUser(userSnap.data() as UserProfile);
              } else {
                await fb.setDoc(userRef, {
                  ...fallbackProfile,
                  createdAt: fb.serverTimestamp(),
                });
                setUser(fallbackProfile);
              }
            } catch {
              // Firestore unavailable or permission denied — still sign the user in
              // using data from Firebase Auth so the UI is never stuck loading
              setUser(fallbackProfile);
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      })
      .catch(() => {
        clearTimeout(timeout);
        setLoading(false);
      });

    return () => {
      clearTimeout(timeout);
      unsubscribe?.();
    };
  }, []);

  // NOTE: This must NOT be async and must NOT await anything before calling
  // signInWithPopup. Browsers only allow popups to open synchronously within
  // a user-gesture handler. Any await (even a resolved one) can break this.
  const signInWithGoogle = useCallback(() => {
    const fb = fbRef.current;
    if (!fb) return; // Modules still loading — button should be disabled
    fb.signInWithPopup(fb.auth, fb.googleProvider).catch((error) => {
      console.error("Google sign in failed:", error);
    });
  }, []);

  const logOut = useCallback(async () => {
    try {
      const fb = fbRef.current;
      if (!fb) return;
      await fb.firebaseSignOut(fb.auth);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);