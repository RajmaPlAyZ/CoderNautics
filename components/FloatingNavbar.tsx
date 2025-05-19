"use client";
import { app } from '@/lib/firebaseClient';
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import { Home, Menu, Shield, Trophy, User, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <>
      <nav className="fixed top-4 sm:top-6 left-1/2 z-50 -translate-x-1/2 flex items-center justify-between w-[95vw] sm:w-[90vw] max-w-4xl px-2 sm:px-6 py-2 sm:py-3 rounded-xl bg-white border-4 border-black shadow-[0_6px_0_#222] backdrop-blur"
        style={{ boxShadow: '0 6px 0 #222' }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 select-none">
          <span className="text-lg md:text-2xl font-extrabold tracking-tight font-comic text-black flex items-center gap-2">
            <img src="https://firebasestorage.googleapis.com/v0/b/codernautics.firebasestorage.app/o/df001333-13eb-4a94-bc58-bbbf64ee46c4.png?alt=media&token=25704cb5-5ea5-4057-8f20-8dc09d1af532" alt="CoderNautics Logo" className="h-6 w-auto sm:h-8 md:h-10" />
            <span><span className="text-blue-600">Coder</span><span className="text-red-600">Nautics</span></span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 md:gap-6">
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
                <span className="text-sm md:text-base">{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </button>

        {/* User Avatar - Desktop */}
        {user && (
          <div className="hidden md:flex items-center gap-1">
            <Link href="/profile" className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500 text-white font-extrabold text-sm md:text-xl shadow-sm cursor-pointer overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.email?.[0]?.toUpperCase()
              )}
            </Link>
            {user.username && (
              <span className="font-semibold text-gray-800 text-xs md:text-base hidden lg:inline">
                {user.username}
              </span>
            )}
          </div>
        )}
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-[4.5rem] sm:top-[5.5rem] left-1/2 z-40 -translate-x-1/2 w-[95vw] sm:w-[90vw] max-w-4xl bg-white border-4 border-black rounded-xl shadow-[0_6px_0_#222] p-4">
          <div className="flex flex-col gap-2">
            {navLinks.map(link => {
              if (link.admin && !isAdmin) return null;
              if (link.auth && !user) return null;
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-150 text-gray-700 ${
                    isActive
                      ? 'bg-blue-200 text-blue-800 shadow-sm'
                      : 'hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            {user && (
              <div className="flex items-center gap-2 px-4 py-3 mt-2 border-t-2 border-gray-100">
                <Link href="/profile" className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-extrabold text-sm shadow-sm cursor-pointer overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user.email?.[0]?.toUpperCase()
                  )}
                </Link>
                {user.username && (
                  <span className="font-semibold text-gray-800">
                    {user.username}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
} 