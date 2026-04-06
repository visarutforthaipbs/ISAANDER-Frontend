"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

// Dynamic imports — Firebase modules are NOT in the initial JS bundle.
// They load asynchronously on mount, saving ~200 KiB from the critical path.
async function getFirebaseModules() {
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
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Safety timeout: if Firebase never responds within 6s, unblock the UI
    const timeout = setTimeout(() => setLoading(false), 6000);

    getFirebaseModules()
      .then((fb) => {
        unsubscribe = fb.onAuthStateChanged(fb.auth, async (firebaseUser) => {
          clearTimeout(timeout);
          if (firebaseUser) {
            const userRef = fb.doc(fb.db, "users", firebaseUser.uid);
            const userSnap = await fb.getDoc(userRef);

            let profileData: UserProfile;

            if (userSnap.exists()) {
              profileData = userSnap.data() as UserProfile;
            } else {
              profileData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                profileComplete: false,
                role: "reader",
              };

              await fb.setDoc(userRef, {
                ...profileData,
                createdAt: fb.serverTimestamp(),
              });
            }

            setUser(profileData);
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

  const signInWithGoogle = useCallback(async () => {
    try {
      const fb = await getFirebaseModules();
      await fb.signInWithPopup(fb.auth, fb.googleProvider);
    } catch (error) {
      console.error("Google sign in failed:", error);
    }
  }, []);

  const logOut = useCallback(async () => {
    try {
      const fb = await getFirebaseModules();
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