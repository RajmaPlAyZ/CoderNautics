"use client"

import { usePathname, useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

interface AuthContextType {
  user: any | null; // Keep for backward compatibility or rename everywhere
  dbUser: any | null; // Add dbUser explicitly
  loading: boolean;
  isLoading: boolean; // Backwards compatibility alias for loading
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { signIn, signOut } = useAuthActions();
  const currentUser = useQuery(api.users.current);

  // Custom loading state specifically for initial hydration auth checks
  const [isReady, setIsReady] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Current user stays undefined until initial fetch concludes
    if (currentUser !== undefined) {
      setIsReady(true);
    }
  }, [currentUser]);

  // Handle protected routes
  useEffect(() => {
    if (!isReady) return;

    const protectedRoutes = ['/', '/profile', '/admin'];
    const isProtectedRoute = protectedRoutes.includes(pathname);

    if (currentUser === null && isProtectedRoute) {
      // Delay redirect slightly to allow OAuth callback auth token to settle.
      // Without this, the user gets bounced to /login immediately after
      // an OAuth redirect because currentUser is briefly null.
      const timeout = setTimeout(() => {
        if (currentUser === null) {
          router.push('/login');
        }
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [currentUser, isReady, pathname, router]);


  const logout = async () => {
    await signOut();
    router.push('/login');
  };

  const signInWithGoogle = async () => {
    try {
      await signIn("google", { redirectTo: "/" });
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser || null,
        dbUser: currentUser || null,
        loading: !isReady,
        isLoading: !isReady,
        logout,
        signInWithGoogle
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}