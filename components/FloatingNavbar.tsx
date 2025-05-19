"use client";
import { app } from '@/lib/firebaseClient';
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import { Home, LogIn, LogOut, Shield, Trophy, User, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';

const navLinks = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Profile', href: '/profile', icon: User, auth: true },
  { label: 'Admin', href: '/admin', icon: Shield, admin: true },
  { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
];

const firestore = getFirestore(app);

export default function FloatingNavbar() {
  const { user, logout } = useAuth();
  const isAdmin = user?.email === 'admin@example.com';
  const pathname = usePathname();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;
    if (user) {
      const profileRef = doc(firestore, "profiles", user.uid);
      unsubscribe = onSnapshot(profileRef, (docSnap) => {
        if (docSnap.exists()) {
          setAvatarUrl(docSnap.data()?.avatar_url || null);
        } else {
          setAvatarUrl(null);
        }
      });
    } else {
      setAvatarUrl(null);
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, [user]);

  return (
    <nav className="fixed top-6 left-1/2 z-50 -translate-x-1/2 flex items-center justify-between w-[90vw] max-w-4xl px-3 md:px-6 py-3 rounded-xl bg-white border-4 border-black shadow-[0_6px_0_#222] backdrop-blur"
      style={{ boxShadow: '0 6px 0 #222' }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-1 select-none">
        <span className="text-lg md:text-2xl font-extrabold tracking-tight font-comic text-black flex items-center gap-2">
          <img src="https://firebasestorage.googleapis.com/v0/b/codernautics.firebasestorage.app/o/df001333-13eb-4a94-bc58-bbbf64ee46c4.png?alt=media&token=25704cb5-5ea5-4057-8f20-8dc09d1af532" alt="CoderNautics Logo" className="h-8 w-auto md:h-10" />
          <span className="hidden sm:inline"><span className="text-blue-600">Coder</span><span className="text-red-600">Nautics</span></span>
        </span>
      </Link>
      {/* Navigation Links */}
      <div className="flex items-center gap-1 md:gap-6">
        {navLinks.map(link => {
          if (link.admin && !isAdmin) return null;
          if (link.auth && !user) return null;
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1 px-2 md:px-4 py-2 rounded-lg font-semibold transition-all duration-150 text-gray-700 ${
                isActive
                  ? 'bg-blue-200 text-blue-800 shadow-sm'
                  : 'hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-700'}`} />
              <span className={`${isActive ? 'inline' : 'hidden'} md:inline text-sm md:text-base`}>{link.label}</span>
            </Link>
          );
        })}
        {!user ? (
          <>
            <Link href="/login" className="flex items-center gap-1 px-2 md:px-4 py-2 rounded-lg font-semibold transition-all duration-150 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
              <LogIn className="w-4 h-4 md:w-5 md:h-5 text-gray-500 group-hover:text-gray-700" />
              <span className={`${pathname === '/login' ? 'inline' : 'hidden'} md:inline text-sm md:text-base`}>Login</span>
            </Link>
            <Link href="/signup" className="flex items-center gap-1 px-2 md:px-4 py-2 rounded-lg font-semibold transition-all duration-150 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
              <UserPlus className="w-4 h-4 md:w-5 md:h-5 text-gray-500 group-hover:text-gray-700" />
              <span className={`${pathname === '/signup' ? 'inline' : 'hidden'} md:inline text-sm md:text-base`}>Sign Up</span>
            </Link>
          </>
        ) : (
          <button onClick={logout} className="flex items-center gap-1 px-2 md:px-4 py-2 rounded-lg font-semibold transition-all duration-150 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
            <LogOut className="w-4 h-4 md:w-5 md:h-5 text-gray-500 group-hover:text-gray-700" />
            <span className={`${pathname === '/logout' ? 'inline' : 'hidden'} md:inline text-sm md:text-base`}>Logout</span>
          </button>
        )}
      </div>
      {/* User Avatar and Username */}
      {user && (
        <div className="flex items-center gap-1">
          <Link href="/profile" className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500 text-white font-extrabold text-sm md:text-xl shadow-sm cursor-pointer overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user.email?.[0]?.toUpperCase()
            )}
          </Link>
          {user.username && (
            <span className="font-semibold text-gray-800 text-xs md:text-base hidden md:inline">
              {user.username}
            </span>
          )}
        </div>
      )}
    </nav>
  );
} 