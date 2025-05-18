"use client"

import { createUserWithEmailAndPassword, User as FirebaseUser, getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { usePathname, useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { app, firestore } from '../lib/firebaseClient';

interface AuthContextType {
  user: (FirebaseUser & { username?: string, isAdmin?: boolean }) | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Helper function to generate a random username
const generateRandomUsername = () => {
  const adjectives = ["Happy", "Silly", "Brave", "Quick", "Lazy", "Witty", "Kind", "Fierce"];
  const nouns = ["Coder", "Byte", "Guru", "Ninja", "Wizard", "Dragon", "Robot", "Phoenix"];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);
  return `${randomAdjective}${randomNoun}${randomNumber}`;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<(FirebaseUser & { username?: string, isAdmin?: boolean }) | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch username and isAdmin from Firestore profile
        const profileRef = doc(firestore, "profiles", firebaseUser.uid);
        const profileSnap = await getDoc(profileRef);
        let userData: { username?: string, isAdmin?: boolean } = {};

        if (profileSnap.exists()) {
          userData = profileSnap.data() as { username?: string, isAdmin?: boolean };
        } else {
          // If profile doesn't exist, create it and generate a username
          const username = generateRandomUsername();
          userData.username = username;
          await setDoc(profileRef, { username }); // Create with username, isAdmin defaults to false/undefined
        }
        
        // Set user state with combined auth and profile data
        setUser({ ...firebaseUser, ...userData });

      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const protectedRoutes = ['/', '/profile', '/admin']; // Add other protected routes here
    const isProtectedRoute = protectedRoutes.includes(pathname);

    // If authentication status has finished loading, user is not logged in, and route is protected, redirect to login.
    // Also, redirect if the user is null immediately and not on an auth page.
    if (!loading && !user && isProtectedRoute) {
      router.push('/login');
    } else if (!loading && user && (pathname === '/login' || pathname === '/signup')) {
      // If user is logged in and tries to access login/signup, redirect to home.
      router.push('/');
    }

  }, [user, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    setUser(userCredential.user);
    return userCredential.user;
  };

  const signup = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Generate and store username in Firestore after successful signup
    const username = generateRandomUsername();
    const profileRef = doc(firestore, "profiles", firebaseUser.uid);
    await setDoc(profileRef, { username }, { merge: true }); // Use merge: true to avoid overwriting avatar_url

    // Fetch the newly created profile to get all data including potential isAdmin default
    const profileSnap = await getDoc(profileRef);
    let userData: { username?: string, isAdmin?: boolean } = {};
    if(profileSnap.exists()){
      userData = profileSnap.data() as { username?: string, isAdmin?: boolean };
    }

    setUser({ ...firebaseUser, ...userData }); // Update local state with username and isAdmin
    return { ...firebaseUser, ...userData };
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Check if user profile exists in Firestore, create if not
      const profileRef = doc(firestore, "profiles", firebaseUser.uid);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        // Create profile with username from Google or generate one
        const username = firebaseUser.displayName || generateRandomUsername();
        await setDoc(profileRef, { username, avatar_url: firebaseUser.photoURL }, { merge: true });
        setUser({ ...firebaseUser, username, isAdmin: false }); // Assume not admin by default
      } else {
        const profileData = profileSnap.data();
        setUser({ ...firebaseUser, username: profileData.username, isAdmin: profileData.isAdmin });
      }

      // Redirect after successful login
      router.push('/');

    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      // Handle errors here, e.g., display a message to the user
      // For example, if user closes the popup, it's an auth/popup-closed-by-user error
      if (error.code !== 'auth/popup-closed-by-user') {
         // You might want to set an error state here to display a message on the page
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
} 